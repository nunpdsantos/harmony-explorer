import { describe, it, expect } from 'vitest';
import {
  INTERVAL_NAMES,
  INTERVAL_SHORT,
  INTERVAL_TIERS,
  generateIntervalQuestion,
  generateChordQualityQuestion,
  generateDictationQuestion,
  updateScore,
  initialScore,
  QUALITY_TIERS,
  DICTATION_TIERS,
} from '../earTraining';

describe('earTraining', () => {
  describe('INTERVAL_NAMES', () => {
    it('has entries for 0-12', () => {
      for (let i = 0; i <= 12; i++) {
        expect(INTERVAL_NAMES[i]).toBeTruthy();
      }
    });
  });

  describe('INTERVAL_SHORT', () => {
    it('has short names for all intervals', () => {
      for (let i = 0; i <= 12; i++) {
        expect(INTERVAL_SHORT[i]).toBeTruthy();
      }
    });

    it('includes standard abbreviations', () => {
      expect(INTERVAL_SHORT[7]).toBe('P5');
      expect(INTERVAL_SHORT[5]).toBe('P4');
      expect(INTERVAL_SHORT[12]).toBe('P8');
      expect(INTERVAL_SHORT[4]).toBe('M3');
      expect(INTERVAL_SHORT[3]).toBe('m3');
    });
  });

  describe('INTERVAL_TIERS', () => {
    it('easy has only P4, P5, P8', () => {
      expect(INTERVAL_TIERS.easy).toEqual([5, 7, 12]);
    });

    it('medium has more intervals', () => {
      expect(INTERVAL_TIERS.medium.length).toBeGreaterThan(INTERVAL_TIERS.easy.length);
    });

    it('hard includes all 12 intervals', () => {
      expect(INTERVAL_TIERS.hard.length).toBe(12);
    });
  });

  describe('generateIntervalQuestion', () => {
    it('returns a question with type "interval"', () => {
      const q = generateIntervalQuestion();
      expect(q.type).toBe('interval');
    });

    it('has valid MIDI notes in play range', () => {
      for (let i = 0; i < 50; i++) {
        const q = generateIntervalQuestion('hard', 'ascending');
        for (const note of q.playNotes) {
          expect(note).toBeGreaterThanOrEqual(36);
          expect(note).toBeLessThanOrEqual(84);
        }
      }
    });

    it('ascending: second note is higher', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateIntervalQuestion('medium', 'ascending');
        expect(q.playNotes[1]).toBeGreaterThanOrEqual(q.playNotes[0]);
      }
    });

    it('descending: second note is lower', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateIntervalQuestion('medium', 'descending');
        expect(q.playNotes[1]).toBeLessThanOrEqual(q.playNotes[0]);
      }
    });

    it('interval matches the difference between notes', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateIntervalQuestion('hard', 'ascending');
        expect(q.playNotes[1] - q.playNotes[0]).toBe(q.interval);
      }
    });

    it('correctAnswer is a valid interval short name', () => {
      const q = generateIntervalQuestion();
      expect(Object.values(INTERVAL_SHORT)).toContain(q.correctAnswer);
    });

    it('options contain the correct answer', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateIntervalQuestion('hard');
        expect(q.options).toContain(q.correctAnswer);
      }
    });

    it('easy questions only use easy intervals', () => {
      const easyShorts = INTERVAL_TIERS.easy.map(i => INTERVAL_SHORT[i]);
      for (let i = 0; i < 20; i++) {
        const q = generateIntervalQuestion('easy');
        expect(easyShorts).toContain(q.correctAnswer);
      }
    });
  });

  describe('generateChordQualityQuestion', () => {
    it('returns a question with type "chord-quality"', () => {
      const q = generateChordQualityQuestion();
      expect(q.type).toBe('chord-quality');
    });

    it('root is a valid pitch class (0-11)', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateChordQualityQuestion('hard');
        expect(q.root).toBeGreaterThanOrEqual(0);
        expect(q.root).toBeLessThan(12);
      }
    });

    it('playNotes has correct number of notes for quality', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateChordQualityQuestion('hard');
        // Triads have 3 notes, 7ths have 4
        expect(q.playNotes.length).toBeGreaterThanOrEqual(3);
        expect(q.playNotes.length).toBeLessThanOrEqual(4);
      }
    });

    it('options contain correct answer', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateChordQualityQuestion('medium');
        expect(q.options).toContain(q.correctAnswer);
      }
    });

    it('easy only has major and minor', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateChordQualityQuestion('easy');
        expect(['Major', 'Minor']).toContain(q.correctAnswer);
      }
    });

    it('quality is from the correct tier', () => {
      for (let i = 0; i < 20; i++) {
        const q = generateChordQualityQuestion('medium');
        expect(QUALITY_TIERS.medium).toContain(q.quality);
      }
    });
  });

  describe('generateDictationQuestion', () => {
    it('returns correct type', () => {
      const q = generateDictationQuestion();
      expect(q.type).toBe('progression-dictation');
    });

    it('easy generates 3 chords', () => {
      const q = generateDictationQuestion('easy');
      expect(q.chords).toHaveLength(3);
      expect(q.playChords).toHaveLength(3);
      expect(q.length).toBe(3);
    });

    it('medium generates 4 chords', () => {
      const q = generateDictationQuestion('medium');
      expect(q.chords).toHaveLength(4);
      expect(q.length).toBe(4);
    });

    it('hard generates 4 chords', () => {
      const q = generateDictationQuestion('hard');
      expect(q.chords).toHaveLength(4);
    });

    it('each chord has valid root and quality', () => {
      for (let i = 0; i < 10; i++) {
        const q = generateDictationQuestion('hard');
        for (const chord of q.chords) {
          expect(chord.root).toBeGreaterThanOrEqual(0);
          expect(chord.root).toBeLessThan(12);
          expect(typeof chord.quality).toBe('string');
        }
      }
    });

    it('easy chords are diatonic to key', () => {
      const key = 0; // C major: C, D, E, F, G, A, B = [0, 2, 4, 5, 7, 9, 11]
      const scalePcs = [0, 2, 4, 5, 7, 9, 11];
      for (let i = 0; i < 20; i++) {
        const q = generateDictationQuestion('easy', key);
        for (const chord of q.chords) {
          expect(scalePcs).toContain(chord.root);
        }
      }
    });

    it('playChords has MIDI notes for each chord', () => {
      const q = generateDictationQuestion('medium');
      for (const notes of q.playChords) {
        expect(notes.length).toBeGreaterThanOrEqual(3);
        for (const n of notes) {
          expect(n).toBeGreaterThanOrEqual(36);
          expect(n).toBeLessThanOrEqual(84);
        }
      }
    });

    it('respects custom key root', () => {
      // Key of G (root=7): G major scale pcs = [7, 9, 11, 0, 2, 4, 6]
      const scalePcs = [7, 9, 11, 0, 2, 4, 6];
      for (let i = 0; i < 20; i++) {
        const q = generateDictationQuestion('easy', 7);
        for (const chord of q.chords) {
          expect(scalePcs).toContain(chord.root);
        }
      }
    });
  });

  describe('scoring', () => {
    it('initialScore starts at zero', () => {
      const s = initialScore();
      expect(s.correct).toBe(0);
      expect(s.total).toBe(0);
      expect(s.streak).toBe(0);
    });

    it('updateScore increments correct and total on correct answer', () => {
      const s = updateScore(initialScore(), true);
      expect(s.correct).toBe(1);
      expect(s.total).toBe(1);
      expect(s.streak).toBe(1);
    });

    it('updateScore increments only total on wrong answer', () => {
      const s = updateScore(initialScore(), false);
      expect(s.correct).toBe(0);
      expect(s.total).toBe(1);
      expect(s.streak).toBe(0);
    });

    it('streak resets on wrong answer', () => {
      let s = initialScore();
      s = updateScore(s, true);
      s = updateScore(s, true);
      s = updateScore(s, true);
      expect(s.streak).toBe(3);
      s = updateScore(s, false);
      expect(s.streak).toBe(0);
      expect(s.correct).toBe(3);
      expect(s.total).toBe(4);
    });

    it('streak continues on consecutive correct', () => {
      let s = initialScore();
      for (let i = 0; i < 10; i++) {
        s = updateScore(s, true);
      }
      expect(s.streak).toBe(10);
      expect(s.correct).toBe(10);
    });
  });

  describe('DICTATION_TIERS', () => {
    it('has three difficulty levels', () => {
      expect(Object.keys(DICTATION_TIERS)).toHaveLength(3);
    });

    it('easy is diatonic', () => {
      expect(DICTATION_TIERS.easy.diatonic).toBe(true);
    });

    it('hard allows chromatic', () => {
      expect(DICTATION_TIERS.hard.diatonic).toBe(false);
    });
  });
});
