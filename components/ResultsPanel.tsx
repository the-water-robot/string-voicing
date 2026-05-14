"use client";

import { useMemo } from "react";
import { findChordsForNotes } from "@/lib/chord-finder";
import { QUALITY_LABELS } from "@/lib/chord-types";
import type { Tuning } from "@/lib/tunings";
import type { NoteName } from "@/lib/notes";

// Hawaii palette
// Ocean:  #0096c7  #00b4d8  #48cae4  #90e0ef
// Sand:   #f5e6b0  #e8d5a0  #c9a86c
// Palm:   #2d6a4f  #40916c  #52b788

type Props = {
  selectedNotes: NoteName[];
  tuning: Tuning;
};

export function ResultsPanel({ selectedNotes, tuning }: Props) {
  const groups = useMemo(
    () => findChordsForNotes(selectedNotes, tuning),
    [selectedNotes, tuning],
  );

  if (selectedNotes.length === 0) {
    return (
      <div style={{
        borderRadius: 16,
        border: "1px dashed rgba(0,100,140,0.4)",
        background: "rgba(5,20,30,0.5)",
        padding: "40px 24px",
        textAlign: "center",
      }}>
        <p style={{ color: "#1e5c6a", fontSize: "0.85rem" }}>
          Premi una nota su ogni corda per trovare gli accordi.
        </p>
      </div>
    );
  }

  const deduped = groups.map((g) => ({
    quality: g.quality,
    names: [...new Set(g.matches.map((m) => m.displayName))],
  }));

  const total = deduped.reduce((s, g) => s + g.names.length, 0);
  const uniqueNotes = [...new Set(selectedNotes)];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Selected notes header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#0096c7", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            note
          </span>
          {uniqueNotes.map((n) => (
            <span
              key={n}
              style={{
                borderRadius: 8,
                background: "rgba(0,180,216,0.12)",
                border: "1px solid rgba(0,180,216,0.35)",
                padding: "2px 10px",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#48cae4",
              }}
            >
              {n}
            </span>
          ))}
        </div>
        <span style={{ color: "#1e4d5a", fontSize: "0.7rem" }}>
          {total} accordi
        </span>
      </div>

      {total === 0 ? (
        <div style={{
          borderRadius: 16,
          border: "1px dashed rgba(0,100,140,0.35)",
          padding: "32px 24px",
          textAlign: "center",
        }}>
          <p style={{ color: "#1e5c6a", fontSize: "0.85rem" }}>
            Nessun accordo trovato per questa combinazione.
          </p>
        </div>
      ) : (
        deduped.map((group) => (
          <section key={group.quality}>
            {/* Quality label — palm green */}
            <h3 style={{
              marginBottom: 10,
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#40916c",
            }}>
              {QUALITY_LABELS[group.quality]}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {group.names.map((name) => (
                <span
                  key={name}
                  style={{
                    borderRadius: 12,
                    border: "1px solid rgba(201,168,108,0.25)",
                    background: "rgba(10,20,15,0.7)",
                    padding: "8px 18px",
                    fontFamily: "monospace",
                    fontSize: "1rem",
                    fontWeight: 700,
                    /* Sand color for chord names */
                    color: "#e8d5a0",
                    letterSpacing: "0.02em",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
