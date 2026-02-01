import { chordPitchClasses, type Chord } from './chords';
import { MIDDLE_C } from './constants';

/**
 * A voiced chord: actual MIDI note numbers (not just pitch classes).
 * e.g. C major in close position: [60, 64, 67] = [C4, E4, G4]
 */
export type VoicedChord = number[];

/**
 * Create an initial voicing for a chord in a comfortable range.
 * Places notes around middle C (MIDI 60).
 */
export function initialVoicing(chord: Chord, baseOctave: number = 4): VoicedChord {
  const pcs = chordPitchClasses(chord);
  const base = (baseOctave) * 12; // C of the base octave
  return pcs.map(pc => {
    let note = base + pc;
    // Keep notes in a reasonable range (C3 to C5)
    while (note < base - 12) note += 12;
    while (note > base + 12) note -= 12;
    return note;
  }).sort((a, b) => a - b);
}

/**
 * Compute smooth voice leading from one voiced chord to the next.
 * Each voice moves to the nearest available target pitch class.
 *
 * This is the "Magic Glue" from the book made audible.
 */
export function smoothVoiceLeading(
  prevVoicing: VoicedChord,
  nextChord: Chord,
): VoicedChord {
  const targetPCs = chordPitchClasses(nextChord);
  const numVoices = prevVoicing.length;
  const numTargets = targetPCs.length;

  if (numVoices === 0) return initialVoicing(nextChord);

  // For each previous note, find the closest realization of each target pitch class
  // Then find the optimal assignment

  if (numVoices === numTargets) {
    return optimalAssignment(prevVoicing, targetPCs);
  }

  // If chord sizes differ, handle gracefully
  if (numVoices > numTargets) {
    // Drop the voice that would move farthest (simplistic approach)
    const assigned = optimalAssignment(prevVoicing.slice(0, numTargets), targetPCs);
    return assigned;
  } else {
    // Add a new voice for extra target notes
    const assigned = optimalAssignment(prevVoicing, targetPCs.slice(0, numVoices));
    const usedPCs = new Set(assigned.map(n => n % 12));
    const extraPCs = targetPCs.filter(pc => !usedPCs.has(pc));
    const extras = extraPCs.map(pc => {
      const base = MIDDLE_C;
      let note = base + pc;
      while (note < base - 6) note += 12;
      while (note > base + 18) note -= 12;
      return note;
    });
    return [...assigned, ...extras].sort((a, b) => a - b);
  }
}

/**
 * Find the optimal assignment of prev notes to target pitch classes
 * that minimizes total movement. Uses brute force (fine for 3-4 notes).
 */
function optimalAssignment(prevNotes: number[], targetPCs: number[]): VoicedChord {
  const n = Math.min(prevNotes.length, targetPCs.length);
  const perms = permutations(targetPCs.slice(0, n));
  let bestCost = Infinity;
  let bestVoicing: VoicedChord = [];

  for (const perm of perms) {
    let cost = 0;
    const voicing: number[] = [];
    for (let i = 0; i < n; i++) {
      const nearest = nearestRealization(prevNotes[i], perm[i]);
      cost += Math.abs(nearest - prevNotes[i]);
      voicing.push(nearest);
    }
    if (cost < bestCost) {
      bestCost = cost;
      bestVoicing = voicing;
    }
  }

  return bestVoicing.sort((a, b) => a - b);
}

/**
 * Find the nearest MIDI note with the given pitch class to a reference note.
 */
function nearestRealization(reference: number, targetPC: number): number {
  const refPC = ((reference % 12) + 12) % 12;
  const diff = ((targetPC - refPC) % 12 + 12) % 12;

  // Two candidates: up by diff, or down by (12 - diff)
  const up = reference + diff;
  const down = reference - (12 - diff);

  if (diff === 0) return reference;

  // Pick the closer one, with slight preference for staying in range
  if (Math.abs(up - reference) <= Math.abs(down - reference)) {
    return up;
  }
  return down;
}

/** Generate all permutations of an array */
function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}
