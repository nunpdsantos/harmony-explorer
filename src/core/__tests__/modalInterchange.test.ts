import { describe, it, expect } from 'vitest';
import {
  getModalInterchangeChords,
  getAllBorrowedChords,
} from '../modalInterchange';
import { chordKey } from '../chords';

describe('getModalInterchangeChords', () => {
  it('returns an array of BorrowedChord objects', () => {
    const result = getModalInterchangeChords(0, 'aeolian');
    expect(Array.isArray(result)).toBe(true);
    for (const bc of result) {
      expect(bc).toHaveProperty('chord');
      expect(bc).toHaveProperty('sourceMode');
      expect(bc).toHaveProperty('roman');
      expect(bc).toHaveProperty('tonalFunction');
      expect(bc).toHaveProperty('description');
    }
  });

  it('returns empty array for modes without triad quality data', () => {
    // 'wholeTone' has no entry in MODE_TRIAD_QUALITIES
    const result = getModalInterchangeChords(0, 'wholeTone');
    expect(result).toEqual([]);
  });

  it('borrows chords from aeolian that are not in ionian', () => {
    const borrowed = getModalInterchangeChords(0, 'aeolian');
    // In C: aeolian has Bb major (♭VII), Ab major (♭VI), etc.
    expect(borrowed.length).toBeGreaterThan(0);

    // None of the borrowed chords should be diatonic to C major
    // C major diatonic triads: C, Dm, Em, F, G, Am, Bdim
    const majorDiatonicKeys = new Set([
      '0-major', '2-minor', '4-minor', '5-major',
      '7-major', '9-minor', '11-diminished',
    ]);
    for (const bc of borrowed) {
      expect(majorDiatonicKeys.has(chordKey(bc.chord))).toBe(false);
    }
  });

  it('includes ♭VII chord when borrowing from aeolian in C', () => {
    const borrowed = getModalInterchangeChords(0, 'aeolian');
    // Bb major = root 10, quality major
    const bVII = borrowed.find(bc => bc.chord.root === 10 && bc.chord.quality === 'major');
    expect(bVII).toBeDefined();
    expect(bVII!.roman).toBe('♭VII');
  });

  it('includes ♭III chord when borrowing from aeolian in C', () => {
    const borrowed = getModalInterchangeChords(0, 'aeolian');
    // Eb major = root 3, quality major
    const bIII = borrowed.find(bc => bc.chord.root === 3 && bc.chord.quality === 'major');
    expect(bIII).toBeDefined();
    expect(bIII!.roman).toBe('♭III');
  });

  it('each borrowed chord has sourceMode matching the requested mode', () => {
    const borrowed = getModalInterchangeChords(0, 'dorian');
    for (const bc of borrowed) {
      expect(bc.sourceMode).toBe('dorian');
    }
  });

  it('each borrowed chord has a description', () => {
    const borrowed = getModalInterchangeChords(0, 'aeolian');
    for (const bc of borrowed) {
      expect(bc.description).toContain('from');
    }
  });

  it('transposes correctly for key of G (root=7)', () => {
    const borrowed = getModalInterchangeChords(7, 'aeolian');
    expect(borrowed.length).toBeGreaterThan(0);
    // F major (♭VII of G) = root 5
    const bVII = borrowed.find(bc => bc.chord.root === 5 && bc.chord.quality === 'major');
    expect(bVII).toBeDefined();
  });

  it('returns correct tonal functions', () => {
    const borrowed = getModalInterchangeChords(0, 'aeolian');
    const functions = new Set(borrowed.map(bc => bc.tonalFunction));
    // Should contain at least one subdominant (♭III, ♭VI, iv, ♭VII are common)
    expect(functions.has('subdominant') || functions.has('tonic') || functions.has('dominant')).toBe(true);
  });

  it('borrows from harmonic minor', () => {
    const borrowed = getModalInterchangeChords(0, 'harmonicMinor');
    expect(borrowed.length).toBeGreaterThan(0);
  });

  it('borrows from melodic minor', () => {
    const borrowed = getModalInterchangeChords(0, 'melodicMinor');
    expect(borrowed.length).toBeGreaterThan(0);
  });

  it('borrowing from ionian returns empty (same as home key)', () => {
    const borrowed = getModalInterchangeChords(0, 'ionian');
    expect(borrowed).toEqual([]);
  });
});

describe('getAllBorrowedChords', () => {
  it('returns borrowed chords from all parallel modes', () => {
    const all = getAllBorrowedChords(0);
    expect(all.length).toBeGreaterThan(0);
  });

  it('returns no duplicate chord keys', () => {
    const all = getAllBorrowedChords(0);
    const keys = all.map(bc => chordKey(bc.chord));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('sorted by semitone distance from key root', () => {
    const all = getAllBorrowedChords(0);
    for (let i = 1; i < all.length; i++) {
      const prevDist = ((all[i - 1].chord.root - 0) % 12 + 12) % 12;
      const currDist = ((all[i].chord.root - 0) % 12 + 12) % 12;
      expect(currDist).toBeGreaterThanOrEqual(prevDist);
    }
  });

  it('prefers aeolian source for duplicate chords', () => {
    // ♭VII Bb major exists in aeolian and mixolydian; aeolian checked first
    const all = getAllBorrowedChords(0);
    const bVII = all.find(bc => bc.chord.root === 10 && bc.chord.quality === 'major');
    if (bVII) {
      expect(bVII.sourceMode).toBe('aeolian');
    }
  });

  it('works for different key roots', () => {
    for (const root of [0, 3, 5, 7, 11]) {
      const all = getAllBorrowedChords(root);
      expect(all.length).toBeGreaterThan(0);
    }
  });
});
