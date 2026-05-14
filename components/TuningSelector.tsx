"use client";

import { TUNINGS, type Tuning } from "@/lib/tunings";

type Props = {
  value: Tuning;
  onChange: (t: Tuning) => void;
};

export function TuningSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 8 }}>
      {TUNINGS.map((t) => {
        const active = t.id === value.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t)}
            style={{
              borderRadius: 12,
              padding: "8px 16px",
              fontSize: "0.85rem",
              fontWeight: 600,
              border: active ? "1px solid rgba(72,202,228,0.55)" : "1px solid rgba(0,100,140,0.35)",
              background: active
                ? "rgba(0,180,216,0.12)"
                : "rgba(5,26,40,0.6)",
              color: active ? "#90e0ef" : "#2a7a8a",
              boxShadow: active ? "0 0 14px 2px rgba(0,180,216,0.14)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t.name}
            <span style={{ marginLeft: 8, fontFamily: "monospace", fontSize: "0.7rem", opacity: 0.5 }}>
              {t.strings.map((s) => s.replace(/\d/, "")).join(" ")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
