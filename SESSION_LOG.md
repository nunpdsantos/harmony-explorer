# Harmony Explorer — Session Log

## Phase 3 Status: COMPLETE

All 10 sub-phases (3.0–3.9) are finished, tested, and building cleanly.

### Final Metrics
- **318 tests**, all passing (19 test files)
- **TypeScript**: zero errors
- **Build**: succeeds (537KB bundle — known warning, addressed in Phase 4)
- **Coverage**: `src/core/` at **96.25%** statements, 29.36% overall

---

## What Was Built in Phase 3

### Sub-Phase 3.0 — Test Infrastructure
- Vitest + jsdom + @testing-library/react configured
- `vitest.config.ts`, `src/setupTests.ts`
- Scripts: `test`, `test:watch`, `test:coverage`

### Sub-Phase 3.1 — Core Music Theory Unit Tests (202 tests)
- 11 test files covering all `src/core/` modules
- constants, chords, scales, relationships, harmony, voiceLeading, proximityPyramid, secondaryDominants, dominantChains, symmetricStructures, neoRiemannianCycle

### Sub-Phase 3.2 — Error Boundaries & UI Foundation
- `ErrorBoundary.tsx` — crash isolation with retry
- `Tooltip.tsx` — portal-based, 300ms delay, hover + focus
- `Modal.tsx` — native `<dialog>`, focus trapping, Escape close
- `VisuallyHidden.tsx` — screen-reader-only span
- Wrapped Sidebar/VisualizationArea/TransportBar in error boundaries
- Added `:focus-visible` global styles

### Sub-Phase 3.3 — Accessibility Pass
- `ChordBubble.tsx` — tabIndex, role="button", aria-label, keyboard nav
- All 7 visualization SVGs — role="img", aria-label, `<title>`, `<desc>`
- `Sidebar.tsx` — role="complementary", aria-pressed
- `TransportBar.tsx` — dynamic aria-labels, aria-pressed
- `VizSelector.tsx` — role="radiogroup"/"radio", aria-checked
- `LessonNav.tsx` — `<nav>`, aria-current="step"
- `ExercisePanel.tsx` — aria-live regions for feedback

### Sub-Phase 3.4 — Exercise System Completion
- `useExerciseState.ts` — build-progression tracking hook
- `FeedbackExplanation.tsx` — post-answer explanations
- Expanded from ~12 to ~28 exercises across 12 lessons
- Every exercise now has an `explanation` field
- Build-progression fully functional with validation

### Sub-Phase 3.5 — Audio Enhancement
- `presets.ts` — 5 presets: Piano, Rhodes, Organ, Pad, Strings
- `humanize.ts` — velocity/timing variation
- `midiInput.ts` — optional Web MIDI input
- `audioEngine.ts` rewritten with preset switching, velocity, humanization
- TransportBar updated with preset selector, volume slider, humanize toggle

### Sub-Phase 3.6 — Keyboard Shortcuts
- `useKeyboardShortcuts.ts` — 15 shortcuts (Space, L, [/], 1-7, Backspace, ?, E, N, arrows)
- `ShortcutsReference.tsx` — modal listing all shortcuts
- Input-focus aware (disabled in text fields)

### Sub-Phase 3.7 — Onboarding & Tooltips
- `useOnboarding.ts` — tour state + localStorage persistence
- `OnboardingTour.tsx` — 6-step overlay tour (first visit only)

### Sub-Phase 3.8 — UI Polish & Design System
- `tokens.css` — CSS custom properties (type scale, semantic colors, spacing)
- `Button.tsx` — primary/secondary/ghost/danger variants
- `Badge.tsx` — tonic/subdominant/dominant/neutral/success
- `Card.tsx` — sidebar section container

### Sub-Phase 3.9 — Component & Integration Tests (116 tests)
- `store.test.ts` (27), `midiExport.test.ts` (14), `voicingEngine.test.ts` (10)
- `persistence.test.ts` (8), `useKeyboardShortcuts.test.ts` (9)
- `useExerciseState.test.ts` (7), `presets.test.ts` (28), `humanize.test.ts` (13)

---

## File Summary

| Category | Count |
|----------|-------|
| Source files (non-test) | 60 |
| Test files | 19 |
| Total tests | 318 |

### New Files Created in Phase 3 (~37)
```
vitest.config.ts
src/setupTests.ts
src/styles/tokens.css
src/components/ErrorBoundary.tsx
src/components/OnboardingTour.tsx
src/components/ShortcutsReference.tsx
src/components/ui/Tooltip.tsx
src/components/ui/Modal.tsx
src/components/ui/VisuallyHidden.tsx
src/components/ui/Button.tsx
src/components/ui/Badge.tsx
src/components/ui/Card.tsx
src/components/ui/index.ts
src/hooks/useKeyboardShortcuts.ts
src/hooks/useOnboarding.ts
src/learn/useExerciseState.ts
src/learn/FeedbackExplanation.tsx
src/audio/presets.ts
src/audio/humanize.ts
src/audio/midiInput.ts
src/core/__tests__/constants.test.ts
src/core/__tests__/chords.test.ts
src/core/__tests__/scales.test.ts
src/core/__tests__/relationships.test.ts
src/core/__tests__/harmony.test.ts
src/core/__tests__/voiceLeading.test.ts
src/core/__tests__/proximityPyramid.test.ts
src/core/__tests__/secondaryDominants.test.ts
src/core/__tests__/dominantChains.test.ts
src/core/__tests__/symmetricStructures.test.ts
src/core/__tests__/neoRiemannianCycle.test.ts
src/audio/__tests__/presets.test.ts
src/audio/__tests__/humanize.test.ts
src/audio/__tests__/voicingEngine.test.ts
src/hooks/__tests__/useKeyboardShortcuts.test.ts
src/learn/__tests__/useExerciseState.test.ts
src/state/__tests__/store.test.ts
src/utils/__tests__/midiExport.test.ts
src/utils/__tests__/persistence.test.ts
```

### Modified Files (~15)
```
package.json — test deps + scripts
tsconfig.app.json — exclude test files
tsconfig.node.json — include vitest.config.ts
src/index.css — focus-visible + tokens import
src/App.tsx — error boundaries, shortcuts, onboarding
src/main.tsx — top-level error boundary
src/state/store.ts — exercise state, audio presets, modal flags
src/components/Sidebar.tsx — ARIA attributes
src/components/TransportBar.tsx — ARIA, preset selector, volume, humanize
src/components/VizSelector.tsx — ARIA radiogroup
src/visualizations/shared/ChordBubble.tsx — keyboard nav, ARIA
src/visualizations/*/[7 SVG files] — role="img", title, desc
src/learn/lessonData.ts — explanations, more exercises
src/learn/ExercisePanel.tsx — build-progression, feedback, ARIA
src/learn/LessonNav.tsx — nav element, ARIA
src/audio/audioEngine.ts — preset system, velocity, humanize
```

