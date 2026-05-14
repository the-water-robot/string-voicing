import { test } from "node:test";
import assert from "node:assert/strict";

import { midiOf, noteAt, noteNameFromMidi } from "../lib/notes";
import { STANDARD, LOW_G } from "../lib/tunings";
import { findChordsForNote } from "../lib/chord-finder";
import { classifySuffix } from "../lib/chord-types";

test("midiOf maps standard pitches", () => {
  assert.equal(midiOf("C4"), 60);
  assert.equal(midiOf("A4"), 69);
  assert.equal(midiOf("G4"), 67);
  assert.equal(midiOf("G3"), 55);
});

test("noteAt produces correct names along each string", () => {
  assert.equal(noteAt(0, 0, STANDARD.strings).name, "G");
  assert.equal(noteAt(0, 12, STANDARD.strings).name, "G");
  assert.equal(noteAt(3, 3, STANDARD.strings).name, "C");
  assert.equal(noteAt(3, 0, STANDARD.strings).name, "A");
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

test("findChordsForNote('C', STANDARD) contains C major root position", () => {
  const groups = findChordsForNote("C", STANDARD);
  const major = groups.find((g) => g.quality === "major");
  assert.ok(major, "should have a Major group");
  const cMajorRoot = major!.matches.find(
    (m) =>
      m.root === "C" &&
      m.position.frets.join(",") === "0,0,0,3" &&
      m.inversion === "root",
  );
  assert.ok(cMajorRoot, "C major [0,0,0,3] should appear in root position");
});

test("findChordsForNote('A', STANDARD) finds Am at [2,0,0,0]", () => {
  const groups = findChordsForNote("A", STANDARD);
  const minor = groups.find((g) => g.quality === "minor");
  assert.ok(minor, "should have a Minor group");
  const am = minor!.matches.find(
    (m) => m.displayName === "Am" && m.position.frets.join(",") === "2,0,0,0",
  );
  assert.ok(am, "Am [2,0,0,0] should appear");
});

test("Low G changes inversion labeling for C major [0,0,0,3]", () => {
  // Re-entrant Standard: lowest sounding pitch is C4 (string 2 open) → root position.
  const standard = findChordsForNote("C", STANDARD);
  const cmajStd = standard
    .find((g) => g.quality === "major")!
    .matches.find(
      (m) => m.root === "C" && m.position.frets.join(",") === "0,0,0,3",
    )!;
  assert.equal(cmajStd.inversion, "root");

  // With Low G (G3), the bass becomes G3 — the 5th of C — so it's a 2nd inversion.
  const low = findChordsForNote("C", LOW_G);
  const cmajLow = low
    .find((g) => g.quality === "major")!
    .matches.find(
      (m) => m.root === "C" && m.position.frets.join(",") === "0,0,0,3",
    )!;
  assert.equal(cmajLow.inversion, "second");
});

test("findChordsForNote produces only voicings whose notes contain the target", () => {
  const groups = findChordsForNote("F#", STANDARD);
  for (const g of groups) {
    for (const m of g.matches) {
      const played = m.notes.filter((_, i) => m.position.frets[i] >= 0);
      const has = played.some((n) => n === "F#" || n === "Gb");
      assert.ok(
        has,
        `${m.displayName} ${m.position.frets.join(",")} should contain F#`,
      );
    }
  }
});
