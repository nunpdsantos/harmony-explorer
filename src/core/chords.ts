import { CHORD_TEMPLATES, noteName, type ChordQuality } from './constants';

/**
 * A chord is a root pitch class (0-11) + a quality.
 * Everything else is computed from these two values.
 */
export interface Chord {
  root: number;       // pitch class 0-11
  quality: ChordQuality;
}

/** Get the interval template for a chord quality */
export function getIntervals(quality: ChordQuality): readonly number[] {
  return CHORD_TEMPLATES[quality].intervals;
}

/** Get the pitch classes (0-11) of a chord */
export function chordPitchClasses(chord: Chord): number[] {
  return getIntervals(chord.quality).map(i => ((chord.root + i) % 12 + 12) % 12);
}

/** Display name: "Cm7", "G7", "F#°", etc. */
export function chordName(chord: Chord): string {
  return noteName(chord.root) + CHORD_TEMPLATES[chord.quality].symbol;
}

/** Full display name: "C Minor 7th" */
export function chordFullName(chord: Chord): string {
  return noteName(chord.root) + ' ' + CHORD_TEMPLATES[chord.quality].name;
}

/** Transpose a chord by n semitones */
export function transposeChord(chord: Chord, semitones: number): Chord {
  return {
    root: ((chord.root + semitones) % 12 + 12) % 12,
    quality: chord.quality,
  };
}

/** Create a chord from root and quality */
export function chord(root: number, quality: ChordQuality): Chord {
  return { root: ((root % 12) + 12) % 12, quality };
}

/** Check if two chords are enharmonically equivalent */
export function chordsEqual(a: Chord, b: Chord): boolean {
  return a.root === b.root && a.quality === b.quality;
}

/** Get the number of notes in a chord */
export function chordSize(chord: Chord): number {
  return getIntervals(chord.quality).length;
}

/** Unique string key for a chord (for maps, sets, etc.) */
export function chordKey(c: Chord): string {
  return `${c.root}-${c.quality}`;
}
