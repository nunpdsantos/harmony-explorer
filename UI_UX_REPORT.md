# Harmony Explorer — UI/UX Design Report

Full audit of the interface design, interaction patterns, visual system, and user experience. Honest assessment: what works, what doesn't, what's missing.

---

## 1. Executive Summary

Harmony Explorer is a dark-themed, information-dense music theory education tool. The UI is **functional and structurally sound** — it gets you from chord selection to visualization to playback without confusion. Accessibility foundations are real (ARIA, keyboard nav, focus management). The design system exists but is **partially applied** — tokens are defined, then bypassed. The visual language is **competent but generic**: it looks like a developer tool, not a music tool. There is no typographic identity, no spatial personality, no memorable visual moment. The app does what it needs to do. It doesn't make you want to stay.

**Overall rating: 6.5/10** — Solid engineering, adequate UX, underdeveloped visual design.

---

## 2. Visual Identity

### 2.1 Typography

**Font:** Inter (Google Fonts), weights 400/500/600/700, with `system-ui` fallback.

**Assessment:** Inter is the default choice for developer tools. It's legible, neutral, and forgettable. For a music theory app — a domain rich with history, emotion, and visual tradition — Inter communicates nothing about the subject matter. No display font. No typographic contrast. No personality.

**Type scale:** 5 stops — 10px, 12px, 14px, 16px, 20px.

| Token | Value | Usage |
|-------|-------|-------|
| `--text-2xs` | 10px | Labels, sublabels, legends |
| `--text-xs` | 12px | Most body text, buttons |
| `--text-sm` | 14px | Chord names, secondary headings |
| `--text-base` | 16px | Rarely used |
| `--text-lg` | 20px | App title only |

**Problems:**
- No line-height tokens. Tailwind defaults apply inconsistently.
- No letter-spacing tokens. `tracking-tight` and `tracking-wider` are used ad hoc.
- 10px text (`--text-2xs`) is used heavily for labels and legends. At this size on high-DPI screens, legibility depends on font rendering. On lower-density displays, it's borderline unreadable.
- The jump from 16px to 20px is the only large-text option. No heading hierarchy above 20px.
- SVG text elements use hardcoded `fontSize` values (7px, 8px, 9px, 11px, 13px, 14px, 20px) that don't map to the token scale at all.

**Verdict:** The type system is minimal and under-specified. It handles basic content but provides no typographic rhythm, no contrast between display and body text, and no connection to the musical domain.

### 2.2 Color System

**Semantic palette (tokens.css):**

| Token | Hex | Role |
|-------|-----|------|
| `--color-tonic` | `#22c55e` | Green — tonic function |
| `--color-subdominant` | `#3b82f6` | Blue — subdominant function |
| `--color-dominant` | `#ef4444` | Red — dominant function |
| `--color-accent` | `#f59e0b` | Amber — selection, reference |

**Surface/text hierarchy (opacity-based):**

| Token | Value | Role |
|-------|-------|------|
| `--color-surface` | `rgba(255,255,255,0.05)` | Background |
| `--color-surface-hover` | `rgba(255,255,255,0.08)` | Hover state |
| `--color-surface-active` | `rgba(255,255,255,0.12)` | Active state |
| `--color-text-primary` | `rgba(255,255,255,0.90)` | Primary text |
| `--color-text-secondary` | `rgba(255,255,255,0.60)` | Secondary text |
| `--color-text-muted` | `rgba(255,255,255,0.50)` | Muted text |
| `--color-text-faint` | `rgba(255,255,255,0.40)` | Faint text |

**What works:**
- The tonic/subdominant/dominant color mapping (green/blue/red) is the strongest design decision in the app. It's semantically meaningful, instantly learnable, and consistently applied across visualizations, badges, chord buttons, and SVG elements.
- The opacity-based text hierarchy creates clear visual layers without introducing new hue values.
- Dark theme (`bg-gray-950` / `#030712`) is appropriate for a visualization-heavy app where colors carry meaning.

**What doesn't:**
- **Token adoption is partial.** Components use Tailwind color classes (`text-white/50`, `bg-blue-600/30`, `border-white/10`) instead of the defined CSS variables. The tokens exist but most of the codebase ignores them.
- **Chord quality colors** in `colors.ts` are a separate hardcoded palette (13 colors for major, minor, dim, aug, dom7, etc.) that has no relationship to the design tokens.
- **Visualization colors** are inline hex values (`#8b5cf6`, `#fbbf24`, `#a78bfa`, `#ec4899`) scattered across SVG components.
- **Focus indicator** (`#3b82f6`) is hardcoded in `index.css`, not using `--color-subdominant`.
- **Range input thumb** (`#3b82f6`) is also hardcoded.

