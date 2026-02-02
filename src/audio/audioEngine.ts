import { PRESETS, type PresetName, type AudioPreset } from './presets';
import { humanizeVelocity, humanizeTiming } from './humanize';
import { ARP_PATTERNS, type ArpPatternName } from './arpeggiation';
import { RHYTHM_PATTERNS, type RhythmPatternName } from './rhythmPatterns';

/**
 * Singleton audio engine wrapping Tone.js.
 * Handles synth creation, chord playback, and progression sequencing.
 * Supports switchable presets and humanization.
 *
 * Tone.js is loaded lazily on first initAudio() call to reduce initial bundle size.
 */

// Tone.js types — resolved after dynamic import
type ToneModule = typeof import('tone');
let Tone: ToneModule | null = null;

let synth: import('tone').PolySynth | null = null;
let reverb: import('tone').Reverb | null = null;
let isInitialized = false;
let currentPreset: PresetName = 'piano';

/** Apply a preset to the existing synth */
function applySynthSettings(preset: AudioPreset): void {
  if (!synth) return;
  synth.set({
    oscillator: { type: preset.oscillator },
    envelope: preset.envelope,
    volume: preset.volume,
  });
}

/** Ensure Tone.js audio context is started (must be called from user gesture) */
export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  // Lazy-load Tone.js on first use
  if (!Tone) {
    Tone = await import('tone');
  }

  await Tone.start();

  const preset = PRESETS[currentPreset];

  reverb = new Tone.Reverb({ decay: preset.reverb.decay, wet: preset.reverb.wet }).toDestination();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: preset.oscillator },
    envelope: preset.envelope,
    volume: preset.volume,
  }).connect(reverb);

  isInitialized = true;
}

/** Switch to a different audio preset */
export function setPreset(name: PresetName): void {
  currentPreset = name;
  const preset = PRESETS[name];

  if (synth) {
    applySynthSettings(preset);
  }

  if (reverb) {
    reverb.decay = preset.reverb.decay;
    reverb.wet.value = preset.reverb.wet;
  }
}

/** Get the current preset name */
export function getPreset(): PresetName {
  return currentPreset;
}

/** Convert MIDI note number to frequency name (e.g., 60 → "C4") */
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return `${note}${octave}`;
}

/** Play a single chord (array of MIDI note numbers) */
export function playChord(midiNotes: number[], duration: string = '2n', velocity?: number): void {
  if (!synth || !isInitialized) return;

  const noteNames = midiNotes.map(midiToNoteName);
  const vel = velocity ?? 0.7;
  synth.triggerAttackRelease(noteNames, duration, undefined, vel);
}

/** Play a chord and release after a specific time in seconds */
export function playChordForDuration(midiNotes: number[], durationSec: number, velocity?: number): void {
  if (!synth || !isInitialized) return;

  const noteNames = midiNotes.map(midiToNoteName);
  const vel = velocity ?? 0.7;
  synth.triggerAttackRelease(noteNames, durationSec, undefined, vel);
}

/**
 * Play a progression of voiced chords with a callback for each step.
 * Supports arpeggiation and rhythm patterns.
 * Returns a cancel function.
 */
export function playProgression(
  voicedChords: number[][],
  bpm: number,
  onStep: (index: number) => void,
  onComplete: () => void,
  loop: boolean = false,
  humanize: number = 0,
  arpPattern: ArpPatternName = 'block',
  rhythmPattern: RhythmPatternName = 'whole',
): () => void {
  if (!synth || !isInitialized) {
    onComplete();
    return () => {};
  }

  const beatDuration = 60 / bpm; // seconds per beat
  const chordDuration = beatDuration * 2; // 2 beats per chord
  let currentIndex = 0;
  let cancelled = false;
  const timeoutIds: ReturnType<typeof setTimeout>[] = [];

  function clearTimeouts() {
    for (const id of timeoutIds) clearTimeout(id);
    timeoutIds.length = 0;
  }

  const arp = ARP_PATTERNS[arpPattern];
  const rhythm = RHYTHM_PATTERNS[rhythmPattern];

  function playNext() {
    if (cancelled) return;

    if (currentIndex >= voicedChords.length) {
      if (loop) {
        currentIndex = 0;
      } else {
        onComplete();
        return;
      }
    }

    onStep(currentIndex);

    const voicing = voicedChords[currentIndex];
    const arpNotes = arp.generate(voicing);

    // Schedule rhythm hits within this chord's duration
    for (const hit of rhythm.hits) {
      const hitDelay = hit.offset * chordDuration * 1000;
      const hitDuration = hit.duration * chordDuration;

      const id = setTimeout(() => {
        if (cancelled) return;

        // For each rhythm hit, play arpeggiated notes subdivided within the hit
        const arpCount = arpNotes.length;
        const arpSubdivision = hitDuration / arpCount;

        for (let a = 0; a < arpCount; a++) {
          const arpDelay = a * arpSubdivision * 1000;
          const arpId = setTimeout(() => {
            if (cancelled) return;
            const velocity = humanize > 0
              ? humanizeVelocity(0.7 * hit.accent, humanize)
              : 0.7 * hit.accent;
            playChordForDuration(arpNotes[a], arpSubdivision * 0.9, velocity);
          }, arpDelay);
          timeoutIds.push(arpId);
        }
      }, humanize > 0 ? humanizeTiming(hitDelay, humanize) : hitDelay);
      timeoutIds.push(id);
    }

    currentIndex++;

    const nextTime = humanize > 0
      ? humanizeTiming(chordDuration * 1000, humanize)
      : chordDuration * 1000;

    const nextId = setTimeout(playNext, nextTime);
    timeoutIds.push(nextId);
  }

  playNext();

  return () => {
    cancelled = true;
    clearTimeouts();
    if (synth) {
      synth.releaseAll();
    }
  };
}

/** Set the main volume (in dB) */
export function setVolume(db: number): void {
  if (synth) synth.volume.value = db;
}

/** Check if audio is initialized */
export function isAudioReady(): boolean {
  return isInitialized;
}

/** Release all currently sounding notes */
export function stopAll(): void {
  if (synth) synth.releaseAll();
}
