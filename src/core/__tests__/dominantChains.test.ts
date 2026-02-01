import { describe, it, expect } from 'vitest';
import { buildDominantChain, findIIVIs } from '../dominantChains';

describe('buildDominantChain', () => {
  it('builds a chain of dom7 chords descending by fifths', () => {
    const chain = buildDominantChain(7, 4); // Start from G
    expect(chain).toHaveLength(4);
    expect(chain[0].root).toBe(7);  // G7
    expect(chain[1].root).toBe(0);  // C7
    expect(chain[2].root).toBe(5);  // F7
    expect(chain[3].root).toBe(10); // Bb7
  });

  it('all chords in chain are dom7', () => {
    const chain = buildDominantChain(0, 12);
    for (const c of chain) {
      expect(c.quality).toBe('dom7');
    }
  });

  it('chain of 12 visits all 12 roots', () => {
    const chain = buildDominantChain(0, 12);
    const roots = chain.map(c => c.root);
    const unique = new Set(roots);
    expect(unique.size).toBe(12);
  });

  it('each step descends by a fifth (interval 5 ascending = 7 descending)', () => {
    const chain = buildDominantChain(0, 6);
    for (let i = 1; i < chain.length; i++) {
      const interval = ((chain[i].root - chain[i - 1].root) % 12 + 12) % 12;
      expect(interval).toBe(5); // up a fourth = down a fifth
    }
  });
});

describe('findIIVIs', () => {
  it('returns 6 ii-V-I patterns for C major', () => {
    const patterns = findIIVIs(0);
    expect(patterns).toHaveLength(6); // 1 primary + 5 secondary
  });

  it('primary ii-V-I in C is Dm7-G7-C', () => {
    const patterns = findIIVIs(0);
    const primary = patterns[0];
    expect(primary.label).toBe('Primary ii-V-I');
    expect(primary.ii.root).toBe(2);     // D
    expect(primary.ii.quality).toBe('min7');
    expect(primary.V.root).toBe(7);      // G
    expect(primary.V.quality).toBe('dom7');
    expect(primary.I.root).toBe(0);      // C
    expect(primary.I.quality).toBe('major');
  });

  it('all ii chords are min7', () => {
    const patterns = findIIVIs(0);
    for (const p of patterns) {
      expect(p.ii.quality).toBe('min7');
    }
  });

  it('all V chords are dom7', () => {
    const patterns = findIIVIs(0);
    for (const p of patterns) {
      expect(p.V.quality).toBe('dom7');
    }
  });

  it('V root is a fifth above the target', () => {
    const patterns = findIIVIs(0);
    for (const p of patterns) {
      const interval = ((p.V.root - p.I.root) % 12 + 12) % 12;
      expect(interval).toBe(7);
    }
  });
});
