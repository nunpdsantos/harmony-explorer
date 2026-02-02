import { CHORD_TEMPLATES, type ChordQuality } from '../core/constants';

// ---------------------------------------------------------------------------
// Interval training
// ---------------------------------------------------------------------------

export const INTERVAL_NAMES: Record<number, string> = {
  0: 'Unison',
  1: 'Minor 2nd',
  2: 'Major 2nd',
  3: 'Minor 3rd',
  4: 'Major 3rd',
  5: 'Perfect 4th',
  6: 'Tritone',
  7: 'Perfect 5th',
  8: 'Minor 6th',
  9: 'Major 6th',
  10: 'Minor 7th',
  11: 'Major 7th',
  12: 'Octave',
};

export const INTERVAL_SHORT: Record<number, string> = {
  0: 'P1',
  1: 'm2',
  2: 'M2',
  3: 'm3',
  4: 'M3',
  5: 'P4',
  6: 'TT',
  7: 'P5',
  8: 'm6',
  9: 'M6',
  10: 'm7',
  11: 'M7',
  12: 'P8',
};

export type IntervalDirection = 'ascending' | 'descending' | 'harmonic';

export interface IntervalQuestion {
  type: 'interval';
  /** Base MIDI note */
  baseMidi: number;
  /** Interval in semitones (1-12) */
  interval: number;
  direction: IntervalDirection;
  /** MIDI notes to play ([base, base+interval] or [base, base-interval]) */
  playNotes: number[];
  /** Correct answer label */
  correctAnswer: string;
  /** All options */
  options: string[];
}

/**
 * Difficulty tiers for interval training.
 * Easy: P4, P5, P8 (most recognizable)
 * Medium: adds M3, m3, M2, m2
 * Hard: all intervals including TT, 6ths, 7ths
 */
export const INTERVAL_TIERS = {
  easy: [5, 7, 12],
  medium: [2, 3, 4, 5, 7, 12],
  hard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
} as const;

export type IntervalDifficulty = keyof typeof INTERVAL_TIERS;

const MIDI_RANGE_LOW = 48;  // C3
const MIDI_RANGE_HIGH = 72; // C5

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random interval training question.
 */
export function generateIntervalQuestion(
  difficulty: IntervalDifficulty = 'easy',
  direction: IntervalDirection = 'ascending',
): IntervalQuestion {
  const intervals = INTERVAL_TIERS[difficulty];
  const interval = intervals[randomInt(0, intervals.length - 1)];

  // Choose base note, ensuring target stays in range
  let baseMidi: number;
  let playNotes: number[];

  if (direction === 'descending') {
    baseMidi = randomInt(MIDI_RANGE_LOW + interval, MIDI_RANGE_HIGH);
    playNotes = [baseMidi, baseMidi - interval];
  } else if (direction === 'harmonic') {
    baseMidi = randomInt(MIDI_RANGE_LOW, MIDI_RANGE_HIGH - interval);
    playNotes = [baseMidi, baseMidi + interval];
  } else {
    // ascending
    baseMidi = randomInt(MIDI_RANGE_LOW, MIDI_RANGE_HIGH - interval);
    playNotes = [baseMidi, baseMidi + interval];
  }

  const correctAnswer = INTERVAL_SHORT[interval];
  const options = intervals.map(i => INTERVAL_SHORT[i]);

  return {
    type: 'interval',
    baseMidi,
    interval,
    direction,
    playNotes,
    correctAnswer,
    options,
  };
}

// ---------------------------------------------------------------------------
// Chord quality training
// ---------------------------------------------------------------------------

export interface ChordQualityQuestion {
  type: 'chord-quality';
  /** Root pitch class (0-11) */
  root: number;
  /** Correct quality */
  quality: ChordQuality;
  /** MIDI notes to play */
  playNotes: number[];
  correctAnswer: string;
  options: string[];
}

export const QUALITY_TIERS = {
  easy: ['major', 'minor'] as ChordQuality[],
  medium: ['major', 'minor', 'diminished', 'augmented'] as ChordQuality[],
  hard: ['major', 'minor', 'diminished', 'augmented', 'dom7', 'maj7', 'min7'] as ChordQuality[],
};

