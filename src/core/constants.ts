// Pitch class constants (0 = C, 1 = C#/Db, ... 11 = B)
export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

// Prefer flats for these keys, sharps for others
const FLAT_KEYS = new Set([1, 3, 5, 6, 8, 10]); // Db, Eb, F, Gb, Ab, Bb

export function noteName(pc: number, preferFlat?: boolean): string {
  const n = ((pc % 12) + 12) % 12;
  if (preferFlat ?? FLAT_KEYS.has(n)) return NOTE_NAMES_FLAT[n];
  return NOTE_NAMES_SHARP[n];
}

// Chord quality templates: intervals from root
export const CHORD_TEMPLATES = {
  major:      { intervals: [0, 4, 7],     symbol: '',    name: 'Major' },
  minor:      { intervals: [0, 3, 7],     symbol: 'm',   name: 'Minor' },
  diminished: { intervals: [0, 3, 6],     symbol: '°',   name: 'Diminished' },
  augmented:  { intervals: [0, 4, 8],     symbol: '+',   name: 'Augmented' },
  dom7:       { intervals: [0, 4, 7, 10], symbol: '7',   name: 'Dominant 7th' },
  maj7:       { intervals: [0, 4, 7, 11], symbol: 'maj7', name: 'Major 7th' },
  min7:       { intervals: [0, 3, 7, 10], symbol: 'm7',  name: 'Minor 7th' },
  dim7:       { intervals: [0, 3, 6, 9],  symbol: '°7',  name: 'Diminished 7th' },
  halfDim7:   { intervals: [0, 3, 6, 10], symbol: 'ø7',  name: 'Half-diminished 7th' },
  minMaj7:    { intervals: [0, 3, 7, 11], symbol: 'mM7', name: 'Minor-major 7th' },
  aug7:       { intervals: [0, 4, 8, 10], symbol: '+7',  name: 'Augmented 7th' },
  sus4:       { intervals: [0, 5, 7],     symbol: 'sus4', name: 'Suspended 4th' },
  sus2:       { intervals: [0, 2, 7],     symbol: 'sus2', name: 'Suspended 2nd' },
} as const;

export type ChordQuality = keyof typeof CHORD_TEMPLATES;

// Circle of fifths order (ascending by 7 semitones)
export const CIRCLE_OF_FIFTHS_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]; // C, G, D, A, E, B, F#, Db, Ab, Eb, Bb, F

// Scale templates
export const SCALE_TEMPLATES = {
  major:          [0, 2, 4, 5, 7, 9, 11],
  naturalMinor:   [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor:  [0, 2, 3, 5, 7, 8, 11],
  melodicMinor:   [0, 2, 3, 5, 7, 9, 11],
} as const;

export type ScaleType = keyof typeof SCALE_TEMPLATES;

// Tonal function categories
export type TonalFunction = 'tonic' | 'subdominant' | 'dominant';

// Roman numeral labels for diatonic degrees
export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'] as const;

// Colors for chord relationships
export const RELATIONSHIP_COLORS = {
  sharedNotes3: '#22c55e', // green — very smooth
  sharedNotes2: '#3b82f6', // blue — smooth
  sharedNotes1: '#f59e0b', // amber — moderate
  sharedNotes0: '#ef4444', // red — distant
  dominant:     '#8b5cf6', // purple — resolution
  tritone:      '#ec4899', // pink — substitution
  neoRiemannian:'#06b6d4', // cyan — transform
} as const;

// MIDI note numbers for middle octave (C4 = 60)
export const MIDDLE_C = 60;