---

## Phase 4 Status: COMPLETE ✅

### 4.1 — Code Splitting & Performance ✅
- Dynamic `import('tone')` in audioEngine.ts — Tone.js loads on first play
- `React.lazy()` + Suspense for all 7 visualizations, LessonView, ShortcutsReference, OnboardingTour
- `manualChunks` in vite.config.ts — vendor-react (192KB), vendor-tone (340KB lazy), vendor-d3 (shared)
- Initial JS load: 537KB → 254KB (62KB app + 192KB react)

### 4.2 — React Component Test Coverage ✅
- 7 new test files: VizSelector (8), Sidebar (16), TransportBar (16), ShortcutsReference (6), OnboardingTour (10), LessonNav (9), ExercisePanel (11)
- Total: 394 tests, 26 test files, ~40% overall coverage

### 4.3 — Lighthouse Audit & Fixes ✅
- Accessibility: 100, Best Practices: 100, SEO: 100
- Added meta description, OG tags, Twitter Cards, manifest.json, icon.svg, robots.txt
- Fixed heading order (h3 → h2), button-name (aria-label), color-contrast (text-white/30 → /50)
- Updated tokens.css: --color-text-muted 0.40→0.50, --color-text-faint 0.25→0.40

### 4.4 — Mobile & Responsive Polish ✅
- TransportBar: replaced hardcoded `width={800}` with `useContainerSize` ref — Timeline now fills container
- TransportBar controls: responsive gaps (gap-2 sm:gap-3), narrower sliders (w-16 sm:w-24), hidden labels on small screens, shorter button text (MIDI, Clear), hidden separators below sm
- LessonView: stacks vertically when container width < 640px (45% text / 55% viz split)
- ChordBubble: invisible 44px touch target circle for bubbles smaller than 22px radius
- All buttons have flex-shrink-0 to prevent text truncation during wrapping

### 4.5 — CI/CD Pipeline ✅
- `.github/workflows/ci.yml` — 4 parallel jobs: Lint, Type Check, Test (with coverage upload), Build (gates on all three)
- Fixed 21 lint errors: disabled React Compiler rules (not using it), fixed unused imports, `useRef` instead of object literal, added missing deps, replaced `Math.random()` with `useId()`, added `coverage/` to eslint ignores
- README.md replaced with proper project README + CI badge
- Vercel preview deployments already handled by dashboard integration

### 4.6 — Sidebar Redesign with Design System ✅
- Sidebar rewritten to use Card, Button, Badge components throughout
- Card component extended with `action` slot and `noBorder` prop
- Eliminated all non-token text sizes across the codebase:
  - `text-[8px]`, `text-[9px]` → `text-[10px]` (--text-2xs)
  - `text-[11px]` → `text-xs` (12px)
  - Type scale now uses only 5 stops: 10px, 12px, 14px, 16px, 20px
- Files standardized: Sidebar, VizSelector, LessonNav, LessonView, ExercisePanel, FeedbackExplanation, Timeline, Tooltip
- Badge used for tonic/subdominant/dominant function legend
- Button used for Enable Audio, Save, Show/Hide, Delete actions

## Phase 4 Status: COMPLETE

---

## Phase 5 Plan: Deep Harmonic Features

Phase 5 focuses on the features that make the app genuinely useful for harmonic exploration — not just displaying relationships, but letting the user *work* with them. The core theory modules already compute voice leading, dominant chains, secondary dominants, and neo-Riemannian transforms. Phase 5 makes that computation visible and interactive.

### 5.1 — Voice-Leading Animation
The app computes `smoothVoiceLeading()` and plays voiced chords, but the user never *sees* the voices move. This sub-phase adds animated voice paths.

**Scope:**
- New `VoiceLeadingOverlay` component rendered on the Timeline during playback
- Each voice (soprano, alto, tenor, bass) gets a colored line/arc showing its movement between consecutive chords
- Highlight common tones (held notes) vs. moving voices
- Show semitone distance per voice as a small label
- Animate on chord transitions (tied to `playingIndex` changes)
- Toggle overlay on/off from TransportBar (new store flag: `showVoiceLeading`)

**Key files:** `Timeline.tsx`, new `VoiceLeadingOverlay.tsx`, `voiceLeading.ts` (existing), `store.ts`

### 5.2 — Intelligent Progression Builder
The current builder is click-to-append with no guidance. `getNextMoves()` already computes strong/common/creative next chords — surface that to the user.

**Scope:**
- "Next moves" panel: when a chord is selected (or last chord in progression), show suggested next chords categorized as Strong / Common / Creative (data from `harmony.ts:getNextMoves`)
- Click a suggestion to append it to the progression
- Drag-to-reorder chords in Timeline (D3 drag behavior or pointer events)
- Voice-leading quality indicator: total semitone movement for the progression, per-transition smoothness score
- 6 preset progression templates: I-IV-V-I, ii-V-I, I-vi-IV-V, I-V-vi-IV, iii-vi-ii-V-I, tritone sub ii-bII7-I
- Templates insert into progression with one click, transposed to current key

**Key files:** `Sidebar.tsx` (new "Next Moves" section), `Timeline.tsx` (drag), `harmony.ts` (existing), `store.ts`, new `ProgressionTemplates.ts`

### 5.3 — Modulation Explorer
The book covers modulation through pivot chords (diminished, augmented, common chords between keys). The app has the theory but no way to explore key-to-key movement.

**Scope:**
- New visualization: `ModulationMap` — two Circle of Fifths rings (source key, target key) showing pivot chords between them
- Identify common chords between two keys (diatonic overlap)
- Show diminished 7th pivot paths (any dim7 note → half-step up → new tonic)
- Show augmented pivot paths (aug triad → semitone move → 6 reachable triads in new key)
- Interactive: user picks source key + target key, map highlights all viable modulation routes
- Each route is clickable → adds the modulation sequence to the progression builder
- New store state: `modulationSource`, `modulationTarget`

**Key files:** new `visualizations/ModulationMap/ModulationMap.tsx`, `symmetricStructures.ts` (existing), `relationships.ts` (existing), `scales.ts` (existing), `store.ts`

