import { describe, it, expect, beforeEach } from 'vitest';
import { getVoicing, voiceProgression, resetVoicing } from '../voicingEngine';
import type { Chord } from '../../core/chords';

describe('Voicing Engine', () => {
  beforeEach(() => {
    resetVoicing();
  });

  const cMajor: Chord = { root: 0, quality: 'major' };
  const fMajor: Chord = { root: 5, quality: 'major' };
  const gMajor: Chord = { root: 7, quality: 'major' };
  const cMinor: Chord = { root: 0, quality: 'minor' };

  describe('getVoicing', () => {
    it('returns an array of MIDI note numbers', () => {
      const voicing = getVoicing(cMajor);
      expect(Array.isArray(voicing)).toBe(true);
      expect(voicing.length).toBeGreaterThanOrEqual(3);
      voicing.forEach(note => {
        expect(typeof note).toBe('number');
        expect(note).toBeGreaterThanOrEqual(36); // Below C2 is too low
        expect(note).toBeLessThanOrEqual(84); // Above C6 is too high
      });
    });

    it('produces correct pitch classes for C major', () => {
      const voicing = getVoicing(cMajor);
      const pitchClasses = voicing.map(n => n % 12).sort((a, b) => a - b);
      expect(pitchClasses).toEqual([0, 4, 7]); // C, E, G
    });

    it('produces correct pitch classes for C minor', () => {
      resetVoicing();
      const voicing = getVoicing(cMinor);
      const pitchClasses = voicing.map(n => n % 12).sort((a, b) => a - b);
      expect(pitchClasses).toEqual([0, 3, 7]); // C, Eb, G
    });

    it('smooth voice leading minimizes movement', () => {
      const v1 = getVoicing(cMajor);
      const v2 = getVoicing(cMinor); // Only E->Eb should change

      // Total movement should be small (just moving 3rd)
      const totalMovement = v1.reduce((sum, note, i) => sum + Math.abs(note - v2[i]), 0);
      expect(totalMovement).toBeLessThanOrEqual(3); // 1 semitone for the 3rd
    });
  });

  describe('voiceProgression', () => {
    it('returns array of voiced chords', () => {
      const voiced = voiceProgression([cMajor, fMajor, gMajor, cMajor]);
      expect(voiced).toHaveLength(4);
      voiced.forEach(v => {
        expect(Array.isArray(v)).toBe(true);
        expect(v.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('first chord is in reasonable range', () => {
      const voiced = voiceProgression([cMajor]);
      voiced[0].forEach(note => {
        expect(note).toBeGreaterThanOrEqual(48); // C3
        expect(note).toBeLessThanOrEqual(72); // C5
      });
    });

    it('subsequent chords have smooth voice leading', () => {
      const voiced = voiceProgression([cMajor, fMajor, gMajor, cMajor]);

      for (let i = 1; i < voiced.length; i++) {
        const prev = voiced[i - 1];
        const curr = voiced[i];
        const totalMovement = prev.reduce((sum, note, j) => {
          if (j < curr.length) {
            return sum + Math.abs(note - curr[j]);
          }
          return sum;
        }, 0);
        // Voice leading should keep movement reasonable
        expect(totalMovement).toBeLessThanOrEqual(20);
      }
    });

    it('handles empty progression', () => {
      const voiced = voiceProgression([]);
      expect(voiced).toEqual([]);
    });

    it('handles single chord', () => {
      const voiced = voiceProgression([cMajor]);
      expect(voiced).toHaveLength(1);
    });
  });

  describe('resetVoicing', () => {
    it('causes next getVoicing to use initial voicing', () => {
      getVoicing(cMajor);
      getVoicing(fMajor);
      getVoicing(gMajor);

      resetVoicing();
      const fresh = getVoicing(cMajor);

      // After reset, should produce a fresh initial voicing
      // which may differ from the voice-led version
      const pitchClasses = fresh.map(n => n % 12).sort((a, b) => a - b);
      expect(pitchClasses).toEqual([0, 4, 7]);
    });
  });
});
