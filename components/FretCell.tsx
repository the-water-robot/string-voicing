"use client";

import type { NoteName } from "@/lib/notes";

type Props = {
  fret: number;
  note: NoteName;
  selected: boolean;
  isOpen: boolean;
  isLastFret: boolean;
  onToggle: () => void;
};

// Nut color: aged bone/ivory
const NUT = "rgba(213,185,130,0.9)";
// Fret wire: dark brass
const WIRE = "rgba(90,65,30,0.35)";

export function FretCell({ fret, selected, isOpen, isLastFret, onToggle, note }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={`Fret ${fret} — ${note}`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 56,
        flexShrink: 0,
        background: "transparent",
        border: "none",
        borderRight: isOpen
          ? `3px solid ${NUT}`
          : isLastFret
            ? "none"
            : `1px solid ${WIRE}`,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      {selected && (
        <span
          aria-hidden
          style={{
            position: "relative",
            zIndex: 10,
            display: "block",
            width: 26,
            height: 26,
            borderRadius: "50%",
            // Sand/gold dot — visible on dark koa wood
            background: "radial-gradient(circle at 40% 38%, #fef3c7, #f5c842)",
            boxShadow: "0 0 14px 4px rgba(245,200,66,0.5), 0 2px 6px rgba(0,0,0,0.6)",
          }}
        />
      )}
    </button>
  );
}
