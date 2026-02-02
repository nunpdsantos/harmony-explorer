# Harmony Explorer — Project Context for Claude

## What This Is
Interactive music theory education app built with React 19 + TypeScript 5.9 + Vite 7 + Zustand 5. Based on the "Illustrated Harmony" book. Deployed on Vercel at harmony-explorer.vercel.app.

## Current State (2026-02-02)
- **All 16 phases complete** — tonal + jazz harmony, notation & export, piano keyboard, UX polish, advanced audio, PWA, progress tracking, save/share, guitar fretboard, ear training
- **1071 tests** (64 files), `tsc -b` clean, ESLint 0 errors, **0 warnings**
- **CSS animations**: fadeIn, fadeSlideIn, successPulse with reduced-motion support
- **8-step onboarding tour** covering all features through Phase 7

## Key Architecture
- **State**: Zustand store (`src/state/store.ts`) with undo middleware (`undoMiddleware.ts`)
- **Visualizations**: 13 lazy-loaded SVG visualizations in `src/visualizations/` (incl. Piano Keyboard, Sheet Music, Guitar Fretboard)
- **Core theory**: `src/core/` — chords, scales, modes, chord-scale theory, modal interchange, altered dominants, Coltrane changes, upper structure triads, negative harmony, voice leading, relationships, harmony, modulation, bridge chords, symmetric structures, neo-Riemannian, secondary dominants, dominant chains, guitar voicings
- **Audio**: Tone.js lazy-loaded, 5 presets, humanization, MIDI input, arpeggiation (6 patterns), rhythm patterns (6 patterns) (`src/audio/`)
- **Lessons**: 22 lessons, 59 exercises, ear training (intervals + chord quality + dictation) (`src/learn/`)
- **Progress**: SM-2 spaced repetition, exercise attempt tracking, difficulty adaptation, review badges (`src/learn/`)
- **Persistence**: IndexedDB via idb-keyval (progressions, attempts, review cards), JSON/URL sharing, 17 famous progressions library
- **PWA**: Service worker (vite-plugin-pwa), offline support, install prompt
- **Design tokens**: CSS in `src/styles/tokens.css`, TS exports in `src/styles/theme.ts`
- **Fonts**: Bricolage Grotesque (display) + Plus Jakarta Sans (body) via Google Fonts
- **~40 chord qualities** including extensions (9ths–13ths), altered dominants, sus, add, 6th chords

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm test` — `vitest run` (1071 tests)
- `npm run lint` — ESLint

## Session Log
Read `SESSION_LOG.md` for complete project history (Phases 1–7 + 14), file inventories.
Read `ROADMAP.md` for phase details (all phases 1–16 complete).
