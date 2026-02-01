# Harmony Explorer

[![CI](https://github.com/nunpdsantos/harmony-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/nunpdsantos/harmony-explorer/actions/workflows/ci.yml)

An interactive music theory tool for exploring harmonic relationships through visualizations, audio playback, and guided lessons. Based on the concepts from *Illustrated Harmony*.

## Features

- **7 visualizations** — Circle of Fifths, Proximity Pyramid, Tonal Function Chart, Diminished Symmetry, Augmented Star, Tritone Substitution Diagram, Alternation Circle
- **Chord progression builder** — click chords to build progressions, play back with adjustable tempo and looping
- **Audio engine** — 5 instrument presets (Piano, Rhodes, Organ, Pad, Strings) with humanization
- **Learn mode** — 12 guided lessons with interactive exercises covering scales, chords, secondary dominants, and more
- **MIDI export** — export progressions as standard MIDI files
- **Keyboard shortcuts** — 15+ shortcuts for fast workflow

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, TypeScript 5.9, Tailwind CSS 4 |
| Build | Vite 7 |
| State | Zustand 5 |
| Visualizations | D3.js 7 (SVG) |
| Audio | Tone.js 15 (Web Audio API) |
| Persistence | idb-keyval (IndexedDB) |
| Testing | Vitest 4, @testing-library/react |

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

## Architecture

```
src/
  core/          Pure music theory functions (scales, chords, harmony)
  audio/         Tone.js engine, presets, voicing, MIDI input
  visualizations/ 7 SVG visualizations + shared ChordBubble
  learn/         Lesson content, exercises, lesson navigation
  components/    React UI (Sidebar, TransportBar, VizSelector)
  hooks/         Custom hooks (shortcuts, onboarding, container size)
  state/         Zustand store
  utils/         MIDI export, persistence
```
