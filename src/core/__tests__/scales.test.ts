import { describe, it, expect } from 'vitest';
import {
  scalePitchClasses,
  diatonicTriads,
  diatonic7ths,
  tonalFunction,
  findScaleDegree,
} from '../scales';
import type { ScaleType } from '../constants';

describe('scalePitchClasses', () => {
  it('returns C major scale correctly', () => {
    expect(scalePitchClasses(0, 'major')).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('returns G major scale correctly', () => {
    expect(scalePitchClasses(7, 'major')).toEqual([7, 9, 11, 0, 2, 4, 6]);
  });

  it('returns C natural minor correctly', () => {
    expect(scalePitchClasses(0, 'naturalMinor')).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });

  it('returns C harmonic minor correctly', () => {
    expect(scalePitchClasses(0, 'harmonicMinor')).toEqual([0, 2, 3, 5, 7, 8, 11]);
  });

  it('returns C melodic minor correctly', () => {
    expect(scalePitchClasses(0, 'melodicMinor')).toEqual([0, 2, 3, 5, 7, 9, 11]);
  });

  it('all scales have 7 pitch classes', () => {
    const scaleTypes: ScaleType[] = ['major', 'naturalMinor', 'harmonicMinor', 'melodicMinor'];
    for (const type of scaleTypes) {
      for (let root = 0; root < 12; root++) {
        expect(scalePitchClasses(root, type)).toHaveLength(7);
      }
    }
  });

  it('all pitch classes are in range 0-11', () => {
    const scaleTypes: ScaleType[] = ['major', 'naturalMinor', 'harmonicMinor', 'melodicMinor'];
    for (const type of scaleTypes) {
      for (let root = 0; root < 12; root++) {
        for (const pc of scalePitchClasses(root, type)) {
          expect(pc).toBeGreaterThanOrEqual(0);
          expect(pc).toBeLessThanOrEqual(11);
        }
      }
    }
  });
});

describe('diatonicTriads', () => {
  it('returns 7 chords', () => {
    expect(diatonicTriads(0, 'major')).toHaveLength(7);
  });

  it('returns correct quality pattern for major scale', () => {
    const triads = diatonicTriads(0, 'major');
    const qualities = triads.map(c => c.quality);
    expect(qualities).toEqual([
      'major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished',
    ]);
  });

  it('returns correct roots for C major', () => {
    const triads = diatonicTriads(0, 'major');
    const roots = triads.map(c => c.root);
    expect(roots).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('returns correct quality pattern for natural minor', () => {
    const triads = diatonicTriads(0, 'naturalMinor');
    const qualities = triads.map(c => c.quality);
    expect(qualities).toEqual([
      'minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major',
    ]);
  });

  it('returns correct quality pattern for harmonic minor', () => {
    const triads = diatonicTriads(0, 'harmonicMinor');
    const qualities = triads.map(c => c.quality);
    expect(qualities).toEqual([
      'minor', 'diminished', 'augmented', 'minor', 'major', 'major', 'diminished',
    ]);
  });
});

describe('diatonic7ths', () => {
  it('returns 7 chords', () => {
    expect(diatonic7ths(0, 'major')).toHaveLength(7);
  });

  it('returns correct quality pattern for major scale 7ths', () => {
    const sevenths = diatonic7ths(0, 'major');
    const qualities = sevenths.map(c => c.quality);
    expect(qualities).toEqual([
      'maj7', 'min7', 'min7', 'maj7', 'dom7', 'min7', 'halfDim7',
    ]);
  });
});

describe('tonalFunction', () => {
  it('I (degree 0) is tonic', () => {
    expect(tonalFunction(0)).toBe('tonic');
  });

  it('ii (degree 1) is subdominant', () => {
    expect(tonalFunction(1)).toBe('subdominant');
  });

  it('iii (degree 2) is tonic', () => {
    expect(tonalFunction(2)).toBe('tonic');
  });

  it('IV (degree 3) is subdominant', () => {
    expect(tonalFunction(3)).toBe('subdominant');
  });

  it('V (degree 4) is dominant', () => {
    expect(tonalFunction(4)).toBe('dominant');
  });

  it('vi (degree 5) is tonic', () => {
    expect(tonalFunction(5)).toBe('tonic');
  });

  it('vii° (degree 6) is dominant', () => {
    expect(tonalFunction(6)).toBe('dominant');
  });
});

describe('findScaleDegree', () => {
  it('finds C as degree 0 in C major', () => {
    expect(findScaleDegree(0, 0, 'major')).toBe(0);
  });

  it('finds G as degree 4 in C major', () => {
    expect(findScaleDegree(7, 0, 'major')).toBe(4);
  });

  it('returns -1 for non-diatonic note', () => {
    // C# is not in C major
    expect(findScaleDegree(1, 0, 'major')).toBe(-1);
  });

  it('works for all diatonic notes in C major', () => {
    const cMajorPCs = [0, 2, 4, 5, 7, 9, 11];
    for (let i = 0; i < 7; i++) {
      expect(findScaleDegree(cMajorPCs[i], 0, 'major')).toBe(i);
    }
  });
});
