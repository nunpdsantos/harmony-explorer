import { describe, it, expect } from 'vitest';
import {
  MODE_TEMPLATES,
  deriveMode,
  modePitchClasses,
  getModesByParent,
  type ModeType,
} from '../modes';

describe('MODE_TEMPLATES', () => {
  it('contains all 7 major modes', () => {
    const majorModes: ModeType[] = ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];
    for (const m of majorModes) {
      expect(MODE_TEMPLATES[m]).toBeDefined();
      expect(MODE_TEMPLATES[m].parent).toBe('major');
    }
  });

  it('contains all 7 melodic minor modes', () => {
    const modes: ModeType[] = ['melodicMinor', 'dorianFlat2', 'lydianAugmented', 'lydianDominant', 'mixolydianFlat6', 'locrianNatural2', 'altered'];
    for (const m of modes) {
      expect(MODE_TEMPLATES[m]).toBeDefined();
      expect(MODE_TEMPLATES[m].parent).toBe('melodicMinor');
    }
  });

  it('contains all 7 harmonic minor modes', () => {
    const modes: ModeType[] = ['harmonicMinor', 'locrianNatural6', 'ionianSharp5', 'dorianSharp4', 'phrygianDominant', 'lydianSharp2', 'ultraLocrian'];
    for (const m of modes) {
      expect(MODE_TEMPLATES[m]).toBeDefined();
      expect(MODE_TEMPLATES[m].parent).toBe('harmonicMinor');
    }
  });

  it('contains symmetric scales', () => {
    const scales: ModeType[] = ['wholeHalfDim', 'halfWholeDim', 'wholeTone', 'augmentedScale'];
    for (const s of scales) {
      expect(MODE_TEMPLATES[s]).toBeDefined();
      expect(MODE_TEMPLATES[s].parent).toBe('symmetric');
    }
  });

  it('contains pentatonic and blues scales', () => {
    expect(MODE_TEMPLATES.pentatonicMajor).toBeDefined();
    expect(MODE_TEMPLATES.pentatonicMinor).toBeDefined();
    expect(MODE_TEMPLATES.blues).toBeDefined();
  });

  it('all modes start with interval 0', () => {
    for (const [, tmpl] of Object.entries(MODE_TEMPLATES)) {
      expect(tmpl.intervals[0]).toBe(0);
    }
  });

  it('all mode intervals are strictly ascending', () => {
    for (const [, tmpl] of Object.entries(MODE_TEMPLATES)) {
      for (let i = 1; i < tmpl.intervals.length; i++) {
        expect(tmpl.intervals[i]).toBeGreaterThan(tmpl.intervals[i - 1]);
      }
    }
  });

  it('ionian matches major scale [0,2,4,5,7,9,11]', () => {
    expect(MODE_TEMPLATES.ionian.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('aeolian matches natural minor [0,2,3,5,7,8,10]', () => {
    expect(MODE_TEMPLATES.aeolian.intervals).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });

  it('whole tone has 6 notes each 2 semitones apart', () => {
    expect(MODE_TEMPLATES.wholeTone.intervals).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('pentatonic major has 5 notes', () => {
    expect(MODE_TEMPLATES.pentatonicMajor.intervals).toHaveLength(5);
  });

  it('blues has 6 notes', () => {
    expect(MODE_TEMPLATES.blues.intervals).toHaveLength(6);
  });

  it('every mode has characteristic tones', () => {
    for (const [, tmpl] of Object.entries(MODE_TEMPLATES)) {
      expect(tmpl.characteristicTones.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every mode has a name', () => {
    for (const [, tmpl] of Object.entries(MODE_TEMPLATES)) {
      expect(tmpl.name.length).toBeGreaterThan(0);
    }
  });
});

describe('deriveMode', () => {
  it('degree 1 returns the parent scale unchanged', () => {
    const parent = [0, 2, 4, 5, 7, 9, 11];
    expect(deriveMode(parent, 1)).toEqual(parent);
  });

  it('degree 2 of major gives dorian intervals', () => {
    const parent = [0, 2, 4, 5, 7, 9, 11];
    const dorian = deriveMode(parent, 2);
    expect(dorian).toEqual([0, 2, 3, 5, 7, 9, 10]);
  });

  it('degree 5 of major gives mixolydian intervals', () => {
    const parent = [0, 2, 4, 5, 7, 9, 11];
    const mixolydian = deriveMode(parent, 5);
    expect(mixolydian).toEqual([0, 2, 4, 5, 7, 9, 10]);
  });

  it('degree 7 of major gives locrian intervals', () => {
    const parent = [0, 2, 4, 5, 7, 9, 11];
    const locrian = deriveMode(parent, 7);
    expect(locrian).toEqual([0, 1, 3, 5, 6, 8, 10]);
  });
});

describe('modePitchClasses', () => {
  it('C ionian returns [0,2,4,5,7,9,11]', () => {
    expect(modePitchClasses(0, 'ionian')).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('D dorian returns [2,4,5,7,9,11,0]', () => {
    const result = modePitchClasses(2, 'dorian');
    expect(result).toEqual([2, 4, 5, 7, 9, 11, 0]);
  });

  it('G mixolydian contains F natural (10)', () => {
    const result = modePitchClasses(7, 'mixolydian');
    expect(result).toContain(5); // F natural = pc 5
  });

  it('C whole tone returns [0,2,4,6,8,10]', () => {
    expect(modePitchClasses(0, 'wholeTone')).toEqual([0, 2, 4, 6, 8, 10]);
  });

  it('wraps around for high roots', () => {
    const result = modePitchClasses(11, 'ionian');
    expect(result[0]).toBe(11); // B
    expect(result).toHaveLength(7);
  });
});

describe('getModesByParent', () => {
  it('returns groups for all parent types', () => {
    const groups = getModesByParent();
    expect(groups.major.length).toBe(7);
    expect(groups.melodicMinor.length).toBe(7);
    expect(groups.harmonicMinor.length).toBe(7);
    expect(groups.symmetric.length).toBe(4);
    expect(groups.other.length).toBeGreaterThanOrEqual(6);
  });

  it('all mode types appear in exactly one group', () => {
    const groups = getModesByParent();
    const allModes = Object.values(groups).flat();
    const unique = new Set(allModes);
    expect(unique.size).toBe(allModes.length);
    expect(allModes.length).toBe(Object.keys(MODE_TEMPLATES).length);
  });
});