**Result:** Three independent color systems coexist — CSS tokens, Tailwind utilities, and hardcoded hex values. Changes to the palette require touching dozens of files instead of one.

### 2.3 Spacing

**Token scale:** 4px increments from `--space-1` (4px) to `--space-6` (24px).

**Actual usage:** Near zero. Components use Tailwind spacing utilities directly:
- `px-4 py-3` (Card)
- `px-2 py-1.5` (Button sm)
- `gap-1.5`, `gap-2`, `gap-3` (various)
- `mt-3`, `mb-2`, `mb-1` (ad hoc margins)

The tokens are defined but effectively unused. Spacing is consistent enough within individual components but varies across them without a shared rhythm.

### 2.4 Backgrounds & Atmosphere

**Current state:** `bg-gray-950` full screen, `bg-gray-900/95 backdrop-blur` for sidebar and transport bar. That's it.

No gradients. No textures. No depth layers. No visual atmosphere. The background is a flat dark void. For an app about harmony — a concept built on relationships, tension, and resolution — the visual environment communicates nothing. Compare with music production tools (Ableton, Logic) or theory apps (Hooktheory) that use spatial depth, subtle gradients, or tonal warmth to create an environment appropriate to the domain.

---

## 3. Layout & Composition

### 3.1 Overall Structure

```
┌──────────────────────────────────────────┐
│ [Mobile header - hamburger + title]      │ ← lg:hidden
├──────────┬───────────────────────────────┤
│          │                               │
│ Sidebar  │     Visualization Area        │
│ (288px)  │     (flex-1)                  │
│          │                               │
├──────────┴───────────────────────────────┤
│ TransportBar (Timeline + Controls)       │
└──────────────────────────────────────────┘
```

**Assessment:** Standard three-panel layout. Sidebar left, main content center-right, transport at bottom. This is a proven pattern for creative tools (DAWs, design apps). The hierarchy is clear: visualization dominates, controls are secondary, transport is persistent.

**Problems:**
- **Sidebar is 288px fixed.** On a 1024px screen (the `lg` breakpoint), that leaves 736px for the visualization. Adequate, but tight for complex SVGs like CircleOfFifths with overlays active.
- **No resizable sidebar.** Users can't adjust the split.
- **Transport bar height is fixed at 96px** for the timeline plus controls. On short screens or landscape phones, this consumes significant vertical space.
- **No panel collapsing.** Can't hide sidebar in desktop to get a full-screen visualization view.

### 3.2 Sidebar Composition

The sidebar packs a lot into 288px:
1. Header (title + mode toggle + viz selector)
2. Context-dependent cards (overlays, key selector, diatonic chords, selected chord, next moves, templates, voice leading quality, saved progressions)
3. Audio enable CTA

**Problems:**
- **Vertical scrolling is inevitable** but there's no visual indicator of scroll position or overflow.
- **Information density varies wildly.** The diatonic chord grid (4 columns of colorful buttons) is visually dominant. The templates list and saved progressions below it are visually lightweight. The hierarchy doesn't match importance.
- **Card spacing is uniform** (`border-b border-white/10`). No visual grouping distinguishes "core actions" (key, chords) from "auxiliary tools" (templates, saved).

### 3.3 Visualization Area

Visualizations fill the available space via `useContainerSize`. SVGs scale with the container. This is correct behavior.

**Problem:** No minimum size enforcement. On very small containers, chord names in SVG become illegible. No fallback or simplified rendering for constrained spaces.

---

## 4. Component Design

### 4.1 Button

Four variants (primary/secondary/ghost/danger), two sizes (sm/md).

```
sm: text-xs px-2 py-1 rounded       → ~24px tall
md: text-sm px-3 py-1.5 rounded-lg  → ~32px tall
```

**Problems:**
- `sm` buttons are 24px tall. Below the 44px WCAG touch target minimum. The `md` variant at 32px is also below threshold.
- No `lg` size exists for primary CTAs.
- The ghost variant (`text-white/50`) has minimal visual affordance. It doesn't look like a button.
- Button colors are Tailwind classes, not design tokens.

### 4.2 Badge

