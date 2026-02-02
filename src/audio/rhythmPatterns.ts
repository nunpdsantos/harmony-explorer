/**
 * Rhythm pattern definitions.
 * Each pattern specifies how a chord's duration is subdivided.
 */

export type RhythmPatternName = 'whole' | 'half' | 'quarter' | 'swing' | 'bossaNova' | 'waltz';

export interface RhythmHit {
  /** Offset within the chord duration (0-1) */
  offset: number;
  /** Duration as fraction of chord duration */
  duration: number;
  /** Velocity multiplier (0-1) */
  accent: number;
}

export interface RhythmPattern {
  name: string;
  /** Generate hits for one chord period. */
  hits: RhythmHit[];
}

export const RHYTHM_PATTERNS: Record<RhythmPatternName, RhythmPattern> = {
  whole: {
    name: 'Whole',
    hits: [
      { offset: 0, duration: 0.95, accent: 1.0 },
    ],
  },
  half: {
    name: 'Half',
    hits: [
      { offset: 0, duration: 0.45, accent: 1.0 },
      { offset: 0.5, duration: 0.45, accent: 0.8 },
    ],
  },
  quarter: {
    name: 'Quarter',
    hits: [
      { offset: 0, duration: 0.22, accent: 1.0 },
      { offset: 0.25, duration: 0.22, accent: 0.7 },
      { offset: 0.5, duration: 0.22, accent: 0.85 },
      { offset: 0.75, duration: 0.22, accent: 0.7 },
    ],
  },
  swing: {
    name: 'Swing',
    hits: [
      { offset: 0, duration: 0.3, accent: 1.0 },
      { offset: 0.33, duration: 0.15, accent: 0.65 },
      { offset: 0.5, duration: 0.3, accent: 0.85 },
      { offset: 0.83, duration: 0.15, accent: 0.65 },
    ],
  },
  bossaNova: {
    name: 'Bossa',
    hits: [
      { offset: 0, duration: 0.2, accent: 1.0 },
      { offset: 0.375, duration: 0.1, accent: 0.6 },
      { offset: 0.5, duration: 0.2, accent: 0.85 },
      { offset: 0.75, duration: 0.1, accent: 0.6 },
    ],
  },
  waltz: {
    name: 'Waltz',
    hits: [
      { offset: 0, duration: 0.3, accent: 1.0 },
      { offset: 0.333, duration: 0.28, accent: 0.6 },
      { offset: 0.667, duration: 0.28, accent: 0.6 },
    ],
  },
};

export const RHYTHM_PATTERN_NAMES: RhythmPatternName[] = ['whole', 'half', 'quarter', 'swing', 'bossaNova', 'waltz'];
