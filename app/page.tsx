"use client";

import { useState } from "react";
import { Fretboard, type SelectedCell } from "@/components/Fretboard";
import { InstrumentSelector } from "@/components/InstrumentSelector";
import { TuningSelector } from "@/components/TuningSelector";
import { ResultsPanel } from "@/components/ResultsPanel";
import { INSTRUMENTS, type Instrument, type Tuning } from "@/lib/tunings";

// Hawaii palette
// Ocean:  #0096c7  #00b4d8  #48cae4  #90e0ef
// Sand:   #f5e6b0  #e8d5a0  #c9a86c
// Palm:   #2d6a4f  #40916c  #52b788  #95d5b2

export default function HomePage() {
  const [instrument, setInstrument] = useState<Instrument>(INSTRUMENTS[0]);
  const [tuning, setTuning] = useState<Tuning>(INSTRUMENTS[0].tunings[0]);
  const [selected, setSelected] = useState<SelectedCell[]>([]);

  const toggleCell = (cell: SelectedCell) => {
    setSelected((prev) => {
      const exists = prev.find(
        (c) => c.string === cell.string && c.fret === cell.fret,
      );
      if (exists) {
        return prev.filter(
          (c) => !(c.string === cell.string && c.fret === cell.fret),
        );
      }
      return [...prev.filter((c) => c.string !== cell.string), cell];
    });
  };

  const selectedNotes = selected
    .slice()
    .sort((a, b) => a.string - b.string)
    .map((c) => c.note);

  const handleInstrumentChange = (i: Instrument) => {
    setInstrument(i);
    setTuning(i.tunings[0]);
    setSelected([]);
  };

  const handleTuningChange = (t: Tuning) => {
    setTuning(t);
    setSelected([]);
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:py-10">

      {/* Header */}
      <header className="mb-7">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          <span
            style={{
              background: "linear-gradient(125deg, #48cae4 0%, #f5e6b0 45%, #52b788 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            String Voicing
          </span>
        </h1>
        <p style={{ color: "#40916c", fontSize: "0.8rem", marginTop: "0.2rem", letterSpacing: "0.04em" }}>
          Premi i tasti per trovare gli accordi
        </p>
      </header>

      {/* Instrument */}
      <section className="mb-5">
        <div className="mb-2">
          <span style={{ color: "#52b788", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Strumento
          </span>
        </div>
        <InstrumentSelector value={instrument} onChange={handleInstrumentChange} />
      </section>

      {/* Tuning */}
      <section className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span style={{ color: "#0096c7", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Accordatura
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => setSelected([])}
              style={{ color: "#48cae4", fontSize: "0.75rem" }}
              className="underline-offset-2 hover:underline"
            >
              cancella
            </button>
          )}
        </div>
        <TuningSelector
          tunings={instrument.tunings}
          value={tuning}
          onChange={handleTuningChange}
        />
      </section>

      {/* Fretboard — edge to edge on mobile */}
      <section className="-mx-4 mb-7 sm:mx-0">
        <div
          className="sm:rounded-2xl sm:overflow-hidden"
          style={{ background: "linear-gradient(160deg, #051a28 0%, #020d14 100%)" }}
        >
          <div className="sm:p-4">
            <Fretboard
              tuning={tuning}
              selected={selected}
              onToggleCell={toggleCell}
            />
          </div>
        </div>
      </section>

      {/* Results */}
      <section>
        <ResultsPanel selectedNotes={selectedNotes} />
      </section>

      <footer className="mt-12 pt-4" style={{ borderTop: "1px solid #0c2a3a", color: "#1e4d5a", fontSize: "0.7rem" }}>
        Ukulele · Cavaquinho · Chitarra — chord finder
      </footer>
    </main>
  );
}
