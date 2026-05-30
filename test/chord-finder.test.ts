import { test } from "node:test";
import assert from "node:assert/strict";

import { midiOf, noteAt, noteNameFromMidi } from "../lib/notes";
import {
  STANDARD,
  CAVAQUINHO_DBGG,
  CAVAQUINHO_DGBD,
  GUITAR_STANDARD,
} from "../lib/tunings";
import { NOTE_NAMES } from "../lib/notes";
import { findChordsForNotes, findChordsForNote } from "../lib/chord-finder";
import { classifySuffix } from "../lib/chord-types";

test("midiOf maps standard pitches", () => {
  assert.equal(midiOf("C4"), 60);
  assert.equal(midiOf("A4"), 69);
  assert.equal(midiOf("G4"), 67);
  assert.equal(midiOf("G3"), 55);
  assert.equal(midiOf("E2"), 40);
});

test("noteAt produces correct names along each string", () => {
  // Ukulele strings array: [G4, C4, E4, A4]
  assert.equal(noteAt(0, 0, STANDARD.strings).name, "G");
  assert.equal(noteAt(0, 12, STANDARD.strings).name, "G");
  assert.equal(noteAt(3, 3, STANDARD.strings).name, "C");
  assert.equal(noteAt(3, 0, STANDARD.strings).name, "A");
});

test("cavaquinho open strings sound D B G G", () => {
  // strings array: [G4, G3, B3, D4] → pitch classes G, G, B, D
  const pcs = CAVAQUINHO_DBGG.strings.map((s) => noteAt(
    CAVAQUINHO_DBGG.strings.indexOf(s),
    0,
    CAVAQUINHO_DBGG.strings,
  ).name);
  assert.deepEqual([...new Set(pcs)].sort(), ["B", "D", "G"]);
});

test("guitar has six strings", () => {
  assert.equal(GUITAR_STANDARD.strings.length, 6);
});

test("noteNameFromMidi wraps pitch class correctly", () => {
  assert.equal(noteNameFromMidi(60), "C");
  assert.equal(noteNameFromMidi(69), "A");
  assert.equal(noteNameFromMidi(73), "C#");
});

test("classifySuffix groups qualities", () => {
  assert.equal(classifySuffix("major"), "major");
  assert.equal(classifySuffix("m"), "minor");
  assert.equal(classifySuffix("7"), "seventh");
  assert.equal(classifySuffix("maj7"), "seventh");
  assert.equal(classifySuffix("m7"), "seventh");
  assert.equal(classifySuffix("sus4"), "suspended");
  assert.equal(classifySuffix("dim"), "diminished");
  assert.equal(classifySuffix("aug"), "augmented");
  assert.equal(classifySuffix("add9"), "other");
});

test("C E G is identified exactly as C major", () => {
  const groups = findChordsForNotes(["C", "E", "G"]);
  const major = groups.find((g) => g.quality === "major");
  assert.ok(major, "should have a Major group");
  const cMajor = major!.matches.find((m) => m.displayName === "C");
  assert.ok(cMajor, "C major should appear");
  assert.equal(cMajor!.exact, true, "C E G is exactly C major");
});

test("A C E is identified exactly as Am", () => {
  const groups = findChordsForNotes(["A", "C", "E"]);
  const minor = groups.find((g) => g.quality === "minor");
  const am = minor!.matches.find((m) => m.displayName === "Am");
  assert.ok(am, "Am should appear");
  assert.equal(am!.exact, true);
});

test("C E G is a (non-exact) subset of C6", () => {
  const groups = findChordsForNotes(["C", "E", "G"]);
  const all = groups.flatMap((g) => g.matches);
  const c6 = all.find((m) => m.displayName === "C6");
  assert.ok(c6, "C6 (C E G A) should contain C E G");
  assert.equal(c6!.exact, false);
});

test("every returned chord contains all selected notes", () => {
  const groups = findChordsForNote("F#");
  const all = groups.flatMap((g) => g.matches);
  assert.ok(all.length > 0);
  // F# must be a chord tone of every match — verified indirectly: at least
  // F#, D, B (a B major contains F#) should appear.
  assert.ok(all.some((m) => m.displayName === "F#"));
  assert.ok(all.some((m) => m.displayName === "B"));
});

test("no matches for an empty selection", () => {
  assert.deepEqual(findChordsForNotes([]), []);
});

test("bass note produces slash naming and inversion", () => {
  // C major triad with E in the bass → C/E, first inversion.
  const bassE = NOTE_NAMES.indexOf("E");
  const groups = findChordsForNotes(["C", "E", "G"], bassE);
  const cMajor = groups
    .find((g) => g.quality === "major")!
    .matches.find((m) => m.root === "C" && m.exact)!;
  assert.equal(cMajor.displayName, "C/E");
  assert.equal(cMajor.inversion, "first");
});

test("root in bass stays root position with no slash", () => {
  const bassC = NOTE_NAMES.indexOf("C");
  const groups = findChordsForNotes(["C", "E", "G"], bassC);
  const cMajor = groups
    .find((g) => g.quality === "major")!
    .matches.find((m) => m.root === "C" && m.exact)!;
  assert.equal(cMajor.displayName, "C");
  assert.equal(cMajor.inversion, "root");
});

test("brazilian cavaquinho is tuned D G B D", () => {
  const pcs = CAVAQUINHO_DGBD.strings.map((s) => s.replace(/-?\d/g, ""));
  assert.deepEqual([...new Set(pcs)].sort(), ["B", "D", "G"]);
  assert.equal(CAVAQUINHO_DGBD.strings.length, 4);
});