### 5.4 — Bridge Chords & Chromatic Lines
The book has a chapter on "Bridges" (chromatic passing chords and tritone sub cascading). This is completely absent from the app.

**Scope:**
- Extend `harmony.ts` with `getBridgeChords(from, to)` — identify chromatic passing chords between two diatonic chords (e.g., Db7 between Dm7 and Cmaj7 via tritone sub of G7)
- Extend Timeline to show bridge/passing chords as smaller, differently-colored bubbles between main chords
- Chromatic bass line detection: when a progression has stepwise (semitone) bass movement, highlight it
- Integrate with TritoneSubDiagram: clicking a tritone pair shows how it creates a chromatic bass line in context
- New core module: `bridgeChords.ts` with `findChromaticBassLines()`, `suggestBridgeChords()`

**Key files:** new `core/bridgeChords.ts`, `harmony.ts`, `Timeline.tsx`, `TritoneSubDiagram.tsx`

### 5.5 — Advanced Lessons (13–16)
Extend the 12-lesson curriculum with 4 advanced lessons covering Phase 5 concepts.

**Scope:**
- **Lesson 13: Voice Leading as Glue** — visualize why ii-V-I sounds smooth, compare voice-leading distances across progressions (uses VoiceLeadingOverlay)
- **Lesson 14: Modulation & Pivot Chords** — explore key changes through common chords, dim7 pivots, aug pivots (uses ModulationMap)
- **Lesson 15: Bridge Chords & Chromatic Lines** — tritone sub cascading, chromatic bass movement, passing chords (uses bridge chord features)
- **Lesson 16: Building & Analyzing Progressions** — capstone lesson combining all tools: build a progression, analyze voice leading, identify function, try reharmonization with tritone subs and bridge chords
- Each lesson: 3 sections + 2-3 exercises
- Exercise types: existing (`select-chord`, `build-progression`, `identify-function`) plus new `analyze-voice-leading` (identify which voice moves the most)

**Key files:** `lessonData.ts` (extend), `ExercisePanel.tsx` (new exercise type), `LessonView.tsx` (add ModulationMap to viz switch)

### 5.6 — Tests & Integration Polish
- Unit tests for `bridgeChords.ts`, `ProgressionTemplates.ts`
- Component tests for `VoiceLeadingOverlay`, `ModulationMap`, next-moves panel, drag-to-reorder
- Integration test: build a progression using suggestions → play with voice-leading overlay → verify audio + visual sync
- Cross-visualization linking: clicking a chord in any view updates all views (already works via store, but verify with new visualizations)
- Target: 450+ tests, maintain Lighthouse 100/100/100

### Estimated Sub-Phase Order
1. **5.1** (Voice-Leading Animation) — foundational, used by lessons and builder
2. **5.2** (Progression Builder) — core user-facing value, immediate usability improvement
3. **5.4** (Bridge Chords) — new theory module, needed before lessons
4. **5.3** (Modulation Explorer) — new visualization, needs bridge chords context
5. **5.5** (Advanced Lessons) — depends on all above features existing
6. **5.6** (Tests & Polish) — final pass

## Phase 5 Status: COMPLETE ✅

### 5.1 — Voice-Leading Animation ✅
- New `VoiceLeadingOverlay` component: SVG overlay on Timeline showing voice paths between consecutive chords
- 4 voice colors (bass=purple, tenor=blue, alto=green, soprano=amber) + 5th voice (pink) for extended chords
- Curved bezier paths between voice positions; common tones shown as dashed lines, moving voices as solid
- Semitone distance labels at midpoint of each moving voice line
- Handles different chord sizes (triad → seventh): extra voices shown as appearing/disappearing dots
- Active transition highlighted during playback (opacity 1.0 vs 0.5)
- Voice legend (B/T/A/S) rendered in top-left of overlay
- MIDI notes mapped to y-position (higher pitch = higher on screen)
- "Voices" toggle button in TransportBar (violet theme, disabled when <2 chords)
- `showVoiceLeading` flag in Zustand store
- `V` keyboard shortcut to toggle overlay
- Shortcut added to ShortcutsReference modal
- Voicings computed via `useMemo` in TransportBar, shared between playback and visualization
- Shared notes indicators hidden when overlay is active (to reduce visual noise)
- 11 new component tests for VoiceLeadingOverlay, 5 new tests in TransportBar + keyboard shortcuts
- **410 tests** total (27 files), zero TS errors, zero lint errors

#### Files Created
```
src/visualizations/Timeline/VoiceLeadingOverlay.tsx
src/visualizations/Timeline/__tests__/VoiceLeadingOverlay.test.tsx
```

#### Files Modified
```
src/state/store.ts — showVoiceLeading flag + setter
src/visualizations/Timeline/Timeline.tsx — accepts voicings + showVoiceLeading props, renders overlay
src/components/TransportBar.tsx — computes voicings via useMemo, passes to Timeline, Voices toggle button
src/hooks/useKeyboardShortcuts.ts — V key toggles voice leading
src/components/ShortcutsReference.tsx — V shortcut documented
src/hooks/__tests__/useKeyboardShortcuts.test.ts — voice leading toggle test
src/components/__tests__/TransportBar.test.tsx — 4 new Voices button tests
```

### 5.2 — Intelligent Progression Builder ✅
- New `progressionTemplates.ts` core module: 6 templates (I-IV-V-I, ii-V-I, I-vi-IV-V, I-V-vi-IV, iii-vi-ii-V-I, ii-bII7-I), `transposeTemplate()` to any key, `analyzeVoiceLeading()` + `smoothnessRating()`
- New `NextMovesPanel` component: shows next moves grouped by strength (Strong/Common/Creative), uses selected chord OR last progression chord as source
- New `VoiceLeadingQualityDisplay` component: per-transition smoothness bars (green/amber/red), total + average semitone movement, smoothness rating badge
- Templates section in Sidebar: click any template to insert it transposed to current key
- Drag-to-reorder in Timeline: HTML5 drag-and-drop, amber drop indicator, ghost opacity on dragged card, cursor feedback (grab/grabbing)
- Sidebar restructured: Selected Chord card (info only), Builder card (NextMovesPanel), Templates card, Voice Leading quality card
- 18 new unit tests for `progressionTemplates.ts` (all templates, transposition, analysis, ratings)
- **428 tests** total (28 files), zero TS errors, zero lint errors

#### Files Created
```
src/core/progressionTemplates.ts
src/components/NextMovesPanel.tsx
src/components/VoiceLeadingQuality.tsx
src/core/__tests__/progressionTemplates.test.ts
```

