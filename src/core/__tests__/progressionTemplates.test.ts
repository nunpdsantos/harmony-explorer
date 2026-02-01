import { describe, it, expect } from 'vitest';
import {
  TEMPLATES,
  transposeTemplate,
  analyzeVoiceLeading,
  smoothnessRating,
} from '../progressionTemplates';
import { chordKey } from '../chords';

describe('ProgressionTemplates', () => {
  describe('TEMPLATES', () => {
    it('has 6 templates', () => {
      expect(TEMPLATES).toHaveLength(6);
    });

    it('each template has required fields', () => {
      for (const t of TEMPLATES) {
        expect(t.name).toBeTruthy();
        expect(t.shortName).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.steps.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe('transposeTemplate', () => {
    it('transposes I-IV-V-I to C major', () => {
      const chords = transposeTemplate(TEMPLATES[0], 0); // C major
      expect(chords).toHaveLength(4);
      expect(chordKey(chords[0])).toBe('0-major');  // C
      expect(chordKey(chords[1])).toBe('5-major');  // F
      expect(chordKey(chords[2])).toBe('7-major');  // G
      expect(chordKey(chords[3])).toBe('0-major');  // C
    });

    it('transposes I-IV-V-I to G major', () => {
      const chords = transposeTemplate(TEMPLATES[0], 7); // G major
      expect(chordKey(chords[0])).toBe('7-major');  // G
      expect(chordKey(chords[1])).toBe('0-major');  // C
      expect(chordKey(chords[2])).toBe('2-major');  // D
      expect(chordKey(chords[3])).toBe('7-major');  // G
    });

    it('transposes ii-V-I to C (Dm7-G7-Cmaj7)', () => {
      const chords = transposeTemplate(TEMPLATES[1], 0);
      expect(chords).toHaveLength(3);
      expect(chordKey(chords[0])).toBe('2-min7');   // Dm7
      expect(chordKey(chords[1])).toBe('7-dom7');   // G7
      expect(chordKey(chords[2])).toBe('0-maj7');   // Cmaj7
    });

    it('transposes ii-V-I to Eb', () => {
      const chords = transposeTemplate(TEMPLATES[1], 3); // Eb major
      expect(chordKey(chords[0])).toBe('5-min7');   // Fm7
      expect(chordKey(chords[1])).toBe('10-dom7');  // Bb7
      expect(chordKey(chords[2])).toBe('3-maj7');   // Ebmaj7
    });

    it('transposes I-vi-IV-V (50s) to C', () => {
      const chords = transposeTemplate(TEMPLATES[2], 0);
      expect(chords).toHaveLength(4);
      expect(chordKey(chords[0])).toBe('0-major');  // C
      expect(chordKey(chords[1])).toBe('9-minor');  // Am
      expect(chordKey(chords[2])).toBe('5-major');  // F
      expect(chordKey(chords[3])).toBe('7-major');  // G
    });

    it('transposes I-V-vi-IV (pop) to C', () => {
      const chords = transposeTemplate(TEMPLATES[3], 0);
      expect(chordKey(chords[0])).toBe('0-major');  // C
      expect(chordKey(chords[1])).toBe('7-major');  // G
      expect(chordKey(chords[2])).toBe('9-minor');  // Am
      expect(chordKey(chords[3])).toBe('5-major');  // F
    });

    it('transposes iii-vi-ii-V-I (circle descent) to C', () => {
      const chords = transposeTemplate(TEMPLATES[4], 0);
      expect(chords).toHaveLength(5);
      expect(chordKey(chords[0])).toBe('4-minor');  // Em
      expect(chordKey(chords[1])).toBe('9-minor');  // Am
      expect(chordKey(chords[2])).toBe('2-minor');  // Dm
      expect(chordKey(chords[3])).toBe('7-major');  // G
      expect(chordKey(chords[4])).toBe('0-major');  // C
    });

    it('transposes tritone sub (ii-bII7-I) to C', () => {
      const chords = transposeTemplate(TEMPLATES[5], 0);
      expect(chords).toHaveLength(3);
      expect(chordKey(chords[0])).toBe('2-min7');   // Dm7
      expect(chordKey(chords[1])).toBe('1-dom7');   // Db7 (bII7)
      expect(chordKey(chords[2])).toBe('0-maj7');   // Cmaj7
    });

    it('transposes tritone sub to F (gm7-Gb7-Fmaj7)', () => {
      const chords = transposeTemplate(TEMPLATES[5], 5); // F major
      expect(chordKey(chords[0])).toBe('7-min7');   // Gm7
      expect(chordKey(chords[1])).toBe('6-dom7');   // Gb7
      expect(chordKey(chords[2])).toBe('5-maj7');   // Fmaj7
    });
  });

  describe('analyzeVoiceLeading', () => {
    it('returns empty for single chord', () => {
      const result = analyzeVoiceLeading([[60, 64, 67]]);
      expect(result.totalMovement).toBe(0);
      expect(result.transitions).toHaveLength(0);
      expect(result.averageMovement).toBe(0);
    });

    it('computes movement for two chords', () => {
      const result = analyzeVoiceLeading([
        [60, 64, 67], // C E G
        [60, 65, 69], // C F A
      ]);
      // Voice 0: |60-60| = 0
      // Voice 1: |65-64| = 1
      // Voice 2: |69-67| = 2
      expect(result.totalMovement).toBe(3);
      expect(result.transitions).toHaveLength(1);
      expect(result.transitions[0].movement).toBe(3);
      expect(result.averageMovement).toBe(3);
    });

    it('handles three chords', () => {
      const result = analyzeVoiceLeading([
        [60, 64, 67],
        [60, 65, 69],
        [59, 62, 67],
      ]);
      // Transition 0→1: 0+1+2 = 3
      // Transition 1→2: 1+3+2 = 6
      expect(result.totalMovement).toBe(9);
      expect(result.transitions).toHaveLength(2);
      expect(result.averageMovement).toBe(4.5);
    });

    it('handles different chord sizes', () => {
      const result = analyzeVoiceLeading([
        [60, 64, 67],       // 3 notes
        [60, 64, 67, 70],   // 4 notes — only first 3 compared
      ]);
      // min(3,4) = 3 voices compared, all same → 0
      expect(result.totalMovement).toBe(0);
    });
  });

  describe('smoothnessRating', () => {
    it('rates low movement as smooth', () => {
      expect(smoothnessRating(2)).toBe('smooth');
      expect(smoothnessRating(4)).toBe('smooth');
    });

    it('rates medium movement as moderate', () => {
      expect(smoothnessRating(5)).toBe('moderate');
      expect(smoothnessRating(8)).toBe('moderate');
    });

    it('rates high movement as angular', () => {
      expect(smoothnessRating(9)).toBe('angular');
      expect(smoothnessRating(15)).toBe('angular');
    });
  });
});
