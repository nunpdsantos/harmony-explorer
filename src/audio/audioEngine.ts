import * as Tone from 'tone';

/**
 * Singleton audio engine wrapping Tone.js.
 * Handles synth creation, chord playback, and progression sequencing.
 */

let synth: Tone.PolySynth | null = null;
let reverb: Tone.Reverb | null = null;
let isInitialized = false;

/** Ensure Tone.js audio context is started (must be called from user gesture) */
export async function initAudio(): Promise<void> {
  if (isInitialized) return;

  await Tone.start();

  reverb = new Tone.Reverb({ decay: 2, wet: 0.25 }).toDestination();

  synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.02,
      decay: 0.3,
      sustain: 0.4,
      release: 1.0,
    },
    volume: -8,
  }).connect(reverb);

  isInitialized = true;
}

/** Convert MIDI note number to frequency name (e.g., 60 → "C4") */
function midiToNoteName(midi: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const note = noteNames[midi % 12];
  return `${note}${octave}`;
}

/** Play a single chord (array of MIDI note numbers) */
export function playChord(midiNotes: number[], duration: string = '2n'): void {
  if (!synth || !isInitialized) return;

  const noteNames = midiNotes.map(midiToNoteName);
  synth.triggerAttackRelease(noteNames, duration);
}

/** Play a chord and release after a specific time in seconds */
export function playChordForDuration(midiNotes: number[], durationSec: number): void {
  if (!synth || !isInitialized) return;

  const noteNames = midiNotes.map(midiToNoteName);
  synth.triggerAttackRelease(noteNames, durationSec);
}

/**
 * Play a progression of voiced chords with a callback for each step.
 * Returns a cancel function.
 */
export function playProgression(
  voicedChords: number[][],
  bpm: number,
  onStep: (index: number) => void,
  onComplete: () => void,
  loop: boolean = false,
): () => void {
  if (!synth || !isInitialized) {
    onComplete();
    return () => {};
  }

  const beatDuration = 60 / bpm; // seconds per beat
  const chordDuration = beatDuration * 2; // 2 beats per chord
  let currentIndex = 0;
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout>;

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
    playChordForDuration(voicedChords[currentIndex], chordDuration * 0.9);
    currentIndex++;

    timeoutId = setTimeout(playNext, chordDuration * 1000);
  }

  playNext();

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
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
