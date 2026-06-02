"use client";

import { useRef, useState } from "react";
import { noteAt, midiOf, octaveOf, type NoteName } from "@/lib/notes";
import { octaveColor } from "@/lib/octaves";
import type { Tuning } from "@/lib/tunings";
import { FretCell } from "./FretCell";

const TOTAL_FRETS = 13; // open + frets 1..12
const FRET_MARKERS: Record<number, "single" | "double"> = {
  3: "single", 5: "single", 7: "single", 9: "single", 12: "double",
};

// Layout constants — must match FretCell sizes
const LABEL_W = 52;  // px, string label column
const CELL_W = 36;   // px, each fret cell
const CAPO_W = 10;   // px, capo bar width

export type SelectedCell = {
  string: number;
  fret: number;
  note: NoteName;
  midi: number;
};

type Props = {
  tuning: Tuning;
  selected: SelectedCell[];
  onToggleCell: (cell: SelectedCell) => void;
  capo?: number;
  onCapoChange?: (fret: number) => void;
};

function thicknessFor(midi: number, min: number, max: number): number {
  if (max === min) return 2;
  const t = (max - midi) / (max - min);
  return 1.2 + t * 1.8;
}

/** Convert a clientX to the fret number relative to the body div ref. */
function clientXToFret(clientX: number, bodyEl: HTMLDivElement): number {
  const rect = bodyEl.getBoundingClientRect();
  const x = clientX - rect.left - LABEL_W;
  return Math.round(x / CELL_W);
}

