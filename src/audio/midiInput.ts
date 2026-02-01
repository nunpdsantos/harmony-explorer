/**
 * Optional Web MIDI input support.
 * Gracefully degrades if Web MIDI is unavailable.
 */

type NoteCallback = (note: number, velocity: number) => void;

let midiAccess: MIDIAccess | null = null;
let noteOnCallback: NoteCallback | null = null;
let noteOffCallback: ((note: number) => void) | null = null;

function handleMIDIMessage(event: MIDIMessageEvent) {
  const data = event.data;
  if (!data || data.length < 3) return;

  const status = data[0] & 0xf0;
  const note = data[1];
  const velocity = data[2];

  if (status === 0x90 && velocity > 0) {
    // Note On
    noteOnCallback?.(note, velocity / 127);
  } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
    // Note Off
    noteOffCallback?.(note);
  }
}

/**
 * Initialize Web MIDI input. Returns true if successful, false if unavailable.
 */
export async function initMIDIInput(): Promise<boolean> {
  if (!navigator.requestMIDIAccess) {
    return false;
  }

  try {
    midiAccess = await navigator.requestMIDIAccess();

    // Listen on all input devices
    for (const input of midiAccess.inputs.values()) {
      input.onmidimessage = handleMIDIMessage;
    }

    // Handle newly connected devices
    midiAccess.onstatechange = () => {
      if (!midiAccess) return;
      for (const input of midiAccess.inputs.values()) {
        input.onmidimessage = handleMIDIMessage;
      }
    };

    return true;
  } catch {
    return false;
  }
}

/**
 * Register a callback for MIDI note-on events.
 */
export function onMIDINoteOn(callback: NoteCallback): void {
  noteOnCallback = callback;
}

/**
 * Register a callback for MIDI note-off events.
 */
export function onMIDINoteOff(callback: (note: number) => void): void {
  noteOffCallback = callback;
}

/**
 * Check if Web MIDI is available in this browser.
 */
export function isMIDIAvailable(): boolean {
  return !!navigator.requestMIDIAccess;
}

/**
 * Get list of connected MIDI input device names.
 */
export function getMIDIInputNames(): string[] {
  if (!midiAccess) return [];
  const names: string[] = [];
  for (const input of midiAccess.inputs.values()) {
    if (input.name) names.push(input.name);
  }
  return names;
}
