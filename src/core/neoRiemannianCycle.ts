import { chord, type Chord } from './chords';
import { applyNeoRiemannian, type NeoRiemannianTransform } from './relationships';

/**
 * Neo-Riemannian cycles: sequences of chords connected by
 * alternating pairs of transforms that traverse all 24 major/minor triads.
 */

export interface CycleStep {
  chord: Chord;
  transform: NeoRiemannianTransform | null; // null for the first chord
}

/**
 * Build the P/L cycle (alternating Parallel and Leading-tone transforms).
 * This generates a 24-chord cycle visiting all major and minor triads
 * with maximally smooth voice leading (1 semitone per step).
 *
 * Starting from C major:
 * C → Cm (P) → Ab (L) → Abm (P) → E (L) → Em (P) → C (L) → ...
 * The full cycle is 24 chords before returning to start.
 */
export function buildPLCycle(startRoot: number = 0): CycleStep[] {
  const steps: CycleStep[] = [];
  let current: Chord = chord(startRoot, 'major');
  steps.push({ chord: current, transform: null });

  const transforms: NeoRiemannianTransform[] = ['P', 'L'];
  let transformIndex = 0;

  for (let i = 0; i < 23; i++) {
    const t = transforms[transformIndex % 2];
    const next = applyNeoRiemannian(current, t);
    if (!next) break;
    steps.push({ chord: next, transform: t });
    current = next;
    transformIndex++;
  }

  return steps;
}

/**
 * Build the P/R cycle (alternating Parallel and Relative transforms).
 * Generates a cycle of chords. The P/R cycle has period 8
 * (visits 8 unique chords, not all 24).
 *
 * C → Cm (P) → Eb (R) → Ebm (P) → Gb (R) → Gbm (P) → A (R) → Am (P) → C (R)
 */
export function buildPRCycle(startRoot: number = 0): CycleStep[] {
  const steps: CycleStep[] = [];
  let current: Chord = chord(startRoot, 'major');
  steps.push({ chord: current, transform: null });

  const transforms: NeoRiemannianTransform[] = ['P', 'R'];
  let transformIndex = 0;
  const seen = new Set<string>([`${current.root}-${current.quality}`]);

  for (let i = 0; i < 23; i++) {
    const t = transforms[transformIndex % 2];
    const next = applyNeoRiemannian(current, t);
    if (!next) break;
    const key = `${next.root}-${next.quality}`;
    if (seen.has(key)) break;
    seen.add(key);
    steps.push({ chord: next, transform: t });
    current = next;
    transformIndex++;
  }

  return steps;
}

/**
 * Build the L/R cycle (alternating Leading-tone and Relative transforms).
 * The L/R cycle has period 24, visiting all major and minor triads.
 *
 * C → Em (L) → G (R) → Bm (L) → D (R) → F#m (L) → A (R) → ...
 */
export function buildLRCycle(startRoot: number = 0): CycleStep[] {
  const steps: CycleStep[] = [];
  let current: Chord = chord(startRoot, 'major');
  steps.push({ chord: current, transform: null });

  const transforms: NeoRiemannianTransform[] = ['L', 'R'];
  let transformIndex = 0;

  for (let i = 0; i < 23; i++) {
    const t = transforms[transformIndex % 2];
    const next = applyNeoRiemannian(current, t);
    if (!next) break;
    steps.push({ chord: next, transform: t });
    current = next;
    transformIndex++;
  }

  return steps;
}
