import React, { useEffect, useRef } from 'react';
import type { VisualizationProps } from '../shared/types';
import { chordName } from '../../core/chords';
import { getDiatonicInfo } from '../../core/harmony';
import { voiceProgression } from '../../audio/voicingEngine';
import { useStore } from '../../state/store';
import {
  COLOR_TEXT_MUTED,
  COLOR_ACCENT,
  FONT_SIZE_SM,
  FONT_SIZE_LG,
} from '../../styles/theme';

/* ─── Key signature mapping (pitch class → VexFlow key string) ─── */
const KEY_SIGS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const FLAT_KEYS = new Set([1, 3, 5, 8, 10]); // Db, Eb, F, Ab, Bb use flats

const SHARP_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
const FLAT_NAMES = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];

/* ─── Helpers ─── */

function keySig(root: number): string {
  return KEY_SIGS[root] ?? 'C';
}

function prefersFlats(root: number): boolean {
  return FLAT_KEYS.has(root);
}

/** Convert MIDI note number to VexFlow key string (e.g. "c#/4") */
function midiToVex(midi: number, flat: boolean): string {
  const names = flat ? FLAT_NAMES : SHARP_NAMES;
  const pc = midi % 12;
  const oct = Math.floor(midi / 12) - 1;
  return `${names[pc]}/${oct}`;
}

/** Get accidental string for a pitch class, or null if natural */
function accidentalFor(pc: number, flat: boolean): string | null {
  if (flat) {
    return [null, 'b', null, 'b', null, null, 'b', null, 'b', null, 'b', null][pc] ?? null;
  }
  return [null, '#', null, '#', null, null, '#', null, '#', null, '#', null][pc] ?? null;
}

/** Split a voicing into treble (≥ C4) and bass (< C4) parts */
function splitVoicing(voicing: number[]): { treble: number[]; bass: number[] } {
  const treble = voicing.filter(n => n >= 60);
  const bass = voicing.filter(n => n < 60);

  // Ensure both staves have at least one note
  if (treble.length === 0 && bass.length > 0) {
    treble.push(bass.pop()!);
  }
  if (bass.length === 0 && treble.length > 0) {
    bass.push(treble.shift()!);
  }

  return { treble, bass };
}

/* ─── Layout constants ─── */
const FIRST_MW = 170;   // first measure width (clef + key sig + time sig)
const NORM_MW = 120;    // normal measure width
const TREBLE_OFF = 30;  // treble stave y-offset within system
const BASS_OFF = 110;   // bass stave y-offset within system
const SYS_H = 210;      // total system height
const SYS_GAP = 20;     // gap between systems
const TOP_M = 10;

/* ─── Main render function ─── */

interface VF {
  Renderer: typeof import('vexflow').Renderer;
  Stave: typeof import('vexflow').Stave;
  StaveNote: typeof import('vexflow').StaveNote;
  Voice: typeof import('vexflow').Voice;
  Formatter: typeof import('vexflow').Formatter;
  Accidental: typeof import('vexflow').Accidental;
  Annotation: typeof import('vexflow').Annotation;
  StaveConnector: typeof import('vexflow').StaveConnector;
}

