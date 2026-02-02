import React, { useMemo, useState, useCallback } from 'react';
import type { VisualizationProps } from '../shared/types';
import { noteName } from '../../core/constants';
import { chordPitchClasses, chordName } from '../../core/chords';
import { initialVoicing } from '../../core/voiceLeading';
import { useStore } from '../../state/store';
import {
  QUALITY_COLORS,
  COLOR_QUALITY_FALLBACK,
  VOICE_COLORS,
  COLOR_ACCENT,
  COLOR_SELECTED_BORDER,
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_FAINT,
  COLOR_KEY_WHITE,
  COLOR_KEY_BLACK,
  FONT_SIZE_2XS,
  FONT_SIZE_XS,
  FONT_SIZE_SM,
  FONT_SIZE_2XL,
} from '../../styles/theme';

/* ─── Piano range: C3 (MIDI 48) → C6 (MIDI 84) ─── */
const MIDI_LO = 48;
const MIDI_HI = 84;
const BLACK_PCS = new Set([1, 3, 6, 8, 10]);

interface KeyInfo {
  midi: number;
  pc: number;
  oct: number;
  black: boolean;
}

/* Pre-build key list at module level */
const KEYS: KeyInfo[] = [];
for (let m = MIDI_LO; m <= MIDI_HI; m++) {
  KEYS.push({
    midi: m,
    pc: m % 12,
    oct: Math.floor(m / 12) - 1,
    black: BLACK_PCS.has(m % 12),
  });
}
const WHITES = KEYS.filter(k => !k.black);
const BLACKS = KEYS.filter(k => k.black);
const N_WHITE = WHITES.length;

/** Sequential white-key index (0-based from C3) */
function wSeq(midi: number): number {
  let n = 0;
  for (let m = MIDI_LO; m < midi; m++) {
    if (!BLACK_PCS.has(m % 12)) n++;
  }
  return n;
}

/** Interval name from semitone distance */
const INTERVAL_NAMES: Record<number, string> = {
  1: 'm2', 2: 'M2', 3: 'm3', 4: 'M3', 5: 'P4', 6: 'TT',
  7: 'P5', 8: 'm6', 9: 'M6', 10: 'm7', 11: 'M7', 12: 'P8',
};

const VOICE_LABELS = ['Bass', 'Tenor', 'Alto', 'Soprano', '5th'];

