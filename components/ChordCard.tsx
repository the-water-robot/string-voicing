"use client";

import type { ChordMatch } from "@/lib/chord-types";
import { INVERSION_LABELS } from "@/lib/chord-types";
import type { Tuning } from "@/lib/tunings";
import type { NoteName } from "@/lib/notes";
import { ChordDiagram } from "./ChordDiagram";

type Props = {
  match: ChordMatch;
  tuning: Tuning;
  highlightNotes?: NoteName[];
};

const PITCH_NAMES: NoteName[] = [
  "C","C#","D","D#","E","F","F#","G","G#","A","A#","B",
];

export function ChordCard({ match, tuning, highlightNotes = [] }: Props) {
  const inversionLabel = INVERSION_LABELS[match.inversion];
  const playedNotes = match.notes.filter((_, i) => match.position.frets[i] >= 0);

  const isHighlighted = (note: NoteName) => {
    const pc = PITCH_NAMES.indexOf(note);
    return highlightNotes.some((h) => PITCH_NAMES.indexOf(h) === pc);
  };

  // Use first highlighted note for diagram (single-note highlight in SVG)
  const primaryHighlight = highlightNotes[0] ?? undefined;

  return (
    <div className="flex gap-3 rounded-xl bg-[#180c05] p-3 ring-1 ring-[#3d2010]/60">
      <ChordDiagram
        frets={match.position.frets}
        fingers={match.position.fingers}
        baseFret={match.position.baseFret}
        highlightNote={primaryHighlight}
        tuning={tuning}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <h4 className="text-base font-bold text-wood-100">
            {match.displayName}
          </h4>
          <span className="text-[10px] uppercase tracking-wider text-[#7a5030]">
            {inversionLabel}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-[10px] text-[#5a3820]">
          {match.position.frets.map((f) => (f < 0 ? "×" : f)).join(" · ")}
          {match.position.baseFret > 1 && (
            <span className="ml-1 text-[#3d2010]">
              · fr {match.position.baseFret}
            </span>
          )}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {playedNotes.map((n, i) => (
            <span
              key={i}
              className={[
                "rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold",
                isHighlighted(n)
                  ? "bg-accent/25 text-accent"
                  : "bg-[#2d1808] text-[#a87845]",
              ].join(" ")}
            >
              {n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