#### Files Modified
```
src/visualizations/Timeline/Timeline.tsx — onReorder prop, drag-and-drop handlers, drop indicator
src/components/TransportBar.tsx — handleReorder callback, passes onReorder to Timeline
src/components/Sidebar.tsx — NextMovesPanel, VoiceLeadingQualityDisplay, Templates section, handleChordAppend
```

### 5.4 — Bridge Chords & Chromatic Lines ✅
- New `bridgeChords.ts` core module: `suggestBridgeChords()` (tritone sub, chromatic passing dim7, secondary dominant), `findChromaticBassLines()` (ascending/descending semitone spans), `suggestBridgesForProgression()` (best-pick per pair with priority ranking)
- Timeline updated: bridge chord mini-bubbles rendered between main cards (dashed border, type-colored: pink=tritone-sub, amber=passing-dim, purple=secondary-dom), click to insert into progression
- Chromatic bass line indicator: pink underline on chords that are part of a chromatic bass span
- Shared notes indicators hidden when bridge overlay is active
- "Bridges" toggle button in TransportBar (pink theme, disabled when <2 chords)
- `showBridgeChords` flag in Zustand store
- `B` keyboard shortcut to toggle bridge chord suggestions
- Shortcut added to ShortcutsReference modal
- Bridge suggestions and chromatic bass spans computed via `useMemo` in TransportBar
- 28 new unit tests for `bridgeChords.ts` (suggest bridge chords, chromatic bass detection, progression suggestions, edge cases)
- 5 new tests in TransportBar + keyboard shortcuts for bridge toggle
- **461 tests** total (29 files), zero TS errors, zero lint errors

#### Files Created
```
src/core/bridgeChords.ts
src/core/__tests__/bridgeChords.test.ts
```

#### Files Modified
```
src/state/store.ts — showBridgeChords flag + setter
src/visualizations/Timeline/Timeline.tsx — bridge chord bubbles, chromatic bass indicator, onBridgeInsert prop
src/components/TransportBar.tsx — bridge suggestions useMemo, Bridges toggle button, handleBridgeInsert callback
src/hooks/useKeyboardShortcuts.ts — B key toggles bridge chords
src/components/ShortcutsReference.tsx — B shortcut documented
src/hooks/__tests__/useKeyboardShortcuts.test.ts — bridge toggle test
src/components/__tests__/TransportBar.test.tsx — 4 new Bridges button tests
```

### Current Metrics
- **461 tests**, all passing (29 test files)
- **TypeScript**: zero errors
- **ESLint**: zero errors, zero warnings
- **Build**: succeeds, initial JS 263KB (74KB app + 192KB react)
- **Lighthouse**: A11y 100, Best Practices 100, SEO 100

### 5.3 — Modulation Explorer ✅
- New `modulation.ts` core module: `findCommonChords()` (diatonic in both keys), `findDiminishedPivots()` (dim7 → major resolution to target diatonic), `findAugmentedPivots()` (aug triad ±1 semitone to target diatonic), `getModulationRoutes()` (combined, sorted by smoothness), `keyDistance()` (circle of fifths distance 0-6)
- New `ModulationMap` visualization (8.25KB lazy-loaded): outer ring (source key diatonic chords) + inner ring (target key diatonic chords) positioned at Circle of Fifths angles, 12 clickable target key selector dots, dashed arc connections between common/pivot chords, red diamond dim7 pivots, amber triangle aug pivots, center info panel (key names, fifths distance, pivot counts), active chord detail, legend
- `modulationMap` added to `VisualizationMode` union, `modulationTarget` state + setter in Zustand store (default G)
- "Keys" category with "Mod" option in VizSelector
- Target key picker Card in Sidebar (12-button row, green=source, amber=target)
- 28 new tests for `modulation.ts` (common chords, dim pivots, aug pivots, modulation routes, key distance)
- VizSelector tests updated for 4 groups / 8 options
- **489 tests** total (30 files), zero TS errors, zero lint errors

#### Files Created
```
src/core/modulation.ts
src/core/__tests__/modulation.test.ts
src/visualizations/ModulationMap/ModulationMap.tsx
```

#### Files Modified
```
src/state/store.ts — modulationMap viz mode, modulationTarget state + setter
src/components/VizSelector.tsx — Keys category with Mod option
src/components/VisualizationArea.tsx — lazy import + render for ModulationMap
src/components/Sidebar.tsx — target key picker Card, modulationTarget store access
src/components/__tests__/VizSelector.test.tsx — updated counts (8 options, 4 groups), added Mod/Keys assertions
```

### Current Metrics
- **489 tests**, all passing (30 test files)
- **TypeScript**: zero errors
- **ESLint**: zero errors, zero warnings
- **Build**: succeeds, ModulationMap 8.25KB lazy-loaded chunk

### 5.5 — Advanced Lessons 13–16 ✅
- **Lesson 13 — Voice Leading**: smooth connections between chords, common tones, measuring smoothness, ii-V-I voice leading. Viz: Circle of Fifths. 3 exercises (identify-function).
- **Lesson 14 — Modulation**: changing keys through pivot chords, key distance, common chords between keys. Viz: Modulation Map. 3 exercises (2 identify-function, 1 select-chord).
- **Lesson 15 — Bridge Chords**: chromatic connections, secondary dominants as bridges, tritone sub approaches. Viz: Circle of Fifths. 3 exercises (2 identify-function, 1 select-chord).
- **Lesson 16 — Capstone: Harmonic Analysis**: combining all concepts, functional analysis, creative application. Viz: Tonal Function Chart. 3 exercises (2 identify-function, 1 build-progression in G major).
- Store `lessonProgress` expanded from `Array(12)` to `Array(16)`
- LessonView updated: `modulationMap` case added with ModulationMap import
- 16 new lessonData tests (structure validation, field completeness, advanced lesson specifics)
- LessonNav tests updated: hardcoded `Array(12)` → `LESSONS.length`
- **505 tests** total (31 files), zero TS errors, zero lint errors

#### Files Created
```
src/learn/__tests__/lessonData.test.ts
```

#### Files Modified
```
src/learn/lessonData.ts — 4 new lessons (Voice Leading, Modulation, Bridge Chords, Capstone)
src/state/store.ts — lessonProgress Array(12) → Array(16)
src/learn/LessonView.tsx — modulationMap case + ModulationMap import
src/learn/__tests__/LessonNav.test.tsx — Array(12) → LESSONS.length, updated test description
```

