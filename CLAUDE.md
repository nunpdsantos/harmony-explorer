# Harmony Explorer — Project Context for Claude

## What This Is
Interactive music theory education app built with React 19 + TypeScript 5.9 + Vite 7 + Zustand 5. Based on the "Illustrated Harmony" book. Deployed on Vercel at harmony-explorer.vercel.app.

## Current State (2026-02-02)
- **Phases 1–7 + 14 complete** — tonal + jazz harmony, UX polish, all tested + deployed
- **804 tests** (48 files), `tsc -b` clean, ESLint 0 errors, **0 warnings**, Lighthouse 100/100/100
- **CSS animations**: fadeIn, fadeSlideIn, successPulse with reduced-motion support
- **8-step onboarding tour** covering all features through Phase 7

## Key Architecture
- **State**: Zustand store (`src/state/store.ts`) with undo middleware (`undoMiddleware.ts`)
- **Visualizations**: 11 lazy-loaded SVG visualizations in `src/visualizations/`
- **Core theory**: `src/core/` — chords, scales, modes, chord-scale theory, modal interchange, altered dominants, Coltrane changes, upper structure triads, negative harmony, voice leading, relationships, harmony, modulation, bridge chords, symmetric structures, neo-Riemannian, secondary dominants, dominant chains
- **Audio**: Tone.js lazy-loaded, 5 presets, humanization, MIDI input (`src/audio/`)
- **Lessons**: 22 lessons, 59 exercises (`src/learn/lessonData.ts`)
- **Design tokens**: CSS in `src/styles/tokens.css`, TS exports in `src/styles/theme.ts`
- **Fonts**: Bricolage Grotesque (display) + Plus Jakarta Sans (body) via Google Fonts
- **~40 chord qualities** including extensions (9ths–13ths), altered dominants, sus, add, 6th chords

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm test` — `vitest run` (804 tests)
- `npm run lint` — ESLint

## Session Log
Read `SESSION_LOG.md` for complete project history (Phases 1–7 + 14), file inventories, and next-phase options.
Read `ROADMAP.md` for remaining phases (8–13, 15–16).
