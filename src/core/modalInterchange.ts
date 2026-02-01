/**
 * Modal Interchange: borrowed chords from parallel modes.
 * Computes which chords are available from parallel minor modes
 * that don't exist in the home major key.
 */

import { chord, chordKey, type Chord } from './chords';
import { type ChordQuality, type TonalFunction } from './constants';
import { type ModeType, MODE_TEMPLATES } from './modes';

export interface BorrowedChord {
  chord: Chord;
  sourceMode: ModeType;
  sourceModeName: string;
  roman: string;
  tonalFunction: TonalFunction;
  description: string;
}

/** Diatonic quality patterns for each parallel mode */
const MODE_TRIAD_QUALITIES: Partial<Record<ModeType, ChordQuality[]>> = {
  ionian:     ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
  dorian:     ['minor', 'minor', 'major', 'major', 'minor', 'diminished', 'major'],
  phrygian:   ['minor', 'major', 'major', 'minor', 'diminished', 'major', 'minor'],
  lydian:     ['major', 'major', 'minor', 'diminished', 'major', 'minor', 'minor'],
  mixolydian: ['major', 'minor', 'diminished', 'major', 'minor', 'minor', 'major'],
  aeolian:    ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  locrian:    ['diminished', 'major', 'minor', 'minor', 'major', 'major', 'minor'],
  harmonicMinor: ['minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished'],
  melodicMinor:  ['minor', 'minor', 'augmented', 'major', 'major', 'diminished', 'diminished'],
};

/** Roman numeral computation from semitone offset */
const FLAT_ROMAN: Record<number, string> = {
  1: '♭II', 2: 'II', 3: '♭III', 4: 'III', 5: 'IV', 6: '♯IV',
  7: 'V', 8: '♭VI', 9: 'VI', 10: '♭VII', 11: 'VII',
};

/** Determine the function of a borrowed chord based on its degree distance from root */
function borrowedChordFunction(semitones: number): TonalFunction {
  // ♭III, ♭VI, iv = subdominant-ish; ♭VII = dominant-ish; rest = tonic
  if ([3, 5, 8, 10].includes(semitones)) return 'subdominant';
  if ([1, 6].includes(semitones)) return 'dominant';
  return 'tonic';
}

function getRomanNumeral(rootSemitones: number, quality: ChordQuality): string {
  if (rootSemitones === 0) {
    return quality === 'minor' || quality === 'diminished' ? 'i' : 'I';
  }

  const base = FLAT_ROMAN[rootSemitones] ?? String(rootSemitones);

  if (quality === 'minor') return base.toLowerCase();
  if (quality === 'diminished') return base.toLowerCase() + '°';
  if (quality === 'augmented') return base + '+';
  return base;
}

/**
 * Get borrowed chords from a specific parallel mode.
 * Only returns chords NOT already diatonic in the home major key.
 */
export function getModalInterchangeChords(
  keyRoot: number,
  borrowFromMode: ModeType,
): BorrowedChord[] {
  const modeQualities = MODE_TRIAD_QUALITIES[borrowFromMode];
  if (!modeQualities) return [];

  const modeIntervals = MODE_TEMPLATES[borrowFromMode].intervals;
  const majorIntervals = MODE_TEMPLATES.ionian.intervals;

  // Build the diatonic triads of the home major key (for exclusion)
  const majorTriadKeys = new Set<string>();
  const majorQualities = MODE_TRIAD_QUALITIES.ionian!;
  for (let i = 0; i < 7; i++) {
    const root = (keyRoot + majorIntervals[i]) % 12;
    majorTriadKeys.add(chordKey(chord(root, majorQualities[i])));
  }

  // Build triads of the parallel mode and filter out diatonic ones
  const borrowed: BorrowedChord[] = [];
  for (let i = 0; i < 7; i++) {
    const modeRoot = (keyRoot + modeIntervals[i]) % 12;
    const quality = modeQualities[i];
    const c = chord(modeRoot, quality);

    if (!majorTriadKeys.has(chordKey(c))) {
      const semitones = ((modeRoot - keyRoot) % 12 + 12) % 12;
      const roman = getRomanNumeral(semitones, quality);

      borrowed.push({
        chord: c,
        sourceMode: borrowFromMode,
        sourceModeName: MODE_TEMPLATES[borrowFromMode].name,
        roman,
        tonalFunction: borrowedChordFunction(semitones),
        description: `${roman} from ${MODE_TEMPLATES[borrowFromMode].name}`,
      });
    }
  }

  return borrowed;
}

/**
 * Get all borrowed chords from all common parallel modes.
 * Deduplicates by chord key, keeping the most common source.
 */
export function getAllBorrowedChords(keyRoot: number): BorrowedChord[] {
  const modes: ModeType[] = [
    'aeolian', 'dorian', 'phrygian', 'lydian',
    'mixolydian', 'harmonicMinor', 'melodicMinor',
  ];

  const seen = new Map<string, BorrowedChord>();

  for (const mode of modes) {
    const chords = getModalInterchangeChords(keyRoot, mode);
    for (const bc of chords) {
      const key = chordKey(bc.chord);
      // Prefer aeolian/dorian sources (most common borrowed chords)
      if (!seen.has(key)) {
        seen.set(key, bc);
      }
    }
  }

  // Sort by root semitone distance from key
  return [...seen.values()].sort((a, b) => {
    const aDist = ((a.chord.root - keyRoot) % 12 + 12) % 12;
    const bDist = ((b.chord.root - keyRoot) % 12 + 12) % 12;
    return aDist - bDist;
  });
}
