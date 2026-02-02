import { describe, it, expect } from 'vitest';
import { RHYTHM_PATTERNS, RHYTHM_PATTERN_NAMES } from '../rhythmPatterns';

describe('Rhythm patterns', () => {
  it('exports all pattern names', () => {
    expect(RHYTHM_PATTERN_NAMES).toHaveLength(6);
    expect(RHYTHM_PATTERN_NAMES).toContain('whole');
    expect(RHYTHM_PATTERN_NAMES).toContain('half');
    expect(RHYTHM_PATTERN_NAMES).toContain('quarter');
    expect(RHYTHM_PATTERN_NAMES).toContain('swing');
    expect(RHYTHM_PATTERN_NAMES).toContain('bossaNova');
    expect(RHYTHM_PATTERN_NAMES).toContain('waltz');
  });

  it('all patterns have names', () => {
    for (const name of RHYTHM_PATTERN_NAMES) {
      expect(RHYTHM_PATTERNS[name].name).toBeTruthy();
    }
  });

  it('all patterns have at least one hit', () => {
    for (const name of RHYTHM_PATTERN_NAMES) {
      expect(RHYTHM_PATTERNS[name].hits.length).toBeGreaterThan(0);
    }
  });

  it('all hits have offset in [0, 1)', () => {
    for (const name of RHYTHM_PATTERN_NAMES) {
      for (const hit of RHYTHM_PATTERNS[name].hits) {
        expect(hit.offset).toBeGreaterThanOrEqual(0);
        expect(hit.offset).toBeLessThan(1);
      }
    }
  });

  it('all hits have positive duration', () => {
    for (const name of RHYTHM_PATTERN_NAMES) {
      for (const hit of RHYTHM_PATTERNS[name].hits) {
        expect(hit.duration).toBeGreaterThan(0);
      }
    }
  });

  it('all hits have accent in (0, 1]', () => {
    for (const name of RHYTHM_PATTERN_NAMES) {
      for (const hit of RHYTHM_PATTERNS[name].hits) {
        expect(hit.accent).toBeGreaterThan(0);
        expect(hit.accent).toBeLessThanOrEqual(1);
      }
    }
  });

  it('first hit always starts at offset 0', () => {
    for (const name of RHYTHM_PATTERN_NAMES) {
      expect(RHYTHM_PATTERNS[name].hits[0].offset).toBe(0);
    }
  });

  describe('whole', () => {
    it('has single hit', () => {
      expect(RHYTHM_PATTERNS.whole.hits).toHaveLength(1);
    });
  });

  describe('half', () => {
    it('has two hits', () => {
      expect(RHYTHM_PATTERNS.half.hits).toHaveLength(2);
    });

    it('second hit at 0.5', () => {
      expect(RHYTHM_PATTERNS.half.hits[1].offset).toBe(0.5);
    });
  });

  describe('quarter', () => {
    it('has four hits', () => {
      expect(RHYTHM_PATTERNS.quarter.hits).toHaveLength(4);
    });

    it('hits are evenly spaced', () => {
      const offsets = RHYTHM_PATTERNS.quarter.hits.map(h => h.offset);
      expect(offsets).toEqual([0, 0.25, 0.5, 0.75]);
    });
  });

  describe('swing', () => {
    it('has four hits with triplet feel', () => {
      expect(RHYTHM_PATTERNS.swing.hits).toHaveLength(4);
      expect(RHYTHM_PATTERNS.swing.hits[1].offset).toBe(0.33);
    });
  });

  describe('bossaNova', () => {
    it('has four hits', () => {
      expect(RHYTHM_PATTERNS.bossaNova.hits).toHaveLength(4);
    });
  });

  describe('waltz', () => {
    it('has three hits', () => {
      expect(RHYTHM_PATTERNS.waltz.hits).toHaveLength(3);
    });

    it('hits are roughly in 3/4 time', () => {
      const offsets = RHYTHM_PATTERNS.waltz.hits.map(h => h.offset);
      expect(offsets[0]).toBe(0);
      expect(offsets[1]).toBeCloseTo(0.333, 2);
      expect(offsets[2]).toBeCloseTo(0.667, 2);
    });
  });
});