function renderNotation(
  el: HTMLDivElement,
  vf: VF,
  progression: import('../../core/chords').Chord[],
  voicings: number[][],
  referenceRoot: number,
  containerWidth: number,
  _containerHeight: number,
  playingIdx: number,
) {
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Annotation, StaveConnector } = vf;

  const flat = prefersFlats(referenceRoot);
  const key = keySig(referenceRoot);
  const n = progression.length;

  // Calculate lines
  const usableW = containerWidth - 48; // padding
  const firstLineCap = Math.max(1, 1 + Math.floor((usableW - FIRST_MW) / NORM_MW));
  const otherLineCap = Math.max(1, Math.floor(usableW / NORM_MW));

  const lines: number[] = [];
  let rem = n;
  lines.push(Math.min(rem, firstLineCap));
  rem -= lines[0];
  while (rem > 0) {
    const c = Math.min(rem, otherLineCap);
    lines.push(c);
    rem -= c;
  }

  const totalH = TOP_M + lines.length * (SYS_H + SYS_GAP) + 20;
  const svgW = Math.max(usableW, 300);
  const svgH = Math.max(totalH, 200);

  // Create renderer
  const renderer = new Renderer(el, Renderer.Backends.SVG);
  renderer.resize(svgW, svgH);
  const ctx = renderer.getContext();

  let chordIdx = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const count = lines[lineIdx];
    const sysY = TOP_M + lineIdx * (SYS_H + SYS_GAP);

    let xOff = 16;

    for (let i = 0; i < count; i++) {
      const isFirst = lineIdx === 0 && i === 0;
      const isLineStart = i === 0;
      const mw = isFirst ? FIRST_MW : NORM_MW;

      // Create staves
      const treble = new Stave(xOff, sysY + TREBLE_OFF, mw);
      const bass = new Stave(xOff, sysY + BASS_OFF, mw);

      if (isFirst) {
        treble.addClef('treble').addKeySignature(key).addTimeSignature('4/4');
        bass.addClef('bass').addKeySignature(key).addTimeSignature('4/4');
      } else if (isLineStart) {
        treble.addClef('treble').addKeySignature(key);
        bass.addClef('bass').addKeySignature(key);
      }

      treble.setContext(ctx).draw();
      bass.setContext(ctx).draw();

      // Connectors
      if (isLineStart) {
        new StaveConnector(treble, bass)
          .setType(StaveConnector.type.BRACE)
          .setContext(ctx)
          .draw();
        new StaveConnector(treble, bass)
          .setType(StaveConnector.type.SINGLE_LEFT)
          .setContext(ctx)
          .draw();
      }
      if (i === count - 1) {
        new StaveConnector(treble, bass)
          .setType(StaveConnector.type.SINGLE_RIGHT)
          .setContext(ctx)
          .draw();
      }

      // Voicing → notes
      const voicing = voicings[chordIdx] ?? [];
      const { treble: tNotes, bass: bNotes } = splitVoicing([...voicing]);

      const createNote = (midiNotes: number[], clef: string) => {
        if (midiNotes.length === 0) {
          return new StaveNote({
            keys: [clef === 'treble' ? 'b/4' : 'd/3'],
            duration: 'wr',
            clef,
          });
        }
        const keys = midiNotes.map(m => midiToVex(m, flat));
        const note = new StaveNote({ keys, duration: 'w', clef });

        // Add accidentals
        midiNotes.forEach((m, idx) => {
          const acc = accidentalFor(m % 12, flat);
          if (acc) {
            note.addModifier(new Accidental(acc), idx);
          }
        });

        // Highlight playing chord
        if (chordIdx === playingIdx) {
          note.setStyle({ fillStyle: COLOR_ACCENT, strokeStyle: COLOR_ACCENT });
        }

        return note;
      };

      const trebleNote = createNote(tNotes, 'treble');
      const bassNote = createNote(bNotes, 'bass');

      // Chord symbol above treble (on first note only)
      if (tNotes.length > 0 || bNotes.length > 0) {
        const ann = new Annotation(chordName(progression[chordIdx]));
        ann.setFont('sans-serif', 12, 'bold');
        ann.setVerticalJustification(1); // TOP
        trebleNote.addModifier(ann);
      }

      // Roman numeral below bass
      const info = getDiatonicInfo(progression[chordIdx], referenceRoot);
      if (info) {
        const roman = new Annotation(info.roman);
        roman.setFont('serif', 11, 'normal');
        roman.setVerticalJustification(4); // BOTTOM_STAVE
        bassNote.addModifier(roman);
      }

      // Create voices and format
      const noteWidth = mw - (isFirst ? 90 : 40);
      const tv = new Voice({ numBeats: 4, beatValue: 4 }).addTickables([trebleNote]);
      const bv = new Voice({ numBeats: 4, beatValue: 4 }).addTickables([bassNote]);

      try {
        new Formatter().joinVoices([tv]).format([tv], noteWidth);
        new Formatter().joinVoices([bv]).format([bv], noteWidth);
      } catch {
        // Formatter can fail with very small widths — skip
      }

      tv.draw(ctx, treble);
      bv.draw(ctx, bass);

      xOff += mw;
      chordIdx++;
    }
  }
}

/* ─── Component ─── */

export const SheetMusic: React.FC<VisualizationProps> = ({
  referenceRoot,
  width,
  height,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progression = useStore(s => s.progression);
  const playingIndex = useStore(s => s.playingIndex);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || progression.length === 0) return;

    let cancelled = false;

    (async () => {
      const vf = await import('vexflow');
      if (cancelled) return;

      el.innerHTML = '';
      const voicings = voiceProgression(progression);

      try {
        renderNotation(
          el,
          vf as unknown as VF,
          progression,
          voicings,
          referenceRoot,
          width - 48, // account for padding
          height,
          playingIndex,
        );
      } catch {
        el.innerHTML = '<p style="color: #999; padding: 16px;">Could not render notation</p>';
      }
    })();

    return () => { cancelled = true; };
  }, [progression, referenceRoot, width, height, playingIndex]);

  if (progression.length === 0) {
    return (
      <svg width={width} height={height} role="img" aria-label="Sheet music — empty">
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fill={COLOR_TEXT_MUTED}
          fontSize={FONT_SIZE_LG}
        >
          Add chords to the progression to see notation
        </text>
        <text
          x={width / 2}
          y={height / 2 + 24}
          textAnchor="middle"
          fill={COLOR_TEXT_MUTED}
          fontSize={FONT_SIZE_SM}
        >
          Click chords in any visualization to build a progression
        </text>
      </svg>
    );
  }

  return (
    <div
      className="w-full h-full overflow-auto p-4"
      role="img"
      aria-label={`Sheet music showing ${progression.length} chord progression`}
    >
      <div className="bg-white/95 rounded-lg shadow-lg p-4 inline-block min-w-full">
        <div ref={containerRef} />
      </div>
    </div>
  );
};
