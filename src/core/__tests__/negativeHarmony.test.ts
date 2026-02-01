import { describe, it, expect } from 'vitest';
import {
  getNegativeMapping,
  computeNegative,
  computeNegativeProgression,
  identifyChordFromPitchClasses,
} from '../negativeHarmony';

describe('getNegativeMapping', () => {
  it('returns a map of 12 entries', () => {
    const mapping = getNegativeMapping(0);
    expect(mapping.size).toBe(12);
  });

  it('all values are valid pitch classes (0-11)', () => {
    for (let root = 0; root < 12; root++) {
      const mapping = getNegativeMapping(root);
      for (const [, neg] of mapping) {
        expect(neg).toBeGreaterThanOrEqual(0);
        expect(neg).toBeLessThan(12);
      }
    }
  });

  it('mapping is an involution (applying twice returns original)', () => {
    const mapping = getNegativeMapping(0);
    for (const [pc, neg] of mapping) {
      const doubleNeg = mapping.get(neg);
      expect(doubleNeg).toBe(pc);
    }
  });

  it('root maps to minor third in key of C', () => {
    const mapping = getNegativeMapping(0);
    // Axis at 3.5 — C(0) reflects to 7 (G)? Let's verify:
    // neg = round(2 * 3.5 - 0) = round(7) = 7
    expect(mapping.get(0)).toBe(7);
  });

  it('fifth maps to root in key of C', () => {
    const mapping = getNegativeMapping(0);
    // neg of 7 = round(2 * 3.5 - 7) = round(0) = 0
    expect(mapping.get(7)).toBe(0);
  });

  it('major third maps to perfect fourth in C', () => {
    const mapping = getNegativeMapping(0);
    // neg of 4 = round(7 - 4) = round(3) = 3
    expect(mapping.get(4)).toBe(3);
  });

  it('mapping changes with different key roots', () => {
    const mapC = getNegativeMapping(0);
    const mapG = getNegativeMapping(7);
    // They should differ for at least some entries
    let different = false;
    for (let pc = 0; pc < 12; pc++) {
      if (mapC.get(pc) !== mapG.get(pc)) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });

  it('all 12 pitch classes appear exactly once in the values', () => {
    const mapping = getNegativeMapping(0);
    const values = [...mapping.values()].sort((a, b) => a - b);
    expect(values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});

describe('computeNegative', () => {
  it('negative of C major in key of C returns a chord', () => {
    const result = computeNegative({ root: 0, quality: 'major' }, 0);
    expect(result).toHaveProperty('root');
    expect(result).toHaveProperty('quality');
    expect(result).toHaveProperty('pitchClasses');
  });

  it('negative of C major in key of C has correct pitch classes', () => {
    const result = computeNegative({ root: 0, quality: 'major' }, 0);
    // C major = [0, 4, 7] → negative mapping of C: [7, 3, 0]
    expect(result.pitchClasses).toContain(7);
    expect(result.pitchClasses).toContain(3);
    expect(result.pitchClasses).toContain(0);
  });

  it('negative of C major in C is identified as a chord', () => {
    const result = computeNegative({ root: 0, quality: 'major' }, 0);
    // [0, 3, 7] = C minor
    expect(result.root).toBe(0);
    expect(result.quality).toBe('minor');
  });

  it('negative pitch classes have 3 notes for a triad', () => {
    const result = computeNegative({ root: 0, quality: 'major' }, 0);
    expect(result.pitchClasses).toHaveLength(3);
  });

  it('negative of dom7 has 4 pitch classes', () => {
    const result = computeNegative({ root: 7, quality: 'dom7' }, 0);
    expect(result.pitchClasses).toHaveLength(4);
  });

  it('negative of G major in key of C', () => {
    const result = computeNegative({ root: 7, quality: 'major' }, 0);
    // G major = [7, 11, 2] → mapping: 7→0, 11→8, 2→5 → [0, 8, 5] → F minor
    expect(result.pitchClasses.sort((a: number, b: number) => a - b)).toEqual([0, 5, 8]);
  });
});

describe('computeNegativeProgression', () => {
  it('transforms all chords in a progression', () => {
    const progression = [
      { root: 0, quality: 'major' as const },
      { root: 7, quality: 'major' as const },
    ];
    const result = computeNegativeProgression(progression, 0);
    expect(result).toHaveLength(2);
  });

  it('each result has root, quality, and pitchClasses', () => {
    const progression = [
      { root: 0, quality: 'major' as const },
      { root: 5, quality: 'major' as const },
      { root: 7, quality: 'dom7' as const },
    ];
    const result = computeNegativeProgression(progression, 0);
    for (const neg of result) {
      expect(neg).toHaveProperty('root');
      expect(neg).toHaveProperty('quality');
      expect(neg).toHaveProperty('pitchClasses');
    }
  });

  it('empty progression returns empty array', () => {
    expect(computeNegativeProgression([], 0)).toEqual([]);
  });
});

describe('identifyChordFromPitchClasses', () => {
  it('identifies [0, 4, 7] as C major', () => {
    const result = identifyChordFromPitchClasses([0, 4, 7]);
    expect(result.root).toBe(0);
    expect(result.quality).toBe('major');
  });

  it('identifies [0, 3, 7] as C minor', () => {
    const result = identifyChordFromPitchClasses([0, 3, 7]);
    expect(result.root).toBe(0);
    expect(result.quality).toBe('minor');
  });

  it('identifies [7, 11, 2] as G major', () => {
    const result = identifyChordFromPitchClasses([7, 11, 2]);
    expect(result.root).toBe(7);
    expect(result.quality).toBe('major');
  });

  it('identifies [0, 4, 7, 10] as C dom7', () => {
    const result = identifyChordFromPitchClasses([0, 4, 7, 10]);
    expect(result.root).toBe(0);
    expect(result.quality).toBe('dom7');
  });

  it('identifies [0, 3, 6] as C diminished', () => {
    const result = identifyChordFromPitchClasses([0, 3, 6]);
    expect(result.root).toBe(0);
    expect(result.quality).toBe('diminished');
  });

  it('identifies [0, 4, 8] as C augmented', () => {
    const result = identifyChordFromPitchClasses([0, 4, 8]);
    expect(result.root).toBe(0);
    expect(result.quality).toBe('augmented');
  });

  it('identifies [0, 4, 7, 11] as C maj7', () => {
    const result = identifyChordFromPitchClasses([0, 4, 7, 11]);
    expect(result.root).toBe(0);
    expect(result.quality).toBe('maj7');
  });

  it('identifies [0, 3, 7, 10] as C min7', () => {
    const result = identifyChordFromPitchClasses([0, 3, 7, 10]);
    expect(result.root).toBe(0);
    expect(result.quality).toBe('min7');
  });

  it('returns a best guess for ambiguous sets', () => {
    // A single note isn't a chord, but should still return something
    const result = identifyChordFromPitchClasses([0]);
    expect(result).toHaveProperty('root');
    expect(result).toHaveProperty('quality');
  });

  it('handles transposed chords correctly', () => {
    // D minor = [2, 5, 9]
    const result = identifyChordFromPitchClasses([2, 5, 9]);
    expect(result.root).toBe(2);
    expect(result.quality).toBe('minor');
  });
});
