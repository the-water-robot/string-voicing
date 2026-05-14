# String Voicing

Interactive ukulele chord finder with a Hawaiian palm-sand-ocean theme.

Press one fret per string on the fretboard — String Voicing shows every chord that contains all four selected notes simultaneously.

## Features

- **Realistic fretboard** — koa wood look, strings only, no note labels cluttering the neck
- **Per-string selection** — one dot per string; tapping a different fret on the same string replaces the previous selection; tapping the same fret again deselects it
- **Multi-note chord search** — finds chords whose voicings contain *all* selected pitch classes at once
- **Chord names only** — results show deduplicated chord names grouped by quality (major, minor, seventh, …), no diagrams
- **Two tunings** — Standard re-entrant (G4 C4 E4 A4) and Low G (G3 C4 E4 A4)
- **Mobile-first** — horizontally scrollable fretboard, large touch targets, no scrollbar

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript
- [`@tombatossals/chords-db`](https://github.com/tombatossals/chords-db) for ukulele chord data

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run unit tests |
| `npm run check` | Type-check + build |