### Current Metrics
- **505 tests**, all passing (31 test files)
- **TypeScript**: zero errors
- **ESLint**: zero errors, zero warnings
- **Build**: succeeds, LessonView 8.20KB chunk (includes ModulationMap)
- **16 lessons** with **41 exercises** total

### 5.6 — Tests & Integration Polish ✅
- Coverage audit identified gaps across visualizations (8% covered), components (31%), hooks (25%)
- **colors.ts**: 20 tests — qualityColor for all chord qualities + fallback, sharedNoteColor (0-3), relationshipOpacity linearity
- **ChordBubble.tsx**: 15 tests — aria-label composition (selected, in progression, reference, next move), aria-pressed, keyboard interaction (Enter/Space), click/hover callbacks, tabIndex accessibility
- **NextMovesPanel.tsx**: 7 tests — header rendering, strength group labels, chord buttons, click/hover callbacks, title attributes, multiple strength groups
- **VoiceLeadingQualityDisplay.tsx**: 10 tests — null for <2 voicings, label rendering, smoothness rating badges (smooth/angular), total/average stats, transition bar count and titles
- **Visualization smoke tests**: 22 tests — all 8 visualizations render SVG + chord buttons without crashing, CircleOfFifths click interaction, cross-cutting tests (selectedChord, hoveredChord, different reference roots, small dimensions)
- **useChordInteraction hook**: 9 tests — returns correct functions, sets selectedChord/hoveredChord in store, adds to progression, plays chord via audio engine, initializes audio when not ready, skips init when ready, multiple clicks build progression
- Fixed 5 pre-existing lint errors (unused pitch class variables in bridgeChords.test.ts and modulation.test.ts)
- **588 tests** total (37 files), zero TS errors, zero lint errors

#### Files Created
```
src/visualizations/shared/__tests__/colors.test.ts
src/visualizations/shared/__tests__/ChordBubble.test.tsx
src/visualizations/__tests__/visualizations.test.tsx
src/components/__tests__/NextMovesPanel.test.tsx
src/components/__tests__/VoiceLeadingQuality.test.tsx
src/hooks/__tests__/useChordInteraction.test.ts
```

#### Files Modified
```
src/core/__tests__/bridgeChords.test.ts — removed unused Bb constant
src/core/__tests__/modulation.test.ts — removed unused Db, Ab, Bb, B constants
```

### Current Metrics
- **588 tests**, all passing (37 test files)
- **TypeScript**: zero errors
- **ESLint**: zero errors, zero warnings
- **Build**: succeeds in 1.01s, initial JS 86KB app + 192KB react
- **16 lessons** with **41 exercises** total

---

## Phase 5 — COMPLETE ✅

All 6 sub-phases delivered:
1. **5.1** Voice-Leading Animation — VoiceLeadingOverlay, V shortcut, voice path visualization
2. **5.2** Intelligent Progression Builder — NextMovesPanel, templates, drag-reorder, VL quality
3. **5.4** Bridge Chords & Chromatic Lines — tritone sub, passing dim, secondary dom, chromatic bass
4. **5.3** Modulation Explorer — ModulationMap viz, pivot chords, key distance
5. **5.5** Advanced Lessons 13–16 — voice leading, modulation, bridge chords, capstone
6. **5.6** Tests & Integration Polish — 83 new tests, lint cleanup, full coverage audit

### Final Metrics (End of Phase 5)
- **588 tests**, all passing (37 test files)
- **9 interactive visualizations**: Circle of Fifths, Tonal Function Chart, Proximity Pyramid, Timeline, Augmented Star, Diminished Symmetry, Alternation Circle, Tritone Substitution Diagram, Modulation Map
- **16 lessons** with **41 exercises** (12 original + 4 advanced covering voice leading, modulation, bridge chords, capstone)
- **Audio**: 5 instrument presets, humanization, MIDI input
- **Features**: voice-leading overlay, progression builder with drag-reorder + templates, bridge chord suggestions, chromatic bass detection, modulation routes
- **Bundle**: 86KB app + 192KB React initial, Tone.js 340KB lazy-loaded
- **Lighthouse**: Accessibility 100, Best Practices 100, SEO 100
- **CI**: GitHub Actions (lint, typecheck, test, build)
- **Deployed**: Vercel + GitHub

---

## Phase 6: Comprehensive UI/UX Redesign — COMPLETE ✅

Phase 6 was a full visual and accessibility overhaul: design token infrastructure, new visual identity, token enforcement across all files, layout restructuring, and comprehensive accessibility fixes.

### 6.1 — Token Infrastructure ✅
- Expanded `tokens.css` from ~38 to ~130 lines
- New token categories: chord quality colors (13), function colors (3+3), shared-note colors (4), next-move colors (3), bridge type colors (3), voice colors (5), pair colors (6), transform colors (3), extended type scale (9 stops), layout tokens, duration tokens, interaction tokens, background tokens

### 6.2 — Visual Identity ✅
- **Font pairing**: Bricolage Grotesque (display) + Plus Jakarta Sans (body/UI) via Google Fonts
- **Background**: radial gradient `radial-gradient(ellipse at 30% 20%, #0c1222 0%, #030712 70%)` — subtle "spotlight on stage" effect
- **Refined palette**: warmer tonic (emerald-400), more vibrant subdominant (blue-400), warmer dominant (red-400), amber accent
- Display font applied to: Sidebar h1, Card headers, Modal headers, OnboardingTour titles, LessonView titles

