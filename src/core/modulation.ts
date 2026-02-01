import { chordKey, chordName, type Chord } from './chords';
import { getDiatonicChords, type DiatonicChordInfo } from './harmony';
import { getDiminished7thGroups, getDiminishedResolutions, getAugmentedReachability } from './symmetricStructures';
import { noteName } from './constants';

/**
 * Modulation analysis: finding pivot chords and paths between two keys.
 *
 * Three pivot mechanisms:
 * 1. Common chords — diatonic in both keys, reinterpreted
 * 2. Diminished 7th pivots — symmetric dim7 resolves to multiple tonics
 * 3. Augmented pivots — symmetric aug triad reaches 6 triads via ±1 semitone
 */

// ── Common (pivot) chords ──────────────────────────────────────────

export interface CommonChord {
  chord: Chord;
  sourceInfo: DiatonicChordInfo;
  targetInfo: DiatonicChordInfo;
  description: string; // e.g. "Am: vi in C → ii in G"
}

/**
 * Find chords that are diatonic in both the source and target major keys.
 * These are the classic "pivot chords" for smooth modulation.
 */
export function findCommonChords(sourceRoot: number, targetRoot: number): CommonChord[] {
  const sourceDiatonic = getDiatonicChords(sourceRoot);
  const targetDiatonic = getDiatonicChords(targetRoot);

  const targetMap = new Map<string, DiatonicChordInfo>();
  for (const d of targetDiatonic) {
    targetMap.set(d.key, d);
  }

  const results: CommonChord[] = [];
  for (const src of sourceDiatonic) {
    const tgt = targetMap.get(src.key);
    if (tgt) {
      results.push({
        chord: src.chord,
        sourceInfo: src,
        targetInfo: tgt,
        description: `${chordName(src.chord)}: ${src.roman} in ${noteName(sourceRoot)} → ${tgt.roman} in ${noteName(targetRoot)}`,
      });
    }
  }

  return results;
}

// ── Diminished 7th pivots ──────────────────────────────────────────

export interface DiminishedPivot {
  dim7Chord: Chord;
  resolvesTo: Chord; // The major chord in target key reached by half-step resolution
  targetDegree: DiatonicChordInfo;
  description: string;
}

/**
 * Find diminished 7th chords that can pivot from source key to target key.
 *
 * Any dim7 chord note can resolve up by half-step to a major chord root.
 * If that resolution lands on a diatonic chord of the target key, it's a valid pivot.
 *
 * Most useful when the resolution lands on the target tonic (I) or dominant (V).
 */
export function findDiminishedPivots(targetRoot: number): DiminishedPivot[] {
  const targetDiatonic = getDiatonicChords(targetRoot);
  const targetMap = new Map<string, DiatonicChordInfo>();
  for (const d of targetDiatonic) {
    targetMap.set(d.key, d);
  }

  const results: DiminishedPivot[] = [];
  const groups = getDiminished7thGroups();

  for (const group of groups) {
    // Use the first chord of each group as representative (all enharmonically equivalent)
    const dim7 = group[0];
    const resolutions = getDiminishedResolutions(dim7);

    for (const resolved of resolutions) {
      const targetInfo = targetMap.get(chordKey(resolved));
      if (targetInfo) {
        results.push({
          dim7Chord: dim7,
          resolvesTo: resolved,
          targetDegree: targetInfo,
          description: `${chordName(dim7)} → ${chordName(resolved)} (${targetInfo.roman} in ${noteName(targetRoot)})`,
        });
      }
    }
  }

  return results;
}

// ── Augmented pivots ───────────────────────────────────────────────

export interface AugmentedPivot {
  augChord: Chord;
  reachesChord: Chord;
  movedNote: string; // e.g. "G# ↓ G"
  targetDegree: DiatonicChordInfo;
  description: string;
}

/**
 * Find augmented triads that can pivot to the target key.
 *
 * An augmented triad can reach 6 triads by moving one note ±1 semitone.
 * If any of those triads is diatonic in the target key, it's a valid pivot.
 */
export function findAugmentedPivots(targetRoot: number): AugmentedPivot[] {
  const targetDiatonic = getDiatonicChords(targetRoot);
  const targetMap = new Map<string, DiatonicChordInfo>();
  for (const d of targetDiatonic) {
    targetMap.set(d.key, d);
  }

  const results: AugmentedPivot[] = [];

  // There are 4 unique augmented triads (roots 0-3; root+4 = same aug triad)
  for (let root = 0; root < 4; root++) {
    const reach = getAugmentedReachability(root);

    for (const r of reach.reachableTriads) {
      const targetInfo = targetMap.get(chordKey(r.triad));
      if (targetInfo) {
        results.push({
          augChord: reach.augChord,
          reachesChord: r.triad,
          movedNote: r.description,
          targetDegree: targetInfo,
          description: `${chordName(reach.augChord)} (${r.description}) → ${chordName(r.triad)} (${targetInfo.roman} in ${noteName(targetRoot)})`,
        });
      }
    }
  }

  return results;
}

// ── Combined modulation routes ─────────────────────────────────────

export type PivotType = 'common' | 'diminished' | 'augmented';

export interface ModulationRoute {
  type: PivotType;
  pivotChord: Chord;         // The chord that acts as the pivot
  targetChord: Chord;        // The chord in the target key reached through this pivot
  sourceRoman?: string;      // Roman numeral in source key (if applicable)
  targetRoman: string;       // Roman numeral in target key
  description: string;
  /** How "smooth" this route is: lower = smoother */
  distance: number;
}

/**
 * Get all modulation routes from source key to target key,
 * sorted by smoothness (common chords first, then dim7, then augmented).
 */
export function getModulationRoutes(sourceRoot: number, targetRoot: number): ModulationRoute[] {
  if (sourceRoot === targetRoot) return [];

  const routes: ModulationRoute[] = [];

  // Common chords — smoothest modulation
  const common = findCommonChords(sourceRoot, targetRoot);
  for (const c of common) {
    routes.push({
      type: 'common',
      pivotChord: c.chord,
      targetChord: c.chord,
      sourceRoman: c.sourceInfo.roman,
      targetRoman: c.targetInfo.roman,
      description: c.description,
      distance: 0,
    });
  }

  // Diminished pivots
  const dimPivots = findDiminishedPivots(targetRoot);
  for (const d of dimPivots) {
    routes.push({
      type: 'diminished',
      pivotChord: d.dim7Chord,
      targetChord: d.resolvesTo,
      targetRoman: d.targetDegree.roman,
      description: d.description,
      distance: 1,
    });
  }

  // Augmented pivots
  const augPivots = findAugmentedPivots(targetRoot);
  for (const a of augPivots) {
    routes.push({
      type: 'augmented',
      pivotChord: a.augChord,
      targetChord: a.reachesChord,
      targetRoman: a.targetDegree.roman,
      description: a.description,
      distance: 2,
    });
  }

  // Sort: common first, then dim, then aug; within same type by target degree
  routes.sort((a, b) => a.distance - b.distance);

  return routes;
}

/**
 * Key distance on the circle of fifths (0-6).
 * 0 = same key, 1 = one fifth apart, ..., 6 = tritone.
 */
export function keyDistance(a: number, b: number): number {
  const diff = ((b - a) % 12 + 12) % 12;
  // Count fifths: each fifth = +7 semitones
  // Convert semitone distance to number of fifths around the circle
  const fifths = [0, 5, 10, 3, 8, 1, 6, 11, 4, 9, 2, 7];
  const dist = fifths[diff];
  return Math.min(dist, 12 - dist);
}
