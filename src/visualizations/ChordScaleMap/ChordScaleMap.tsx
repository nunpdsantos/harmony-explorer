import React, { useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { noteName } from '../../core/constants';
import { chordName, chordPitchClasses, type Chord } from '../../core/chords';
import { findScaleDegree } from '../../core/scales';
import { getScalesForChordInContext, getScalesForChord, getTensionLabels } from '../../core/chordScaleTheory';
import { modePitchClasses, MODE_TEMPLATES, type ModeType } from '../../core/modes';
import {
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_FAINT,
  COLOR_TEXT_DIM,
  COLOR_RING_STROKE,
  COLOR_CHORD_TONE,
  COLOR_CHORD_TONE_LIGHT,
  COLOR_AVOID_NOTE,
  COLOR_ACCENT,
  FONT_SIZE_XS,
  FONT_SIZE_SM,
  FONT_SIZE_BASE,
  FONT_SIZE_MD,
  FONT_SIZE_LG,
  FONT_SIZE_3XL,
} from '../../styles/theme';

/** Circular pitch-class display showing chord tones, scale tones, and avoid notes */
export const ChordScaleMap: React.FC<VisualizationProps> = ({
  referenceRoot,
  selectedChord,
  hoveredChord,
  width,
  height,
}) => {
  const activeChord: Chord | null = hoveredChord ?? selectedChord;

  const mapping = useMemo(() => {
    if (!activeChord) return null;

    const degree = findScaleDegree(activeChord.root, referenceRoot, 'major');
    if (degree >= 0) {
      return getScalesForChordInContext(activeChord.quality, referenceRoot, degree);
    }
    return getScalesForChord(activeChord.quality);
  }, [activeChord, referenceRoot]);

  const primaryMode: ModeType = mapping?.primaryScale ?? 'ionian';
  const modeInfo = MODE_TEMPLATES[primaryMode];

  const chordTonePCs = useMemo(
    () => activeChord ? new Set(chordPitchClasses(activeChord)) : new Set<number>(),
    [activeChord],
  );

  const scalePCs = useMemo(
    () => activeChord ? new Set(modePitchClasses(activeChord.root, primaryMode)) : new Set<number>(),
    [activeChord, primaryMode],
  );

  const avoidPCs = useMemo(() => {
    if (!mapping) return new Set<number>();
    return new Set(mapping.avoidNotes.map(i => ((activeChord!.root + i) % 12 + 12) % 12));
  }, [mapping, activeChord]);

  const tensionLabels = useMemo(
    () => activeChord ? getTensionLabels(activeChord.root, primaryMode) : new Map<number, string>(),
    [activeChord, primaryMode],
  );

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const radius = size * 0.34;
  const dotRadius = size * 0.032;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Chord-Scale Map"
    >
      <title>Chord-Scale Map</title>

      {/* Background circle */}
      <circle cx={cx} cy={cy} r={radius + dotRadius + 20} fill="none" stroke={COLOR_RING_STROKE} strokeWidth={1} />

      {/* 12 pitch class positions */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const pc = i;

        const isChordTone = chordTonePCs.has(pc);
        const isScaleTone = scalePCs.has(pc);
        const isAvoid = avoidPCs.has(pc);
        const isCharacteristic = modeInfo.characteristicTones.includes(
          ((pc - (activeChord?.root ?? 0)) % 12 + 12) % 12
        );
        const tension = tensionLabels.get(pc);

        let fill = 'rgba(255,255,255,0.06)';
        let stroke = 'rgba(255,255,255,0.15)';
        let strokeW = 1;
        let textColor = COLOR_TEXT_DIM;

        if (isChordTone) {
          fill = COLOR_CHORD_TONE;
          stroke = COLOR_CHORD_TONE_LIGHT;
          strokeW = 2;
          textColor = COLOR_TEXT_PRIMARY;
        } else if (isAvoid) {
          fill = 'rgba(239,68,68,0.25)';
          stroke = COLOR_AVOID_NOTE;
          strokeW = 2;
          textColor = COLOR_AVOID_NOTE;
        } else if (isScaleTone) {
          fill = isCharacteristic ? 'rgba(251,191,36,0.25)' : 'rgba(59,130,246,0.12)';
          stroke = isCharacteristic ? COLOR_ACCENT : 'rgba(59,130,246,0.4)';
          strokeW = isCharacteristic ? 2 : 1.5;
          textColor = isCharacteristic ? COLOR_ACCENT : COLOR_TEXT_SECONDARY;
        }

        // Label position (outside circle)
        const labelDist = radius + dotRadius + 16;
        const lx = cx + Math.cos(angle) * labelDist;
        const ly = cy + Math.sin(angle) * labelDist;

        // Tension label position (inside circle)
        const tensionDist = radius - dotRadius - 14;
        const tx = cx + Math.cos(angle) * tensionDist;
        const ty = cy + Math.sin(angle) * tensionDist;

        return (
          <g key={pc}>
            {/* Dot */}
            <circle
              cx={x}
              cy={y}
              r={isChordTone ? dotRadius * 1.15 : dotRadius}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeW}
            />

            {/* Avoid X */}
            {isAvoid && !isChordTone && (
              <g>
                <line x1={x - dotRadius * 0.5} y1={y - dotRadius * 0.5} x2={x + dotRadius * 0.5} y2={y + dotRadius * 0.5} stroke={COLOR_AVOID_NOTE} strokeWidth={2} />
                <line x1={x + dotRadius * 0.5} y1={y - dotRadius * 0.5} x2={x - dotRadius * 0.5} y2={y + dotRadius * 0.5} stroke={COLOR_AVOID_NOTE} strokeWidth={2} />
              </g>
            )}

            {/* Note name */}
            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isChordTone ? 'white' : textColor}
              fontSize={isChordTone ? FONT_SIZE_SM : FONT_SIZE_XS}
              fontWeight={isChordTone ? 700 : 400}
            >
              {noteName(pc)}
            </text>

            {/* Pitch class number outside */}
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              fill={COLOR_TEXT_DIM}
              fontSize={FONT_SIZE_XS}
            >
              {pc}
            </text>

            {/* Tension label inside */}
            {tension && !isChordTone && (
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isAvoid ? COLOR_AVOID_NOTE : isCharacteristic ? COLOR_ACCENT : COLOR_TEXT_MUTED}
                fontSize={FONT_SIZE_XS}
                fontWeight={600}
              >
                {tension}
              </text>
            )}
          </g>
        );
      })}

      {/* Center info */}
      {activeChord ? (
        <g>
          <text x={cx} y={cy - 28} textAnchor="middle" fill="white" fontSize={FONT_SIZE_3XL} fontWeight={700}>
            {chordName(activeChord)}
          </text>
          <text x={cx} y={cy - 6} textAnchor="middle" fill={COLOR_TEXT_SECONDARY} fontSize={FONT_SIZE_MD}>
            {modeInfo.name}
          </text>
          {mapping && mapping.alternates.length > 0 && (
            <text x={cx} y={cy + 14} textAnchor="middle" fill={COLOR_TEXT_FAINT} fontSize={FONT_SIZE_XS}>
              Alt: {mapping.alternates.map(a => MODE_TEMPLATES[a].name).join(', ')}
            </text>
          )}
          <text x={cx} y={cy + 32} textAnchor="middle" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_XS}>
            Characteristic: {modeInfo.characteristicTones
              .map(i => noteName(((activeChord.root + i) % 12 + 12) % 12))
              .join(', ') || '—'}
          </text>
        </g>
      ) : (
        <g>
          <text x={cx} y={cy - 8} textAnchor="middle" fill={COLOR_TEXT_FAINT} fontSize={FONT_SIZE_LG}>
            Chord-Scale Map
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_BASE}>
            Select a chord to see scales
          </text>
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(${width - 160}, ${height - 100})`}>
        <text x={0} y={0} fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_XS} fontWeight={600}>LEGEND</text>
        <circle cx={8} cy={14} r={5} fill={COLOR_CHORD_TONE} />
        <text x={20} y={18} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Chord tone</text>
        <circle cx={8} cy={30} r={5} fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.4)" strokeWidth={1.5} />
        <text x={20} y={34} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Scale tone</text>
        <circle cx={8} cy={46} r={5} fill="rgba(251,191,36,0.25)" stroke={COLOR_ACCENT} strokeWidth={2} />
        <text x={20} y={50} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Characteristic</text>
        <circle cx={8} cy={62} r={5} fill="rgba(239,68,68,0.25)" stroke={COLOR_AVOID_NOTE} strokeWidth={2} />
        <text x={20} y={66} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Avoid note</text>
      </g>
    </svg>
  );
};
