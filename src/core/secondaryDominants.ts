import { chord, type Chord } from './chords';
import { getDiatonicChords } from './harmony';

/**
 * Secondary dominants: V7 of each diatonic chord (except I and vii°).
 * In C major: V7/ii = A7, V7/iii = B7, V7/IV = C7, V7/V = D7, V7/vi = E7
 */

export interface SecondaryDominant {
  dom7: Chord;           // The secondary dominant chord (e.g. A7)
  target: Chord;         // The diatonic chord it resolves to (e.g. Dm)
  targetDegree: number;  // Degree index 0-6 in the key
  label: string;         // e.g. "V7/ii"
}

const TARGET_DEGREES = [1, 2, 3, 4, 5]; // ii, iii, IV, V, vi (skip I=0, vii°=6)
const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

/**
 * Get all secondary dominants for a given key.
 * Returns V7/ii, V7/iii, V7/IV, V7/V, V7/vi.
 */
export function getSecondaryDominants(keyRoot: number): SecondaryDominant[] {
  const diatonic = getDiatonicChords(keyRoot);
  const results: SecondaryDominant[] = [];

  for (const deg of TARGET_DEGREES) {
    const target = diatonic[deg].chord;
    // The secondary dominant root is a P5 above the target root
    const domRoot = (target.root + 7) % 12;
    const dom7 = chord(domRoot, 'dom7');
    results.push({
      dom7,
      target: target,
      targetDegree: deg,
      label: `V7/${ROMAN[deg]}`,
    });
  }

  return results;
}

/**
 * Check if a given chord is a secondary dominant in the given key.
 * Returns the SecondaryDominant info if it is, null otherwise.
 */
export function isSecondaryDominant(c: Chord, keyRoot: number): SecondaryDominant | null {
  if (c.quality !== 'dom7') return null;
  const secondaries = getSecondaryDominants(keyRoot);
  return secondaries.find(sd => sd.dom7.root === c.root) ?? null;
}
