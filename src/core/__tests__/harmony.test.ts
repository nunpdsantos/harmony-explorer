import { describe, it, expect } from 'vitest';
import {
  getDiatonicChords,
  isDiatonic,
  getDiatonicInfo,
  getNextMoves,
  functionColor,
  functionBgColor,
} from '../harmony';
import { chordName } from '../chords';

describe('getDiatonicChords', () => {
  it('returns 7 diatonic chords for C major', () => {
    const chords = getDiatonicChords(0);
    expect(chords).toHaveLength(7);
  });

  it('C major diatonic chords are C, Dm, Em, F, G, Am, Bdim', () => {
    const chords = getDiatonicChords(0);
    const names = chords.map(d => chordName(d.chord));
    expect(names).toEqual(['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']);
  });

  it('assigns correct roman numerals', () => {
    const chords = getDiatonicChords(0);
    const romans = chords.map(d => d.roman);
    expect(romans).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  });

  it('assigns correct tonal functions', () => {
    const chords = getDiatonicChords(0);
    const functions = chords.map(d => d.function);
    expect(functions).toEqual([
      'tonic', 'subdominant', 'tonic', 'subdominant', 'dominant', 'tonic', 'dominant',
    ]);
  });

  it('degree indices are 0-6', () => {
    const chords = getDiatonicChords(0);
    const degrees = chords.map(d => d.degree);
    expect(degrees).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('works for G major', () => {
    const chords = getDiatonicChords(7);
    const names = chords.map(d => chordName(d.chord));
    expect(names).toEqual(['G', 'Am', 'Bm', 'C', 'D', 'Em', 'Gb°']);
  });
});

describe('isDiatonic', () => {
  it('C major is diatonic in C', () => {
    expect(isDiatonic({ root: 0, quality: 'major' }, 0)).toBe(true);
  });

  it('D minor is diatonic in C', () => {
    expect(isDiatonic({ root: 2, quality: 'minor' }, 0)).toBe(true);
  });

  it('D major is not diatonic in C', () => {
    expect(isDiatonic({ root: 2, quality: 'major' }, 0)).toBe(false);
  });

  it('C# major is not diatonic in C', () => {
    expect(isDiatonic({ root: 1, quality: 'major' }, 0)).toBe(false);
  });
});

describe('getDiatonicInfo', () => {
  it('returns info for diatonic chord', () => {
    const info = getDiatonicInfo({ root: 0, quality: 'major' }, 0);
    expect(info).not.toBeNull();
    expect(info!.roman).toBe('I');
    expect(info!.function).toBe('tonic');
  });

  it('returns null for non-diatonic chord', () => {
    const info = getDiatonicInfo({ root: 1, quality: 'major' }, 0);
    expect(info).toBeNull();
  });
});

describe('getNextMoves', () => {
  it('returns moves for I chord', () => {
    const moves = getNextMoves({ root: 0, quality: 'major' }, 0);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('I chord has strong moves to IV and V', () => {
    const moves = getNextMoves({ root: 0, quality: 'major' }, 0);
    const strongMoves = moves.filter(m => m.strength === 'strong');
    const strongRomans = strongMoves.map(m => m.info.roman);
    expect(strongRomans).toContain('IV');
    expect(strongRomans).toContain('V');
  });

  it('V chord has strong move to I', () => {
    const moves = getNextMoves({ root: 7, quality: 'major' }, 0);
    const strongMoves = moves.filter(m => m.strength === 'strong');
    const strongRomans = strongMoves.map(m => m.info.roman);
    expect(strongRomans).toContain('I');
  });

  it('returns moves for non-diatonic chord', () => {
    const moves = getNextMoves({ root: 1, quality: 'dom7' }, 0);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('all moves reference valid chords', () => {
    const moves = getNextMoves({ root: 0, quality: 'major' }, 0);
    for (const m of moves) {
      expect(m.chord.root).toBeGreaterThanOrEqual(0);
      expect(m.chord.root).toBeLessThanOrEqual(11);
      expect(m.info.degree).toBeGreaterThanOrEqual(0);
      expect(m.info.degree).toBeLessThanOrEqual(6);
    }
  });
});

describe('functionColor', () => {
  it('returns different colors for each function', () => {
    const colors = [
      functionColor('tonic'),
      functionColor('subdominant'),
      functionColor('dominant'),
    ];
    expect(new Set(colors).size).toBe(3);
  });

  it('returns hex color strings', () => {
    expect(functionColor('tonic')).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('functionBgColor', () => {
  it('returns rgba strings', () => {
    expect(functionBgColor('tonic')).toMatch(/^rgba\(/);
    expect(functionBgColor('subdominant')).toMatch(/^rgba\(/);
    expect(functionBgColor('dominant')).toMatch(/^rgba\(/);
  });
});
