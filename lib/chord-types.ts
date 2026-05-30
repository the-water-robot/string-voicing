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

export type Inversion = "root" | "first" | "second" | "third" | "voicing";

export const INVERSION_LABELS: Record<Inversion, string> = {
  root: "fondamentale",
  first: "1° rivolto",
  second: "2° rivolto",
  third: "3° rivolto",
  voicing: "voicing",
};

/** Tiny ordinal shown as a superscript on inverted chords ("" = none). */
export const INVERSION_SHORT: Record<Inversion, string> = {
  root: "",
  first: "1",
  second: "2",
  third: "3",
  voicing: "",
};

export type ChordMatch = {
  /** Display name like "Am", "Cmaj7", or a slash chord "C/E" */
  displayName: string;
  /** Root note, e.g. "C", "F#" */
  root: NoteName;
  /** Suffix, e.g. "" (major), "m", "maj7" */
  suffix: string;
  quality: ChordQuality;
  /** True when the selected notes are exactly the chord tones (no missing, no extra). */
  exact: boolean;
  /** Position implied by the bass (lowest sounding) note, when known. */
  inversion: Inversion;
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
