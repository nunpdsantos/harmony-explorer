import { describe, it, expect } from 'vitest';
import { buildPLCycle, buildPRCycle, buildLRCycle } from '../neoRiemannianCycle';

describe('buildPLCycle', () => {
  it('produces 24 steps (all major + minor triads)', () => {
    const cycle = buildPLCycle(0);
    expect(cycle).toHaveLength(24);
  });

  it('starts with C major', () => {
    const cycle = buildPLCycle(0);
    expect(cycle[0].chord.root).toBe(0);
    expect(cycle[0].chord.quality).toBe('major');
    expect(cycle[0].transform).toBeNull();
  });

  it('alternates P and L transforms', () => {
    const cycle = buildPLCycle(0);
    for (let i = 1; i < cycle.length; i++) {
      const expected = i % 2 === 1 ? 'P' : 'L';
      expect(cycle[i].transform).toBe(expected);
    }
  });

  it('all chords are either major or minor', () => {
    const cycle = buildPLCycle(0);
    for (const step of cycle) {
      expect(['major', 'minor']).toContain(step.chord.quality);
    }
  });

  it('visits 6 unique triads in one hexatonic system (repeating in a cycle)', () => {
    const cycle = buildPLCycle(0);
    const seen = new Set(cycle.map(s => `${s.chord.root}-${s.chord.quality}`));
    // P/L generates a hexatonic system: 6 unique chords repeated 4 times = 24 steps
    expect(seen.size).toBe(6);
  });

  it('works from different start roots', () => {
    const cycle = buildPLCycle(7); // Start from G
    expect(cycle[0].chord.root).toBe(7);
    expect(cycle).toHaveLength(24);
  });
});

describe('buildPRCycle', () => {
  it('produces 8 steps', () => {
    const cycle = buildPRCycle(0);
    // P/R cycle has period 8: C→Cm→Eb→Ebm→Gb→Gbm→A→Am
    expect(cycle).toHaveLength(8);
  });

  it('starts with the given root as major', () => {
    const cycle = buildPRCycle(0);
    expect(cycle[0].chord.root).toBe(0);
    expect(cycle[0].chord.quality).toBe('major');
  });

  it('alternates P and R transforms', () => {
    const cycle = buildPRCycle(0);
    for (let i = 1; i < cycle.length; i++) {
      const expected = i % 2 === 1 ? 'P' : 'R';
      expect(cycle[i].transform).toBe(expected);
    }
  });

  it('all chords are valid', () => {
    const cycle = buildPRCycle(0);
    for (const step of cycle) {
      expect(step.chord.root).toBeGreaterThanOrEqual(0);
      expect(step.chord.root).toBeLessThanOrEqual(11);
      expect(['major', 'minor']).toContain(step.chord.quality);
    }
  });
});

describe('buildLRCycle', () => {
  it('produces 24 steps', () => {
    const cycle = buildLRCycle(0);
    expect(cycle).toHaveLength(24);
  });

  it('starts with the given root as major', () => {
    const cycle = buildLRCycle(0);
    expect(cycle[0].chord.root).toBe(0);
    expect(cycle[0].chord.quality).toBe('major');
  });

  it('alternates L and R transforms', () => {
    const cycle = buildLRCycle(0);
    for (let i = 1; i < cycle.length; i++) {
      const expected = i % 2 === 1 ? 'L' : 'R';
      expect(cycle[i].transform).toBe(expected);
    }
  });

  it('all chords are valid major or minor triads', () => {
    const cycle = buildLRCycle(0);
    for (const step of cycle) {
      expect(step.chord.root).toBeGreaterThanOrEqual(0);
      expect(step.chord.root).toBeLessThanOrEqual(11);
      expect(['major', 'minor']).toContain(step.chord.quality);
    }
  });
});
