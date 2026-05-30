import { NOTE_NAMES, type NoteName } from "./notes";
import {
  displayName,
  type ChordMatch,
  type ChordQuality,
  type GroupedMatches,
  QUALITY_ORDER,
} from "./chord-types";

/**
 * Theory-based chord identification.
 *
 * Given the set of selected pitch classes (one note per string), we find every
 * named chord whose tones CONTAIN all of them. This is instrument- and
 * tuning-agnostic: chord names depend only on which pitch classes sound, so the
 * same engine serves ukulele, cavaquinho and guitar alike.
 */

type ChordDef = { suffix: string; intervals: number[]; quality: ChordQuality };

// Intervals are semitones from the root.
const CHORD_DEFS: ChordDef[] = [
  { suffix: "", intervals: [0, 4, 7], quality: "major" },
  { suffix: "m", intervals: [0, 3, 7], quality: "minor" },
  { suffix: "dim", intervals: [0, 3, 6], quality: "diminished" },
  { suffix: "aug", intervals: [0, 4, 8], quality: "augmented" },
  { suffix: "sus2", intervals: [0, 2, 7], quality: "suspended" },
  { suffix: "sus4", intervals: [0, 5, 7], quality: "suspended" },
  { suffix: "6", intervals: [0, 4, 7, 9], quality: "major" },
  { suffix: "m6", intervals: [0, 3, 7, 9], quality: "minor" },
  { suffix: "7", intervals: [0, 4, 7, 10], quality: "seventh" },
  { suffix: "maj7", intervals: [0, 4, 7, 11], quality: "seventh" },
  { suffix: "m7", intervals: [0, 3, 7, 10], quality: "seventh" },
  { suffix: "m7b5", intervals: [0, 3, 6, 10], quality: "seventh" },
  { suffix: "dim7", intervals: [0, 3, 6, 9], quality: "diminished" },
  { suffix: "mMaj7", intervals: [0, 3, 7, 11], quality: "seventh" },
  { suffix: "add9", intervals: [0, 2, 4, 7], quality: "other" },
  { suffix: "madd9", intervals: [0, 2, 3, 7], quality: "other" },
  { suffix: "9", intervals: [0, 2, 4, 7, 10], quality: "seventh" },
  { suffix: "maj9", intervals: [0, 2, 4, 7, 11], quality: "seventh" },
  { suffix: "m9", intervals: [0, 2, 3, 7, 10], quality: "seventh" },
  { suffix: "7sus4", intervals: [0, 5, 7, 10], quality: "seventh" },
];

const pcOf = (n: NoteName): number => NOTE_NAMES.indexOf(n);

/** Find every named chord whose tones contain all selected pitch classes. */
export function findChordsForNotes(selected: NoteName[]): GroupedMatches[] {
  const sel = new Set(selected.map(pcOf));
  if (sel.size === 0) return [];

  const matches: ChordMatch[] = [];

  for (let root = 0; root < 12; root++) {
    for (const def of CHORD_DEFS) {
      const chordPcs = new Set(def.intervals.map((i) => (root + i) % 12));

      let isSubset = true;
      for (const p of sel) {
        if (!chordPcs.has(p)) {
          isSubset = false;
          break;
        }
      }
      if (!isSubset) continue;

      const rootName = NOTE_NAMES[root];
      matches.push({
        displayName: displayName(rootName, def.suffix),
        root: rootName,
        suffix: def.suffix,
        quality: def.quality,
        exact: chordPcs.size === sel.size, // subset + equal size ⇒ identical
      });
    }
  }

  return groupAndSort(matches);
}

/** Convenience wrapper for a single selected note. */
export function findChordsForNote(selected: NoteName): GroupedMatches[] {
  return findChordsForNotes([selected]);
}

function groupAndSort(matches: ChordMatch[]): GroupedMatches[] {
  const grouped: GroupedMatches[] = QUALITY_ORDER.map((q) => ({
    quality: q,
    matches: [],
  }));
  const indexByQuality = new Map(grouped.map((g, i) => [g.quality, i]));

  for (const m of matches) {
    grouped[indexByQuality.get(m.quality)!].matches.push(m);
  }

  for (const g of grouped) {
    g.matches.sort((a, b) => {
      // Exact matches first, then by root pitch class, then shorter suffix.
      if (a.exact !== b.exact) return a.exact ? -1 : 1;
      const rootCmp = pcOf(a.root) - pcOf(b.root);
      if (rootCmp !== 0) return rootCmp;
      return a.suffix.length - b.suffix.length;
    });
  }

  return grouped.filter((g) => g.matches.length > 0);
}
