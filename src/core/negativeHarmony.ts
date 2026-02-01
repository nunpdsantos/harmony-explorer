/**
 * Negative Harmony: reflects chords around the axis between the root
 * and its fifth (root + 3.5 semitones = the midpoint between root and b3).
 */

import { CHORD_TEMPLATES, type ChordQuality } from './constants';

/**
 * Get the full 12-note negative mapping for a key.
 * The axis sits between the root and the minor 3rd (at 3.5 semitones from root).
 * Each pitch class maps to its mirror across this axis.
 */
export function getNegativeMapping(keyRoot: number): Map<number, number> {
  const mapping = new Map<number, number>();
  const axis = keyRoot + 3.5; // midpoint between root and b3
  for (let pc = 0; pc < 12; pc++) {
    // Reflect pc around axis: negative = 2 * axis - pc
    const neg = ((Math.round(2 * axis - pc) % 12) + 12) % 12;
    mapping.set(pc, neg);
  }
  return mapping;
}

/**
 * Compute the negative of a chord in a given key.
 * Returns the reflected pitch classes and attempts to identify the resulting chord.
 */
export function computeNegative(
  chord: { root: number; quality: ChordQuality },
  keyRoot: number,
): { root: number; quality: ChordQuality; pitchClasses: number[] } {
  const mapping = getNegativeMapping(keyRoot);
  const intervals = CHORD_TEMPLATES[chord.quality].intervals;
  const originalPCs = intervals.map(i => ((chord.root + i) % 12 + 12) % 12);
  const negativePCs = originalPCs.map(pc => mapping.get(pc) ?? pc);

  const identified = identifyChordFromPitchClasses(negativePCs);
  return {
    root: identified.root,
    quality: identified.quality,
    pitchClasses: negativePCs,
  };
}

/**
 * Compute the negative of an entire progression.
 */
export function computeNegativeProgression(
  progression: { root: number; quality: ChordQuality }[],
  keyRoot: number,
): { root: number; quality: ChordQuality; pitchClasses: number[] }[] {
  return progression.map(chord => computeNegative(chord, keyRoot));
}

/**
 * General-purpose chord identification from a set of pitch classes.
 * Tries all 12 possible roots and all chord templates to find a match.
 */
export function identifyChordFromPitchClasses(
  pcs: number[],
): { root: number; quality: ChordQuality } {
  const pcSet = new Set(pcs.map(pc => ((pc % 12) + 12) % 12));
  const pcArr = [...pcSet].sort((a, b) => a - b);

  // Try each pitch class as root, check against all templates
  const qualities = Object.keys(CHORD_TEMPLATES) as ChordQuality[];

  let bestMatch: { root: number; quality: ChordQuality; score: number } = {
    root: pcArr[0] ?? 0,
    quality: 'major',
    score: -1,
  };

  for (const root of pcArr) {
    for (const quality of qualities) {
      const template = CHORD_TEMPLATES[quality].intervals;
      const templatePCs = new Set(template.map(i => ((root + i) % 12 + 12) % 12));

      // Count matching pitch classes
      let matches = 0;
      for (const pc of pcSet) {
        if (templatePCs.has(pc)) matches++;
      }

      // Perfect match: all template notes present and same size
      if (matches === template.length && template.length === pcSet.size) {
        return { root, quality };
      }

      // Track best partial match
      const score = matches - Math.abs(template.length - pcSet.size) * 0.5;
      if (score > bestMatch.score) {
        bestMatch = { root, quality, score };
      }
    }
  }

  return { root: bestMatch.root, quality: bestMatch.quality };
}
