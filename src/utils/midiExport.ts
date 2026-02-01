import type { Chord } from '../core/chords';
import { getIntervals } from '../core/chords';

/**
 * MIDI file generation — Type 0 (single track) with no external dependencies.
 * Manually constructs the binary MIDI format.
 */

const MIDI_HEADER = [0x4D, 0x54, 0x68, 0x64]; // "MThd"
const TRACK_HEADER = [0x4D, 0x54, 0x72, 0x6B]; // "MTrk"

/** Encode a number as a MIDI variable-length quantity */
function writeVLQ(value: number): number[] {
  if (value < 0) value = 0;
  if (value < 0x80) return [value];

  const bytes: number[] = [];
  bytes.unshift(value & 0x7F);
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7F) | 0x80);
    value >>= 7;
  }
  return bytes;
}

/** Write a 16-bit big-endian value */
function write16(value: number): number[] {
  return [(value >> 8) & 0xFF, value & 0xFF];
}

/** Write a 32-bit big-endian value */
function write32(value: number): number[] {
  return [
    (value >> 24) & 0xFF,
    (value >> 16) & 0xFF,
    (value >> 8) & 0xFF,
    value & 0xFF,
  ];
}

/** Convert a chord to MIDI note numbers using close voicing around middle C */
function chordToMidiNotes(chord: Chord, baseOctave: number = 4): number[] {
  const intervals = getIntervals(chord.quality);
  const baseNote = chord.root + baseOctave * 12 + 12; // MIDI: C4 = 60, so root 0 (C) at octave 4 = 60
  return intervals.map(interval => baseNote + interval);
}

/**
 * Export a chord progression as a Type 0 MIDI file.
 *
 * @param chords - Array of Chord objects
 * @param bpm - Tempo in beats per minute (default 120)
 * @param beatsPerChord - Duration of each chord in beats (default 2)
 * @returns Uint8Array containing the complete MIDI file
 */
export function exportProgressionAsMidi(
  chords: Chord[],
  bpm: number = 120,
  beatsPerChord: number = 2,
): Uint8Array {
  const ticksPerBeat = 480; // Standard resolution
  const chordTicks = beatsPerChord * ticksPerBeat;
  const velocity = 80;

  // Build track data
  const trackData: number[] = [];

  // Tempo meta event: FF 51 03 <tempo in microseconds per beat>
  const microsecondsPerBeat = Math.round(60_000_000 / bpm);
  trackData.push(
    0x00,       // delta time
    0xFF, 0x51, 0x03,
    (microsecondsPerBeat >> 16) & 0xFF,
    (microsecondsPerBeat >> 8) & 0xFF,
    microsecondsPerBeat & 0xFF,
  );

  // Program change to piano (channel 0, program 0)
  trackData.push(0x00, 0xC0, 0x00);

  // Write chord events
  for (let i = 0; i < chords.length; i++) {
    const notes = chordToMidiNotes(chords[i]);

    // Note On events (all at delta time 0 except first note of first chord)
    for (let n = 0; n < notes.length; n++) {
      trackData.push(...writeVLQ(n === 0 && i > 0 ? 0 : 0)); // delta = 0 for simultaneous
      trackData.push(0x90, notes[n] & 0x7F, velocity);
    }

    // Note Off events after chordTicks
    for (let n = 0; n < notes.length; n++) {
      trackData.push(...writeVLQ(n === 0 ? chordTicks : 0)); // Only first note has delta
      trackData.push(0x80, notes[n] & 0x7F, 0x00);
    }
  }

  // End of track meta event
  trackData.push(0x00, 0xFF, 0x2F, 0x00);

  // Assemble complete MIDI file
  const fileData: number[] = [];

  // Header chunk: MThd, length=6, format=0, tracks=1, ticksPerBeat
  fileData.push(...MIDI_HEADER);
  fileData.push(...write32(6));        // Header data length
  fileData.push(...write16(0));        // Format 0
  fileData.push(...write16(1));        // 1 track
  fileData.push(...write16(ticksPerBeat));

  // Track chunk: MTrk, length, data
  fileData.push(...TRACK_HEADER);
  fileData.push(...write32(trackData.length));
  fileData.push(...trackData);

  return new Uint8Array(fileData);
}

/**
 * Trigger a browser download of a MIDI file.
 */
export function downloadMidi(data: Uint8Array, filename: string = 'progression.mid'): void {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