### 6.3 — Token Enforcement Migration ✅
- Created `src/styles/theme.ts` — single source of truth for all color values as TypeScript exports (needed for SVG inline styles which can't use `var()`)
- Migrated 240+ hardcoded hex/rgba/fontSize values across 34 files to token imports
- ESLint `no-restricted-syntax` rule warns on raw hex literals in `.tsx` files outside `/src/styles/`
- Only `theme.ts` and `tokens.css` contain raw color values

### 6.4 — Layout Restructuring ✅
- **Collapsible sidebar**: desktop (≥1024px) toggles between 288px expanded ↔ 56px icon rail; tablet (768-1023px) collapsed rail as overlay; mobile (<768px) slide-in overlay
- Rail shows: expand button, mode toggle icons (Explore/Learn), VizSelector compact (icon-only), key indicator
- `\` keyboard shortcut toggles sidebar collapse
- **Transport bar grouped**: 3 logical groups — Playback (Play, Loop, BPM, Undo, Redo) | Overlays (Voices, Bridges, Humanize) | Output (Preset, Volume, MIDI, Clear, Count) — with visual separators
- `VizSelector` compact mode: icon-only buttons for rail view (◎, ⟳, △, ▦, ◇, ✦, ⬡, ⊞)

### 6.5 — Accessibility Fixes ✅
- **`prefers-reduced-motion`**: new `useReducedMotion` hook, CSS media query zeroes duration tokens, ChordBubble conditionally renders `<animate>` elements
- **`prefers-contrast`**: CSS media query increases border opacity, text contrast, bolder focus ring
- **Undo/Redo**: Zustand middleware (`undoMiddleware.ts`) tracking progression changes, 50-entry history stack, `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` redo, undo/redo buttons in TransportBar
- **Timeline keyboard reorder**: chord cards `tabIndex={0}`, `ArrowLeft`/`ArrowRight` moves chord, `Delete`/`Backspace` removes, `role="listbox"`/`"option"`, `aria-selected`, descriptive `aria-label`
- **Touch targets**: Timeline remove button has 44px invisible touch wrapper, touch move buttons (← →) shown on focus
- **Modal focus return**: captures `document.activeElement` on open, restores on close
- **Screen reader announcements**: `useAnnouncements` hook subscribes to store changes, `<div role="status" aria-live="polite">` in App

### 6.6 — Tests & Polish ✅
- 32 new tests across 4 new test files:
  - `undoMiddleware.test.ts` (11 tests) — undo/redo stack, limits, edge cases
  - `useReducedMotion.test.ts` (4 tests) — hook behavior with mocked matchMedia
  - `useAnnouncements.test.ts` (6 tests) — announcement text generation
  - `Timeline.keyboard.test.tsx` (11 tests) — keyboard reorder, deletion, ARIA roles

#### New Files Created in Phase 6
```
src/styles/theme.ts — color/font/size constants for TypeScript
src/hooks/useReducedMotion.ts — prefers-reduced-motion hook
src/state/undoMiddleware.ts — Zustand undo/redo middleware
src/hooks/useAnnouncements.ts — screen reader announcement hook
src/state/__tests__/undoMiddleware.test.ts
src/hooks/__tests__/useReducedMotion.test.ts
src/hooks/__tests__/useAnnouncements.test.ts
src/visualizations/Timeline/__tests__/Timeline.keyboard.test.tsx
```

#### Files Modified in Phase 6 (~40 files)
```
src/styles/tokens.css — expanded to ~130 lines, all new token categories
index.html — Google Fonts links (Bricolage Grotesque + Plus Jakarta Sans)
src/index.css — body font, background, prefers-reduced-motion, prefers-contrast media queries
src/App.tsx — AriaAnnouncer component, useAnnouncements hook, token-based background
src/state/store.ts — sidebarCollapsed, toggleSidebarCollapsed, undo/redo integration, announce
src/components/Sidebar.tsx — collapsible rail mode, display font, token migration
src/components/TransportBar.tsx — 3 group containers, undo/redo buttons, token migration
src/components/VizSelector.tsx — compact icon mode for rail
src/components/ui/Modal.tsx — focus return on close
src/components/ui/Card.tsx — display font headers
src/components/OnboardingTour.tsx — display font titles
src/components/ShortcutsReference.tsx — \ and Cmd+Z shortcuts documented
src/hooks/useKeyboardShortcuts.ts — \ sidebar toggle, Cmd+Z undo, Cmd+Shift+Z redo
src/visualizations/shared/ChordBubble.tsx — useReducedMotion, token migration
src/visualizations/Timeline/Timeline.tsx — keyboard reorder, touch targets, ARIA, tokens
src/visualizations/CircleOfFifths/CircleOfFifths.tsx — token migration
src/visualizations/ModulationMap/ModulationMap.tsx — token migration
src/visualizations/Timeline/VoiceLeadingOverlay.tsx — token migration
src/visualizations/TonalFunctionChart/TonalFunctionChart.tsx — token migration
src/visualizations/ProximityPyramid/ProximityPyramid.tsx — token migration
src/visualizations/AugmentedStar/AugmentedStar.tsx — token migration
src/visualizations/DiminishedSymmetry/DiminishedSymmetry.tsx — token migration
src/visualizations/AlternationCircle/AlternationCircle.tsx — token migration
src/visualizations/TritoneSubDiagram/TritoneSubDiagram.tsx — token migration
src/visualizations/shared/colors.ts — imports from theme.ts
src/components/NextMovesPanel.tsx — token migration
src/components/VoiceLeadingQuality.tsx — token migration
src/components/VisualizationArea.tsx — token migration
src/components/ErrorBoundary.tsx — token migration
src/components/ui/Button.tsx — token classes
src/components/ui/Badge.tsx — token classes
src/components/ui/Tooltip.tsx — token classes
src/learn/ExercisePanel.tsx — token classes
src/learn/LessonView.tsx — display font, token classes
src/learn/LessonNav.tsx — token classes
src/learn/FeedbackExplanation.tsx — token classes
eslint.config.js — no-restricted-syntax rule for hex literals
```

### Git Commits
- `16c5f72` — Phase 6: Comprehensive UI/UX redesign (59 files, +5389/-397)
- `7b80f39` — Fix tsc -b type errors in undoMiddleware and CircleOfFifths (build fix for Vercel)

### Final Metrics (End of Phase 6)
- **620 tests**, all passing (41 test files)
- **68 source files**, 41 test files
- **TypeScript**: zero errors (`tsc -b` clean)
- **ESLint**: zero errors, 2 warnings (hex in test/sidebar — allowed)
- **Build**: succeeds in ~1s, 95KB app + 192KB React initial, Tone.js 340KB lazy
- **9 interactive visualizations**: Circle of Fifths, Tonal Function Chart, Proximity Pyramid, Timeline, Augmented Star, Diminished Symmetry, Alternation Circle, Tritone Substitution Diagram, Modulation Map
- **16 lessons** with **41 exercises**
- **Audio**: 5 instrument presets, humanization, MIDI input
- **Lighthouse**: Accessibility 100, Best Practices 100, SEO 100
- **CI**: GitHub Actions (lint, typecheck, test, build)
- **Deployed**: Vercel (harmony-explorer.vercel.app) — deployment successful on `7b80f39`

---

## Phase 7: Extended Harmony — COMPLETE ✅

Phase 7 was a full jazz theory extension: chord extensions (9ths–13ths), all modes, modal interchange, chord-scale theory, altered dominants, Coltrane changes, upper structure triads, negative harmony. Two new visualizations, Circle of Fifths overlays, 6 new lessons, and 184 new tests.

### 7.1 — Chord Extensions & Voice Leading Foundation ✅
- **constants.ts**: ~25 new chord qualities — extensions (dom9, maj9, min9, dom11, min11, dom13, min13, maj13), altered (alt7, dom7sharp11, dom7flat9, dom7sharp9, dom7flat13, dom7flat5, dom7sharp5flat9, dom7sharp5sharp9), 6th chords (sixth, min6, sixNine), add chords (add9, minAdd9), suspended (dom7sus4, dom9sus4), special (min7flat9, halfDim7flat9)
- **theme.ts**: QUALITY_COLORS entries for all new qualities (rose/pink for altered, blue/cyan for extensions)
- **voiceLeading.ts**: Greedy nearest-neighbor fallback (`greedyAssignment()`) for chords with 5+ notes — prevents O(n!) blowup on extended chords
- **scales.ts**: `DIATONIC_9TH_QUALITIES` and `DIATONIC_13TH_QUALITIES` tables, `diatonic9ths()` and `diatonic13ths()` functions

### 7.2 — Modes & Chord-Scale Theory + Viz ✅
- **New `modes.ts`**: 7 modes of major, 7 of melodic minor, 7 of harmonic minor, 4 symmetric scales (wholeHalfDim, halfWholeDim, wholeTone, augmentedScale), 3 bebop scales, pentatonic/blues. `ModeType` union, `MODE_TEMPLATES`, `deriveMode()`, `modePitchClasses()`, `getModesByParent()`
- **New `chordScaleTheory.ts`**: `getScalesForChord(quality)` static mapping, `getScalesForChordInContext(quality, keyRoot, degree)` context-aware (min7 as ii→dorian, vi→aeolian, iii→phrygian), `computeAvoidNotes()`, `getTensionLabels()`
- **New `ChordScaleMap` visualization**: circular pitch-class display (12 clock positions), chord tones solid blue, scale tones lighter, avoid notes red X, scale name + characteristic tones + tension labels. Category "Scales" in VizSelector

### 7.3 — Modal Interchange ✅
- **New `modalInterchange.ts`**: `BorrowedChord` interface, `getModalInterchangeChords(keyRoot, mode)` — chords from parallel mode not in home major, `getAllBorrowedChords(keyRoot)` — aggregates from 7 modes, deduplicates, sorts
- **Sidebar**: borrowed chords panel grouped by source mode (purple styling), modal interchange + Coltrane toggle buttons
- **CircleOfFifths**: modal interchange overlay — ghost bubbles (purple dashed circles) at borrowed chord positions
- **Store**: `showModalInterchange` flag, `M` keyboard shortcut

### 7.4 — Altered Dominants & Reharmonization ✅
- **New `alteredDominants.ts`**: `AlteredDominantInfo` interface with quality/alterations/associatedScale/tensionLevel (1-4), `isDominantFamily()`, `getAlteredDominantInfo()`, `suggestResolutions()` (standard/tritone sub/deceptive), `suggestAlterations()`, `getAlteredVariants()`
- **Sidebar**: AlteredDominantPanel showing variants with tension level (rose styling)
- **NextMovesPanel**: "Resolutions" section for dominant chords with rose styling

### 7.5 — Coltrane Changes & Upper Structure Triads ✅
- **New `coltraneChanges.ts`**: `getColtraneTriangle(tonic)` (3 major-third-apart centers), `generateColtraneSubstitution()` (Giant Steps sequence), `expandIIV_Coltrane()`, `analyzeColtraneProgression()` (pattern detection with confidence)
- **New `upperStructureTriads.ts`**: 7 standard UST definitions (II, ♭iii, ♭III, ♯IV, ♭VI, ♭VII, VI), `getUpperStructureTriads(dom7Root)`, `formatUST()`
- **CircleOfFifths**: Coltrane triangle overlay (amber dashed equilateral triangle with V7 labels)
- **Store**: `showColtraneOverlay` flag, `J` keyboard shortcut

### 7.6 — Negative Harmony + Viz ✅
- **New `negativeHarmony.ts`**: `getNegativeMapping(keyRoot)` — 12-note reflection map around axis at root + 3.5 semitones, `computeNegative(chord, keyRoot)`, `computeNegativeProgression()`, `identifyChordFromPitchClasses()` (general-purpose chord ID from pitch class set)
- **New `NegativeHarmonyMirror` visualization**: vertical axis, original chord (blue) on left, negative chord (pink) on right, crossing connection lines, chord names. Under "Keys" category in VizSelector

### 7.7 — Lessons 17–22 ✅
- **Lesson 17**: Chord Extensions — 9ths, 11ths, 13ths. Viz: chordScaleMap. 3 exercises
- **Lesson 18**: Modes & Scales — major modes, characteristic tones. Viz: chordScaleMap. 3 exercises
- **Lesson 19**: Chord-Scale Theory — matching scales to chords, avoid notes. Viz: chordScaleMap. 3 exercises
- **Lesson 20**: Modal Interchange — borrowing from parallel modes. Viz: circleOfFifths. 3 exercises
- **Lesson 21**: Altered Dominants & Reharmonization — altered variants, tritone sub. Viz: circleOfFifths. 3 exercises
- **Lesson 22**: Coltrane Changes & Negative Harmony — major thirds cycle, reflection. Viz: circleOfFifths. 3 exercises
- Store `lessonProgress` expanded from `Array(16)` to `Array(22)`

### 7.8 — Tests & Polish ✅
- 7 new test files: `modes.test.ts` (25), `chordScaleTheory.test.ts` (21), `modalInterchange.test.ts` (17), `alteredDominants.test.ts` (33), `coltraneChanges.test.ts` (21), `upperStructureTriads.test.ts` (14), `negativeHarmony.test.ts` (27)
- Updated: `voiceLeading.test.ts` (+7 greedy fallback tests), `visualizations.test.tsx` (+11 ChordScaleMap/NegativeHarmonyMirror smoke tests), `lessonData.test.ts` (+8 lesson 17-22 tests)
- Updated: `constants.test.ts`, `chords.test.ts`, `VizSelector.test.tsx` (adjusted counts for new qualities/vizs/lessons)
- Fixed 5 lint errors (unused imports in test files)
- **804 tests** total (48 files), zero TS errors, zero lint errors (25 warnings — pre-existing hex color warnings)

#### New Files Created in Phase 7
```
src/core/modes.ts
src/core/chordScaleTheory.ts
src/core/modalInterchange.ts
src/core/alteredDominants.ts
src/core/coltraneChanges.ts
src/core/upperStructureTriads.ts
src/core/negativeHarmony.ts
src/visualizations/ChordScaleMap/ChordScaleMap.tsx
src/visualizations/NegativeHarmonyMirror/NegativeHarmonyMirror.tsx
src/core/__tests__/modes.test.ts
src/core/__tests__/chordScaleTheory.test.ts
src/core/__tests__/modalInterchange.test.ts
src/core/__tests__/alteredDominants.test.ts
src/core/__tests__/coltraneChanges.test.ts
src/core/__tests__/upperStructureTriads.test.ts
src/core/__tests__/negativeHarmony.test.ts
```

#### Files Modified in Phase 7 (20 files)
```
src/core/constants.ts — ~25 new chord qualities
src/core/scales.ts — diatonic 9th/13th tables
src/core/voiceLeading.ts — greedy fallback for 5+ notes
src/styles/theme.ts — QUALITY_COLORS for new qualities
src/state/store.ts — new viz modes, toggles, lesson expansion
src/components/VizSelector.tsx — 2 new viz options (ChordScaleMap, NegativeHarmonyMirror)
src/components/VisualizationArea.tsx — lazy imports for new vizs
src/components/Sidebar.tsx — borrowed chords panel, altered dominant panel, overlay toggles
src/components/NextMovesPanel.tsx — resolution suggestions for dominants
src/components/ShortcutsReference.tsx — M and J shortcuts documented
src/hooks/useKeyboardShortcuts.ts — M (modal), J (Coltrane) toggles
src/visualizations/CircleOfFifths/CircleOfFifths.tsx — modal interchange + Coltrane overlays
src/learn/lessonData.ts — 6 new lessons (17–22)
src/learn/LessonView.tsx — chordScaleMap + negativeHarmonyMirror cases
src/core/__tests__/constants.test.ts — updated quality count
src/core/__tests__/chords.test.ts — mod 12 for extended intervals
src/core/__tests__/voiceLeading.test.ts — greedy fallback tests
src/components/__tests__/VizSelector.test.tsx — 10 options, 5 categories
src/visualizations/__tests__/visualizations.test.tsx — ChordScaleMap + NegativeHarmonyMirror smoke tests
src/learn/__tests__/lessonData.test.ts — lessons 17–22 tests
```

### Git Commit
- `4476722` — Phase 7: Extended Harmony — jazz theory extension (36 files, +3437/-25)

### Final Metrics (End of Phase 7)
- **804 tests**, all passing (48 test files)
- **~84 source files**, 48 test files
- **TypeScript**: zero errors (`tsc -b` clean)
- **ESLint**: zero errors, 25 warnings (hex color literals in new viz/overlay components — cosmetic)
- **Build**: succeeds in ~1s, ChordScaleMap 8.13KB + NegativeHarmonyMirror 2.98KB lazy-loaded
- **11 interactive visualizations**: Circle of Fifths, Tonal Function Chart, Proximity Pyramid, Timeline, Augmented Star, Diminished Symmetry, Alternation Circle, Tritone Substitution Diagram, Modulation Map, Chord-Scale Map, Negative Harmony Mirror
- **22 lessons** with **59 exercises**
- **~40 chord qualities** (from ~13)
- **Audio**: 5 instrument presets, humanization, MIDI input (Tone.js handles arbitrary polyphony for extended chords)
- **CI**: GitHub Actions (lint, typecheck, test, build)

---

## Current State — End of Phase 7 (2026-02-01)

### What's Done
Phases 1–7 are complete. The app covers both tonal and extended jazz harmony:
- All tonal harmony fundamentals from the "Illustrated Harmony" book
- Full jazz theory: chord extensions, all modes (major/melodic minor/harmonic minor/symmetric), chord-scale theory, modal interchange, altered dominants, Coltrane changes, upper structure triads, negative harmony
- Interactive chord exploration across 11 linked visualizations
- Voice leading analysis and animation (greedy fallback for extended chords)
- Modulation pathways between keys
- Bridge chord suggestions (tritone sub, passing diminished, secondary dominants)
- 22-lesson curriculum with 59 progressive exercises
- Full design token system with enforcement
- Custom visual identity (Bricolage Grotesque + Plus Jakarta Sans fonts, radial gradient bg)
- Collapsible sidebar (desktop rail mode)
- Undo/redo for progression changes
- Comprehensive accessibility: reduced-motion, high-contrast, keyboard navigation, screen reader announcements, ARIA roles, focus management
- Responsive at all breakpoints (320px–1280px+)
- 804 tests, Lighthouse 100/100/100, CI/CD pipeline

### Repository
- **GitHub**: github.com/nunpdsantos/harmony-explorer
- **Live**: harmony-explorer.vercel.app
- **Branch**: `main` at commit `4476722`

### Possible Phase 8 Directions (To Be Decided)
The user should choose the next direction. Options:

1. **Notation & Export** — render progressions as sheet music (VexFlow), MIDI file export with voice leading, PDF export of lesson progress/analysis reports
2. **Piano Keyboard View** — new visualization showing chord voicings on a piano keyboard, voice movement animation, integrate with audio playback
3. **Advanced Audio** — arpeggiation patterns, chord rhythm/strumming patterns, custom voicing editor, audio recording/export
4. **PWA & Offline** — service worker for offline access, installable app, sync progress across devices
5. **Performance & Analytics** — track student progress over time, spaced repetition for exercises, difficulty adaptation
6. **Progression Save/Share** — save named progressions to IndexedDB, export as shareable URL or JSON, import shared progressions
7. **Further UX Polish** — animations/transitions, micro-interactions, onboarding for Phase 5-7 features, better mobile touch, hex color token migration for remaining warnings
8. **Guitar Fretboard View** — chord shapes on a fretboard, voicing comparison, fingering suggestions
9. **Ear Training** — audio-based exercises: identify intervals, chord qualities, progressions by ear

### How to Start Next Session
1. Read this file (`SESSION_LOG.md`) for full project history and current state
2. Read `ROADMAP.md` for the full Phases 8–16 plan with checkable sub-tasks
3. Run `npx vitest run` to confirm 804 tests pass
4. Run `npx tsc -b && npx vite build` to confirm clean build
5. **Start with Phase 14 (UX Polish)** — quick wins, cleans up 25 lint warnings, low risk
6. Then follow the suggested order in `ROADMAP.md` for subsequent phases
