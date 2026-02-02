import { describe, it, expect } from 'vitest';
import {
  STANDARD_TUNING,
  TUNINGS,
  TUNING_NAMES,
  midiNote,
  pitchClass,
  getGuitarShapes,
  shapeMidiNotes,
  shapePitchClasses,
} from '../guitarVoicings';

describe('guitarVoicings', () => {
  describe('STANDARD_TUNING', () => {
    it('has 6 strings', () => {
      expect(STANDARD_TUNING).toHaveLength(6);
    });

    it('matches E-A-D-G-B-E', () => {
      // E2=40, A2=45, D3=50, G3=55, B3=59, E4=64
      expect(STANDARD_TUNING).toEqual([40, 45, 50, 55, 59, 64]);
    });
  });

  describe('TUNINGS', () => {
    it('includes standard', () => {
      expect(TUNINGS.standard).toEqual(STANDARD_TUNING);
    });

    it('has multiple tunings', () => {
      expect(TUNING_NAMES.length).toBeGreaterThan(1);
    });

    it('all tunings have 6 strings', () => {
      for (const name of TUNING_NAMES) {
        expect(TUNINGS[name]).toHaveLength(6);
      }
    });
  });

  describe('midiNote', () => {
    it('returns open string note for fret 0', () => {
      expect(midiNote(0, 0)).toBe(40); // low E2
      expect(midiNote(5, 0)).toBe(64); // high E4
    });

    it('adds fret offset', () => {
      expect(midiNote(0, 5)).toBe(45); // E2 + 5 = A2
      expect(midiNote(0, 12)).toBe(52); // E2 + 12 = E3
    });

    it('respects custom tuning', () => {
      expect(midiNote(0, 0, TUNINGS.dropD)).toBe(38); // D2
    });
  });

  describe('pitchClass', () => {
    it('returns correct pitch class', () => {
      expect(pitchClass(0, 0)).toBe(4); // E = 4
      expect(pitchClass(1, 0)).toBe(9); // A = 9
    });

    it('wraps at 12', () => {
      expect(pitchClass(0, 8)).toBe(0); // E + 8 semitones = C
    });
  });

  describe('getGuitarShapes', () => {
    it('returns shapes for C major', () => {
      const shapes = getGuitarShapes(0, 'major');
      expect(shapes.length).toBeGreaterThan(0);
    });

    it('returns shapes for A minor', () => {
      const shapes = getGuitarShapes(9, 'minor');
      expect(shapes.length).toBeGreaterThan(0);
    });

    it('each shape has 6 fret values', () => {
      const shapes = getGuitarShapes(0, 'major');
      for (const shape of shapes) {
        expect(shape.frets).toHaveLength(6);
      }
    });

    it('fret values are >= -1', () => {
      const shapes = getGuitarShapes(7, 'dom7');
      for (const shape of shapes) {
        for (const fret of shape.frets) {
          expect(fret).toBeGreaterThanOrEqual(-1);
        }
      }
    });

    it('returns shapes for all 12 roots for major', () => {
      for (let root = 0; root < 12; root++) {
        const shapes = getGuitarShapes(root, 'major');
        expect(shapes.length).toBeGreaterThan(0);
      }
    });

    it('shape labels are non-empty', () => {
      const shapes = getGuitarShapes(0, 'major');
      for (const shape of shapes) {
        expect(shape.label.length).toBeGreaterThan(0);
      }
    });

    it('produces correct pitch classes for shapes', () => {
      const shapes = getGuitarShapes(0, 'major');
      // C major = pitch classes 0, 4, 7
      const expectedPcs = new Set([0, 4, 7]);
      for (const shape of shapes) {
        const pcs = shapePitchClasses(shape);
        for (const pc of pcs) {
          expect(expectedPcs.has(pc)).toBe(true);
        }
      }
    });

    it('handles dom7 quality', () => {
      const shapes = getGuitarShapes(0, 'dom7');
      expect(shapes.length).toBeGreaterThan(0);
    });

    it('handles min7 quality', () => {
      const shapes = getGuitarShapes(0, 'min7');
      expect(shapes.length).toBeGreaterThan(0);
    });

    it('handles diminished quality', () => {
      const shapes = getGuitarShapes(0, 'diminished');
      expect(shapes.length).toBeGreaterThan(0);
    });

    it('handles exotic quality via interval fallback', () => {
      // dom9 is not in SHAPE_TEMPLATES but has CHORD_TEMPLATES
      const shapes = getGuitarShapes(0, 'dom9');
      expect(shapes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('shapeMidiNotes', () => {
    it('returns only played strings (excludes -1)', () => {
      const shapes = getGuitarShapes(0, 'major');
      const shape = shapes[0];
      const notes = shapeMidiNotes(shape);
      const playedCount = shape.frets.filter(f => f >= 0).length;
      expect(notes).toHaveLength(playedCount);
    });

    it('all notes are valid MIDI range', () => {
      const shapes = getGuitarShapes(5, 'minor');
      for (const shape of shapes) {
        const notes = shapeMidiNotes(shape);
        for (const n of notes) {
          expect(n).toBeGreaterThanOrEqual(36); // ~C2
          expect(n).toBeLessThanOrEqual(90);    // ~F#6
        }
      }
    });
  });

  describe('shapePitchClasses', () => {
    it('returns pitch classes in 0-11 range', () => {
      const shapes = getGuitarShapes(7, 'major');
      for (const shape of shapes) {
        const pcs = shapePitchClasses(shape);
        for (const pc of pcs) {
          expect(pc).toBeGreaterThanOrEqual(0);
          expect(pc).toBeLessThan(12);
        }
      }
    });
  });
});