Five semantic variants mapping to harmonic function:

| Variant | Background | Text |
|---------|-----------|------|
| tonic | `green-500/20` | `green-400` |
| subdominant | `blue-500/20` | `blue-400` |
| dominant | `red-500/20` | `red-400` |
| neutral | `white/10` | `white/60` |
| success | `emerald-500/20` | `emerald-400` |

**Assessment:** The badge component is well-designed for its purpose. The function-color mapping is semantically clear. The low-opacity backgrounds prevent visual overload while maintaining color meaning.

**Problem:** At 10px text with 6px/2px padding, badges are extremely small. Touch targets are approximately 16px tall — far below minimum.

### 4.3 Card

Simple container: optional title, optional action slot, content children, optional bottom border.

**Assessment:** Cards provide adequate sectioning in the sidebar. The uppercase 10px titles act as section dividers.

**Problem:** Cards have no visual weight — no background color, no shadow, no elevation. In a dense sidebar, they blend into each other. The only separator is a thin `border-white/10` bottom border that's nearly invisible.

### 4.4 Modal

Uses native `<dialog>` element. Backdrop blur, gray-900 background, rounded-xl corners.

**Assessment:** Semantically correct. Visually adequate.

**Problems:**
- No focus trap. Tab key can escape to background content.
- No return-focus on close (focus doesn't go back to trigger element).
- Backdrop click closes the modal, but there's no visible affordance suggesting this.

### 4.5 ChordBubble (SVG Interactive Element)

The most important interactive element in the app. Used across all visualizations.

**What works:**
- Rich state encoding: stroke color, stroke width, scale, opacity, and animation all encode different states (selected, hovered, in-progression, reference, next-move, dimmed).
- The pulsing glow animation on next-move suggestions is effective.
- Accessibility: full ARIA labels, keyboard support, 44px invisible touch targets.
- State-dependent fill colors from `qualityColor()` provide instant chord quality recognition.

**What doesn't:**
- 15 boolean/optional props create a complex combinatorial state space. Some combinations may produce visual conflicts (e.g., a chord that's simultaneously selected, in-progression, and a next-move).
- Font sizes are hardcoded (14px for large bubbles, 11px for small; 8px for labels, 7px for sublabels). On small screens with many chords, these become illegible.
- The sublabel function coloring (`T`=green, `S`=blue, `D`=red) uses hardcoded hex matching the tokens but not referencing them.

---

## 5. Interaction Design

### 5.1 Core Interaction Loop

The primary interaction pattern:

```
Select Key → See Diatonic Chords → Click Chord → Hear It + See It Everywhere
                                        ↓
                           Added to Progression → Play Progression
```

**Assessment:** This loop is clean and intuitive. Click-to-hear provides immediate feedback. Cross-visualization highlighting (clicking a chord updates all views) creates a powerful exploratory experience. The connection between seeing and hearing is the app's strongest UX feature.

### 5.2 Progression Building

Two modes of building:
1. **Direct click** on diatonic chords in sidebar → appends to progression
2. **Next moves panel** → suggests contextual next chords grouped by strength

Plus:
- Template insertion (replaces progression)
- Drag-to-reorder in timeline
- Bridge chord insertion (click suggested bridge between chords)

**Problems:**
- **No undo.** Accidentally clearing a progression is permanent. No Ctrl+Z.
- **Templates replace** the entire progression without confirmation.
- **Drag-to-reorder uses HTML5 drag** — not available on touch devices. No touch fallback.
- **Bridge chord suggestions** are visually faint (opacity-40, small dashed-border cards). Users may not discover them without the onboarding tour.

### 5.3 Playback Controls

Play/Stop, Loop, BPM, Voices overlay, Bridges overlay, Preset, Volume, Humanize, MIDI export, Clear.

**Assessment:** Feature-complete. All necessary controls exist.

**Problems:**
- **10+ controls in a single row** that wraps on smaller screens. No grouping, no visual hierarchy. Play and Clear have equal visual weight, despite very different importance.
- **No keyboard shortcut hints** on the controls themselves. Users must open the shortcuts modal to discover them.
- **BPM and Volume sliders** are 64-96px wide. Precise adjustment is difficult, especially with a trackpad.
- **Preset selector** is a native `<select>` dropdown — visually inconsistent with the custom-styled buttons around it.

### 5.4 Keyboard Shortcuts

15 shortcuts covering playback, navigation, mode switching, and feature toggles.

**Assessment:** Comprehensive and well-chosen. `Space` for play, `L` for loop, `V` for voices, `B` for bridges — mnemonic and discoverable.

**Problem:** `?` opens shortcuts reference, but there's no onscreen hint that shortcuts exist until you happen to press `?` or complete the onboarding tour. A small keyboard icon in the UI would help.

### 5.5 Onboarding

6-step overlay tour on first visit, with localStorage persistence.

**Assessment:** Covers the basics — sidebar, visualization, chord clicking, progression, playback, learning mode. Reasonable for first-time orientation.

**Problems:**
- **One-shot only.** No way to replay the tour from the UI (must clear localStorage).
- **No contextual help.** When a user first encounters voice-leading overlays or bridge chords (Phase 5 features), there's no guidance. The onboarding only covers Phase 1-3 concepts.
- **No progressive disclosure.** Advanced features (bridges, modulation, templates) are visible immediately alongside basics, increasing cognitive load for beginners.

---

## 6. Responsive Design

### 6.1 Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Default | < 640px | Full mobile: sidebar overlay, cramped controls |
| `sm:` | 640px | Slightly wider gaps, visible labels |
| `lg:` | 1024px | Desktop: static sidebar, hidden mobile header |

**Missing:**
- No `md:` (768px) breakpoint. iPads in portrait (768px) get the mobile experience.
- No `xl:` (1280px) or `2xl:` (1536px) optimization. Large monitors get the same layout as a 1024px laptop.
- No landscape detection for phones (limited vertical space).
- No container queries. All breakpoints are viewport-based.

### 6.2 Mobile Experience

**Layout:** Sidebar becomes a fixed overlay with hamburger trigger. Visualization takes full width. Transport bar wraps controls.

**Problems:**
- **Transport controls wrap to 2-3 rows** on phone screens. 10+ small buttons competing for space.
- **Timeline height (96px) is fixed.** On a 667px-tall phone minus browser chrome and transport controls, the visualization area may be under 350px.
- **Drag-to-reorder doesn't work on touch.** HTML5 drag-and-drop API is desktop-only.
- **No swipe gestures.** Mobile users expect swipe to navigate between visualizations.
- **SVG visualizations don't simplify** at small sizes. Chord names and labels overlap.
- **Sidebar at 288px** covers most of a 375px phone screen. The remaining 87px of peeking content is too narrow to be useful as a "I can see what's behind" indicator but wide enough to look like a layout bug.

### 6.3 Tablet Experience

**Assessment:** Tablets get the worst of both worlds. At 768px (iPad portrait), you get the mobile layout with a touch-optimized sidebar overlay. At 1024px (iPad landscape), you get the desktop layout with a mouse-optimized static sidebar. Neither is truly tablet-optimized.

---

## 7. Accessibility

### 7.1 What's Done Well

- **ARIA roles and labels** are comprehensive. Sidebar, buttons, radio groups, toggle buttons, chord bubbles all have appropriate attributes.
- **Keyboard navigation** exists for all primary interactions. ChordBubble supports Enter/Space. Buttons are tabbable.
- **Focus indicators** are visible with `:focus-visible` outline.
- **Skip-to-content link** exists.
- **Semantic HTML**: `<dialog>`, `<aside>`, `<main>`, `<nav>`, `<header>`.
- **SVG accessibility**: `role="img"`, `<title>`, `<desc>` on visualization SVGs.
- **Lighthouse Accessibility: 100/100.**

### 7.2 What's Missing

| Issue | Severity | Details |
|-------|----------|---------|
| `prefers-reduced-motion` | **High** | No support. All animations play unconditionally. The pulsing ChordBubble glow, sidebar slide transition, and playing chord scale animation will affect users with vestibular disorders. |
| Modal focus trap | **High** | Tab key escapes the modal to background content. Screen reader users may lose context. |
| Touch targets | **Medium** | Multiple elements below 44px minimum: sm buttons (~24px), badges (~16px), legend items, VizSelector options. |
| Color-only information | **Medium** | Chord quality is communicated primarily through color (blue=major, purple=minor, red=dim). Color-blind users need the text labels, which exist but are small and secondary. |
| Drag-and-drop | **Medium** | Timeline reordering has no keyboard alternative. Users who can't use a mouse can't reorder chords. |
| Focus return | **Low** | Modal close doesn't return focus to trigger element. |
| `prefers-contrast` | **Low** | No support for high-contrast preferences. |
| Tooltip viewport bounds | **Low** | Tooltips can overflow screen edges, becoming partially hidden. |

### 7.3 Screen Reader Experience

Not tested with actual screen readers (VoiceOver, NVDA). The ARIA markup suggests a reasonable experience, but SVG-heavy interactive visualizations are inherently challenging for screen readers. The ChordBubble aria-labels are descriptive (`"C Major, I, reference chord, selected, in progression"`) which is good practice.

---

## 8. Design System Coherence

### 8.1 Token Adoption Score

| Category | Tokens Defined | Token Usage Rate | Assessment |
|----------|---------------|-----------------|------------|
| Type scale | 5 sizes | ~40% | SVG text ignores tokens entirely |
| Colors (semantic) | 4 function colors | ~30% | Most usage is hardcoded Tailwind classes |
| Colors (surface/text) | 8 values | ~15% | Almost never referenced directly |
| Spacing | 6 values | ~5% | Effectively unused |
| Radii | 4 values | ~10% | Tailwind classes used instead |

**Overall token adoption: ~20%.** The design system is declared but not enforced. This means:
- Theme changes require touching many files instead of one.
- Visual consistency depends on developer discipline rather than system constraints.
- A "dark mode to light mode" switch is not feasible without rewriting most component styles.

### 8.2 Inconsistencies Catalog

**Color inconsistencies:**
- Focus indicator: hardcoded `#3b82f6` in `index.css`, should use `--color-subdominant`
- Range thumb: hardcoded `#3b82f6` in `index.css`
- ChordBubble sublabel colors: inline hex matching tokens but not referencing them
- Visualization colors: ~30 unique hardcoded hex values across SVG files
- Toggle button active states: each uses a different Tailwind color class (blue/violet/pink/amber/green)

**Spacing inconsistencies:**
- Card padding: `px-4 py-3`
- Button sm padding: `px-2 py-1`
- Button md padding: `px-3 py-1.5`
- Transport controls gap: `gap-2 sm:gap-3`
- Sidebar internal gap: `gap-1.5`
- Chord grid gap: `gap-1.5`
- Template list gap: `gap-1`

These follow no shared rhythm. Each component defines its own spacing independently.

**Typography inconsistencies:**
- Sidebar title: `text-lg font-bold` (20px)
- Card titles: `text-[10px] uppercase tracking-wider font-medium`
- Button text: `text-xs` (12px) or `text-sm` (14px)
- SVG chord names: `fontSize={14}` or `fontSize={11}` (dynamic)
- SVG labels: `fontSize={7}`, `fontSize={8}`, `fontSize={9}`

---

## 9. Performance & Loading

### 9.1 Bundle Analysis

| Chunk | Size | Loading |
|-------|------|---------|
| App core | 86KB | Immediate |
| React vendor | 192KB | Immediate |
| Tone.js | 340KB | Lazy (on first play) |
| Visualizations | ~8KB each | Lazy (React.lazy) |
| Total initial | 278KB | — |

**Assessment:** Initial load is lean. Lazy-loading Tone.js is the right call — audio is a secondary concern at first paint. Visualization code-splitting means only the active viz loads.

### 9.2 Rendering Performance

No performance profiling data available. Potential concerns:
- SVG visualizations with many elements (CircleOfFifths with all overlays active: dozens of chord bubbles, lines, arcs, labels)
- `useMemo` is used appropriately for voicings and bridge suggestions
- No virtualization for long progressions in Timeline

### 9.3 Loading States

**Current:** `"Loading..."` text in a centered flex container for lazy-loaded components.

**Problem:** No skeleton screens, no progress indicators, no branded loading state. The transition from empty to loaded is abrupt.

---

## 10. Information Architecture

### 10.1 Mode Structure

```
Explore Mode                    Learn Mode
├── 8 Visualizations            ├── 16 Lessons
│   ├── Circle of Fifths        │   ├── Lesson 1-12 (fundamentals)
│   ├── Alternation Circle      │   └── Lesson 13-16 (advanced)
│   ├── Proximity Pyramid       │
│   ├── Tonal Function Chart    │
│   ├── Diminished Symmetry     │
│   ├── Augmented Star          │
│   ├── Tritone Substitution    │
│   └── Modulation Map          │
├── Key Selector                │
├── Diatonic Chords             │
├── Builder (Next Moves)        │
├── Templates                   │
├── Voice Leading Quality       │
└── Saved Progressions          │
```

**Assessment:** The Explore/Learn split is clear. Explore mode provides tools; Learn mode provides guidance. The viz selector categories (Circle, Function, Symmetry, Keys) are meaningful groupings.

**Problems:**
- **No connection between modes.** Learn mode doesn't reference Explore mode tools. A lesson about voice leading could link to the Voices overlay, but doesn't.
- **Visualization naming is jargon-heavy.** "Proximity Pyramid" and "Tritone Substitution" assume domain knowledge. No descriptions or tooltips explain what each visualization shows.
- **The VizSelector abbreviations** (CoF, Alt, Prox, T/S/D, Dim, Aug, Tri, Mod) are not self-explanatory.

### 10.2 Discoverability

**Hidden features:**
- Bridge chord suggestions (toggle buried in transport controls)
- Voice-leading overlay (toggle buried in transport controls)
- Drag-to-reorder (no visual hint)
- Keyboard shortcuts (no visible indicator)
- MIDI export (small button, no tooltip)
- Humanize toggle (no explanation of what it does)

**Assessment:** Many of the app's most powerful features are low-visibility. A user who opens the app, selects a key, clicks some chords, and plays them back will have a good experience — but may never discover bridges, voice-leading analysis, templates, or modulation exploration without the onboarding tour or documentation.

---

## 11. Comparison Against Domain Standards

### 11.1 Music Theory Education Tools

**Hooktheory (hooktheory.com):** Piano-roll visualization, horizontal progression with vertical pitch, chord function colors. Uses playful, warm color palette. Clear progressive disclosure.

**musictheory.net:** Clean, minimal interface. Focuses on one concept per page. High contrast. Large touch targets.

**Harmony Explorer vs. these:**
- **Stronger** in visualization variety (9 visualizations vs. typically 1-2)
- **Stronger** in harmonic analysis depth (bridge chords, modulation routes, dominant chains)
- **Weaker** in visual polish and progressive disclosure
- **Weaker** in mobile experience
- **Weaker** in onboarding and guided learning flow

### 11.2 Creative Music Tools

**Ableton Live:** Dark theme, color-coded clips, timeline-based. Dense but hierarchically organized. Clear primary actions.

**Splice:** Modern, dark, gradient-rich. Strong visual identity. Audio-visual connection.

**Harmony Explorer vs. these:**
- Similar density level but without the visual refinement
- No animation or motion design to match the creative domain
- No branded visual identity (could be any dark-mode web app)

---

## 12. Priority Recommendations

### Critical (Functional Gaps)

| # | Issue | Impact |
|---|-------|--------|
| 1 | Add `prefers-reduced-motion` support | Accessibility compliance, user safety |
| 2 | Implement modal focus trap | Screen reader users can't use modals properly |
| 3 | Add keyboard alternative to drag-reorder | Keyboard-only users can't reorder chords |
| 4 | Add undo/redo for progression changes | Destructive actions have no recovery |

### High (Usability)

| # | Issue | Impact |
|---|-------|--------|
| 5 | Increase minimum touch targets to 44px | Mobile/tablet usability |
| 6 | Add touch-based reordering (long-press + drag) | Mobile users can't reorder |
| 7 | Collapse transport controls on small screens | Mobile layout is cramped |
| 8 | Add contextual help/tooltips to feature toggles | Feature discoverability |
| 9 | Add visual scroll indicator to sidebar | Users don't know content extends below |
| 10 | Simplify SVG visualizations at small sizes | Readability on mobile |

### Medium (Visual Design)

| # | Issue | Impact |
|---|-------|--------|
| 11 | Replace Inter with a distinctive font pairing | Visual identity and memorability |
| 12 | Enforce design token usage across all components | Maintainability and consistency |
| 13 | Add depth/atmosphere to background | Visual warmth appropriate to domain |
| 14 | Redesign transport bar with visual grouping | Reduce cognitive load |
| 15 | Add skeleton loading states | Perceived performance |
| 16 | Create card elevation/grouping system | Sidebar visual hierarchy |

### Low (Enhancement)

| # | Issue | Impact |
|---|-------|--------|
| 17 | Add `md:` breakpoint for tablets | Tablet experience |
| 18 | Support `prefers-contrast: high` | Accessibility |
| 19 | Add panel resize handles | Power user workflow |
| 20 | Connect Learn and Explore modes | Pedagogical flow |
| 21 | Add descriptive tooltips to viz selector | Discoverability for beginners |

---

## 13. Component Inventory

### UI Primitives

| Component | File | Variants | Token Compliance |
|-----------|------|----------|-----------------|
| Button | `ui/Button.tsx` | primary, secondary, ghost, danger × sm, md | Partial (Tailwind classes, not tokens) |
| Badge | `ui/Badge.tsx` | tonic, subdominant, dominant, neutral, success | Good (semantic colors match tokens) |
| Card | `ui/Card.tsx` | title, action, noBorder | Partial (spacing via Tailwind) |
| Modal | `ui/Modal.tsx` | — | Partial |
| Tooltip | `ui/Tooltip.tsx` | top, bottom, left, right | Partial |
| VisuallyHidden | `ui/VisuallyHidden.tsx` | — | N/A |

### Application Components

| Component | File | Lines | Complexity |
|-----------|------|-------|------------|
| Sidebar | `Sidebar.tsx` | 397 | High — multiple conditional sections, state management |
| TransportBar | `TransportBar.tsx` | 307 | High — playback, audio, memos, callbacks |
| VizSelector | `VizSelector.tsx` | 78 | Low |
| VisualizationArea | `VisualizationArea.tsx` | 78 | Low — lazy router |
| NextMovesPanel | `NextMovesPanel.tsx` | — | Medium |
| VoiceLeadingQuality | `VoiceLeadingQuality.tsx` | — | Medium |
| OnboardingTour | `OnboardingTour.tsx` | — | Medium |
| ShortcutsReference | `ShortcutsReference.tsx` | — | Low |

### Visualization Components

| Component | SVG Elements | Interactive | States |
|-----------|-------------|-------------|--------|
| CircleOfFifths | ~100+ (chords, arcs, lines, labels) | ChordBubble × 12+ | Selected, hovered, overlays |
| TonalFunctionChart | ~50+ | ChordBubble × 7 | Selected, hovered |
| ProximityPyramid | ~40+ | ChordBubble × 7 | Selected, hovered |
| Timeline | HTML cards + SVG overlay | Drag, click, remove | Playing, selected, bridge |
| AugmentedStar | ~30+ | ChordBubble × 4 | Selected, hovered |
| DiminishedSymmetry | ~40+ | ChordBubble × 3+ | Selected, hovered |
| AlternationCircle | ~30+ | ChordBubble × 12 | Selected, hovered |
| TritoneSubDiagram | ~40+ | ChordBubble × 12 | Selected, hovered |
| ModulationMap | ~60+ | ChordBubble × 14+, key selectors | Source/target, pivots |

---

## 14. Metrics Summary

| Metric | Value | Assessment |
|--------|-------|------------|
| Lighthouse Accessibility | 100/100 | Automated checks pass; manual gaps remain |
| Lighthouse Best Practices | 100/100 | Good |
| Lighthouse SEO | 100/100 | Good |
| Initial bundle | 278KB | Lean |
| Lazy audio | 340KB | Appropriate |
| Tests | 588 (37 files) | Strong coverage |
| TypeScript errors | 0 | Clean |
| Lint errors | 0 | Clean |
| Design token adoption | ~20% | Needs enforcement |
| Touch target compliance | ~60% | Below standard |
| WCAG 2.1 AA estimated | ~85% | Motion, focus trap, touch targets missing |
| Mobile usability | ~55% | Functional but cramped and missing touch patterns |

---

## 15. Conclusion

Harmony Explorer is an **engineering-first product with design-second treatment.** The architecture is clean, the features are deep, and the core interaction loop (select → hear → see → build) is genuinely effective. The harmonic function color system is the standout design decision — it turns abstract music theory into immediately visual, learnable relationships.

The weaknesses are in visual identity (generic font, flat backgrounds, no atmosphere), design system enforcement (tokens exist but aren't used), mobile optimization (functional but not comfortable), and progressive disclosure (powerful features are hidden). The accessibility foundation is solid but has specific gaps that prevent full WCAG 2.1 AA compliance.

The app is at the stage where the functionality is mature and the interface needs to catch up. A focused visual design pass — typography, atmosphere, motion, and token enforcement — would transform it from "impressive technical demo" into "product people want to use."

---

*Report generated: Feb 1, 2026*
*Scope: Full UI/UX audit of Harmony Explorer codebase*
*Method: Static code analysis of all component, style, and configuration files*
