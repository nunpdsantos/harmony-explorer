import { describe, it, expect } from 'vitest';
import {
  chordPitchClasses,
  chordName,
  chordFullName,
  transposeChord,
  chordsEqual,
  chordKey,
  chord,
  chordSize,
  getIntervals,
} from '../chords';
import { CHORD_TEMPLATES } from '../constants';

describe('chordPitchClasses', () => {
  it('returns [0, 4, 7] for C major', () => {
    expect(chordPitchClasses({ root: 0, quality: 'major' })).toEqual([0, 4, 7]);
  });

  it('returns [0, 3, 7] for C minor', () => {
    expect(chordPitchClasses({ root: 0, quality: 'minor' })).toEqual([0, 3, 7]);
  });

  it('returns correct pitch classes for G major', () => {
    expect(chordPitchClasses({ root: 7, quality: 'major' })).toEqual([7, 11, 2]);
  });

  it('wraps around 12 correctly for high roots', () => {
    // Bb major: root=10, intervals [0,4,7] -> [10, 2, 5]
    expect(chordPitchClasses({ root: 10, quality: 'major' })).toEqual([10, 2, 5]);
  });

  it('returns 4 notes for dom7', () => {
    const pcs = chordPitchClasses({ root: 0, quality: 'dom7' });
    expect(pcs).toEqual([0, 4, 7, 10]);
  });

  it('returns correct pitch classes for all 13 qualities from C', () => {
    for (const quality of Object.keys(CHORD_TEMPLATES) as Array<keyof typeof CHORD_TEMPLATES>) {
      const pcs = chordPitchClasses({ root: 0, quality });
      expect(pcs).toEqual([...CHORD_TEMPLATES[quality].intervals]);
    }
  });
});

describe('chordName', () => {
  it('returns "C" for C major', () => {
    expect(chordName({ root: 0, quality: 'major' })).toBe('C');
  });

  it('returns "Cm" for C minor', () => {
    expect(chordName({ root: 0, quality: 'minor' })).toBe('Cm');
  });

  it('returns "G7" for G dom7', () => {
    expect(chordName({ root: 7, quality: 'dom7' })).toBe('G7');
  });

  it('returns "Db°7" for Db dim7', () => {
    expect(chordName({ root: 1, quality: 'dim7' })).toBe('Db°7');
  });

  it('uses flat names for flat-key roots', () => {
    expect(chordName({ root: 3, quality: 'major' })).toBe('Eb');
    expect(chordName({ root: 8, quality: 'minor' })).toBe('Abm');
  });
});

describe('chordFullName', () => {
  it('returns "C Major" for C major', () => {
    expect(chordFullName({ root: 0, quality: 'major' })).toBe('C Major');
  });

  it('returns "C Minor" for C minor', () => {
    expect(chordFullName({ root: 0, quality: 'minor' })).toBe('C Minor');
  });
});

describe('transposeChord', () => {
  it('transposes C major up 7 semitones to G major', () => {
    const result = transposeChord({ root: 0, quality: 'major' }, 7);
    expect(result.root).toBe(7);
    expect(result.quality).toBe('major');
  });

  it('wraps around correctly', () => {
    const result = transposeChord({ root: 10, quality: 'minor' }, 5);
    expect(result.root).toBe(3);
  });

  it('handles negative transposition', () => {
    const result = transposeChord({ root: 2, quality: 'major' }, -5);
    expect(result.root).toBe(9);
  });

  it('preserves quality', () => {
    const result = transposeChord({ root: 0, quality: 'dim7' }, 3);
    expect(result.quality).toBe('dim7');
  });
});

describe('chord', () => {
  it('creates a chord with normalized root', () => {
    const c = chord(0, 'major');
    expect(c.root).toBe(0);
    expect(c.quality).toBe('major');
  });

  it('normalizes root > 11', () => {
    const c = chord(14, 'minor');
    expect(c.root).toBe(2);
  });

  it('normalizes negative root', () => {
    const c = chord(-1, 'major');
    expect(c.root).toBe(11);
  });
});

describe('chordsEqual', () => {
  it('returns true for identical chords', () => {
    expect(chordsEqual({ root: 0, quality: 'major' }, { root: 0, quality: 'major' })).toBe(true);
  });

  it('returns false for different roots', () => {
    expect(chordsEqual({ root: 0, quality: 'major' }, { root: 7, quality: 'major' })).toBe(false);
  });

  it('returns false for different qualities', () => {
    expect(chordsEqual({ root: 0, quality: 'major' }, { root: 0, quality: 'minor' })).toBe(false);
  });
});

describe('chordKey', () => {
  it('returns "0-major" for C major', () => {
    expect(chordKey({ root: 0, quality: 'major' })).toBe('0-major');
  });

  it('returns unique keys for different chords', () => {
    const key1 = chordKey({ root: 0, quality: 'major' });
    const key2 = chordKey({ root: 0, quality: 'minor' });
    const key3 = chordKey({ root: 7, quality: 'major' });
    expect(key1).not.toBe(key2);
    expect(key1).not.toBe(key3);
  });
});

describe('chordSize', () => {
  it('returns 3 for triads', () => {
    expect(chordSize({ root: 0, quality: 'major' })).toBe(3);
    expect(chordSize({ root: 0, quality: 'minor' })).toBe(3);
    expect(chordSize({ root: 0, quality: 'diminished' })).toBe(3);
  });

  it('returns 4 for seventh chords', () => {
    expect(chordSize({ root: 0, quality: 'dom7' })).toBe(4);
    expect(chordSize({ root: 0, quality: 'maj7' })).toBe(4);
    expect(chordSize({ root: 0, quality: 'dim7' })).toBe(4);
  });
});

describe('getIntervals', () => {
  it('returns correct intervals for major', () => {
    expect(getIntervals('major')).toEqual([0, 4, 7]);
  });

  it('returns correct intervals for dom7', () => {
    expect(getIntervals('dom7')).toEqual([0, 4, 7, 10]);
  });
});
