import { describe, it, expect } from 'vitest';
import {
  NOTE_NAMES_SHARP,
  NOTE_NAMES_FLAT,
  noteName,
  CHORD_TEMPLATES,
  CIRCLE_OF_FIFTHS_ORDER,
  SCALE_TEMPLATES,
  MIDDLE_C,
} from '../constants';

describe('NOTE_NAMES', () => {
  it('has 12 sharp names', () => {
    expect(NOTE_NAMES_SHARP).toHaveLength(12);
  });

  it('has 12 flat names', () => {
    expect(NOTE_NAMES_FLAT).toHaveLength(12);
  });

  it('starts with C and ends with B', () => {
    expect(NOTE_NAMES_SHARP[0]).toBe('C');
    expect(NOTE_NAMES_SHARP[11]).toBe('B');
    expect(NOTE_NAMES_FLAT[0]).toBe('C');
    expect(NOTE_NAMES_FLAT[11]).toBe('B');
  });
});

describe('noteName', () => {
  it('returns C for pitch class 0', () => {
    expect(noteName(0)).toBe('C');
  });

  it('returns sharp names for natural sharp keys', () => {
    expect(noteName(2)).toBe('D');
    expect(noteName(4)).toBe('E');
  });

  it('returns flat names for flat keys', () => {
    expect(noteName(1)).toBe('Db');
    expect(noteName(3)).toBe('Eb');
    expect(noteName(10)).toBe('Bb');
  });

  it('respects preferFlat override', () => {
    expect(noteName(1, true)).toBe('Db');
    expect(noteName(1, false)).toBe('C#');
  });

  it('wraps around correctly', () => {
    expect(noteName(12)).toBe('C');
    expect(noteName(-1)).toBe('B');
  });
});

describe('CHORD_TEMPLATES', () => {
  it('has at least 30 chord qualities', () => {
    expect(Object.keys(CHORD_TEMPLATES).length).toBeGreaterThanOrEqual(30);
  });

  it('major triad has intervals [0, 4, 7]', () => {
    expect(CHORD_TEMPLATES.major.intervals).toEqual([0, 4, 7]);
  });

  it('minor triad has intervals [0, 3, 7]', () => {
    expect(CHORD_TEMPLATES.minor.intervals).toEqual([0, 3, 7]);
  });

  it('dom7 has intervals [0, 4, 7, 10]', () => {
    expect(CHORD_TEMPLATES.dom7.intervals).toEqual([0, 4, 7, 10]);
  });

  it('dim7 has intervals [0, 3, 6, 9]', () => {
    expect(CHORD_TEMPLATES.dim7.intervals).toEqual([0, 3, 6, 9]);
  });

  it('all templates have non-empty intervals starting with 0', () => {
    for (const [, tmpl] of Object.entries(CHORD_TEMPLATES)) {
      expect(tmpl.intervals.length).toBeGreaterThanOrEqual(3);
      expect(tmpl.intervals[0]).toBe(0);
    }
  });

  it('all intervals are in range 0-21 (extensions up to 13th)', () => {
    for (const [, tmpl] of Object.entries(CHORD_TEMPLATES)) {
      for (const interval of tmpl.intervals) {
        expect(interval).toBeGreaterThanOrEqual(0);
        expect(interval).toBeLessThanOrEqual(21);
      }
    }
  });
});

describe('CIRCLE_OF_FIFTHS_ORDER', () => {
  it('has 12 entries', () => {
    expect(CIRCLE_OF_FIFTHS_ORDER).toHaveLength(12);
  });

  it('starts with C (0)', () => {
    expect(CIRCLE_OF_FIFTHS_ORDER[0]).toBe(0);
  });

  it('second entry is G (7)', () => {
    expect(CIRCLE_OF_FIFTHS_ORDER[1]).toBe(7);
  });

  it('contains all 12 pitch classes', () => {
    const sorted = [...CIRCLE_OF_FIFTHS_ORDER].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('each step is a fifth (7 semitones) apart', () => {
    for (let i = 0; i < 11; i++) {
      const diff = ((CIRCLE_OF_FIFTHS_ORDER[i + 1] - CIRCLE_OF_FIFTHS_ORDER[i]) % 12 + 12) % 12;
      expect(diff).toBe(7);
    }
  });
});

describe('SCALE_TEMPLATES', () => {
  it('has 4 scale types', () => {
    expect(Object.keys(SCALE_TEMPLATES)).toHaveLength(4);
  });

  it('major scale has 7 notes', () => {
    expect(SCALE_TEMPLATES.major).toHaveLength(7);
  });

  it('major scale starts with 0', () => {
    expect(SCALE_TEMPLATES.major[0]).toBe(0);
  });

  it('all scales have 7 degrees', () => {
    for (const scale of Object.values(SCALE_TEMPLATES)) {
      expect(scale).toHaveLength(7);
    }
  });
});

describe('MIDDLE_C', () => {
  it('is MIDI note 60', () => {
    expect(MIDDLE_C).toBe(60);
  });
});