export function Fretboard({ tuning, selected, onToggleCell, capo = 0, onCapoChange }: Props) {
  const strings = tuning.strings;
  const displayIndices = strings.map((_, i) => i).reverse(); // A on top, G on bottom

  const midis = strings.map((s) => midiOf(s));
  const minMidi = Math.min(...midis);
  const maxMidi = Math.max(...midis);

  const bodyRef = useRef<HTMLDivElement>(null);
  // liveFret: the fret shown during a drag (null = not dragging)
  const [liveFret, setLiveFret] = useState<number | null>(null);

  const displayCapo = liveFret ?? capo;

  const isSelected = (s: number, f: number) =>
    selected.some((c) => c.string === s && c.fret === f);
  const selectedForString = (s: number) =>
    selected.find((c) => c.string === s) ?? null;

  // ── Capo drag handlers (pointer-captured on the bar) ──────────────────────

  function onCapoPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setLiveFret(capo > 0 ? capo : 1);
  }

  function onCapoPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (liveFret === null || !bodyRef.current) return;
    const f = clientXToFret(e.clientX, bodyRef.current);
    setLiveFret(Math.max(0, Math.min(12, f)));
  }

  function onCapoPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (liveFret === null || !bodyRef.current) return;
    const f = clientXToFret(e.clientX, bodyRef.current);
    const final = Math.max(0, Math.min(12, f));
    setLiveFret(null);
    onCapoChange?.(final);
  }

  // Capo bar left position (centre on the fret wire before fret N)
  const capoLeft = LABEL_W + CELL_W * displayCapo - CAPO_W / 2;

  const dot = {
    display: "block", width: 7, height: 7, borderRadius: "50%",
    background: "rgba(0,180,216,0.35)",
  } as const;

  return (
    <div className="fretboard-scroll overflow-x-auto">
      <div className="inline-block min-w-max">

        {/* ── Markers row + capo toggle ───────────────────────────────── */}
        <div className="mb-1 flex items-center">
          {/* Capo button lives in the label area */}
          <div style={{ width: LABEL_W, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <button
              title={capo > 0 ? `Capo al tasto ${capo} — clicca per rimuovere` : "Aggiungi capostasto"}
              onClick={() => onCapoChange?.(capo > 0 ? 0 : 1)}
              style={{
                fontSize: "0.55rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: 6,
                padding: "3px 6px",
                border: capo > 0
                  ? "1px solid rgba(213,185,130,0.7)"
                  : "1px solid rgba(90,65,30,0.4)",
                background: capo > 0
                  ? "rgba(213,185,130,0.18)"
                  : "rgba(30,15,7,0.6)",
                color: capo > 0 ? "#d4b896" : "#7a5030",
                cursor: "pointer",
              }}
            >
              {capo > 0 ? `capo ${capo}` : "+ capo"}
            </button>
          </div>

          {/* Open-column spacer */}
          <div style={{ width: CELL_W, flexShrink: 0, height: 14 }} />

          {/* Fret marker dots */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((fret) => {
            const marker = FRET_MARKERS[fret];
            return (
              <div
                key={fret}
                style={{ width: CELL_W, flexShrink: 0, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {marker === "single" && <span style={dot} />}
                {marker === "double" && (
                  <span style={{ display: "flex", gap: 3 }}>
                    <span style={dot} /><span style={dot} />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Fretboard body ─────────────────────────────────────────── */}
        <div
          ref={bodyRef}
          style={{
            position: "relative", // anchor for capo overlay
            borderRadius: 14,
            background: "linear-gradient(180deg, #1e0f07 0%, #160b05 50%, #1e0f07 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.85)",
          }}
        >
          {displayIndices.map((stringIdx, displayPos) => {
            const openPitch = strings[stringIdx];
            const isLastDisplay = displayPos === displayIndices.length - 1;
            const selCell = selectedForString(stringIdx);
            const selOct = selCell ? octaveOf(selCell.midi) : 0;
            const thickness = thicknessFor(midis[stringIdx], minMidi, maxMidi);

            // Show note at capo position when capo is set, otherwise open string
            const labelNote = capo > 0
              ? noteAt(stringIdx, capo, strings).name
              : openPitch.replace(/-?\d/g, "");

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
                <div style={{ width: LABEL_W, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: 8 }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", fontWeight: 700, color: "#40916c" }}>
                    {labelNote}
                  </span>
                  {selCell && (
                    <span style={{ marginTop: 2, borderRadius: 4, background: `${octaveColor(selOct)}22`, padding: "0 4px", fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 700, color: octaveColor(selOct), lineHeight: 1.3 }}>
                      {selCell.note}
                      <sup style={{ fontSize: "0.55em", marginLeft: 1 }}>{selOct}</sup>
                    </span>
                  )}
                </div>

                {/* Cells + string line */}
                <div style={{ position: "relative", display: "flex" }}>
                  <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, pointerEvents: "none", display: "flex", alignItems: "center" }}>
                    <div style={{
                      width: "100%",
                      height: thickness,
                      background: "linear-gradient(to right, transparent, rgba(201,168,108,0.82) 3%, rgba(201,168,108,0.82) 97%, transparent)",
                    }} />
                  </div>

                  {Array.from({ length: TOTAL_FRETS }, (_, fret) => {
                    const { name, midi } = noteAt(stringIdx, fret, strings);
                    return (
                      <FretCell
                        key={fret}
                        fret={fret}
                        note={name}
                        selected={isSelected(stringIdx, fret)}
                        isOpen={fret === 0}
                        isLastFret={fret === TOTAL_FRETS - 1}
                        disabled={fret > 0 && fret < displayCapo}
                        onToggle={() => onToggleCell({ string: stringIdx, fret, note: name, midi })}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* ── Capo bar overlay ───────────────────────────────────── */}
          {displayCapo > 0 && (
            <div
              aria-label={`Capostasto al tasto ${displayCapo}`}
              onPointerDown={onCapoPointerDown}
              onPointerMove={onCapoPointerMove}
              onPointerUp={onCapoPointerUp}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: capoLeft,
                width: CAPO_W,
                borderRadius: 5,
                background: "linear-gradient(to right, #a07840, #e8d5b0, #e0c898, #a07840)",
                boxShadow: "0 0 0 1px rgba(160,120,64,0.6), 0 2px 10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
                cursor: liveFret !== null ? "grabbing" : "grab",
                zIndex: 20,
                touchAction: "none",
                userSelect: "none",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
