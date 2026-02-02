import { describe, it, expect } from 'vitest';
import { exportProgressionAsMidi, exportProgressionAsMidiVoiced } from '../midiExport';
import { voiceProgression } from '../../audio/voicingEngine';
import type { Chord } from '../../core/chords';

describe('MIDI Export', () => {
  const cMajor: Chord = { root: 0, quality: 'major' };
  const gMajor: Chord = { root: 7, quality: 'major' };

  it('returns a Uint8Array', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('starts with MThd header', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    // "MThd" = 0x4D, 0x54, 0x68, 0x64
    expect(result[0]).toBe(0x4D);
    expect(result[1]).toBe(0x54);
    expect(result[2]).toBe(0x68);
    expect(result[3]).toBe(0x64);
  });

  it('header data length is 6', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    // Bytes 4-7: 32-bit big-endian length = 6
    const len = (result[4] << 24) | (result[5] << 16) | (result[6] << 8) | result[7];
    expect(len).toBe(6);
  });

  it('format is 0 (single track)', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    // Bytes 8-9: format
    const format = (result[8] << 8) | result[9];
    expect(format).toBe(0);
  });

  it('has 1 track', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    // Bytes 10-11: number of tracks
    const tracks = (result[10] << 8) | result[11];
    expect(tracks).toBe(1);
  });

  it('ticks per beat is 480', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    // Bytes 12-13: ticks per beat
    const tpb = (result[12] << 8) | result[13];
    expect(tpb).toBe(480);
  });

  it('contains MTrk track header', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    // After 14 bytes of header, track starts with "MTrk"
    expect(result[14]).toBe(0x4D);
    expect(result[15]).toBe(0x54);
    expect(result[16]).toBe(0x72);
    expect(result[17]).toBe(0x6B);
  });

  it('contains tempo meta event', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    // After header (14 bytes) + MTrk (4 bytes) + length (4 bytes) = byte 22
    // Delta time (1 byte) + FF 51 03
    expect(result[22]).toBe(0x00); // delta time
    expect(result[23]).toBe(0xFF); // meta event
    expect(result[24]).toBe(0x51); // tempo
    expect(result[25]).toBe(0x03); // length

    // At 120 BPM: 60,000,000 / 120 = 500,000 microseconds
    const tempo = (result[26] << 16) | (result[27] << 8) | result[28];
    expect(tempo).toBe(500000);
  });

  it('encodes correct tempo for different BPMs', () => {
    const result80 = exportProgressionAsMidi([cMajor], 80);
    const tempo80 = (result80[26] << 16) | (result80[27] << 8) | result80[28];
    expect(tempo80).toBe(750000); // 60,000,000 / 80

    const result60 = exportProgressionAsMidi([cMajor], 60);
    const tempo60 = (result60[26] << 16) | (result60[27] << 8) | result60[28];
    expect(tempo60).toBe(1000000); // 60,000,000 / 60
  });

  it('contains note-on events (0x90)', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    const data = Array.from(result);
    const hasNoteOn = data.some((b, i) => b === 0x90 && i > 22);
    expect(hasNoteOn).toBe(true);
  });

  it('contains note-off events (0x80)', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    const data = Array.from(result);
    const hasNoteOff = data.some((b, i) => b === 0x80 && i > 22);
    expect(hasNoteOff).toBe(true);
  });

  it('ends with end-of-track meta event', () => {
    const result = exportProgressionAsMidi([cMajor], 120);
    const len = result.length;
    // End of track: 00 FF 2F 00
    expect(result[len - 4]).toBe(0x00);
    expect(result[len - 3]).toBe(0xFF);
    expect(result[len - 2]).toBe(0x2F);
    expect(result[len - 1]).toBe(0x00);
  });

  it('produces larger output for more chords', () => {
    const single = exportProgressionAsMidi([cMajor], 120);
    const double = exportProgressionAsMidi([cMajor, gMajor], 120);
    expect(double.length).toBeGreaterThan(single.length);
  });

  it('produces valid output for empty progression', () => {
    const result = exportProgressionAsMidi([], 120);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBeGreaterThan(14); // At minimum has header + track
  });
});

describe('MIDI Export (Voiced)', () => {
  const cMajor: Chord = { root: 0, quality: 'major' };
  const fMajor: Chord = { root: 5, quality: 'major' };
  const gDom7: Chord = { root: 7, quality: 'dom7' };
  const progression = [cMajor, fMajor, gDom7];

  it('returns a Uint8Array', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('starts with MThd header', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings);
    expect(result[0]).toBe(0x4D);
    expect(result[1]).toBe(0x54);
    expect(result[2]).toBe(0x68);
    expect(result[3]).toBe(0x64);
  });

  it('contains key signature meta event (FF 59 02)', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings, 120, 0);
    const bytes = Array.from(result);
    let found = false;
    for (let i = 0; i < bytes.length - 2; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0x59 && bytes[i + 2] === 0x02) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('key of C has 0 sharps/flats', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings, 120, 0);
    const bytes = Array.from(result);
    for (let i = 0; i < bytes.length - 4; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0x59 && bytes[i + 2] === 0x02) {
        // sf byte: 0 for C major
        expect(bytes[i + 3]).toBe(0x00);
        // mi byte: 0 for major
        expect(bytes[i + 4]).toBe(0x00);
        break;
      }
    }
  });

  it('contains time signature meta event (FF 58 04)', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings);
    const bytes = Array.from(result);
    let found = false;
    for (let i = 0; i < bytes.length - 2; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0x58 && bytes[i + 2] === 0x04) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('contains text events (FF 01) for chord names', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings);
    const bytes = Array.from(result);
    let textEventCount = 0;
    for (let i = 0; i < bytes.length - 1; i++) {
      if (bytes[i] === 0xFF && bytes[i + 1] === 0x01) {
        textEventCount++;
      }
    }
    expect(textEventCount).toBe(3); // one per chord
  });

  it('ends with end-of-track meta event', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings);
    const len = result.length;
    expect(result[len - 4]).toBe(0x00);
    expect(result[len - 3]).toBe(0xFF);
    expect(result[len - 2]).toBe(0x2F);
    expect(result[len - 1]).toBe(0x00);
  });

  it('voiced version is larger than basic (more metadata)', () => {
    const voicings = voiceProgression(progression);
    const voiced = exportProgressionAsMidiVoiced(progression, voicings);
    const basic = exportProgressionAsMidi(progression);
    expect(voiced.length).toBeGreaterThan(basic.length);
  });

  it('different key roots produce different key signatures', () => {
    const voicings = voiceProgression(progression);
    const inC = exportProgressionAsMidiVoiced(progression, voicings, 120, 0);
    const inG = exportProgressionAsMidiVoiced(progression, voicings, 120, 7);
    // They should differ in the key signature bytes
    expect(inC).not.toEqual(inG);
  });

  it('contains note-on and note-off events', () => {
    const voicings = voiceProgression(progression);
    const result = exportProgressionAsMidiVoiced(progression, voicings);
    const bytes = Array.from(result);
    expect(bytes.some((b, i) => b === 0x90 && i > 22)).toBe(true);
    expect(bytes.some((b, i) => b === 0x80 && i > 22)).toBe(true);
  });
});
