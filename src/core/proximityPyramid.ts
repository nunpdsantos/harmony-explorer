import { chord, chordKey, type Chord } from './chords';
import { sharedNoteCount } from './relationships';
import type { ChordQuality } from './constants';

/**
 * The Proximity Pyramid: organize all chords by how many notes they share
 * with a reference chord. This is the book's signature visualization.
 *
 * Level 0 (top): The reference chord itself
 * Level 1: Chords sharing the most notes
 * Level 2: Chords sharing fewer notes
 * Level 3: Chords sharing no notes
 */
export interface PyramidLevel {
  sharedCount: number;
  chords: Chord[];
}

/**
 * Build a proximity pyramid for a reference chord.
 * Considers all 12 roots × specified qualities.
 */
export function buildProximityPyramid(
  reference: Chord,
  qualities: ChordQuality[] = ['major', 'minor'],
): PyramidLevel[] {
  const levels = new Map<number, Chord[]>();
  const refKey = chordKey(reference);

  for (const quality of qualities) {
    for (let root = 0; root < 12; root++) {
      const candidate = chord(root, quality);
      if (chordKey(candidate) === refKey) continue; // skip self

      const shared = sharedNoteCount(reference, candidate);
      if (!levels.has(shared)) levels.set(shared, []);
      levels.get(shared)!.push(candidate);
    }
  }

  // Sort levels descending (most shared notes first)
  const sortedKeys = Array.from(levels.keys()).sort((a, b) => b - a);

  return sortedKeys.map(count => ({
    sharedCount: count,
    chords: levels.get(count)!,
  }));
}
