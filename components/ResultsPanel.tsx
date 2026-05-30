"use client";

import { useMemo } from "react";
import { findChordsForNotes } from "@/lib/chord-finder";
import { QUALITY_LABELS } from "@/lib/chord-types";
import type { NoteName } from "@/lib/notes";

// Hawaii palette — Ocean / Sand / Palm

type Props = {
  selectedNotes: NoteName[];
};

export function ResultsPanel({ selectedNotes }: Props) {
  const groups = useMemo(
    () => findChordsForNotes(selectedNotes),
    [selectedNotes],
  );

  if (selectedNotes.length === 0) {
    return (
      <div style={{ borderRadius: 16, border: "1px dashed rgba(0,100,140,0.4)", background: "rgba(5,20,30,0.5)", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ color: "#1e5c6a", fontSize: "0.85rem" }}>
          Premi una nota su ogni corda per trovare gli accordi.
        </p>
      </div>
    );
  }

  const total = groups.reduce((s, g) => s + g.matches.length, 0);
  const exactTotal = groups.reduce(
    (s, g) => s + g.matches.filter((m) => m.exact).length,
    0,
  );
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
              style={{ borderRadius: 8, background: "rgba(0,180,216,0.12)", border: "1px solid rgba(0,180,216,0.35)", padding: "2px 10px", fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700, color: "#48cae4" }}
            >
              {n}
            </span>
          ))}
        </div>
        <span style={{ color: "#1e4d5a", fontSize: "0.7rem" }}>
          {exactTotal > 0 ? `${exactTotal} esatti · ` : ""}{total} accordi
        </span>
      </div>

      {total === 0 ? (
        <div style={{ borderRadius: 16, border: "1px dashed rgba(0,100,140,0.35)", padding: "32px 24px", textAlign: "center" }}>
          <p style={{ color: "#1e5c6a", fontSize: "0.85rem" }}>
            Nessun accordo trovato per questa combinazione.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.quality}>
            <h3 style={{ marginBottom: 10, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#40916c" }}>
              {QUALITY_LABELS[group.quality]}
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {group.matches.map((m) => (
                <span
                  key={m.displayName}
                  title={m.exact ? "Accordo esatto" : "Contiene le note selezionate"}
                  style={
                    m.exact
                      ? {
                          borderRadius: 12,
                          border: "1px solid rgba(245,200,66,0.55)",
                          background: "rgba(245,200,66,0.14)",
                          padding: "8px 18px",
                          fontFamily: "monospace",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#f5e6b0",
                          boxShadow: "0 0 12px 1px rgba(245,200,66,0.18)",
                        }
                      : {
                          borderRadius: 12,
                          border: "1px solid rgba(201,168,108,0.2)",
                          background: "rgba(10,20,15,0.6)",
                          padding: "8px 18px",
                          fontFamily: "monospace",
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#9c8a63",
                        }
                  }
                >
                  {m.displayName}
                </span>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
