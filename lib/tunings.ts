import type { PitchString } from "./notes";

export type Tuning = {
  id: string;
  name: string;
  /**
   * Pitches of the open strings, indexed strings[0] = string 1 (G), strings[3] = string 4 (A).
   * In standard re-entrant tuning, strings[0] (G4) is *higher* in pitch than strings[1] (C4).
   * The chords-db `frets` array uses the same index convention.
   */
  strings: [PitchString, PitchString, PitchString, PitchString];
};

export const STANDARD: Tuning = {
  id: "standard",
  name: "Standard (re-entrant)",
  strings: ["G4", "C4", "E4", "A4"],
};

export const LOW_G: Tuning = {
  id: "low-g",
  name: "Low G",
  strings: ["G3", "C4", "E4", "A4"],
};

export const TUNINGS: Tuning[] = [STANDARD, LOW_G];

export function findTuning(id: string): Tuning {
  return TUNINGS.find((t) => t.id === id) ?? STANDARD;
}
