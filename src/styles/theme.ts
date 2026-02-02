/**
 * Single source of truth for color values as TypeScript exports.
 * Used by SVG inline styles which can't use CSS var().
 *
 * All raw color values should live here or in tokens.css — nowhere else.
 */

/* ─── Tonal function colors ─── */
export const COLOR_FN_TONIC = '#34d399';
export const COLOR_FN_SUBDOMINANT = '#60a5fa';
export const COLOR_FN_DOMINANT = '#f87171';
export const COLOR_FN_TONIC_BG = 'rgba(52, 211, 153, 0.15)';
export const COLOR_FN_SUBDOMINANT_BG = 'rgba(96, 165, 250, 0.15)';
export const COLOR_FN_DOMINANT_BG = 'rgba(248, 113, 113, 0.15)';

export const COLOR_ACCENT = '#fbbf24';

/* ─── Chord quality colors ─── */
export const QUALITY_COLORS: Record<string, string> = {
  // Triads
  major:      '#3b82f6',
  minor:      '#8b5cf6',
  diminished: '#ef4444',
  augmented:  '#f59e0b',
  sus4:       '#059669',
  sus2:       '#0d9488',

  // 7th chords
  dom7:       '#06b6d4',
  maj7:       '#2563eb',
  min7:       '#7c3aed',
  dim7:       '#dc2626',
  halfDim7:   '#ea580c',
  minMaj7:    '#9333ea',
  aug7:       '#d97706',
  dom7sus4:   '#0891b2',

  // 6th chords
  sixth:      '#3b82f6',
  min6:       '#7c3aed',
  sixNine:    '#2563eb',

  // Add chords
  add9:       '#60a5fa',
  minAdd9:    '#a78bfa',

  // 9th chords
  dom9:       '#0ea5e9',
  maj9:       '#3b82f6',
  min9:       '#8b5cf6',
  dom9sus4:   '#0891b2',

  // 11th chords
  dom11:      '#14b8a6',
  min11:      '#a78bfa',

  // 13th chords
  dom13:      '#06b6d4',
  min13:      '#7c3aed',
  maj13:      '#2563eb',

  // Altered dominants
  alt7:            '#e11d48',
  dom7sharp11:     '#ec4899',
  dom7flat9:       '#f43f5e',
  dom7sharp9:      '#db2777',
  dom7flat13:      '#be185d',
  dom7flat5:       '#e11d48',
  dom7sharp5flat9: '#f43f5e',
  dom7sharp5sharp9:'#db2777',

  // Special diatonic extensions
  min7flat9:       '#c026d3',
  halfDim7flat9:   '#ea580c',
};

export const COLOR_QUALITY_FALLBACK = '#6b7280';

/* ─── Shared-note colors ─── */
export const SHARED_NOTE_COLORS: Record<number, string> = {
  0: '#ef4444',
  1: '#f59e0b',
  2: '#3b82f6',
  3: '#22c55e',
};

/* ─── Next-move strength colors ─── */
export const COLOR_MOVE_STRONG = '#fbbf24';
export const COLOR_MOVE_COMMON = '#a78bfa';
export const COLOR_MOVE_CREATIVE = '#6b7280';

/* ─── Bridge type colors ─── */
export const BRIDGE_TYPE_COLORS: Record<string, string> = {
  'tritone-sub':    '#ec4899',
  'passing-dim':    '#f59e0b',
  'secondary-dom':  '#8b5cf6',
};

/* ─── Voice colors (bass → soprano + 5th) ─── */
export const VOICE_COLORS = [
  '#a78bfa', // bass — purple-400
  '#60a5fa', // tenor — blue-400
  '#34d399', // alto — green-400
  '#fbbf24', // soprano — amber-400
  '#f472b6', // 5th voice — pink-400
];

/* ─── Tritone pair colors ─── */
export const PAIR_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
];

/* ─── Neo-Riemannian transform colors ─── */
export const TRANSFORM_COLORS: Record<string, string> = {
  P: '#f59e0b',
  L: '#8b5cf6',
  R: '#06b6d4',
};

/* ─── Diminished symmetry group colors ─── */
export const DIM_GROUP_COLORS = ['#ef4444', '#3b82f6', '#22c55e'];

/* ─── Interaction state colors ─── */
export const COLOR_SELECTED_BORDER = '#ffffff';
export const COLOR_HOVERED_BORDER = '#e2e8f0';
export const COLOR_PLAYING_GLOW = 'rgba(251, 191, 36, 0.5)';

/* ─── Background & surface ─── */
export const COLOR_BG_PRIMARY = '#030712';
export const COLOR_BG_SURFACE = 'rgba(12, 18, 34, 0.95)';

/* ─── Text colors for SVG ─── */
export const COLOR_TEXT_PRIMARY = 'rgba(255, 255, 255, 0.90)';
export const COLOR_TEXT_SECONDARY = 'rgba(255, 255, 255, 0.60)';
export const COLOR_TEXT_MUTED = 'rgba(255, 255, 255, 0.50)';
export const COLOR_TEXT_FAINT = 'rgba(255, 255, 255, 0.40)';
export const COLOR_TEXT_DIM = 'rgba(255, 255, 255, 0.30)';
export const COLOR_TEXT_DIMMER = 'rgba(255, 255, 255, 0.25)';

/* ─── SVG structural colors ─── */
export const COLOR_RING_STROKE = 'rgba(255, 255, 255, 0.06)';
export const COLOR_RING_FILL = 'rgba(255, 255, 255, 0.04)';
export const COLOR_LINE_FAINT = 'rgba(255, 255, 255, 0.12)';
export const COLOR_LINE_DIM = 'rgba(255, 255, 255, 0.10)';
export const COLOR_DIATONIC_STROKE = 'rgba(255, 255, 255, 0.35)';
export const COLOR_NON_DIATONIC_STROKE = 'rgba(255, 255, 255, 0.12)';

/* ─── Chord-scale analysis colors ─── */
export const COLOR_CHORD_TONE = '#3b82f6';        // blue-500
export const COLOR_CHORD_TONE_LIGHT = '#60a5fa';   // blue-400
export const COLOR_AVOID_NOTE = '#ef4444';          // red-500

/* ─── Piano keyboard colors ─── */
export const COLOR_KEY_WHITE = '#f8f8f8';
export const COLOR_KEY_BLACK = '#1a1a2e';

/* ─── Guitar fretboard colors ─── */
export const COLOR_FRETBOARD_WOOD = '#1c1917';     // stone-900
export const COLOR_FRET_WIRE = 'rgba(255, 255, 255, 0.20)';
export const COLOR_STRING = 'rgba(255, 255, 255, 0.35)';
export const COLOR_NUT = 'rgba(255, 255, 255, 0.50)';
export const COLOR_FRET_DOT = 'rgba(255, 255, 255, 0.08)';

/* ─── Overlay colors ─── */
export const COLOR_NEGATIVE_HARMONY = '#ec4899';    // pink-500
export const COLOR_MODAL_INTERCHANGE = '#a855f7';   // purple-500

/* ─── Font sizes for SVG (px) ─── */
export const FONT_SIZE_3XS = 7;
export const FONT_SIZE_2XS = 8;
export const FONT_SIZE_XS = 9;
export const FONT_SIZE_SM = 10;
export const FONT_SIZE_BASE = 11;
export const FONT_SIZE_MD = 12;
export const FONT_SIZE_LG = 13;
export const FONT_SIZE_XL = 14;
export const FONT_SIZE_2XL = 16;
export const FONT_SIZE_3XL = 18;
export const FONT_SIZE_4XL = 20;
