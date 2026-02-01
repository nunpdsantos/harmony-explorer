import { describe, it, expect } from 'vitest';
import {
  getUpperStructureTriads,
  formatUST,
} from '../upperStructureTriads';

describe('getUpperStructureTriads', () => {
  it('returns 7 UST definitions', () => {
    const usts = getUpperStructureTriads(0);
    expect(usts).toHaveLength(7);
  });

  it('each UST has required fields', () => {
    const usts = getUpperStructureTriads(0);
    for (const ust of usts) {
      expect(ust.rootInterval).toBeDefined();
      expect(ust.quality).toMatch(/^(major|minor)$/);
      expect(ust.notes).toHaveLength(3);
      expect(ust.bassNotes).toHaveLength(3);
      expect(ust.extensions.length).toBeGreaterThan(0);
      expect(ust.label).toMatch(/^UST/);
      expect(ust.tensionLevel).toBeGreaterThanOrEqual(1);
      expect(ust.tensionLevel).toBeLessThanOrEqual(4);
    }
  });

  it('bass notes are root, major 3rd, minor 7th of dom7', () => {
    const usts = getUpperStructureTriads(0); // C dom7
    for (const ust of usts) {
      expect(ust.bassNotes).toEqual([0, 4, 10]); // C, E, Bb
    }
  });

  it('bass notes transpose correctly for G7', () => {
    const usts = getUpperStructureTriads(7); // G dom7
    for (const ust of usts) {
      expect(ust.bassNotes).toEqual([7, 11, 5]); // G, B, F
    }
  });

  it('UST II over C7 has D major triad (D, F#, A)', () => {
    const usts = getUpperStructureTriads(0);
    const ustII = usts.find(u => u.label === 'UST II');
    expect(ustII).toBeDefined();
    expect(ustII!.quality).toBe('major');
    expect(ustII!.notes).toEqual([2, 6, 9]); // D=2, F#=6, A=9
  });

  it('UST ♯IV over C7 has F# major triad', () => {
    const usts = getUpperStructureTriads(0);
    const ustSharp4 = usts.find(u => u.label === 'UST ♯IV');
    expect(ustSharp4).toBeDefined();
    expect(ustSharp4!.quality).toBe('major');
    expect(ustSharp4!.notes).toEqual([6, 10, 1]); // F#=6, Bb=10, Db=1
  });

  it('UST ♭VI over C7 has Ab major triad', () => {
    const usts = getUpperStructureTriads(0);
    const ustFlat6 = usts.find(u => u.label === 'UST ♭VI');
    expect(ustFlat6).toBeDefined();
    expect(ustFlat6!.quality).toBe('major');
    expect(ustFlat6!.notes).toEqual([8, 0, 3]); // Ab=8, C=0, Eb=3
  });

  it('all UST notes are valid pitch classes (0-11)', () => {
    for (let root = 0; root < 12; root++) {
      const usts = getUpperStructureTriads(root);
      for (const ust of usts) {
        for (const note of ust.notes) {
          expect(note).toBeGreaterThanOrEqual(0);
          expect(note).toBeLessThan(12);
        }
        for (const note of ust.bassNotes) {
          expect(note).toBeGreaterThanOrEqual(0);
          expect(note).toBeLessThan(12);
        }
      }
    }
  });

  it('major triads have intervals [0, 4, 7]', () => {
    const usts = getUpperStructureTriads(0);
    for (const ust of usts) {
      if (ust.quality === 'major') {
        const intervals = ust.notes.map(n => ((n - ust.notes[0]) % 12 + 12) % 12);
        expect(intervals).toEqual([0, 4, 7]);
      }
    }
  });

  it('minor triads have intervals [0, 3, 7]', () => {
    const usts = getUpperStructureTriads(0);
    for (const ust of usts) {
      if (ust.quality === 'minor') {
        const intervals = ust.notes.map(n => ((n - ust.notes[0]) % 12 + 12) % 12);
        expect(intervals).toEqual([0, 3, 7]);
      }
    }
  });

  it('normalizes root via mod 12', () => {
    const usts12 = getUpperStructureTriads(12);
    const usts0 = getUpperStructureTriads(0);
    expect(usts12[0].bassNotes).toEqual(usts0[0].bassNotes);
  });
});

describe('formatUST', () => {
  it('formats UST II over C7 correctly', () => {
    const usts = getUpperStructureTriads(0);
    const ustII = usts.find(u => u.label === 'UST II')!;
    const formatted = formatUST(ustII, 0);
    expect(formatted).toBe('D / C7');
  });

  it('formats minor UST with m suffix', () => {
    const usts = getUpperStructureTriads(0);
    const minorUST = usts.find(u => u.quality === 'minor');
    if (minorUST) {
      const formatted = formatUST(minorUST, 0);
      expect(formatted).toContain('m');
      expect(formatted).toContain('/ C7');
    }
  });

  it('formats for different roots', () => {
    const usts = getUpperStructureTriads(7);
    const ustII = usts.find(u => u.label === 'UST II')!;
    const formatted = formatUST(ustII, 7);
    expect(formatted).toBe('A / G7');
  });
});
