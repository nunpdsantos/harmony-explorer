/**
 * Audio preset definitions for different instrument timbres.
 * Each preset configures oscillator type, ADSR envelope, and effect parameters.
 */

export interface AudioPreset {
  name: string;
  oscillator: 'triangle' | 'sine' | 'square' | 'sawtooth';
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  reverb: {
    decay: number;
    wet: number;
  };
  volume: number;
}

export type PresetName = 'piano' | 'rhodes' | 'organ' | 'pad' | 'strings';

export const PRESETS: Record<PresetName, AudioPreset> = {
  piano: {
    name: 'Piano',
    oscillator: 'triangle',
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 1.0,
    },
    reverb: { decay: 2, wet: 0.25 },
    volume: -8,
  },
  rhodes: {
    name: 'Rhodes',
    oscillator: 'sine',
    envelope: {
      attack: 0.01,
      decay: 0.5,
      sustain: 0.3,
      release: 1.5,
    },
    reverb: { decay: 2.5, wet: 0.3 },
    volume: -6,
  },
  organ: {
    name: 'Organ',
    oscillator: 'square',
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.8,
      release: 0.3,
    },
    reverb: { decay: 1.5, wet: 0.2 },
    volume: -14,
  },
  pad: {
    name: 'Pad',
    oscillator: 'sawtooth',
    envelope: {
      attack: 0.4,
      decay: 0.5,
      sustain: 0.7,
      release: 2.5,
    },
    reverb: { decay: 3.5, wet: 0.45 },
    volume: -12,
  },
  strings: {
    name: 'Strings',
    oscillator: 'sawtooth',
    envelope: {
      attack: 0.3,
      decay: 0.4,
      sustain: 0.6,
      release: 2.0,
    },
    reverb: { decay: 3, wet: 0.35 },
    volume: -10,
  },
};

export const PRESET_NAMES: PresetName[] = ['piano', 'rhodes', 'organ', 'pad', 'strings'];
