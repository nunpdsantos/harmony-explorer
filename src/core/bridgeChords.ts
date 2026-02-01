import { chord, chordName, type Chord } from './chords';

/**
 * Bridge chords: chromatic passing chords inserted between two chords
 * to create smooth voice leading and chromatic bass lines.
 *
 * Three types:
 * 1. Tritone sub approach — the tritone sub of V7/target creates chromatic bass
 * 2. Chromatic passing diminished — dim7 one semitone below/above target root
 * 3. Secondary dominant — V7 of the target chord
 */

export interface BridgeChord {
  chord: Chord;
  type: 'tritone-sub' | 'passing-dim' | 'secondary-dom';
  reason: string;
  /** Whether this creates chromatic bass movement from→bridge→to */
  createsChromaticBass: boolean;
}

/**
 * Suggest bridge chords that can be inserted between `from` and `to`.
 */
export function suggestBridgeChords(from: Chord, to: Chord): BridgeChord[] {
  const results: BridgeChord[] = [];
  const fromBass = from.root;
  const toBass = to.root;

  // 1. Tritone substitution approach
  // V7 of `to` has root a P5 above to.root
  const v7Root = (to.root + 7) % 12;
  const v7 = chord(v7Root, 'dom7');
  // Tritone sub of V7 has root a tritone away
  const tritoneSubRoot = (v7Root + 6) % 12;
  const tritoneSub = chord(tritoneSubRoot, 'dom7');

  // Check if tritone sub creates chromatic bass
  const tritoneSubBassDown = ((fromBass - tritoneSubRoot) % 12 + 12) % 12;
  const tritoneSubToTarget = ((tritoneSubRoot - toBass) % 12 + 12) % 12;
  const tritoneSubChromaticBass =
    (tritoneSubBassDown === 1 && tritoneSubToTarget === 1) || // from → tritoneSub → to descending
    (tritoneSubBassDown === 11 && tritoneSubToTarget === 11); // ascending

  // Don't suggest if the tritone sub IS the from or to chord
  if (tritoneSubRoot !== fromBass && tritoneSubRoot !== toBass) {
    results.push({
      chord: tritoneSub,
      type: 'tritone-sub',
      reason: `${chordName(tritoneSub)} (tritone sub of ${chordName(v7)}, resolves to ${chordName(to)})`,
      createsChromaticBass: tritoneSubChromaticBass,
    });
  }

  // 2. Chromatic passing diminished chord
  // A dim7 one semitone below the target root
  const dimBelowRoot = ((toBass - 1) % 12 + 12) % 12;
  if (dimBelowRoot !== fromBass && dimBelowRoot !== toBass) {
    const dimBelow = chord(dimBelowRoot, 'dim7');
    const dimFromDist = ((fromBass - dimBelowRoot) % 12 + 12) % 12;
    results.push({
      chord: dimBelow,
      type: 'passing-dim',
      reason: `${chordName(dimBelow)} (chromatic passing, resolves up to ${chordName(to)})`,
      createsChromaticBass: dimFromDist === 1, // from descends by semitone to dim, dim ascends to target
    });
  }

  // A dim7 one semitone above the target root (descending approach)
  const dimAboveRoot = (toBass + 1) % 12;
  if (dimAboveRoot !== fromBass && dimAboveRoot !== toBass && dimAboveRoot !== dimBelowRoot) {
    const dimAbove = chord(dimAboveRoot, 'dim7');
    const dimFromDist = ((dimAboveRoot - fromBass) % 12 + 12) % 12;
    results.push({
      chord: dimAbove,
      type: 'passing-dim',
      reason: `${chordName(dimAbove)} (chromatic passing, resolves down to ${chordName(to)})`,
      createsChromaticBass: dimFromDist === 1, // from ascends by semitone to dim, dim descends to target
    });
  }

  // 3. Secondary dominant (V7 of target)
  if (v7Root !== fromBass && v7Root !== toBass) {
    results.push({
      chord: v7,
      type: 'secondary-dom',
      reason: `${chordName(v7)} (V7 of ${chordName(to)})`,
      createsChromaticBass: false, // V7 resolves by P5, not chromatic
    });
  }

  return results;
}

/**
 * Find chromatic bass line segments in a progression.
 * A chromatic bass line is a sequence of consecutive chords
 * whose roots move by semitone (ascending or descending).
 *
 * Returns spans: [startIndex, endIndex] (inclusive).
 */
export interface ChromaticBassSpan {
  start: number;
  end: number;
  direction: 'ascending' | 'descending';
}

export function findChromaticBassLines(progression: Chord[]): ChromaticBassSpan[] {
  if (progression.length < 2) return [];

  const spans: ChromaticBassSpan[] = [];
  let spanStart = 0;
  let spanDirection: 'ascending' | 'descending' | null = null;

  for (let i = 1; i < progression.length; i++) {
    const prevRoot = progression[i - 1].root;
    const currRoot = progression[i].root;
    const interval = ((currRoot - prevRoot) % 12 + 12) % 12;

    let dir: 'ascending' | 'descending' | null = null;
    if (interval === 1) dir = 'ascending';
    else if (interval === 11) dir = 'descending';

    if (dir !== null && (spanDirection === null || dir === spanDirection)) {
      // Continue or start a span
      if (spanDirection === null) {
        spanStart = i - 1;
        spanDirection = dir;
      }
    } else {
      // End current span if it exists and has at least 2 steps (3 chords)
      if (spanDirection !== null && i - 1 - spanStart >= 2) {
        spans.push({ start: spanStart, end: i - 1, direction: spanDirection });
      }
      // Start new span if current interval is chromatic
      if (dir !== null) {
        spanStart = i - 1;
        spanDirection = dir;
      } else {
        spanDirection = null;
      }
    }
  }

  // Close final span
  if (spanDirection !== null && progression.length - 1 - spanStart >= 2) {
    spans.push({ start: spanStart, end: progression.length - 1, direction: spanDirection });
  }

  return spans;
}

/**
 * For each consecutive pair in a progression, suggest the best bridge chord.
 * Returns an array of length (progression.length - 1), where each entry
 * is the top bridge chord suggestion (or null if none is compelling).
 */
export interface BridgeSuggestion {
  position: number; // index between chord[position] and chord[position+1]
  bridge: BridgeChord;
}

export function suggestBridgesForProgression(
  progression: Chord[],
): BridgeSuggestion[] {
  const suggestions: BridgeSuggestion[] = [];

  for (let i = 0; i < progression.length - 1; i++) {
    const bridges = suggestBridgeChords(progression[i], progression[i + 1]);

    // Prioritize: chromatic bass > tritone-sub > secondary-dom > passing-dim
    const best =
      bridges.find(b => b.createsChromaticBass && b.type === 'tritone-sub') ??
      bridges.find(b => b.createsChromaticBass) ??
      bridges.find(b => b.type === 'tritone-sub') ??
      bridges.find(b => b.type === 'secondary-dom') ??
      bridges[0] ?? null;

    if (best) {
      suggestions.push({ position: i, bridge: best });
    }
  }

  return suggestions;
}
