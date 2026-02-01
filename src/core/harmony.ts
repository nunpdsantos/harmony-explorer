import { chordKey, type Chord } from './chords';
import { diatonicTriads } from './scales';
import { type TonalFunction } from './constants';
import { sharedNoteCount, isDominantOf } from './relationships';

/**
 * Full harmonic context for a key — diatonic chords, their functions,
 * and the "next moves" graph showing where each chord can lead.
 */

export interface DiatonicChordInfo {
  chord: Chord;
  degree: number;          // 0-6
  roman: string;           // "I", "ii", "iii", etc.
  function: TonalFunction;
  key: string;             // chordKey for lookups
}

/** Roman numerals with case for major/minor */
const ROMAN_MAJOR = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii\u00B0'];

/** Tonal function by degree in major key */
const DEGREE_FUNCTIONS: TonalFunction[] = [
  'tonic',        // I
  'subdominant',  // ii
  'tonic',        // iii
  'subdominant',  // IV
  'dominant',     // V
  'tonic',        // vi
  'dominant',     // vii°
];

/** Get all diatonic chord info for a major key */
export function getDiatonicChords(root: number): DiatonicChordInfo[] {
  const triads = diatonicTriads(root, 'major');
  return triads.map((c, i) => ({
    chord: c,
    degree: i,
    roman: ROMAN_MAJOR[i],
    function: DEGREE_FUNCTIONS[i],
    key: chordKey(c),
  }));
}

/** Check if a chord is diatonic in the given key */
export function isDiatonic(c: Chord, keyRoot: number): boolean {
  const diatonic = getDiatonicChords(keyRoot);
  const k = chordKey(c);
  return diatonic.some(d => d.key === k);
}

/** Get the diatonic info for a chord if it's diatonic, null otherwise */
export function getDiatonicInfo(c: Chord, keyRoot: number): DiatonicChordInfo | null {
  const diatonic = getDiatonicChords(keyRoot);
  return diatonic.find(d => d.key === chordKey(c)) ?? null;
}

/**
 * Functional harmony "next moves" — where can you go from a given chord?
 *
 * Classical rules (simplified):
 * - I can go anywhere
 * - ii → V, vii°, I (subdominant resolves to dominant or tonic)
 * - iii → vi, IV, ii (tonic moves to subdominant or tonic)
 * - IV → V, vii°, I, ii (subdominant to dominant or tonic)
 * - V → I, vi (dominant resolves to tonic)
 * - vi → ii, IV, V (tonic moves to subdominant or dominant)
 * - vii° → I, iii (dominant resolves to tonic)
 *
 * We also mark which moves are "strong" (expected) vs "possible" (creative).
 */
export interface NextMove {
  chord: Chord;
  info: DiatonicChordInfo;
  strength: 'strong' | 'common' | 'creative';
  reason: string;
}

