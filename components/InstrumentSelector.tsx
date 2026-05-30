"use client";

import { INSTRUMENTS, type Instrument } from "@/lib/tunings";

type Props = {
  value: Instrument;
  onChange: (i: Instrument) => void;
};

export function InstrumentSelector({ value, onChange }: Props) {
  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 8 }}>
      {INSTRUMENTS.map((inst) => {
        const active = inst.id === value.id;
        return (
          <button
            key={inst.id}
            type="button"
            onClick={() => onChange(inst)}
            style={{
              borderRadius: 12,
              padding: "8px 18px",
              fontSize: "0.9rem",
              fontWeight: 700,
              border: active ? "1px solid rgba(82,183,136,0.6)" : "1px solid rgba(45,106,79,0.35)",
              background: active ? "rgba(82,183,136,0.14)" : "rgba(5,26,18,0.6)",
              color: active ? "#95d5b2" : "#2d6a4f",
              boxShadow: active ? "0 0 14px 2px rgba(82,183,136,0.15)" : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {inst.name}
          </button>
        );
      })}
    </div>
  );
}
