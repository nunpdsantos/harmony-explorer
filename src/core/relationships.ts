import { chordPitchClasses, type Chord } from './chords';

/**
 * Count shared pitch classes between two chords.
 * This is the book's core "proximity" concept.
 */
export function sharedNoteCount(a: Chord, b: Chord): number {
  const setA = new Set(chordPitchClasses(a));
  const setB = chordPitchClasses(b);
  return setB.filter(pc => setA.has(pc)).length;
}

/** Get the actual shared pitch classes */
export function sharedNotes(a: Chord, b: Chord): number[] {
  const setA = new Set(chordPitchClasses(a));
  return chordPitchClasses(b).filter(pc => setA.has(pc));
}

/**
 * Circle of fifths distance (minimum steps around the circle).
 * Each step = 7 semitones (or 5 in the other direction).
 */
export function fifthsDistance(rootA: number, rootB: number): number {
  const diff = ((rootB - rootA) % 12 + 12) % 12;
  // Count fifths (7 semitones each)
  let steps = 0;
  let current = 0;
  while (current !== diff && steps < 12) {
    current = (current + 7) % 12;
    steps++;
  }
  return Math.min(steps, 12 - steps);
}

/**
 * Check if chord A is a dominant of chord B (A → B is a V-I resolution).
 * A's root should be 7 semitones above B's root (a fifth above),
 * and A should contain a major third (be major or dominant quality).
 */
export function isDominantOf(a: Chord, b: Chord): boolean {
  const interval = ((a.root - b.root) % 12 + 12) % 12;
  if (interval !== 7) return false;
  // A must have a major quality (major third interval = 4)
  const aIntervals = chordPitchClasses(a).map(pc => ((pc - a.root) % 12 + 12) % 12);
  return aIntervals.includes(4);
}

/**
 * Check if two chords are tritone substitutions of each other.
 * Same tritone (3rd and 7th swap roles), roots a tritone apart.
 */
export function isTritoneSubstitution(a: Chord, b: Chord): boolean {
  const interval = ((a.root - b.root) % 12 + 12) % 12;
  if (interval !== 6) return false;
  // Both should be dominant-type chords (contain major 3rd + minor 7th)
  const hasDomQuality = (c: Chord) => {
    const pcs = chordPitchClasses(c).map(pc => ((pc - c.root) % 12 + 12) % 12);
    return pcs.includes(4) && pcs.includes(10);
  };
  return hasDomQuality(a) && hasDomQuality(b);
}

/**
 * Neo-Riemannian transformations.
 * P (Parallel): C major ↔ C minor — change the third
 * L (Leading-tone): C major → E minor, C minor → Ab major — move one note by semitone
 * R (Relative): C major → A minor, C minor → Eb major — relative key
 */
export type NeoRiemannianTransform = 'P' | 'L' | 'R';

export function applyNeoRiemannian(c: Chord, transform: NeoRiemannianTransform): Chord | null {
  if (c.quality === 'major') {
    switch (transform) {
      case 'P': return { root: c.root, quality: 'minor' };
      case 'L': return { root: ((c.root + 4) % 12), quality: 'minor' };   // major 3rd becomes root
      case 'R': return { root: ((c.root + 9) % 12), quality: 'minor' };   // down minor 3rd
    }
  } else if (c.quality === 'minor') {
    switch (transform) {
      case 'P': return { root: c.root, quality: 'major' };
      case 'L': return { root: ((c.root + 8) % 12), quality: 'major' };   // up minor 3rd from minor's 5th perspective
      case 'R': return { root: ((c.root + 3) % 12), quality: 'major' };   // up minor 3rd
    }
  }
  return null; // Only works on major/minor triads
}

/** Find which neo-Riemannian transform connects two chords (if any) */
export function findNeoRiemannianTransform(a: Chord, b: Chord): NeoRiemannianTransform | null {
  for (const t of ['P', 'L', 'R'] as const) {
    const result = applyNeoRiemannian(a, t);
    if (result && result.root === b.root && result.quality === b.quality) return t;
  }
  return null;
}

/** Voice leading distance: minimum total semitone movement between two chords */
export function voiceLeadingDistance(a: Chord, b: Chord): number {
  const pcsA = chordPitchClasses(a);
  const pcsB = chordPitchClasses(b);

  // For simplicity with different-sized chords, compute min cost assignment
  // using the shorter chord's notes against the longer
  const shorter = pcsA.length <= pcsB.length ? pcsA : pcsB;
  const longer = pcsA.length <= pcsB.length ? pcsB : pcsA;

  // Brute force optimal assignment for small chord sizes (max 4 notes)
  return minAssignmentCost(shorter, longer);
}

/** Minimum semitone distance between two pitch classes */
function pcDistance(a: number, b: number): number {
  const d = ((b - a) % 12 + 12) % 12;
  return Math.min(d, 12 - d);
}

/** Brute force minimum cost assignment (works for small arrays) */
function minAssignmentCost(from: number[], to: number[]): number {
  if (from.length === 0) return 0;

  let minCost = Infinity;
  const permutations = getPermutations(to);

  for (const perm of permutations) {
    let cost = 0;
    for (let i = 0; i < from.length; i++) {
      cost += pcDistance(from[i], perm[i]);
    }
    if (cost < minCost) minCost = cost;
  }

  return minCost;
}

/** Generate permutations of length n from array (only take first n elements) */
function getPermutations(arr: number[], n?: number): number[][] {
  const len = n ?? arr.length;
  if (len === 0) return [[]];
  if (len === 1) return arr.map(x => [x]);

  const results: number[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of getPermutations(rest, len - 1)) {
      results.push([arr[i], ...perm]);
    }
  }
  return results;
}

/**
 * Comprehensive relationship summary between two chords.
 */
export interface ChordRelationship {
  sharedNotes: number[];
  sharedNoteCount: number;
  fifthsDistance: number;
  isDominant: boolean;       // a is dominant of b
  isReverseDominant: boolean; // b is dominant of a
  isTritoneSubstitution: boolean;
  neoRiemannianTransform: NeoRiemannianTransform | null;
  voiceLeadingDistance: number;
}

export function analyzeRelationship(a: Chord, b: Chord): ChordRelationship {
  return {
    sharedNotes: sharedNotes(a, b),
    sharedNoteCount: sharedNoteCount(a, b),
    fifthsDistance: fifthsDistance(a.root, b.root),
    isDominant: isDominantOf(a, b),
    isReverseDominant: isDominantOf(b, a),
    isTritoneSubstitution: isTritoneSubstitution(a, b),
    neoRiemannianTransform: findNeoRiemannianTransform(a, b),
    voiceLeadingDistance: voiceLeadingDistance(a, b),
  };
}
