import { chord, type Chord } from './chords';
import { getDiatonicChords } from './harmony';

/**
 * Build a chain of dominant 7th chords descending by fifths.
 * Starting from startRoot, each chord is V7 of the next.
 * E.g. starting from G: G7 → C7 → F7 → Bb7 → Eb7 → ...
 */
export function buildDominantChain(startRoot: number, length: number): Chord[] {
  const chain: Chord[] = [];
  let current = ((startRoot % 12) + 12) % 12;
  for (let i = 0; i < length; i++) {
    chain.push(chord(current, 'dom7'));
    current = (current + 5) % 12; // descend a fifth (= up a fourth)
  }
  return chain;
}

/**
 * A ii-V-I pattern.
 */
export interface IIVI {
  ii: Chord;
  V: Chord;
  I: Chord;
  label: string; // e.g. "Primary ii-V-I" or "ii-V-I of IV"
}

const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

/**
 * Find all ii-V-I patterns in a key: the primary one plus
 * secondary ii-V-Is that target each diatonic chord.
 *
 * Primary: ii-V7-I in the home key
 * Secondary: e.g. in C major, ii-V-I of IV = Gm7-C7-F
 */
export function findIIVIs(keyRoot: number): IIVI[] {
  const results: IIVI[] = [];
  const diatonic = getDiatonicChords(keyRoot);

  // Primary ii-V-I
  results.push({
    ii: chord(diatonic[1].chord.root, 'min7'),
    V: chord(diatonic[4].chord.root, 'dom7'),
    I: diatonic[0].chord,
    label: 'Primary ii-V-I',
  });

  // Secondary ii-V-Is targeting each diatonic chord except I and vii°
  const targetDegrees = [1, 2, 3, 4, 5]; // ii, iii, IV, V, vi
  for (const deg of targetDegrees) {
    const target = diatonic[deg].chord;
    const vRoot = (target.root + 7) % 12; // V of target
    const iiRoot = (target.root + 2) % 12; // ii of target (whole step above)
    results.push({
      ii: chord(iiRoot, 'min7'),
      V: chord(vRoot, 'dom7'),
      I: target,
      label: `ii-V-I of ${ROMAN[deg]}`,
    });
  }

  return results;
}
