import { chord, type Chord } from './chords';
import type { ChordQuality } from './constants';

/**
 * A progression template defined by scale degrees and qualities.
 * Degree is 0-indexed (0 = I, 1 = II, ... 6 = VII).
 * Templates are key-agnostic; call transposeTemplate() to get concrete chords.
 */
export interface ProgressionTemplate {
  name: string;
  shortName: string;
  description: string;
  steps: { degree: number; quality: ChordQuality }[];
}

/** Major scale intervals from root for each degree */
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

export const TEMPLATES: ProgressionTemplate[] = [
  {
    name: 'I – IV – V – I',
    shortName: 'I-IV-V-I',
    description: 'Classic cadential progression',
    steps: [
      { degree: 0, quality: 'major' },
      { degree: 3, quality: 'major' },
      { degree: 4, quality: 'major' },
      { degree: 0, quality: 'major' },
    ],
  },
  {
    name: 'ii – V – I',
    shortName: 'ii-V-I',
    description: 'Jazz standard resolution',
    steps: [
      { degree: 1, quality: 'min7' },
      { degree: 4, quality: 'dom7' },
      { degree: 0, quality: 'maj7' },
    ],
  },
  {
    name: 'I – vi – IV – V',
    shortName: 'I-vi-IV-V',
    description: '50s doo-wop progression',
    steps: [
      { degree: 0, quality: 'major' },
      { degree: 5, quality: 'minor' },
      { degree: 3, quality: 'major' },
      { degree: 4, quality: 'major' },
    ],
  },
  {
    name: 'I – V – vi – IV',
    shortName: 'I-V-vi-IV',
    description: 'Pop four-chord progression',
    steps: [
      { degree: 0, quality: 'major' },
      { degree: 4, quality: 'major' },
      { degree: 5, quality: 'minor' },
      { degree: 3, quality: 'major' },
    ],
  },
  {
    name: 'iii – vi – ii – V – I',
    shortName: 'iii-vi-ii-V-I',
    description: 'Circle of fifths descent',
    steps: [
      { degree: 2, quality: 'minor' },
      { degree: 5, quality: 'minor' },
      { degree: 1, quality: 'minor' },
      { degree: 4, quality: 'major' },
      { degree: 0, quality: 'major' },
    ],
  },
  {
    name: 'ii – bII7 – I',
    shortName: 'ii-bII7-I',
    description: 'Tritone substitution cadence',
    steps: [
      { degree: 1, quality: 'min7' },
      // bII7 is a special case — handled in transposeTemplate
      { degree: -1, quality: 'dom7' }, // sentinel: -1 = flat-II
      { degree: 0, quality: 'maj7' },
    ],
  },
];

/**
 * Transpose a template to a concrete key.
 * Returns actual Chord objects rooted in the given key.
 */
export function transposeTemplate(template: ProgressionTemplate, keyRoot: number): Chord[] {
  return template.steps.map(step => {
    if (step.degree === -1) {
      // Special: bII (one semitone above root)
      return chord(keyRoot + 1, step.quality);
    }
    const root = (keyRoot + MAJOR_SCALE[step.degree]) % 12;
    return chord(root, step.quality);
  });
}

/**
 * Compute voice-leading smoothness for a sequence of voicings.
 * Returns total semitone movement and per-transition scores.
 */
export interface VoiceLeadingQuality {
  totalMovement: number;
  transitions: { from: number; to: number; movement: number }[];
  averageMovement: number;
}

export function analyzeVoiceLeading(voicings: number[][]): VoiceLeadingQuality {
  const transitions: VoiceLeadingQuality['transitions'] = [];
  let total = 0;

  for (let i = 0; i < voicings.length - 1; i++) {
    const curr = voicings[i];
    const next = voicings[i + 1];
    const minLen = Math.min(curr.length, next.length);
    let movement = 0;
    for (let v = 0; v < minLen; v++) {
      movement += Math.abs(next[v] - curr[v]);
    }
    transitions.push({ from: i, to: i + 1, movement });
    total += movement;
  }

  return {
    totalMovement: total,
    transitions,
    averageMovement: transitions.length > 0 ? total / transitions.length : 0,
  };
}

/**
 * Rate smoothness on a simple scale.
 * Lower average movement = smoother voice leading.
 */
export function smoothnessRating(avgMovement: number): 'smooth' | 'moderate' | 'angular' {
  if (avgMovement <= 4) return 'smooth';
  if (avgMovement <= 8) return 'moderate';
  return 'angular';
}
