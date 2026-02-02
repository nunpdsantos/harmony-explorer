import React, { useState, useCallback, useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { chordPitchClasses, chordName } from '../../core/chords';
import { noteName } from '../../core/constants';
import {
  STANDARD_TUNING,
  TUNINGS,
  TUNING_NAMES,
  getGuitarShapes,
  midiNote,
  type GuitarChordShape,
  type Tuning,
} from '../../core/guitarVoicings';
import {
  QUALITY_COLORS,
  COLOR_QUALITY_FALLBACK,
  COLOR_FRETBOARD_WOOD,
  COLOR_FRET_WIRE,
  COLOR_STRING,
  COLOR_NUT,
  COLOR_FRET_DOT,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_MUTED,
  COLOR_ACCENT,
  FONT_SIZE_XS,
  FONT_SIZE_SM,
  FONT_SIZE_MD,
  FONT_SIZE_2XL,
} from '../../styles/theme';
import { useStore } from '../../state/store';

const NUM_FRETS = 15;
const NUM_STRINGS = 6;
/** Fret positions with inlay dots */
const DOT_FRETS = new Set([3, 5, 7, 9, 12, 15]);
const DOUBLE_DOT_FRETS = new Set([12]);

export const GuitarFretboard: React.FC<VisualizationProps> = ({
  selectedChord,
  hoveredChord,
  width,
  height,
}) => {
  const audioReady = useStore(s => s.audioReady);
  const setAudioReady = useStore(s => s.setAudioReady);

  const [tuningName, setTuningName] = useState('standard');
  const [shapeIndex, setShapeIndex] = useState(0);
  const [pressed, setPressed] = useState<number | null>(null);

  const tuning: Tuning = TUNINGS[tuningName] ?? STANDARD_TUNING;
  const chord = hoveredChord ?? selectedChord;

  // Get chord shapes
  const shapes = useMemo(() => {
    if (!chord) return [];
    return getGuitarShapes(chord.root, chord.quality, tuning);
  }, [chord, tuning]);

  const currentShape: GuitarChordShape | null = shapes[shapeIndex % Math.max(shapes.length, 1)] ?? null;
  const activePcs = chord ? new Set(chordPitchClasses(chord)) : new Set<number>();
  const rootPc = chord?.root ?? -1;
  const qualityColor = chord
    ? (QUALITY_COLORS[chord.quality] ?? COLOR_QUALITY_FALLBACK)
    : COLOR_QUALITY_FALLBACK;

  // Layout calculations
  const pad = 16;
  const leftLabelW = 24;
  const topLabelH = 20;
  const controlBarH = 36;
  const availW = Math.max(200, width - pad * 2 - leftLabelW);
  const availH = Math.max(120, height - pad * 2 - topLabelH - controlBarH);
  const fretW = availW / (NUM_FRETS + 1);
  const stringSpacing = availH / (NUM_STRINGS + 1);

  // Play a single note
  const play = useCallback(async (midi: number) => {
    setPressed(midi);
    setTimeout(() => setPressed(null), 180);
    const ae = await import('../../audio/audioEngine');
    if (!audioReady) {
      await ae.initAudio();
      setAudioReady(true);
    }
    ae.playChord([midi], '4n');
  }, [audioReady, setAudioReady]);

  // Cycle to next shape
  const nextShape = useCallback(() => {
    setShapeIndex(prev => (prev + 1) % Math.max(shapes.length, 1));
  }, [shapes.length]);

  return (
    <div className="flex flex-col items-center" style={{ width, height }}>
      {/* Control bar */}
      <div className="flex items-center gap-3 px-3" style={{ height: controlBarH }}>
        {chord && (
          <span className="text-sm font-bold" style={{ color: qualityColor }}>
            {chordName(chord)}
          </span>
        )}

        {shapes.length > 1 && (
          <button
            onClick={nextShape}
            className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/60 transition-colors"
          >
            {currentShape?.label ?? 'Shape'} ({(shapeIndex % shapes.length) + 1}/{shapes.length})
          </button>
        )}

        <select
          value={tuningName}
          onChange={e => { setTuningName(e.target.value); setShapeIndex(0); }}
          className="text-[10px] bg-white/5 text-white/60 rounded px-1.5 py-0.5 border border-white/10"
          aria-label="Guitar tuning"
        >
          {TUNING_NAMES.map(name => (
            <option key={name} value={name}>
              {name === 'standard' ? 'Standard' : name}
            </option>
          ))}
        </select>
      </div>

      {/* SVG fretboard */}
      <svg
        width={width}
        height={height - controlBarH}
        role="img"
        aria-label="Guitar fretboard"
        style={{ userSelect: 'none' }}
      >
        <defs>
          <linearGradient id="fretboard-bg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLOR_FRETBOARD_WOOD} stopOpacity="0.9" />
            <stop offset="100%" stopColor={COLOR_FRETBOARD_WOOD} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Fretboard background */}
        <rect
          x={pad + leftLabelW}
          y={pad + topLabelH}
          width={availW}
          height={stringSpacing * (NUM_STRINGS - 1) + stringSpacing}
          rx={4}
          fill="url(#fretboard-bg)"
        />

        {/* Fret wires */}
        {Array.from({ length: NUM_FRETS + 1 }, (_, f) => {
          const x = pad + leftLabelW + (f + 1) * fretW;
          return (
            <line
              key={`fret-${f}`}
              x1={x}
              y1={pad + topLabelH + stringSpacing * 0.5}
              x2={x}
              y2={pad + topLabelH + stringSpacing * (NUM_STRINGS - 0.5)}
              stroke={f === 0 ? COLOR_NUT : COLOR_FRET_WIRE}
              strokeWidth={f === 0 ? 3 : 1}
            />
          );
        })}

        {/* Fret number labels */}
        {Array.from({ length: NUM_FRETS }, (_, f) => {
          const x = pad + leftLabelW + (f + 1) * fretW + fretW / 2;
          return (
            <text
              key={`fn-${f}`}
              x={x}
              y={pad + topLabelH * 0.75}
              textAnchor="middle"
              fontSize={FONT_SIZE_XS}
              fill={COLOR_TEXT_MUTED}
            >
              {f + 1}
            </text>
          );
        })}

        {/* Inlay dots */}
        {Array.from({ length: NUM_FRETS }, (_, f) => {
          if (!DOT_FRETS.has(f + 1)) return null;
          const cx = pad + leftLabelW + (f + 1) * fretW + fretW / 2;
          const midY = pad + topLabelH + stringSpacing * (NUM_STRINGS / 2);

          if (DOUBLE_DOT_FRETS.has(f + 1)) {
            return (
              <g key={`dot-${f}`}>
                <circle cx={cx} cy={midY - stringSpacing * 1.2} r={4} fill={COLOR_FRET_DOT} />
                <circle cx={cx} cy={midY + stringSpacing * 1.2} r={4} fill={COLOR_FRET_DOT} />
              </g>
            );
          }

          return <circle key={`dot-${f}`} cx={cx} cy={midY} r={4} fill={COLOR_FRET_DOT} />;
        })}

        {/* Strings */}
        {Array.from({ length: NUM_STRINGS }, (_, s) => {
          const y = pad + topLabelH + (s + 0.5) * stringSpacing;
          // Thicker for bass strings
          const sw = 1 + (NUM_STRINGS - 1 - s) * 0.3;
          return (
            <line
              key={`str-${s}`}
              x1={pad + leftLabelW + fretW}
              y1={y}
              x2={pad + leftLabelW + availW}
              y2={y}
              stroke={COLOR_STRING}
              strokeWidth={sw}
            />
          );
        })}

        {/* String labels (note names) */}
        {Array.from({ length: NUM_STRINGS }, (_, s) => {
          const y = pad + topLabelH + (s + 0.5) * stringSpacing;
          const stringNote = noteName(tuning[NUM_STRINGS - 1 - s] % 12);
          return (
            <text
              key={`sl-${s}`}
              x={pad + leftLabelW - 4}
              y={y}
              textAnchor="end"
              dominantBaseline="central"
              fontSize={FONT_SIZE_SM}
              fill={COLOR_TEXT_SECONDARY}
            >
              {stringNote}
            </text>
          );
        })}

        {/* Chord shape dots */}
        {currentShape && Array.from({ length: NUM_STRINGS }, (_, s) => {
          // String display: high E at top (index 0), low E at bottom
          const stringIdx = NUM_STRINGS - 1 - s;
          const fret = currentShape.frets[stringIdx];
          const y = pad + topLabelH + (s + 0.5) * stringSpacing;

          if (fret === -1) {
            // Muted string — show X
            return (
              <text
                key={`mute-${s}`}
                x={pad + leftLabelW + fretW * 0.5}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={FONT_SIZE_MD}
                fill={COLOR_TEXT_MUTED}
              >
                ×
              </text>
            );
          }

          if (fret === 0) {
            // Open string — show circle outline at nut
            const pc = tuning[stringIdx] % 12;
            const isRoot = pc === rootPc;
            return (
              <g key={`open-${s}`}>
                <circle
                  cx={pad + leftLabelW + fretW * 0.5}
                  cy={y}
                  r={Math.min(stringSpacing * 0.3, 10)}
                  fill="none"
                  stroke={isRoot ? qualityColor : COLOR_TEXT_SECONDARY}
                  strokeWidth={2}
                />
                <text
                  x={pad + leftLabelW + fretW * 0.5}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={FONT_SIZE_XS}
                  fill={isRoot ? qualityColor : COLOR_TEXT_PRIMARY}
                >
                  {noteName(pc)}
                </text>
              </g>
            );
          }

          // Fretted note
          const cx = pad + leftLabelW + fret * fretW + fretW / 2;
          const midi = midiNote(stringIdx, fret, tuning);
          const pc = midi % 12;
          const isRoot = pc === rootPc;
          const isActive = activePcs.has(pc);
          const isPressed = pressed === midi;
          const r = Math.min(stringSpacing * 0.35, 12);

          return (
            <g
              key={`note-${s}`}
              style={{ cursor: 'pointer' }}
              onClick={() => play(midi)}
              role="button"
              aria-label={`Play ${noteName(pc)} on string ${stringIdx + 1}, fret ${fret}`}
            >
              <circle
                cx={cx}
                cy={y}
                r={r}
                fill={isRoot ? qualityColor : isActive ? qualityColor + '99' : COLOR_TEXT_MUTED}
                stroke={isPressed ? COLOR_ACCENT : 'none'}
                strokeWidth={isPressed ? 2 : 0}
                opacity={isActive ? 1 : 0.4}
              />
              <text
                x={cx}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={FONT_SIZE_XS}
                fill={COLOR_TEXT_PRIMARY}
                style={{ pointerEvents: 'none' }}
              >
                {noteName(pc)}
              </text>
            </g>
          );
        })}

        {/* Empty state */}
        {!chord && (
          <text
            x={width / 2}
            y={(height - controlBarH) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={FONT_SIZE_2XL}
            fill={COLOR_TEXT_MUTED}
          >
            Select a chord to see shapes
          </text>
        )}

        {/* No shapes available */}
        {chord && shapes.length === 0 && (
          <text
            x={width / 2}
            y={(height - controlBarH) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={FONT_SIZE_MD}
            fill={COLOR_TEXT_MUTED}
          >
            No shapes available for {chordName(chord)}
          </text>
        )}
      </svg>
    </div>
  );
};
