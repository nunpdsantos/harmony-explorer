import { describe, it, expect } from 'vitest';
import {
  PROGRESSION_LIBRARY,
  LIBRARY_CATEGORIES,
  getLibraryByCategory,
  transposeLibraryEntry,
} from '../progressionLibrary';

describe('progressionLibrary', () => {
  it('has entries in all categories', () => {
    for (const cat of LIBRARY_CATEGORIES) {
      const entries = getLibraryByCategory(cat);
      expect(entries.length).toBeGreaterThan(0);
    }
  });

  it('has 4 categories', () => {
    expect(LIBRARY_CATEGORIES).toHaveLength(4);
    expect(LIBRARY_CATEGORIES).toContain('jazz');
    expect(LIBRARY_CATEGORIES).toContain('pop');
    expect(LIBRARY_CATEGORIES).toContain('classical');
    expect(LIBRARY_CATEGORIES).toContain('blues');
  });

  it('all entries have required fields', () => {
    for (const entry of PROGRESSION_LIBRARY) {
      expect(entry.name).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(typeof entry.key).toBe('number');
      expect(entry.key).toBeGreaterThanOrEqual(0);
      expect(entry.key).toBeLessThan(12);
      expect(entry.chords.length).toBeGreaterThan(0);
      expect(LIBRARY_CATEGORIES).toContain(entry.category);
    }
  });

  it('all chords have valid root (0-11) and quality', () => {
    for (const entry of PROGRESSION_LIBRARY) {
      for (const chord of entry.chords) {
        expect(chord.root).toBeGreaterThanOrEqual(0);
        expect(chord.root).toBeLessThan(12);
        expect(typeof chord.quality).toBe('string');
      }
    }
  });

  it('has at least 15 entries total', () => {
    expect(PROGRESSION_LIBRARY.length).toBeGreaterThanOrEqual(15);
  });

  describe('transposeLibraryEntry', () => {
    it('returns same chords when transposing to same key', () => {
      const entry = PROGRESSION_LIBRARY[0];
      const result = transposeLibraryEntry(entry, entry.key);
      expect(result.length).toBe(entry.chords.length);
      for (let i = 0; i < result.length; i++) {
        expect(result[i].root).toBe(entry.chords[i].root);
        expect(result[i].quality).toBe(entry.chords[i].quality);
      }
    });

    it('transposes up by semitones', () => {
      const entry = PROGRESSION_LIBRARY.find(e => e.key === 0)!;
      const result = transposeLibraryEntry(entry, 2);
      for (let i = 0; i < result.length; i++) {
        expect(result[i].root).toBe((entry.chords[i].root + 2) % 12);
      }
    });

    it('preserves qualities when transposing', () => {
      const entry = PROGRESSION_LIBRARY[0];
      const result = transposeLibraryEntry(entry, 5);
      for (let i = 0; i < result.length; i++) {
        expect(result[i].quality).toBe(entry.chords[i].quality);
      }
    });

    it('wraps around at 12', () => {
      const entry = PROGRESSION_LIBRARY.find(e => e.key === 0)!;
      const result = transposeLibraryEntry(entry, 11);
      for (const chord of result) {
        expect(chord.root).toBeGreaterThanOrEqual(0);
        expect(chord.root).toBeLessThan(12);
      }
    });
  });

  describe('getLibraryByCategory', () => {
    it('filters correctly', () => {
      const jazz = getLibraryByCategory('jazz');
      for (const entry of jazz) {
        expect(entry.category).toBe('jazz');
      }
    });

    it('returns subset of full library', () => {
      const jazz = getLibraryByCategory('jazz');
      expect(jazz.length).toBeLessThan(PROGRESSION_LIBRARY.length);
    });
  });

  it('includes well-known progressions', () => {
    const names = PROGRESSION_LIBRARY.map(e => e.name);
    expect(names).toContain('Autumn Leaves');
    expect(names).toContain('Giant Steps');
    expect(names).toContain('I-V-vi-IV');
    expect(names).toContain('12-Bar Blues');
    expect(names).toContain('Pachelbel Canon');
  });
});
