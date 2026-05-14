import ukuleleData from "@tombatossals/chords-db/lib/ukulele.json";
import {
  NOTE_NAMES,
  type NoteName,
  midiOf,
  noteNameFromMidi,
  normalizeRoot,
} from "./notes";
import type { Tuning } from "./tunings";
import {
  classifySuffix,
  displayName,
  type ChordMatch,
  type ChordPosition,
  type GroupedMatches,
  type Inversion,
  QUALITY_ORDER,
} from "./chord-types";

type RawPosition = {
  frets: number[];
  fingers?: number[];
  baseFret?: number;
  barres?: number[];
  midi?: number[];
};

type RawChord = {
  key: string;
  suffix: string;
  positions: RawPosition[];
};

type RawDB = {
  chords: Record<string, RawChord[]>;
};

const DB = ukuleleData as unknown as RawDB;

const ALL_CHORDS: RawChord[] = Object.values(DB.chords).flat();

export function loadUkuleleChords(): RawChord[] {
  return ALL_CHORDS;
}

function voicingNotes(
  position: RawPosition,
  tuning: Tuning,
): { midi: number[]; notes: NoteName[]; played: boolean[] } {
  const baseFret = position.baseFret ?? 1;
  const midi: number[] = [];
  const notes: NoteName[] = [];
  const played: boolean[] = [];
  for (let i = 0; i < tuning.strings.length; i++) {
    const f = position.frets[i];
    if (f === undefined || f < 0) {
      played.push(false);
      midi.push(-1);
      notes.push("C");
      continue;
    }
    const open = midiOf(tuning.strings[i]);
    const absoluteFret = f === 0 ? 0 : f + (baseFret - 1);
    const m = open + absoluteFret;
    midi.push(m);
    notes.push(noteNameFromMidi(m));
    played.push(true);
  }
  return { midi, notes, played };
}

const PITCH_CLASS_BY_NAME: Record<NoteName, number> = NOTE_NAMES.reduce(
  (acc, n, i) => {
    acc[n] = i;
    return acc;
  },
  {} as Record<NoteName, number>,
);

function inversionFor(
  rootPc: number,
  midi: number[],
  played: boolean[],
  suffix: string,
): Inversion {
  let lowest = Infinity;
  for (let i = 0; i < midi.length; i++) {
    if (played[i] && midi[i] < lowest) lowest = midi[i];
  }
  if (!isFinite(lowest)) return "voicing";
  const interval = ((lowest % 12) - rootPc + 12) % 12;
  const quality = classifySuffix(suffix);

  if (interval === 0) return "root";
  if (interval === 4 || interval === 3) return "first";
  if (interval === 7 || interval === 6 || interval === 8) return "second";
  if (
    quality === "seventh" &&
    (interval === 10 || interval === 11 || interval === 9)
  ) {
    return "third";
  }
  return "voicing";
}

function buildMatches(
  filterFn: (voicingPcs: Set<number>) => boolean,
  tuning: Tuning,
): ChordMatch[] {
  const matches: ChordMatch[] = [];
  for (const chord of ALL_CHORDS) {
    const root = normalizeRoot(chord.key);
    const rootPc = PITCH_CLASS_BY_NAME[root];
    for (const position of chord.positions) {
      if (!position.frets || position.frets.length < tuning.strings.length) continue;
      const { midi, notes, played } = voicingNotes(position, tuning);
      const voicingPcs = new Set(
        notes.filter((_, i) => played[i]).map((n) => PITCH_CLASS_BY_NAME[n]),
      );
      if (!filterFn(voicingPcs)) continue;

      const inv = inversionFor(rootPc, midi, played, chord.suffix);
      const pos: ChordPosition = {
        frets: position.frets,
        fingers: position.fingers,
        baseFret: position.baseFret ?? 1,
        barres: position.barres,
      };
      matches.push({
        displayName: displayName(root, chord.suffix),
        root,
        suffix: chord.suffix,
        quality: classifySuffix(chord.suffix),
        inversion: inv,
        notes,
        midi,
        position: pos,
      });
    }
  }
  return matches;
}

function groupAndSort(matches: ChordMatch[]): GroupedMatches[] {
  const grouped: GroupedMatches[] = QUALITY_ORDER.map((q) => ({
    quality: q,
    matches: [],
  }));
  const indexByQuality = new Map(grouped.map((g, i) => [g.quality, i]));
  for (const m of matches) {
    const i = indexByQuality.get(m.quality)!;
    grouped[i].matches.push(m);
  }

  const invRank: Record<Inversion, number> = {
    root: 0,
    first: 1,
    second: 2,
    third: 3,
    voicing: 4,
  };
  for (const g of grouped) {
    g.matches.sort((a, b) => {
      const rootCmp = PITCH_CLASS_BY_NAME[a.root] - PITCH_CLASS_BY_NAME[b.root];
      if (rootCmp !== 0) return rootCmp;
      const invCmp = invRank[a.inversion] - invRank[b.inversion];
      if (invCmp !== 0) return invCmp;
      return a.position.baseFret - b.position.baseFret;
    });
  }

  return grouped.filter((g) => g.matches.length > 0);
}

/** Find every voicing containing the given single pitch class. */
export function findChordsForNote(
  selected: NoteName,
  tuning: Tuning,
): GroupedMatches[] {
  const targetPc = PITCH_CLASS_BY_NAME[selected];
  return groupAndSort(
    buildMatches((pcs) => pcs.has(targetPc), tuning),
  );
}

/**
 * Find every voicing whose sounded notes contain ALL of the given pitch classes.
 * When multiple notes are selected (one per string), this returns chords that
 * include every selected pitch class simultaneously.
 */
export function findChordsForNotes(
  selected: NoteName[],
  tuning: Tuning,
): GroupedMatches[] {
  if (selected.length === 0) return [];
  if (selected.length === 1) return findChordsForNote(selected[0], tuning);

  const targetPcs = [...new Set(selected.map((n) => PITCH_CLASS_BY_NAME[n]))];
  return groupAndSort(
    buildMatches((pcs) => targetPcs.every((pc) => pcs.has(pc)), tuning),
  );
}
