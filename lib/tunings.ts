import type { PitchString } from "./notes";

export type Tuning = {
  id: string;
  name: string;
  /**
   * Open-string pitches. Index 0 = the highest string *number* (ukulele
   * string 4 / guitar string 6 — the one drawn at the BOTTOM of the
   * fretboard). The board is rendered in reverse, so string 1 sits on top.
   */
  strings: PitchString[];
};

export type Instrument = {
  id: string;
  name: string;
  tunings: Tuning[];
};

/* ── Ukulele ────────────────────────────────────────────────── */
// Display top→bottom: A4 E4 C4 G4
export const STANDARD: Tuning = {
  id: "uke-standard",
  name: "Standard (re-entrant)",
  strings: ["G4", "C4", "E4", "A4"],
};

export const LOW_G: Tuning = {
  id: "uke-low-g",
  name: "Low G",
  strings: ["G3", "C4", "E4", "A4"],
};

/* ── Cavaquinho português ───────────────────────────────────── */
// Display top→bottom: D4 B3 G3 G4  (afinação "D B G G")
export const CAVAQUINHO_DBGG: Tuning = {
  id: "cava-dbgg",
  name: "Portuguesa (D B G G)",
  strings: ["G4", "G3", "B3", "D4"],
};

/* ── Guitar ─────────────────────────────────────────────────── */
// Display top→bottom: E4 B3 G3 D3 A2 E2
export const GUITAR_STANDARD: Tuning = {
  id: "gtr-standard",
  name: "Standard (E A D G B E)",
  strings: ["E2", "A2", "D3", "G3", "B3", "E4"],
};

export const GUITAR_DROP_D: Tuning = {
  id: "gtr-drop-d",
  name: "Drop D",
  strings: ["D2", "A2", "D3", "G3", "B3", "E4"],
};

export const INSTRUMENTS: Instrument[] = [
  { id: "ukulele", name: "Ukulele", tunings: [STANDARD, LOW_G] },
  { id: "cavaquinho", name: "Cavaquinho", tunings: [CAVAQUINHO_DBGG] },
  { id: "guitar", name: "Chitarra", tunings: [GUITAR_STANDARD, GUITAR_DROP_D] },
];

export function findInstrument(id: string): Instrument {
  return INSTRUMENTS.find((i) => i.id === id) ?? INSTRUMENTS[0];
}

export function findTuning(id: string): Tuning {
  for (const inst of INSTRUMENTS) {
    const t = inst.tunings.find((x) => x.id === id);
    if (t) return t;
  }
  return STANDARD;
}
