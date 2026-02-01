import { describe, it, expect } from 'vitest';
import { PRESETS, PRESET_NAMES } from '../presets';

describe('Audio Presets', () => {
  it('has 5 presets', () => {
    expect(PRESET_NAMES).toHaveLength(5);
  });

  it('PRESET_NAMES matches PRESETS keys', () => {
    for (const name of PRESET_NAMES) {
      expect(PRESETS[name]).toBeDefined();
    }
  });

  it.each(PRESET_NAMES)('%s has valid oscillator type', (name) => {
    const preset = PRESETS[name];
    expect(['triangle', 'sine', 'square', 'sawtooth']).toContain(preset.oscillator);
  });

  it.each(PRESET_NAMES)('%s has valid ADSR values', (name) => {
    const { envelope } = PRESETS[name];
    expect(envelope.attack).toBeGreaterThanOrEqual(0);
    expect(envelope.attack).toBeLessThanOrEqual(5);
    expect(envelope.decay).toBeGreaterThanOrEqual(0);
    expect(envelope.decay).toBeLessThanOrEqual(5);
    expect(envelope.sustain).toBeGreaterThanOrEqual(0);
    expect(envelope.sustain).toBeLessThanOrEqual(1);
    expect(envelope.release).toBeGreaterThanOrEqual(0);
    expect(envelope.release).toBeLessThanOrEqual(10);
  });

  it.each(PRESET_NAMES)('%s has valid reverb settings', (name) => {
    const { reverb } = PRESETS[name];
    expect(reverb.decay).toBeGreaterThan(0);
    expect(reverb.wet).toBeGreaterThanOrEqual(0);
    expect(reverb.wet).toBeLessThanOrEqual(1);
  });

  it.each(PRESET_NAMES)('%s has a display name', (name) => {
    expect(PRESETS[name].name).toBeTruthy();
    expect(typeof PRESETS[name].name).toBe('string');
  });

  it.each(PRESET_NAMES)('%s has reasonable volume', (name) => {
    const { volume } = PRESETS[name];
    expect(volume).toBeGreaterThanOrEqual(-30);
    expect(volume).toBeLessThanOrEqual(0);
  });

  it('all presets have unique names', () => {
    const names = PRESET_NAMES.map(n => PRESETS[n].name);
    expect(new Set(names).size).toBe(names.length);
  });
});
