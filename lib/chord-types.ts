import type { NoteName } from "./notes";

export type ChordQuality =
  | "major"
  | "minor"
  | "seventh"
  | "suspended"
  | "diminished"
  | "augmented"
  | "other";

export const QUALITY_ORDER: ChordQuality[] = [
  "major",
  "minor",
  "seventh",
  "suspended",
  "diminished",
  "augmented",
  "other",
];

export const QUALITY_LABELS: Record<ChordQuality, string> = {
  major: "Major",
  minor: "Minor",
  seventh: "Seventh",
  suspended: "Suspended",
  diminished: "Diminished",
  augmented: "Augmented",
  other: "Other",
};

export type Inversion =
  | "root"
  | "first"
  | "second"
  | "third"
  | "voicing";

export const INVERSION_LABELS: Record<Inversion, string> = {
  root: "Root position",
  first: "1st inversion",
  second: "2nd inversion",
  third: "3rd inversion",
  voicing: "voicing",
};

export type ChordPosition = {
  frets: number[];
  fingers?: number[];
  baseFret: number;
  barres?: number[];
};

export type ChordMatch = {
  /** Display name like "Am" or "Cmaj7" */
  displayName: string;
  /** Normalized root, e.g. "C", "F#" */
  root: NoteName;
  /** Original suffix from chords-db, e.g. "major", "m7" */
  suffix: string;
  quality: ChordQuality;
  inversion: Inversion;
  /** Notes the voicing actually produces, in string order [G, C, E, A] */
  notes: NoteName[];
  /** Pitch (MIDI) of each string in this voicing, same order */
  midi: number[];
  position: ChordPosition;
};

export type GroupedMatches = {
  quality: ChordQuality;
  matches: ChordMatch[];
};

export function classifySuffix(suffix: string): ChordQuality {
  const s = suffix.toLowerCase();
  if (s === "" || s === "major" || s === "maj") return "major";
  if (s === "m" || s === "minor" || s === "min") return "minor";
  if (s.startsWith("sus")) return "suspended";
  if (s.startsWith("dim")) return "diminished";
  if (s.startsWith("aug")) return "augmented";
  // Seventh family: 7, maj7, m7, m7b5, mmaj7, etc. — anything with a 7 in it that isn't already classified
  if (/(^|[^0-9])7/.test(s) || s.includes("maj7") || s.includes("mmaj7")) {
    return "seventh";
  }
  return "other";
}

export function displayName(root: NoteName, suffix: string): string {
  if (suffix === "" || suffix === "major") return root;
  if (suffix === "minor" || suffix === "m") return `${root}m`;
  return `${root}${suffix}`;
}
