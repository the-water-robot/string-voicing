export const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

const PITCH_CLASS: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export type PitchString = `${string}${number}`;

export function parseNoteName(input: string): { pitchClass: number; octave: number } {
  const match = input.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) {
    throw new Error(`Invalid pitch string: ${input}`);
  }
  const [, name, octStr] = match;
  const pitchClass = PITCH_CLASS[name];
  if (pitchClass === undefined) {
    throw new Error(`Unknown note name: ${name}`);
  }
  return { pitchClass, octave: parseInt(octStr, 10) };
}

export function midiOf(pitch: string): number {
  const { pitchClass, octave } = parseNoteName(pitch);
  return (octave + 1) * 12 + pitchClass;
}

export function noteNameFromMidi(midi: number): NoteName {
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

/** Scientific-pitch octave number for a MIDI value (C4 = 60 → 4). */
export function octaveOf(midi: number): number {
  return Math.floor(midi / 12) - 1;
}

export function noteAt(stringIndex: number, fret: number, openPitches: string[]): {
  midi: number;
  name: NoteName;
} {
  const midi = midiOf(openPitches[stringIndex]) + fret;
  return { midi, name: noteNameFromMidi(midi) };
}

export function normalizeRoot(root: string): NoteName {
  // chords-db sometimes uses "Csharp" / "Eb" / "Ab" / "Bb" / "Db" / "Gb"
  const cleaned = root
    .replace(/sharp/i, "#")
    .replace(/flat/i, "b");
  const { pitchClass } = parseNoteName(`${cleaned}4`);
  return NOTE_NAMES[pitchClass];
}
