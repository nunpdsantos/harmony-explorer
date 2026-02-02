import { chord, type Chord } from './chords';

/**
 * Library of famous chord progressions.
 * Each entry includes the original key and chords.
 * Use transposeLibraryEntry to adjust to any key.
 */

export interface LibraryEntry {
  name: string;
  category: 'jazz' | 'pop' | 'classical' | 'blues';
  key: number;
  chords: Chord[];
  description: string;
}

/** Transpose a library entry to a target key */
export function transposeLibraryEntry(entry: LibraryEntry, targetKey: number): Chord[] {
  const offset = ((targetKey - entry.key) % 12 + 12) % 12;
  return entry.chords.map(c => chord((c.root + offset) % 12, c.quality));
}

export const PROGRESSION_LIBRARY: LibraryEntry[] = [
  // ── Jazz ──
  {
    name: 'Autumn Leaves',
    category: 'jazz',
    key: 7, // G minor (relative: Bb)
    chords: [
      chord(0, 'min7'),   // Cm7
      chord(5, 'dom7'),   // F7
      chord(10, 'maj7'),  // Bbmaj7
      chord(3, 'maj7'),   // Ebmaj7
      chord(9, 'halfDim7'), // Am7b5
      chord(2, 'dom7'),   // D7
      chord(7, 'minor'),  // Gm
    ],
    description: 'Classic jazz standard with ii-V-I in Bb and ii-V-i in Gm',
  },
  {
    name: 'Giant Steps',
    category: 'jazz',
    key: 11, // B
    chords: [
      chord(11, 'maj7'), // Bmaj7
      chord(2, 'dom7'),  // D7
      chord(7, 'maj7'),  // Gmaj7
      chord(10, 'dom7'), // Bb7
      chord(3, 'maj7'),  // Ebmaj7
    ],
    description: 'Coltrane changes — major thirds cycle',
  },
  {
    name: 'Rhythm Changes (A)',
    category: 'jazz',
    key: 10, // Bb
    chords: [
      chord(10, 'maj7'), // Bbmaj7
      chord(7, 'min7'),  // Gm7
      chord(0, 'min7'),  // Cm7
      chord(5, 'dom7'),  // F7
      chord(2, 'min7'),  // Dm7
      chord(7, 'dom7'),  // G7
      chord(0, 'min7'),  // Cm7
      chord(5, 'dom7'),  // F7
    ],
    description: 'I Got Rhythm A section — I-vi-ii-V turnarounds',
  },
  {
    name: 'So What',
    category: 'jazz',
    key: 2, // D dorian
    chords: [
      chord(2, 'min7'), // Dm7 (8 bars)
      chord(3, 'min7'), // Ebm7 (8 bars)
      chord(2, 'min7'), // Dm7 (8 bars)
    ],
    description: 'Miles Davis — modal jazz, D dorian to Eb dorian',
  },
  {
    name: 'ii-V-I Major',
    category: 'jazz',
    key: 0, // C
    chords: [
      chord(2, 'min7'),  // Dm7
      chord(7, 'dom7'),  // G7
      chord(0, 'maj7'),  // Cmaj7
    ],
    description: 'The most common jazz cadence',
  },
  {
    name: 'ii-V-i Minor',
    category: 'jazz',
    key: 0, // C minor
    chords: [
      chord(2, 'halfDim7'), // Dm7b5
      chord(7, 'dom7'),   // G7
      chord(0, 'min7'),   // Cm7
    ],
    description: 'Minor key ii-V-i cadence',
  },

  // ── Pop ──
  {
    name: 'I-V-vi-IV',
    category: 'pop',
    key: 0,
    chords: [
      chord(0, 'major'), // C
      chord(7, 'major'), // G
      chord(9, 'minor'), // Am
      chord(5, 'major'), // F
    ],
    description: 'The most common pop progression',
  },
  {
    name: 'vi-IV-I-V',
    category: 'pop',
    key: 0,
    chords: [
      chord(9, 'minor'), // Am
      chord(5, 'major'), // F
      chord(0, 'major'), // C
      chord(7, 'major'), // G
    ],
    description: 'Pop rotation starting on vi (Despacito, etc.)',
  },
  {
    name: 'I-vi-IV-V',
    category: 'pop',
    key: 0,
    chords: [
      chord(0, 'major'), // C
      chord(9, 'minor'), // Am
      chord(5, 'major'), // F
      chord(7, 'major'), // G
    ],
    description: '50s doo-wop progression',
  },
  {
    name: 'I-IV-vi-V',
    category: 'pop',
    key: 0,
    chords: [
      chord(0, 'major'), // C
      chord(5, 'major'), // F
      chord(9, 'minor'), // Am
      chord(7, 'major'), // G
    ],
    description: 'Common pop variant (Hey Ya, etc.)',
  },

  // ── Classical ──
  {
    name: 'Pachelbel Canon',
    category: 'classical',
    key: 2, // D
    chords: [
      chord(2, 'major'),  // D
      chord(9, 'major'),  // A
      chord(11, 'minor'), // Bm
      chord(6, 'minor'),  // F#m
      chord(7, 'major'),  // G
      chord(2, 'major'),  // D
      chord(7, 'major'),  // G
      chord(9, 'major'),  // A
    ],
    description: 'I-V-vi-iii-IV-I-IV-V descending bass line',
  },
  {
    name: 'Circle of Fifths',
    category: 'classical',
    key: 0,
    chords: [
      chord(0, 'major'), // C
      chord(5, 'major'), // F
      chord(11, 'diminished'), // B°
      chord(4, 'minor'), // Em
      chord(9, 'minor'), // Am
      chord(2, 'minor'), // Dm
      chord(7, 'major'), // G
      chord(0, 'major'), // C
    ],
    description: 'Complete circle of fifths descent',
  },
  {
    name: 'Romanesca',
    category: 'classical',
    key: 0,
    chords: [
      chord(0, 'major'), // C
      chord(7, 'major'), // G
      chord(9, 'minor'), // Am
      chord(4, 'minor'), // Em
      chord(5, 'major'), // F
      chord(0, 'major'), // C
      chord(5, 'major'), // F
      chord(7, 'major'), // G
    ],
    description: 'Renaissance ground bass pattern',
  },

  // ── Blues ──
  {
    name: '12-Bar Blues',
    category: 'blues',
    key: 0,
    chords: [
      chord(0, 'dom7'), // C7
      chord(0, 'dom7'),
      chord(0, 'dom7'),
      chord(0, 'dom7'),
      chord(5, 'dom7'), // F7
      chord(5, 'dom7'),
      chord(0, 'dom7'),
      chord(0, 'dom7'),
      chord(7, 'dom7'), // G7
      chord(5, 'dom7'),
      chord(0, 'dom7'),
      chord(7, 'dom7'), // turnaround
    ],
    description: 'Standard 12-bar blues form',
  },
  {
    name: 'Jazz Blues',
    category: 'blues',
    key: 5, // F
    chords: [
      chord(5, 'dom7'),  // F7
      chord(10, 'dom7'), // Bb7
      chord(5, 'dom7'),  // F7
      chord(0, 'min7'),  // Cm7 (passing)
      chord(10, 'dom7'), // Bb7
      chord(10, 'dom7'),
      chord(5, 'dom7'),  // F7
      chord(9, 'min7'),  // Am7
      chord(2, 'dom7'),  // D7
      chord(7, 'min7'),  // Gm7
      chord(0, 'dom7'),  // C7
      chord(5, 'dom7'),  // F7
    ],
    description: 'Blues with ii-V substitutions',
  },
  {
    name: 'Minor Blues',
    category: 'blues',
    key: 0,
    chords: [
      chord(0, 'min7'),  // Cm7
      chord(0, 'min7'),
      chord(0, 'min7'),
      chord(0, 'min7'),
      chord(5, 'min7'),  // Fm7
      chord(5, 'min7'),
      chord(0, 'min7'),
      chord(0, 'min7'),
      chord(9, 'halfDim7'), // Am7b5
      chord(7, 'dom7'),   // G7
      chord(0, 'min7'),
      chord(7, 'dom7'),
    ],
    description: 'Minor key blues with ii-V turnaround',
  },
];

/** Get library entries by category */
export function getLibraryByCategory(category: LibraryEntry['category']): LibraryEntry[] {
  return PROGRESSION_LIBRARY.filter(e => e.category === category);
}

/** All unique category names */
export const LIBRARY_CATEGORIES: LibraryEntry['category'][] = ['jazz', 'pop', 'classical', 'blues'];