/* ─── Component ─── */
export const PianoKeyboard: React.FC<VisualizationProps> = ({
  selectedChord,
  hoveredChord,
  width,
  height,
}) => {
  const [showNames, setShowNames] = useState(true);
  const [pressed, setPressed] = useState<number | null>(null);
  const audioReady = useStore(s => s.audioReady);
  const setAudioReady = useStore(s => s.setAudioReady);

  const chord = hoveredChord ?? selectedChord;

  /* ── Chord data ── */
  const pcs = useMemo(
    () => chord ? new Set(chordPitchClasses(chord)) : new Set<number>(),
    [chord],
  );
  const rootPC = chord?.root ?? -1;
  const qColor = chord
    ? (QUALITY_COLORS[chord.quality] ?? COLOR_QUALITY_FALLBACK)
    : '';

  /* ── Voicing (MIDI note numbers) ── */
  const voicing = useMemo(() => chord ? initialVoicing(chord) : [], [chord]);
  const visVoicing = useMemo(
    () => voicing.filter(m => m >= MIDI_LO && m <= MIDI_HI),
    [voicing],
  );

  /* ── Layout ── */
  const pad = 16;
  const headH = chord ? 50 : 30;
  const legendH = visVoicing.length > 0 ? 22 : 0;
  const availW = Math.max(width - pad * 2, 100);
  const availH = Math.max(height - headH - legendH - pad, 60);

  const wkw = Math.min(availW / N_WHITE, 52);
  const wkh = Math.min(availH, wkw * 5);
  const bkw = wkw * 0.6;
  const bkh = wkh * 0.62;
  const cr = Math.max(wkw * 0.08, 2);
  const dotR = Math.max(Math.min(wkw * 0.2, 7), 3);

  const kbTotalW = N_WHITE * wkw;
  const kbX = (width - kbTotalW) / 2;
  const kbY = headH + (availH - wkh) / 2;

  /* ── Helpers ── */

  /** X-center of any MIDI key on the keyboard */
  const keyCx = (midi: number) =>
    BLACK_PCS.has(midi % 12)
      ? kbX + (wSeq(midi - 1) + 1) * wkw
      : kbX + wSeq(midi) * wkw + wkw / 2;

  /** Click → play single note */
  const play = useCallback(async (midi: number) => {
    setPressed(midi);
    setTimeout(() => setPressed(null), 180);
    const ae = await import('../../audio/audioEngine');
    if (!audioReady) { await ae.initAudio(); setAudioReady(true); }
    ae.playChord([midi], '4n');
  }, [audioReady, setAudioReady]);

  /* ── Key fill logic ── */
  const whiteFill = (pc: number, midi: number) =>
    midi === pressed ? COLOR_ACCENT
    : pc === rootPC ? qColor
    : pcs.has(pc) ? qColor + '80'
    : COLOR_KEY_WHITE;

  const blackFill = (pc: number, midi: number) =>
    midi === pressed ? COLOR_ACCENT
    : pc === rootPC ? qColor
    : pcs.has(pc) ? qColor + 'bb'
    : COLOR_KEY_BLACK;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Piano keyboard${chord ? ` showing ${chordName(chord)}` : ''}`}
    >
      {/* ── Header ── */}
      <text
        x={width / 2}
        y={chord ? 22 : 20}
        textAnchor="middle"
        fill={COLOR_TEXT_PRIMARY}
        fontSize={FONT_SIZE_2XL}
        fontWeight="600"
      >
        {chord ? chordName(chord) : 'Piano Keyboard'}
      </text>

      {chord && visVoicing.length > 0 && (
        <text x={width / 2} y={40} textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_SM}>
          {visVoicing.map(m => `${noteName(m % 12)}${Math.floor(m / 12) - 1}`).join(' · ')}
        </text>
      )}

      {/* ── Note-names toggle ── */}
      <g
        onClick={() => setShowNames(v => !v)}
        style={{ cursor: 'pointer' }}
        role="button"
        aria-label={showNames ? 'Hide note names' : 'Show note names'}
      >
        <rect
          x={width - pad - 66}
          y={6}
          width={58}
          height={20}
          rx={10}
          fill={showNames ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}
        />
        <text
          x={width - pad - 37}
          y={20}
          textAnchor="middle"
          fill={showNames ? COLOR_TEXT_SECONDARY : COLOR_TEXT_FAINT}
          fontSize={FONT_SIZE_XS}
        >
          {showNames ? 'Notes ✓' : 'Notes'}
        </text>
      </g>

      {/* ── White keys ── */}
      {WHITES.map((k, i) => {
        const x = kbX + i * wkw;
        const ct = pcs.has(k.pc);
        const isRoot = k.pc === rootPC;

        return (
          <g key={k.midi} onClick={() => play(k.midi)} style={{ cursor: 'pointer' }}>
            <rect
              x={x + 0.5}
              y={kbY}
              width={wkw - 1}
              height={wkh}
              rx={cr}
              fill={whiteFill(k.pc, k.midi)}
              stroke={ct ? qColor : 'rgba(0,0,0,0.12)'}
              strokeWidth={ct ? 1.5 : 0.5}
            />

            {showNames && (
              <text
                x={x + wkw / 2}
                y={kbY + wkh - 8}
                textAnchor="middle"
                fill={ct ? COLOR_SELECTED_BORDER : 'rgba(0,0,0,0.3)'}
                fontSize={FONT_SIZE_XS}
                fontWeight={isRoot ? '700' : ct ? '600' : '400'}
                pointerEvents="none"
              >
                {noteName(k.pc)}
                {k.pc === 0 && <tspan fontSize={FONT_SIZE_2XS}>{k.oct}</tspan>}
              </text>
            )}

            {/* Middle C indicator */}
            {k.midi === 60 && !ct && (
              <circle
                cx={x + wkw / 2}
                cy={kbY + wkh - 22}
                r={2}
                fill="rgba(0,0,0,0.12)"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}

      {/* ── Black keys ── */}
      {BLACKS.map(k => {
        const kcx = keyCx(k.midi);
        const x = kcx - bkw / 2;
        const ct = pcs.has(k.pc);
        const isRoot = k.pc === rootPC;

        return (
          <g key={k.midi} onClick={() => play(k.midi)} style={{ cursor: 'pointer' }}>
            <rect
              x={x}
              y={kbY}
              width={bkw}
              height={bkh}
              rx={cr}
              fill={blackFill(k.pc, k.midi)}
              stroke={ct ? qColor : 'rgba(0,0,0,0.3)'}
              strokeWidth={ct ? 1.5 : 0.5}
            />

            {showNames && (
              <text
                x={kcx}
                y={kbY + bkh - 6}
                textAnchor="middle"
                fill={COLOR_SELECTED_BORDER}
                fontSize={FONT_SIZE_2XS}
                fontWeight={isRoot ? '700' : ct ? '600' : '400'}
                opacity={ct ? 1 : 0.5}
                pointerEvents="none"
              >
                {noteName(k.pc)}
              </text>
            )}
          </g>
        );
      })}

      {/* ── Voicing dots (color-coded by voice) ── */}
      {visVoicing.map((m, vi) => {
        const isBlk = BLACK_PCS.has(m % 12);
        const dx = keyCx(m);
        const dy = isBlk
          ? kbY + bkh * 0.42
          : kbY + bkh + (wkh - bkh) * 0.42;
        const col = VOICE_COLORS[vi] ?? VOICE_COLORS[4];

        return (
          <g key={`voice-${vi}`} pointerEvents="none">
            <circle cx={dx} cy={dy} r={dotR + 1} fill="rgba(0,0,0,0.2)" />
            <circle cx={dx} cy={dy} r={dotR} fill={col} stroke={COLOR_SELECTED_BORDER} strokeWidth={0.8} />
          </g>
        );
      })}

      {/* ── Interval labels between adjacent voicing notes ── */}
      {visVoicing.length >= 2 && kbY > headH + 12 && visVoicing.map((m, i) => {
        if (i >= visVoicing.length - 1) return null;
        const next = visVoicing[i + 1];
        const semis = next - m;
        const mx = (keyCx(m) + keyCx(next)) / 2;

        return (
          <text
            key={`iv-${i}`}
            x={mx}
            y={kbY - 6}
            textAnchor="middle"
            fill={COLOR_TEXT_FAINT}
            fontSize={FONT_SIZE_2XS}
            pointerEvents="none"
          >
            {INTERVAL_NAMES[semis] ?? `${semis}st`}
          </text>
        );
      })}

      {/* ── Voice legend ── */}
      {visVoicing.length > 0 && kbY + wkh + 20 < height && (
        <g>
          {visVoicing.map((m, i) => {
            const lx = kbX + i * 60;
            const ly = kbY + wkh + 16;
            const col = VOICE_COLORS[i] ?? VOICE_COLORS[4];

            return (
              <g key={`leg-${i}`}>
                <circle cx={lx + 5} cy={ly} r={3} fill={col} />
                <text
                  x={lx + 12}
                  y={ly + 3.5}
                  fill={COLOR_TEXT_MUTED}
                  fontSize={FONT_SIZE_2XS}
                >
                  {VOICE_LABELS[i] ?? `V${i + 1}`}: {noteName(m % 12)}{Math.floor(m / 12) - 1}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};
