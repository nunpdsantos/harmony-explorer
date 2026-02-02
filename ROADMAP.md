# Harmony Explorer — Future Phases Roadmap

> **Baseline (end of Phase 7):** 804 tests, 48 test files, 78 source files, 11 visualizations, 22 lessons, 59 exercises, ~40 chord qualities. Phases 1–7 complete. Commit `2d22c3d` on `main`.

Each phase below is self-contained and can be done in any order. Estimated scope is per-phase. Check off sub-phases as they're completed in future sessions.

---

## Phase 8: Notation & Export

Render progressions as sheet music, export to MIDI/PDF.

### 8.1 — VexFlow Integration
- [ ] Install `vexflow` as dependency
- [ ] New `src/visualizations/SheetMusic/SheetMusic.tsx` — renders current progression as standard notation on a grand staff
- [ ] Map MIDI voicings from `voiceLeading.ts` to VexFlow `StaveNote` objects
- [ ] Show chord symbols above the staff, roman numerals below
- [ ] Handle key signatures based on `referenceRoot`
- [ ] Lazy-load VexFlow (it's ~200KB)
- [ ] Add to VizSelector under new "Notation" category

### 8.2 — MIDI File Export
- [ ] Extend existing `src/utils/midiExport.ts` to include voice-led voicings (not just root-position)
- [ ] Export as `.mid` file with proper tempo (from BPM setting), time signature, key signature
- [ ] Download button in TransportBar (disabled when progression empty)
- [ ] Include chord names as MIDI text events

### 8.3 — PDF Report Export
- [ ] New `src/utils/pdfExport.ts` using `jspdf` or browser print
- [ ] Export analysis report: progression in notation, chord names, roman numerals, voice leading distances, scale recommendations, function analysis
- [ ] Export lesson progress: completed lessons, exercise scores
- [ ] "Export PDF" button in Sidebar

### 8.4 — Tests
- [ ] SheetMusic smoke tests (renders SVG/canvas, handles empty progression)
- [ ] MIDI export tests (correct note values, tempo, key signature)
- [ ] PDF export tests (generates blob, includes expected sections)

**New files:** ~4 source, ~3 test
**Modified files:** VizSelector, VisualizationArea, TransportBar, Sidebar, store

---

## Phase 9: Piano Keyboard View ✅ COMPLETE (9.1, 9.2, 9.4)

Interactive piano keyboard showing chord voicings and voice movement.

### 9.1 — Piano Keyboard Component ✅
- [x] New `src/visualizations/PianoKeyboard/PianoKeyboard.tsx` — SVG piano (3 octaves, C3–C6)
- [x] White and black keys with proper proportions
- [x] Highlight active chord tones with quality-based colors (root = full color, others = alpha)
- [x] Show note names on keys (toggle button)
- [x] Click a key to hear the note (via audio engine, lazy-loaded)
- [x] Add to VizSelector under new "Keyboard" category
- [x] Middle C indicator dot, responsive layout

### 9.2 — Voicing Visualization ✅
- [x] Show current voicing dots on keys (color-coded by voice: bass/tenor/alto/soprano via VOICE_COLORS)
- [x] Show intervals between adjacent voicing notes (m2, M3, P5, etc.)
- [x] Voice legend below keyboard with note names
- Progression animation deferred (requires tracking playingIndex transitions)
- Split view deferred (optional enhancement)

### 9.3 — Interactive Input (deferred)
- [ ] Click keys to build custom voicings
- [ ] Chord detection: identify what chord the clicked notes form (reuse `identifyChordFromPitchClasses`)
- [ ] Integrate with MIDI input — light up keys as user plays external MIDI keyboard

### 9.4 — Tests ✅
- [x] Keyboard renders correct number of keys (22 white + 15 black + toggle = 38 groups)
- [x] Highlights correct notes for chord
- [x] Click interaction tests
- [x] Voicing dots and interval labels
- [x] Handles empty state, different sizes
- [x] 16 tests in 1 test file

**New files:** 1 source (`PianoKeyboard.tsx`), 1 test
**Modified files:** VizSelector, VisualizationArea, store, theme.ts, VizSelector.test.tsx

---

## Phase 10: Advanced Audio

Arpeggiation, rhythm patterns, voicing editor, recording.

### 10.1 — Arpeggiation Patterns
- [ ] New `src/audio/arpeggiation.ts` — pattern definitions: up, down, up-down, random, alberti bass
- [ ] Modify `audioEngine.ts` to play chords as arpeggios at subdivisions of the beat
- [ ] Pattern selector in TransportBar (dropdown or button group)
- [ ] Arpeggio speed tied to BPM

### 10.2 — Rhythm Patterns
- [ ] New `src/audio/rhythmPatterns.ts` — whole notes, half notes, quarters, swing 8ths, bossa nova, waltz
- [ ] Each pattern defines note durations and accents per beat
- [ ] Rhythm selector in TransportBar
- [ ] Visual feedback: Timeline cards pulse on rhythm hits

### 10.3 — Custom Voicing Editor
- [ ] New `src/components/VoicingEditor.tsx` — modal or sidebar panel
- [ ] Shows current voicing as MIDI notes, allows drag-up/drag-down to respell
- [ ] Constraint: notes must be valid pitch classes of the chord
- [ ] Save custom voicings per chord in store

### 10.4 — Audio Recording & Export
- [ ] Use `MediaRecorder` API to capture audio output
- [ ] Record button in TransportBar (red dot indicator)
- [ ] Export as `.wav` or `.webm`
- [ ] Option to record a single playthrough or loop

### 10.5 — Tests
- [ ] Arpeggiation pattern output tests (note order, timing)
- [ ] Rhythm pattern duration tests
- [ ] VoicingEditor interaction tests
- [ ] Recording start/stop state tests

**New files:** ~5 source, ~3 test
**Modified files:** audioEngine, TransportBar, store, Timeline

---

## Phase 11: PWA & Offline

Make the app installable and fully functional offline.

### 11.1 — Service Worker
- [ ] `vite-plugin-pwa` configuration in `vite.config.ts`
- [ ] Precache all app assets (HTML, JS, CSS, fonts)
- [ ] Runtime cache for Google Fonts
- [ ] Offline fallback page
- [ ] Cache-first strategy for static assets, network-first for API calls (if any)

### 11.2 — Web App Manifest
- [ ] Update existing `manifest.json` — app icons (192px, 512px, maskable), theme color, background color, display: standalone
- [ ] Generate icons from existing `icon.svg`
- [ ] Splash screen configuration

### 11.3 — Offline Data
- [ ] All lesson data already bundled (no API needed)
- [ ] Ensure Tone.js samples (if using samples) are cached
- [ ] IndexedDB for progression saves (prep for Phase 13)
- [ ] "Offline ready" indicator in UI

### 11.4 — Install Prompt
- [ ] Listen for `beforeinstallprompt` event
- [ ] Show install banner/button when available
- [ ] Track install state in store

### 11.5 — Tests
- [ ] Service worker registration tests (mock)
- [ ] Offline state detection tests
- [ ] Install prompt handling tests

**New files:** ~3 source, ~2 test, icons
**Modified files:** vite.config.ts, manifest.json, App.tsx, store

---

## Phase 12: Performance & Analytics

Track student progress, spaced repetition, difficulty adaptation.

### 12.1 — Progress Tracking
- [ ] New `src/learn/progressTracker.ts` — records exercise attempts (timestamp, correct/incorrect, time spent)
- [ ] Store in IndexedDB via `idb` library
- [ ] Progress dashboard page/modal: completion %, accuracy per lesson, streak count
- [ ] Heatmap calendar of practice days

### 12.2 — Spaced Repetition
- [ ] New `src/learn/spacedRepetition.ts` — SM-2 algorithm implementation
- [ ] Each exercise gets a "next review" date based on past performance
- [ ] "Review" mode: presents exercises due for review across all lessons
- [ ] Review button in Sidebar (shows count of due exercises)

### 12.3 — Difficulty Adaptation
- [ ] Track accuracy per exercise type and topic area
- [ ] Auto-suggest next lesson based on weakest areas
- [ ] Exercises can have difficulty tiers (easy/medium/hard)
- [ ] Show difficulty badge on exercises

### 12.4 — Tests
- [ ] Progress tracking CRUD tests
- [ ] SM-2 interval calculation tests
- [ ] Difficulty scoring tests
- [ ] Dashboard rendering tests

**New files:** ~4 source, ~3 test
**Modified files:** ExercisePanel, LessonView, Sidebar, store

---

## Phase 13: Progression Save/Share

Persistent storage and sharing of progressions.

### 13.1 — IndexedDB Storage
- [ ] New `src/utils/progressionStorage.ts` — CRUD operations for named progressions
- [ ] Uses `idb` library (or raw IndexedDB)
- [ ] Each saved progression: name, chords, key, timestamp, tags
- [ ] "My Progressions" panel in Sidebar with list, load, delete

### 13.2 — Import/Export
- [ ] Export as JSON file (download)
- [ ] Import from JSON file (file picker)
- [ ] Export as shareable URL (encode progression in URL hash/params)
- [ ] Import from URL on app load (parse hash)

### 13.3 — Progression Library
- [ ] Built-in library of famous progressions (Autumn Leaves, Giant Steps, All The Things You Are, Rhythm Changes, etc.)
- [ ] Categorized: Jazz Standards, Pop, Classical, Blues
- [ ] Click to load into builder

### 13.4 — Tests
- [ ] IndexedDB CRUD tests (mock)
- [ ] JSON import/export round-trip tests
- [ ] URL encoding/decoding tests
- [ ] Library data validation tests

**New files:** ~3 source, ~3 test
**Modified files:** Sidebar, store, App.tsx (URL parsing)

---

## Phase 14: UX Polish & Animation ✅ COMPLETE

Micro-interactions, transitions, onboarding updates, token cleanup.

### 14.1 — Transitions & Animation ✅
- [x] Visualization switch fade-in (keyed wrapper)
- [x] Page transition for Explore ↔ Learn mode (same mechanism)
- [x] Mobile overlay fade-in
- [x] All animations respect `prefers-reduced-motion`
- ChordBubble already has hover scale + transition (existing)
- Sidebar collapse width animation skipped (two separate render paths, not worth refactoring)

### 14.2 — Micro-Interactions ✅
- [x] Button press: scale-down feedback (`active:scale-[0.97]`)
- [x] Success feedback: pulse animation on exercise completion
- ChordBubble hover glow/pulse already existed (Phase 3)

### 14.3 — Onboarding Updates ✅
- [x] Tour expanded 6→8 steps for Phase 5-7 features
- [x] Contextual info for overlays (V, B, M, J shortcuts)
- "What's New" modal skipped (requires version tracking, over-engineering)

### 14.4 — Token Cleanup ✅
- [x] Migrated 24 hex color warnings to 5 new semantic tokens
- [x] Files: ChordScaleMap, NegativeHarmonyMirror, CircleOfFifths, Sidebar, ChordBubble.test
- [x] Removed unused eslint-disable in undoMiddleware
- [x] Goal achieved: zero ESLint warnings

### 14.5 — Tests ✅
- [x] Onboarding tour tests updated for 8-step count
- [x] Token audit: zero raw hex in .tsx files
- [x] 804 tests passing, zero errors, zero warnings

**Modified files:** 14 files (token migration + animations + onboarding)

---

## Phase 15: Guitar Fretboard View

Chord shapes on a fretboard with voicing comparison.

### 15.1 — Fretboard Component
- [ ] New `src/visualizations/GuitarFretboard/GuitarFretboard.tsx` — SVG 6-string fretboard (frets 0–15)
- [ ] Standard tuning (E A D G B E), support for alternate tunings
- [ ] Show chord tones as colored dots on fret positions
- [ ] Multiple voicing options per chord (open, barre, jazz voicings)
- [ ] Finger numbering overlay

### 15.2 — Chord Shape Database
- [ ] New `src/core/guitarVoicings.ts` — common chord shapes for all qualities
- [ ] Open position, barre position, and jazz voicing variants
- [ ] Voice leading between consecutive guitar shapes
- [ ] Capo support (transpose shapes)

### 15.3 — Integration
- [ ] Add to VizSelector under "Keyboard" or new "Instrument" category
- [ ] Responds to selected chord from store
- [ ] Click a fret position to hear the note
- [ ] Show multiple voicing options with "next voicing" button

### 15.4 — Tests
- [ ] Fretboard renders correct number of strings/frets
- [ ] Chord shapes produce correct pitch classes
- [ ] Voicing navigation tests
- [ ] Tuning calculation tests

**New files:** ~3 source, ~2 test
**Modified files:** VizSelector, VisualizationArea, store

---

## Phase 16: Ear Training

Audio-based exercises for interval, chord, and progression recognition.

### 16.1 — Interval Training
- [ ] New `src/learn/earTraining.ts` — exercise generation for intervals
- [ ] Play two notes, user identifies the interval (m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7, P8)
- [ ] Ascending, descending, and harmonic (simultaneous) modes
- [ ] Progressive difficulty: start with P5/P4/P8, add smaller intervals

### 16.2 — Chord Quality Training
- [ ] Play a chord, user identifies the quality (major, minor, dim, aug, dom7, maj7, min7, etc.)
- [ ] Start with triads, progress to 7ths, then extensions
- [ ] Show chord on current visualization after answering

### 16.3 — Progression Dictation
- [ ] Play a 4-chord progression, user builds it in the progression builder
- [ ] Difficulty tiers: diatonic only → with secondary dominants → with borrowed chords → with substitutions
- [ ] Replay button, hint button (reveals one chord)

### 16.4 — Ear Training UI
- [ ] New exercise type: `'ear-training'` in LessonExercise
- [ ] Dedicated ear training mode accessible from Sidebar
- [ ] Score tracking and streaks
- [ ] Integration with spaced repetition (Phase 12) if available

### 16.5 — Tests
- [ ] Interval generation tests (correct frequencies/MIDI)
- [ ] Chord quality randomization tests
- [ ] Progression dictation validation tests
- [ ] UI interaction tests

**New files:** ~4 source, ~3 test
**Modified files:** ExercisePanel, LessonView, audioEngine, store, lessonData

---

## Summary Table

| Phase | Name | Key Deliverables | Approx. New Files |
|-------|------|-----------------|-------------------|
| 8 | Notation & Export | Sheet music viz, MIDI export, PDF reports | ~7 |
| 9 | Piano Keyboard | Piano viz, voicing display, click input | ~5 |
| 10 | Advanced Audio | Arpeggiation, rhythm, voicing editor, recording | ~8 |
| 11 | PWA & Offline | Service worker, installable, offline-ready | ~5 |
| 12 | Performance & Analytics | Progress tracking, spaced repetition, adaptation | ~7 |
| 13 | Progression Save/Share | IndexedDB, JSON/URL sharing, famous progressions | ~6 |
| 14 | UX Polish | Animations, micro-interactions, token cleanup | ~3 |
| 15 | Guitar Fretboard | Fretboard viz, chord shapes, tunings | ~5 |
| 16 | Ear Training | Interval/chord/progression ear exercises | ~7 |

## Suggested Order

Phases can be done in any order, but this sequence builds naturally:

1. ~~**Phase 14** (UX Polish)~~ ✅ DONE
2. ~~**Phase 9** (Piano Keyboard)~~ ✅ DONE (9.3 interactive input deferred)
3. **Phase 8** (Notation & Export) — pairs well with piano keyboard
4. **Phase 10** (Advanced Audio) — enriches the audio experience
5. **Phase 13** (Progression Save/Share) — enables persistence
6. **Phase 11** (PWA & Offline) — depends on persistence being solid
7. **Phase 12** (Performance & Analytics) — depends on persistence
8. **Phase 15** (Guitar Fretboard) — new instrument view
9. **Phase 16** (Ear Training) — depends on solid audio + exercise system

## How to Use This File

1. Pick a phase to work on
2. Create a detailed plan in `.claude/plans/` (like Phase 7's plan)
3. Work through sub-phases in order, checking off items
4. Update `SESSION_LOG.md` after each phase completion
5. Update `CLAUDE.md` with new metrics
