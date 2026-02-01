/**
 * Coltrane Changes: major-third cycle substitutions (Giant Steps).
 * Divides the octave into three equal major-third-related tonal centers.
 */

import { chord, type Chord } from './chords';

/**
 * Get the three tonal centers of a Coltrane triangle.
 * Major thirds apart: root, root+4, root+8.
 */
export function getColtraneTriangle(tonic: number): [number, number, number] {
  return [
    tonic % 12,
    (tonic + 4) % 12,
    (tonic + 8) % 12,
  ];
}

/**
 * Generate the Giant Steps chord sequence for any tonic.
 * The classic Coltrane pattern: moving through three tonal centers
 * connected by V7 chords.
 */
export function generateColtraneSubstitution(tonic: number): Chord[] {
  const [c1, c2, c3] = getColtraneTriangle(tonic);

  // Giant Steps pattern:
  // Imaj7 | V7/c2 | Imaj7(c2) | V7/c3 | Imaj7(c3) | V7/c1 | Imaj7(c1) | ...
  return [
    chord(c1, 'maj7'),              // B maj7
    chord((c2 + 7) % 12, 'dom7'),   // D7 (V7 of c2)
    chord(c2, 'maj7'),              // G maj7
    chord((c3 + 7) % 12, 'dom7'),   // Bb7 (V7 of c3)
    chord(c3, 'maj7'),              // Eb maj7
    chord((c1 + 7) % 12, 'dom7'),   // F#7 (V7 of c1)
    chord(c1, 'maj7'),              // B maj7
  ];
}

/**
 * Expand a ii-V-I into Coltrane changes.
 * Replaces a standard ii-V-I with a descending major-third cycle.
 */
export function expandIIV_Coltrane(tonic: number): Chord[] {
  const [c1, c2, c3] = getColtraneTriangle(tonic);

  return [
    // ii-V to center 2
    chord((c2 + 5) % 12, 'min7'),   // ii of c2
    chord((c2 + 7) % 12, 'dom7'),   // V7 of c2
    chord(c2, 'maj7'),              // I of c2
    // V to center 3
    chord((c3 + 7) % 12, 'dom7'),   // V7 of c3
    chord(c3, 'maj7'),              // I of c3
    // V to tonic
    chord((c1 + 7) % 12, 'dom7'),   // V7 of c1
    chord(c1, 'maj7'),              // I (home)
  ];
}

/**
 * Analyze if a chord progression follows Coltrane substitution patterns.
 * Returns the detected tonal centers if found, null otherwise.
 */
export function analyzeColtraneProgression(
  chords: Chord[],
): { detected: boolean; tonalCenters: number[]; confidence: number } {
  if (chords.length < 3) return { detected: false, tonalCenters: [], confidence: 0 };

  // Look for major chords whose roots are 4 semitones apart
  const majorRoots = chords
    .filter(c => c.quality === 'major' || c.quality === 'maj7')
    .map(c => c.root);

  if (majorRoots.length < 2) return { detected: false, tonalCenters: [], confidence: 0 };

  // Check for major-third relationships
  const centers = new Set<number>();
  for (let i = 0; i < majorRoots.length; i++) {
    for (let j = i + 1; j < majorRoots.length; j++) {
      const dist = ((majorRoots[j] - majorRoots[i]) % 12 + 12) % 12;
      if (dist === 4 || dist === 8) {
        centers.add(majorRoots[i]);
        centers.add(majorRoots[j]);
        // Add the missing third center
        const third = (majorRoots[i] + (dist === 4 ? 8 : 4)) % 12;
        centers.add(third);
      }
    }
  }

  if (centers.size >= 3) {
    // Check if V7 chords precede the major chords
    let v7Count = 0;
    for (const center of centers) {
      const v7Root = (center + 7) % 12;
      if (chords.some(c => c.root === v7Root && (c.quality === 'dom7' || c.quality === 'dom9'))) {
        v7Count++;
      }
    }

    const confidence = Math.min(1, v7Count / centers.size + (centers.size >= 3 ? 0.3 : 0));
    return {
      detected: confidence > 0.5,
      tonalCenters: [...centers],
      confidence,
    };
  }

  return { detected: false, tonalCenters: [], confidence: 0 };
}
