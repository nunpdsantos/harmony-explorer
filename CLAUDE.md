# Harmony Explorer — Project Context for Claude

## What This Is
Interactive music theory education app built with React 19 + TypeScript 5.9 + Vite 7 + Zustand 5. Based on the "Illustrated Harmony" book. Deployed on Vercel at harmony-explorer.vercel.app.

## Current State (2026-02-01)
- **Phases 1–6 complete** — all features implemented, tested, deployed
- **620 tests** (41 files), `tsc -b` clean, ESLint clean, Lighthouse 100/100/100
- **Latest commit**: `7b80f39` on `main` branch
- **Ready for Phase 7** — user needs to choose direction

## Key Architecture
- **State**: Zustand store (`src/state/store.ts`) with undo middleware (`undoMiddleware.ts`)
- **Visualizations**: 9 lazy-loaded SVG visualizations in `src/visualizations/`
- **Audio**: Tone.js lazy-loaded, 5 presets, humanization, MIDI input (`src/audio/`)
- **Lessons**: 16 lessons, 41 exercises (`src/learn/lessonData.ts`)
- **Design tokens**: CSS in `src/styles/tokens.css`, TS exports in `src/styles/theme.ts`
- **Fonts**: Bricolage Grotesque (display) + Plus Jakarta Sans (body) via Google Fonts

## Commands
- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build`
- `npm test` — `vitest run` (620 tests)
- `npm run lint` — ESLint

## Session Log
Read `SESSION_LOG.md` for complete project history (Phases 1–6), file inventories, and next-phase options.
