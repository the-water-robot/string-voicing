"use client";

import type { NoteName } from "@/lib/notes";
import { noteNameFromMidi, midiOf } from "@/lib/notes";
import type { Tuning } from "@/lib/tunings";

export type ChordDiagramProps = {
  frets: number[];
  fingers?: number[];
  baseFret?: number;
  highlightNote?: NoteName;
  tuning: Tuning;
};

const STRINGS = 4;
const FRET_ROWS = 4;
const W = 110;
const H = 140;
const PAD_X = 16;
const PAD_TOP = 26;
const PAD_BOTTOM = 12;
const FRET_H = (H - PAD_TOP - PAD_BOTTOM) / FRET_ROWS;
const STRING_GAP = (W - PAD_X * 2) / (STRINGS - 1);

const PITCH_NAMES: NoteName[] = [
  "C","C#","D","D#","E","F","F#","G","G#","A","A#","B",
];

function pcEq(a: NoteName, b: NoteName): boolean {
  return PITCH_NAMES.indexOf(a) === PITCH_NAMES.indexOf(b);
}

export function ChordDiagram({
  frets,
  fingers,
  baseFret = 1,
  highlightNote,
  tuning,
}: ChordDiagramProps) {
  const showBaseFretLabel = baseFret > 1;
  const stringX = (i: number) => PAD_X + i * STRING_GAP;
  const fretY = (row: number) => PAD_TOP + row * FRET_H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-[140px] w-[110px] shrink-0 select-none"
      role="img"
      aria-label="Chord diagram"
    >
      {/* Nut */}
      <line
        x1={PAD_X}
        x2={W - PAD_X}
        y1={PAD_TOP}
        y2={PAD_TOP}
        stroke={showBaseFretLabel ? "#6b4c2a" : "#d4b896"}
        strokeWidth={showBaseFretLabel ? 1 : 3.5}
      />

      {/* Fret wires */}
      {Array.from({ length: FRET_ROWS }, (_, i) => i + 1).map((row) => (
        <line
          key={row}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={fretY(row)}
          y2={fretY(row)}
          stroke="#5a3c1a"
          strokeWidth={1}
        />
      ))}

      {/* Strings */}
      {Array.from({ length: STRINGS }, (_, i) => (
        <line
          key={i}
          x1={stringX(i)}
          x2={stringX(i)}
          y1={PAD_TOP}
          y2={fretY(FRET_ROWS)}
          stroke="#8b6424"
          strokeWidth={i === 1 ? 1.8 : 1.2}
          opacity={0.8}
        />
      ))}

      {/* baseFret label */}
      {showBaseFretLabel && (
        <text
          x={PAD_X - 5}
          y={PAD_TOP + FRET_H / 2 + 3}
          textAnchor="end"
          fill="#7a5030"
          fontSize="9"
          fontFamily="ui-monospace, monospace"
        >
          {baseFret}fr
        </text>
      )}

      {/* Open / muted markers */}
      {frets.map((f, i) => {
        if (f === 0) {
          return (
            <circle
              key={`o-${i}`}
              cx={stringX(i)}
              cy={PAD_TOP - 9}
              r={4}
              fill="none"
              stroke="#a87845"
              strokeWidth={1.2}
            />
          );
        }
        if (f < 0) {
          return (
            <text
              key={`x-${i}`}
              x={stringX(i)}
              y={PAD_TOP - 5}
              textAnchor="middle"
              fill="#5a3820"
              fontSize="11"
              fontWeight="700"
            >
              ×
            </text>
          );
        }
        return null;
      })}

      {/* Dots */}
      {frets.map((f, i) => {
        if (f <= 0) return null;
        const open = midiOf(tuning.strings[i]);
        const absoluteFret = f + (baseFret - 1);
        const note = noteNameFromMidi(open + absoluteFret);
        const isHighlight = highlightNote ? pcEq(note, highlightNote) : false;
        const row = f;
        const cy = fretY(row) - FRET_H / 2;

        return (
          <g key={`d-${i}`}>
            <circle
              cx={stringX(i)}
              cy={cy}
              r={7.5}
              fill={isHighlight ? "#f59e0b" : "#c8a235"}
              opacity={isHighlight ? 1 : 0.85}
            />
            {fingers && fingers[i] > 0 && (
              <text
                x={stringX(i)}
                y={cy + 3.5}
                textAnchor="middle"
                fill="#0d0803"
                fontSize="9"
                fontWeight="700"
              >
                {fingers[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
