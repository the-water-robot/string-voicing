"use client";

import { useMemo } from "react";
import { findChordsForNotes, findNearestChords } from "@/lib/chord-finder";
import { QUALITY_LABELS, INVERSION_LABELS } from "@/lib/chord-types";
import { NOTE_NAMES, octaveOf, type NoteName } from "@/lib/notes";
import { octaveColor } from "@/lib/octaves";

export type SelectedNote = { note: NoteName; midi: number };

type Props = {
  selected: SelectedNote[];
};

export function ResultsPanel({ selected }: Props) {
  // Sort by pitch so the bass (lowest sounding note) is first.
  const sorted = useMemo(
    () => [...selected].sort((a, b) => a.midi - b.midi),
    [selected],
  );

  const bassPc = sorted.length ? NOTE_NAMES.indexOf(sorted[0].note) : undefined;

  const groups = useMemo(
    () => findChordsForNotes(sorted.map((s) => s.note), bassPc),
    [sorted, bassPc],
  );

  const nearest = useMemo(
    () => findNearestChords(sorted.map((s) => s.note)),
    [sorted],
  );

  if (selected.length === 0) {
    return (
      <div style={{ borderRadius: 16, border: "1px dashed rgba(0,100,140,0.4)", background: "rgba(5,20,30,0.5)", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ color: "#1e5c6a", fontSize: "0.85rem" }}>
          Premi una nota su ogni corda per trovare gli accordi.
        </p>
      </div>
    );
  }

  // If any chord matches the selection *exactly*, those are the real chords —
  // hide the supersets (otherwise a plain triad would also list its 7ths/adds).
  const anyExact = groups.some((g) => g.matches.some((m) => m.exact));
  const view = groups
    .map((g) => ({
      quality: g.quality,
      matches: anyExact ? g.matches.filter((m) => m.exact) : g.matches,
    }))
    .filter((g) => g.matches.length > 0);

  const total = view.reduce((s, g) => s + g.matches.length, 0);

  // Distinct selected notes by pitch + octave, bass-first.
  const seen = new Set<string>();
  const chips = sorted.filter((s) => {
    const k = `${s.note}${octaveOf(s.midi)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Selected notes — coloured by octave, bass first */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          {chips.map((s, i) => {
            const oct = octaveOf(s.midi);
            const col = octaveColor(oct);
            return (
              <span
                key={`${s.note}-${oct}`}
                title={i === 0 ? `basso · ${s.note}${oct}` : `${s.note}${oct}`}
                style={{
                  borderRadius: 8,
                  background: `${col}1f`,
                  border: `1px solid ${col}`,
                  padding: "2px 9px",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: col,
                  lineHeight: 1.4,
                }}
              >
                {s.note}
                <sup style={{ fontSize: "0.6em", marginLeft: 1 }}>{oct}</sup>
                {i === 0 && (
                  <span style={{ marginLeft: 4, fontSize: "0.55em", opacity: 0.7, verticalAlign: "middle" }}>
                    basso
                  </span>
                )}
              </span>
            );
          })}
        </div>
        <span style={{ color: "#1e4d5a", fontSize: "0.7rem" }}>
          {anyExact ? `${total} esatti` : `${total} possibili`}
        </span>
      </div>

      {/* ── Suona come… — solo accordi esatti (distanza 0) ── */}
      {nearest.some((n) => n.distance === 0) && (
        <div style={{
          borderRadius: 14,
          border: "1px solid rgba(82,183,136,0.2)",
          background: "rgba(5,28,18,0.7)",
          padding: "12px 16px",
        }}>
          <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#40916c", marginBottom: 10 }}>
            Suona come…
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {nearest.filter((n) => n.distance === 0).map((n) => (
              <span
                key={n.displayName}
                style={{
                  borderRadius: 10,
                  padding: "6px 16px",
                  fontFamily: "monospace",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  border: "1px solid rgba(245,200,66,0.5)",
                  background: "rgba(245,200,66,0.13)",
                  color: "#f5e6b0",
                  boxShadow: "0 0 10px 1px rgba(245,200,66,0.15)",
                }}
              >
                {n.displayName}
              </span>
            ))}
          </div>
        </div>
      )}

      {total === 0 ? (
        <div style={{ borderRadius: 16, border: "1px dashed rgba(0,100,140,0.35)", padding: "32px 24px", textAlign: "center" }}>
          <p style={{ color: "#1e5c6a", fontSize: "0.85rem" }}>
            Nessun accordo trovato per questa combinazione.
          </p>
        </div>
      ) : (
        <>
          {!anyExact && (
            <p style={{ color: "#5a7a30", fontSize: "0.72rem", marginTop: -8 }}>
              Nessun accordo esatto — ecco gli accordi che contengono queste note:
            </p>
          )}
          {view.map((group) => (
            <section key={group.quality}>
              <h3 style={{ marginBottom: 10, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#40916c" }}>
                {QUALITY_LABELS[group.quality]}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.matches.map((m) => (
                  <span
                    key={m.displayName}
                    title={INVERSION_LABELS[m.inversion]}
                    style={
                      m.exact
                        ? { borderRadius: 12, border: "1px solid rgba(245,200,66,0.55)", background: "rgba(245,200,66,0.14)", padding: "8px 18px", fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: "#f5e6b0", boxShadow: "0 0 12px 1px rgba(245,200,66,0.18)" }
                        : { borderRadius: 12, border: "1px solid rgba(201,168,108,0.2)", background: "rgba(10,20,15,0.6)", padding: "8px 18px", fontFamily: "monospace", fontSize: "1rem", fontWeight: 600, color: "#9c8a63" }
                    }
                  >
                    {m.displayName}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