export type QualityDifficulty = keyof typeof QUALITY_TIERS;

const QUALITY_DISPLAY: Record<string, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Diminished',
  augmented: 'Augmented',
  dom7: 'Dominant 7th',
  maj7: 'Major 7th',
  min7: 'Minor 7th',
};

/**
 * Generate a chord quality identification question.
 */
export function generateChordQualityQuestion(
  difficulty: QualityDifficulty = 'easy',
): ChordQualityQuestion {
  const qualities = QUALITY_TIERS[difficulty];
  const quality = qualities[randomInt(0, qualities.length - 1)];
  const root = randomInt(0, 11);
  const baseMidi = 48 + root; // C3 region

  const template = CHORD_TEMPLATES[quality];
  const playNotes = template.intervals.map((i: number) => baseMidi + i);

  const correctAnswer = QUALITY_DISPLAY[quality] ?? quality;
  const options = qualities.map(q => QUALITY_DISPLAY[q] ?? q);

  return {
    type: 'chord-quality',
    root,
    quality,
    playNotes,
    correctAnswer,
    options,
  };
}

// ---------------------------------------------------------------------------
// Progression dictation
// ---------------------------------------------------------------------------

export interface ProgressionDictationQuestion {
  type: 'progression-dictation';
  /** Array of {root, quality} for the progression */
  chords: Array<{ root: number; quality: ChordQuality }>;
  /** MIDI note arrays for each chord */
  playChords: number[][];
  /** Number of chords to identify */
  length: number;
}

export const DICTATION_TIERS = {
  easy: {
    length: 3,
    qualities: ['major', 'minor'] as ChordQuality[],
    diatonic: true,
  },
  medium: {
    length: 4,
    qualities: ['major', 'minor', 'dom7'] as ChordQuality[],
    diatonic: true,
  },
  hard: {
    length: 4,
    qualities: ['major', 'minor', 'dom7', 'diminished', 'min7'] as ChordQuality[],
    diatonic: false,
  },
};

export type DictationDifficulty = keyof typeof DICTATION_TIERS;

/** Major scale pitch classes from a given root */
function majorScalePcs(root: number): number[] {
  return [0, 2, 4, 5, 7, 9, 11].map(i => (root + i) % 12);
}

/** Diatonic chord qualities for major scale degrees */
const DIATONIC_QUALITIES: ChordQuality[] = [
  'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
];

/**
 * Generate a progression dictation question.
 */
export function generateDictationQuestion(
  difficulty: DictationDifficulty = 'easy',
  keyRoot: number = 0,
): ProgressionDictationQuestion {
  const tier = DICTATION_TIERS[difficulty];
  const scalePcs = majorScalePcs(keyRoot);
  const chords: Array<{ root: number; quality: ChordQuality }> = [];

  for (let i = 0; i < tier.length; i++) {
    let root: number;
    let quality: ChordQuality;

    if (tier.diatonic) {
      // Pick a random scale degree
      const degree = randomInt(0, 6);
      root = scalePcs[degree];
      quality = DIATONIC_QUALITIES[degree];
    } else {
      root = randomInt(0, 11);
      quality = tier.qualities[randomInt(0, tier.qualities.length - 1)];
    }

    chords.push({ root, quality });
  }

  const playChords = chords.map(c => {
    const baseMidi = 48 + c.root;
    const template = CHORD_TEMPLATES[c.quality];
    return template.intervals.map((i: number) => baseMidi + i);
  });

  return {
    type: 'progression-dictation',
    chords,
    playChords,
    length: tier.length,
  };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface EarTrainingScore {
  correct: number;
  total: number;
  streak: number;
}

export function updateScore(
  score: EarTrainingScore,
  isCorrect: boolean,
): EarTrainingScore {
  return {
    correct: score.correct + (isCorrect ? 1 : 0),
    total: score.total + 1,
    streak: isCorrect ? score.streak + 1 : 0,
  };
}

export function initialScore(): EarTrainingScore {
  return { correct: 0, total: 0, streak: 0 };
}
