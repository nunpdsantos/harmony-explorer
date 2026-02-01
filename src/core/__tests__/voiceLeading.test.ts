import { describe, it, expect } from 'vitest';
import { initialVoicing, smoothVoiceLeading } from '../voiceLeading';
import type { Chord } from '../chords';

const C_MAJOR: Chord = { root: 0, quality: 'major' };
const G_MAJOR: Chord = { root: 7, quality: 'major' };
const C_MINOR: Chord = { root: 0, quality: 'minor' };
const F_MAJOR: Chord = { root: 5, quality: 'major' };

describe('initialVoicing', () => {
  it('returns correct number of notes for a triad', () => {
    const voicing = initialVoicing(C_MAJOR);
    expect(voicing).toHaveLength(3);
  });

  it('returns correct number of notes for a 7th chord', () => {
    const voicing = initialVoicing({ root: 0, quality: 'dom7' });
    expect(voicing).toHaveLength(4);
  });

  it('notes are sorted ascending', () => {
    const voicing = initialVoicing(C_MAJOR);
    for (let i = 1; i < voicing.length; i++) {
      expect(voicing[i]).toBeGreaterThanOrEqual(voicing[i - 1]);
    }
  });

  it('notes are in a reasonable MIDI range', () => {
    const voicing = initialVoicing(C_MAJOR);
    for (const note of voicing) {
      expect(note).toBeGreaterThanOrEqual(36); // C2
      expect(note).toBeLessThanOrEqual(84);    // C6
    }
  });

  it('pitch classes match the chord', () => {
    const voicing = initialVoicing(C_MAJOR);
    const pcs = voicing.map(n => ((n % 12) + 12) % 12).sort((a, b) => a - b);
    expect(pcs).toEqual([0, 4, 7]);
  });
});

describe('smoothVoiceLeading', () => {
  it('returns correct number of notes', () => {
    const prev = initialVoicing(C_MAJOR);
    const next = smoothVoiceLeading(prev, G_MAJOR);
    expect(next).toHaveLength(3);
  });

  it('notes are sorted ascending', () => {
    const prev = initialVoicing(C_MAJOR);
    const next = smoothVoiceLeading(prev, G_MAJOR);
    for (let i = 1; i < next.length; i++) {
      expect(next[i]).toBeGreaterThanOrEqual(next[i - 1]);
    }
  });

  it('minimizes total movement compared to initial voicing', () => {
    const prev = initialVoicing(C_MAJOR);
    const smooth = smoothVoiceLeading(prev, C_MINOR);
    const fresh = initialVoicing(C_MINOR);

    // Movement from prev to smooth should be <= movement from prev to fresh
    const smoothMovement = prev.reduce((sum, note, i) => sum + Math.abs(note - smooth[i]), 0);
    const freshMovement = prev.reduce((sum, note, i) => sum + Math.abs(note - fresh[i]), 0);
    expect(smoothMovement).toBeLessThanOrEqual(freshMovement);
  });

  it('C major → C minor only moves one note by 1 semitone', () => {
    const prev = initialVoicing(C_MAJOR);
    const next = smoothVoiceLeading(prev, C_MINOR);

    // The pitch classes should be C, Eb, G
    const pcs = next.map(n => ((n % 12) + 12) % 12).sort((a, b) => a - b);
    expect(pcs).toEqual([0, 3, 7]);

    // Total movement should be exactly 1
    const totalMovement = prev.reduce((sum, note, i) => sum + Math.abs(note - next[i]), 0);
    expect(totalMovement).toBe(1);
  });

  it('handles empty previous voicing by returning initial', () => {
    const next = smoothVoiceLeading([], F_MAJOR);
    expect(next).toHaveLength(3);
  });

  it('handles different-sized chords', () => {
    const prev = initialVoicing(C_MAJOR); // 3 notes
    const next = smoothVoiceLeading(prev, { root: 0, quality: 'dom7' }); // 4 notes
    expect(next).toHaveLength(4);
  });
});

describe('large chord handling (greedy fallback)', () => {
  it('handles 5-note chord (dom9)', () => {
    const C_DOM9: Chord = { root: 0, quality: 'dom9' };
    const voicing = initialVoicing(C_DOM9);
    expect(voicing).toHaveLength(5);
    const pcs = voicing.map(n => ((n % 12) + 12) % 12).sort((a, b) => a - b);
    expect(pcs).toEqual([0, 2, 4, 7, 10]);
  });

  it('smooth voice leading works for 5-note chords', () => {
    const C_DOM9: Chord = { root: 0, quality: 'dom9' };
    const G_DOM9: Chord = { root: 7, quality: 'dom9' };
    const prev = initialVoicing(C_DOM9);
    const next = smoothVoiceLeading(prev, G_DOM9);
    expect(next).toHaveLength(5);
    // All notes should be valid MIDI
    for (const note of next) {
      expect(note).toBeGreaterThanOrEqual(24);
      expect(note).toBeLessThanOrEqual(96);
    }
  });

  it('handles 6-note chord (dom13)', () => {
    const C_DOM13: Chord = { root: 0, quality: 'dom13' };
    const voicing = initialVoicing(C_DOM13);
    expect(voicing).toHaveLength(6);
  });

  it('smooth voice leading for 6-note chords does not crash', () => {
    const C_DOM13: Chord = { root: 0, quality: 'dom13' };
    const G_DOM13: Chord = { root: 7, quality: 'dom13' };
    const prev = initialVoicing(C_DOM13);
    const next = smoothVoiceLeading(prev, G_DOM13);
    expect(next).toHaveLength(6);
  });

  it('pitch classes are correct after voice leading large chords', () => {
    const C_DOM9: Chord = { root: 0, quality: 'dom9' };
    const F_MAJ9: Chord = { root: 5, quality: 'maj9' };
    const prev = initialVoicing(C_DOM9);
    const next = smoothVoiceLeading(prev, F_MAJ9);
    const pcs = new Set(next.map(n => ((n % 12) + 12) % 12));
    // F maj9 = F, A, C, E, G = [5, 9, 0, 4, 7]
    expect(pcs.has(5)).toBe(true);  // F
    expect(pcs.has(9)).toBe(true);  // A
    expect(pcs.has(0)).toBe(true);  // C
  });

  it('transitioning from small to large chord works', () => {
    const prev = initialVoicing(C_MAJOR); // 3 notes
    const C_DOM13: Chord = { root: 0, quality: 'dom13' };
    const next = smoothVoiceLeading(prev, C_DOM13); // 6 notes
    expect(next).toHaveLength(6);
  });

  it('transitioning from large to small chord works', () => {
    const C_DOM13: Chord = { root: 0, quality: 'dom13' };
    const prev = initialVoicing(C_DOM13); // 6 notes
    const next = smoothVoiceLeading(prev, C_MAJOR); // 3 notes
    expect(next).toHaveLength(3);
  });
});