const NEXT_MOVE_MAP: Record<number, { degree: number; strength: 'strong' | 'common' | 'creative'; reason: string }[]> = {
  0: [ // I
    { degree: 3, strength: 'strong',   reason: 'I \u2192 IV (to subdominant)' },
    { degree: 4, strength: 'strong',   reason: 'I \u2192 V (to dominant)' },
    { degree: 5, strength: 'common',   reason: 'I \u2192 vi (deceptive/relative)' },
    { degree: 1, strength: 'common',   reason: 'I \u2192 ii (to subdominant)' },
    { degree: 2, strength: 'creative', reason: 'I \u2192 iii (mediant)' },
  ],
  1: [ // ii
    { degree: 4, strength: 'strong',   reason: 'ii \u2192 V (pre-dominant to dominant)' },
    { degree: 6, strength: 'common',   reason: 'ii \u2192 vii\u00B0 (to dominant)' },
    { degree: 0, strength: 'common',   reason: 'ii \u2192 I (to tonic)' },
    { degree: 3, strength: 'creative', reason: 'ii \u2192 IV (subdominant swap)' },
  ],
  2: [ // iii
    { degree: 5, strength: 'strong',   reason: 'iii \u2192 vi (tonic to tonic)' },
    { degree: 3, strength: 'common',   reason: 'iii \u2192 IV (to subdominant)' },
    { degree: 1, strength: 'common',   reason: 'iii \u2192 ii (to subdominant)' },
    { degree: 4, strength: 'creative', reason: 'iii \u2192 V (skip to dominant)' },
  ],
  3: [ // IV
    { degree: 4, strength: 'strong',   reason: 'IV \u2192 V (subdominant to dominant)' },
    { degree: 0, strength: 'strong',   reason: 'IV \u2192 I (plagal cadence)' },
    { degree: 1, strength: 'common',   reason: 'IV \u2192 ii (subdominant swap)' },
    { degree: 6, strength: 'common',   reason: 'IV \u2192 vii\u00B0 (to dominant)' },
    { degree: 5, strength: 'creative', reason: 'IV \u2192 vi (subdominant to tonic)' },
  ],
  4: [ // V
    { degree: 0, strength: 'strong',   reason: 'V \u2192 I (authentic cadence)' },
    { degree: 5, strength: 'common',   reason: 'V \u2192 vi (deceptive cadence)' },
    { degree: 3, strength: 'creative', reason: 'V \u2192 IV (retrogression)' },
  ],
  5: [ // vi
    { degree: 1, strength: 'strong',   reason: 'vi \u2192 ii (tonic to subdominant)' },
    { degree: 3, strength: 'strong',   reason: 'vi \u2192 IV (tonic to subdominant)' },
    { degree: 4, strength: 'common',   reason: 'vi \u2192 V (to dominant)' },
    { degree: 2, strength: 'creative', reason: 'vi \u2192 iii (tonic to tonic)' },
    { degree: 0, strength: 'creative', reason: 'vi \u2192 I (back to tonic)' },
  ],
  6: [ // vii°
    { degree: 0, strength: 'strong',   reason: 'vii\u00B0 \u2192 I (dominant to tonic)' },
    { degree: 2, strength: 'common',   reason: 'vii\u00B0 \u2192 iii (to tonic)' },
    { degree: 5, strength: 'creative', reason: 'vii\u00B0 \u2192 vi (deceptive)' },
  ],
};

/** Get the suggested next moves from a chord in a key */
export function getNextMoves(c: Chord, keyRoot: number): NextMove[] {
  const diatonic = getDiatonicChords(keyRoot);
  const info = getDiatonicInfo(c, keyRoot);

  if (!info) {
    // Non-diatonic chord: suggest resolving to nearest diatonic chord
    // by shared notes or dominant resolution
    const moves: NextMove[] = [];
    for (const d of diatonic) {
      const shared = sharedNoteCount(c, d.chord);
      if (isDominantOf(c, d.chord)) {
        moves.push({ chord: d.chord, info: d, strength: 'strong', reason: `Dominant resolution \u2192 ${d.roman}` });
      } else if (shared >= 2) {
        moves.push({ chord: d.chord, info: d, strength: 'common', reason: `${shared} shared notes \u2192 ${d.roman}` });
      }
    }
    return moves.length > 0 ? moves : diatonic.slice(0, 3).map(d => ({
      chord: d.chord, info: d, strength: 'creative' as const, reason: `Return to key \u2192 ${d.roman}`,
    }));
  }

  const moveDefinitions = NEXT_MOVE_MAP[info.degree] ?? [];
  return moveDefinitions.map(m => ({
    chord: diatonic[m.degree].chord,
    info: diatonic[m.degree],
    strength: m.strength,
    reason: m.reason,
  }));
}

/** Color for tonal function */
export function functionColor(fn: TonalFunction): string {
  switch (fn) {
    case 'tonic':       return '#22c55e'; // green
    case 'subdominant': return '#3b82f6'; // blue
    case 'dominant':    return '#ef4444'; // red
  }
}

/** Background color for tonal function (dim) */
export function functionBgColor(fn: TonalFunction): string {
  switch (fn) {
    case 'tonic':       return 'rgba(34,197,94,0.15)';
    case 'subdominant': return 'rgba(59,130,246,0.15)';
    case 'dominant':    return 'rgba(239,68,68,0.15)';
  }
}
