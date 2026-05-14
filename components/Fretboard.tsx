"use client";

import { noteAt, type NoteName } from "@/lib/notes";
import type { Tuning } from "@/lib/tunings";
import { FretCell } from "./FretCell";

const TOTAL_FRETS = 13; // open + frets 1..12
const FRET_MARKERS: Record<number, "single" | "double"> = {
  3: "single",
  5: "single",
  7: "single",
  9: "single",
  12: "double",
};

export type SelectedCell = { string: number; fret: number; note: NoteName };

type Props = {
  tuning: Tuning;
  selected: SelectedCell[];
  onToggleCell: (cell: SelectedCell) => void;
};

// String thickness: C (idx 1) is thickest for nylon re-entrant uke
const STRING_THICKNESS = [1.5, 2.5, 2, 1.5];

export function Fretboard({ tuning, selected, onToggleCell }: Props) {
  const stringLabels = tuning.strings;
  // A (idx 3) on top → G (idx 0) on bottom
  const displayIndices = [3, 2, 1, 0];

  const isSelected = (s: number, f: number) =>
    selected.some((c) => c.string === s && c.fret === f);

  const selectedNoteForString = (s: number) =>
    selected.find((c) => c.string === s)?.note ?? null;

  return (
    <div className="fretboard-scroll overflow-x-auto">
      <div className="inline-block min-w-max">

        {/* Fret position dot markers row */}
        <div className="mb-1 flex" style={{ paddingLeft: 52 }}>
          {/* spacer for open column */}
          <div style={{ width: 36, flexShrink: 0 }} />
          {Array.from({ length: 12 }, (_, i) => i + 1).map((fret) => {
            const marker = FRET_MARKERS[fret];
            return (
              <div
                key={fret}
                style={{ width: 36, flexShrink: 0, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {marker === "single" && (
                  <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "rgba(0,180,216,0.35)" }} />
                )}
                {marker === "double" && (
                  <span style={{ display: "flex", gap: 3 }}>
                    <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "rgba(0,180,216,0.35)" }} />
                    <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "rgba(0,180,216,0.35)" }} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Fretboard body — koa wood */}
        <div
          style={{
            borderRadius: 14,
            background: "linear-gradient(180deg, #1e0f07 0%, #160b05 50%, #1e0f07 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.85)",
          }}
        >
          {displayIndices.map((stringIdx, displayPos) => {
            const openPitch = stringLabels[stringIdx];
            const isLastDisplay = displayPos === displayIndices.length - 1;
            const selectedNote = selectedNoteForString(stringIdx);
            const pitchLetter = openPitch.replace(/\d/, "");

            return (
              <div
                key={stringIdx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom: isLastDisplay ? "none" : "1px solid rgba(61,32,16,0.25)",
                }}
              >
                {/* String label */}
                <div
                  style={{
                    width: 52,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    paddingRight: 8,
                  }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700, color: "#40916c" }}>
                    {pitchLetter}
                  </span>
                  {selectedNote && (
                    <span style={{
                      marginTop: 2,
                      borderRadius: 4,
                      background: "rgba(245,230,176,0.15)",
                      padding: "0 4px",
                      fontFamily: "monospace",
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      color: "#f5e6b0",
                    }}>
                      {selectedNote}
                    </span>
                  )}
                </div>

                {/* Cells + string line */}
                <div style={{ position: "relative", display: "flex" }}>
                  {/* String line */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: 0, bottom: 0, left: 0, right: 0,
                      pointerEvents: "none",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div style={{
                      width: "100%",
                      height: STRING_THICKNESS[stringIdx],
                      background: "linear-gradient(to right, transparent, rgba(201,168,108,0.82) 3%, rgba(201,168,108,0.82) 97%, transparent)",
                    }} />
                  </div>

                  {Array.from({ length: TOTAL_FRETS }, (_, fret) => {
                    const { name } = noteAt(stringIdx, fret, tuning.strings);
                    return (
                      <FretCell
                        key={fret}
                        fret={fret}
                        note={name}
                        selected={isSelected(stringIdx, fret)}
                        isOpen={fret === 0}
                        isLastFret={fret === TOTAL_FRETS - 1}
                        onToggle={() =>
                          onToggleCell({ string: stringIdx, fret, note: name })
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
