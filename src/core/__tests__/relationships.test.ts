import { describe, it, expect } from 'vitest';
import {
  sharedNoteCount,
  sharedNotes,
  fifthsDistance,
  isDominantOf,
  isTritoneSubstitution,
  applyNeoRiemannian,
  findNeoRiemannianTransform,
  voiceLeadingDistance,
  analyzeRelationship,
} from '../relationships';
import type { Chord } from '../chords';

const C_MAJOR: Chord = { root: 0, quality: 'major' };
const C_MINOR: Chord = { root: 0, quality: 'minor' };
const G_MAJOR: Chord = { root: 7, quality: 'major' };
const F_MAJOR: Chord = { root: 5, quality: 'major' };
const A_MINOR: Chord = { root: 9, quality: 'minor' };
const E_MINOR: Chord = { root: 4, quality: 'minor' };
const G7: Chord = { root: 7, quality: 'dom7' };
const Db7: Chord = { root: 1, quality: 'dom7' };
const D_MINOR: Chord = { root: 2, quality: 'minor' };

describe('sharedNoteCount', () => {
  it('C major and A minor share 2 notes (C, E)', () => {
    expect(sharedNoteCount(C_MAJOR, A_MINOR)).toBe(2);
  });

  it('C major and G major share 1 note (G... wait B too) — let me check: C,E,G vs G,B,D = G shared', () => {
    // C major: [0,4,7], G major: [7,11,2] → shared: [7]
    expect(sharedNoteCount(C_MAJOR, G_MAJOR)).toBe(1);
  });

  it('C major and F major share 1 note (C)', () => {
    // C major: [0,4,7], F major: [5,9,0] → shared: [0]
    expect(sharedNoteCount(C_MAJOR, F_MAJOR)).toBe(1);
  });

  it('chord shares all notes with itself', () => {
    expect(sharedNoteCount(C_MAJOR, C_MAJOR)).toBe(3);
  });
});

describe('sharedNotes', () => {
  it('returns the actual shared pitch classes', () => {
    const shared = sharedNotes(C_MAJOR, A_MINOR);
    expect(shared.sort()).toEqual([0, 4].sort());
  });
});

describe('fifthsDistance', () => {
  it('C to G is 1 fifth', () => {
    expect(fifthsDistance(0, 7)).toBe(1);
  });

  it('C to F is 1 fifth (going counterclockwise)', () => {
    expect(fifthsDistance(0, 5)).toBe(1);
  });

  it('C to C is 0', () => {
    expect(fifthsDistance(0, 0)).toBe(0);
  });

  it('C to F# is 6 (opposite on circle)', () => {
    expect(fifthsDistance(0, 6)).toBe(6);
  });

  it('C to D is 2 fifths', () => {
    expect(fifthsDistance(0, 2)).toBe(2);
  });

  it('is symmetric', () => {
    expect(fifthsDistance(0, 7)).toBe(fifthsDistance(7, 0));
  });
});

describe('isDominantOf', () => {
  it('G major is dominant of C major', () => {
    expect(isDominantOf(G_MAJOR, C_MAJOR)).toBe(true);
  });

  it('G7 is dominant of C major', () => {
    expect(isDominantOf(G7, C_MAJOR)).toBe(true);
  });

  it('C major is not dominant of G major', () => {
    expect(isDominantOf(C_MAJOR, G_MAJOR)).toBe(false);
  });

  it('D minor is not dominant of G (minor has minor third)', () => {
    expect(isDominantOf(D_MINOR, G_MAJOR)).toBe(false);
  });
});

describe('isTritoneSubstitution', () => {
  it('G7 and Db7 are tritone subs', () => {
    expect(isTritoneSubstitution(G7, Db7)).toBe(true);
  });

  it('is symmetric', () => {
    expect(isTritoneSubstitution(Db7, G7)).toBe(true);
  });

  it('C major and F# major are not tritone subs (need dom quality)', () => {
    expect(isTritoneSubstitution(C_MAJOR, { root: 6, quality: 'major' })).toBe(false);
  });
});

describe('applyNeoRiemannian', () => {
  it('P: C major → C minor', () => {
    const result = applyNeoRiemannian(C_MAJOR, 'P');
    expect(result).toEqual(C_MINOR);
  });

  it('P: C minor → C major', () => {
    const result = applyNeoRiemannian(C_MINOR, 'P');
    expect(result).toEqual(C_MAJOR);
  });

  it('L: C major → E minor', () => {
    const result = applyNeoRiemannian(C_MAJOR, 'L');
    expect(result).toEqual(E_MINOR);
  });

  it('R: C major → A minor', () => {
    const result = applyNeoRiemannian(C_MAJOR, 'R');
    expect(result).toEqual(A_MINOR);
  });

  it('L: C minor → Ab major', () => {
    const result = applyNeoRiemannian(C_MINOR, 'L');
    expect(result).toEqual({ root: 8, quality: 'major' });
  });

  it('R: C minor → Eb major', () => {
    const result = applyNeoRiemannian(C_MINOR, 'R');
    expect(result).toEqual({ root: 3, quality: 'major' });
  });

  it('returns null for non-major/minor chords', () => {
    expect(applyNeoRiemannian({ root: 0, quality: 'dom7' }, 'P')).toBeNull();
  });

  it('P is an involution (applying twice returns original)', () => {
    const p1 = applyNeoRiemannian(C_MAJOR, 'P')!;
    const p2 = applyNeoRiemannian(p1, 'P')!;
    expect(p2).toEqual(C_MAJOR);
  });
});

describe('findNeoRiemannianTransform', () => {
  it('finds P between C major and C minor', () => {
    expect(findNeoRiemannianTransform(C_MAJOR, C_MINOR)).toBe('P');
  });

  it('finds L between C major and E minor', () => {
    expect(findNeoRiemannianTransform(C_MAJOR, E_MINOR)).toBe('L');
  });

  it('finds R between C major and A minor', () => {
    expect(findNeoRiemannianTransform(C_MAJOR, A_MINOR)).toBe('R');
  });

  it('returns null when no single transform connects chords', () => {
    expect(findNeoRiemannianTransform(C_MAJOR, G_MAJOR)).toBeNull();
  });
});

describe('voiceLeadingDistance', () => {
  it('C major to C minor is 1 (just the third moves)', () => {
    // C,E,G → C,Eb,G: E→Eb = 1 semitone
    expect(voiceLeadingDistance(C_MAJOR, C_MINOR)).toBe(1);
  });

  it('identical chord has distance 0', () => {
    expect(voiceLeadingDistance(C_MAJOR, C_MAJOR)).toBe(0);
  });

  it('distance is non-negative', () => {
    expect(voiceLeadingDistance(C_MAJOR, G_MAJOR)).toBeGreaterThanOrEqual(0);
  });
});

describe('analyzeRelationship', () => {
  it('returns a complete relationship object', () => {
    const rel = analyzeRelationship(G7, C_MAJOR);
    expect(rel.isDominant).toBe(true);
    expect(rel.sharedNoteCount).toBeGreaterThanOrEqual(0);
    expect(rel.fifthsDistance).toBe(1);
    expect(typeof rel.voiceLeadingDistance).toBe('number');
  });
});
