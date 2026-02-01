import { describe, it, expect } from 'vitest';
import { humanizeVelocity, humanizeTiming, applySwing } from '../humanize';

describe('humanizeVelocity', () => {
  it('returns base velocity when amount is 0', () => {
    expect(humanizeVelocity(0.7, 0)).toBe(0.7);
  });

  it('returns value between 0.1 and 1.0', () => {
    for (let i = 0; i < 100; i++) {
      const vel = humanizeVelocity(0.7, 1.0);
      expect(vel).toBeGreaterThanOrEqual(0.1);
      expect(vel).toBeLessThanOrEqual(1.0);
    }
  });

  it('clamps low velocity', () => {
    for (let i = 0; i < 50; i++) {
      const vel = humanizeVelocity(0.1, 1.0);
      expect(vel).toBeGreaterThanOrEqual(0.1);
    }
  });

  it('clamps high velocity', () => {
    for (let i = 0; i < 50; i++) {
      const vel = humanizeVelocity(1.0, 1.0);
      expect(vel).toBeLessThanOrEqual(1.0);
    }
  });

  it('produces variation when amount > 0', () => {
    const results = new Set<number>();
    for (let i = 0; i < 50; i++) {
      results.add(Math.round(humanizeVelocity(0.7, 0.5) * 1000));
    }
    // Should produce at least 2 different values
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('humanizeTiming', () => {
  it('returns base time when amount is 0', () => {
    expect(humanizeTiming(1.0, 0)).toBe(1.0);
  });

  it('returns non-negative values', () => {
    for (let i = 0; i < 100; i++) {
      const time = humanizeTiming(0.5, 1.0);
      expect(time).toBeGreaterThanOrEqual(0);
    }
  });

  it('stays close to base time', () => {
    for (let i = 0; i < 100; i++) {
      const time = humanizeTiming(1.0, 0.5);
      expect(time).toBeGreaterThanOrEqual(0.97);
      expect(time).toBeLessThanOrEqual(1.03);
    }
  });
});

describe('applySwing', () => {
  it('returns 0 for on-beat (even index)', () => {
    expect(applySwing(0, 0.5, 0.5)).toBe(0);
    expect(applySwing(2, 0.5, 0.5)).toBe(0);
    expect(applySwing(4, 0.5, 0.5)).toBe(0);
  });

  it('returns 0 when swing amount is 0', () => {
    expect(applySwing(1, 0.5, 0)).toBe(0);
    expect(applySwing(3, 0.5, 0)).toBe(0);
  });

  it('returns positive offset for off-beat with swing', () => {
    const offset = applySwing(1, 0.5, 0.5);
    expect(offset).toBeGreaterThan(0);
  });

  it('scales with beat duration', () => {
    const slow = applySwing(1, 1.0, 0.5);
    const fast = applySwing(1, 0.5, 0.5);
    expect(slow).toBeCloseTo(fast * 2);
  });

  it('scales with swing amount', () => {
    const full = applySwing(1, 0.5, 1.0);
    const half = applySwing(1, 0.5, 0.5);
    expect(full).toBeCloseTo(half * 2);
  });
});
