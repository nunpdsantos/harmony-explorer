import React, { useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { noteName } from '../../core/constants';
import { chordName, chordPitchClasses, type Chord } from '../../core/chords';
import { computeNegative, getNegativeMapping } from '../../core/negativeHarmony';
import {
  COLOR_TEXT_PRIMARY,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_FAINT,
  COLOR_TEXT_DIM,
  COLOR_RING_STROKE,
  FONT_SIZE_XS,
  FONT_SIZE_SM,
  FONT_SIZE_LG,
  FONT_SIZE_2XL,
} from '../../styles/theme';

/**
 * Negative Harmony Mirror visualization.
 * Shows original chord on left, negative chord on right,
 * with crossing lines through the axis.
 */
export const NegativeHarmonyMirror: React.FC<VisualizationProps> = ({
  referenceRoot,
  selectedChord,
  hoveredChord,
  width,
  height,
}) => {
  const activeChord: Chord | null = hoveredChord ?? selectedChord;

  const mapping = useMemo(() => getNegativeMapping(referenceRoot), [referenceRoot]);

  const negativeChord = useMemo(() => {
    if (!activeChord) return null;
    return computeNegative(activeChord, referenceRoot);
  }, [activeChord, referenceRoot]);

  const cx = width / 2;
  const cy = height / 2;
  const colWidth = width * 0.3;
  const leftX = cx - colWidth * 0.6;
  const rightX = cx + colWidth * 0.6;
  const axisX = cx;
  const noteSpacing = Math.min(height * 0.055, 36);
  const startY = cy - 5.5 * noteSpacing;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Negative Harmony Mirror"
    >
      <title>Negative Harmony Mirror</title>

      {/* Axis line */}
      <line
        x1={axisX}
        y1={startY - 20}
        x2={axisX}
        y2={startY + 12 * noteSpacing + 20}
        stroke={COLOR_RING_STROKE}
        strokeWidth={2}
        strokeDasharray="6 4"
      />

      {/* Axis label */}
      <text
        x={axisX}
        y={startY - 30}
        textAnchor="middle"
        fill={COLOR_TEXT_FAINT}
        fontSize={FONT_SIZE_XS}
      >
        Axis ({noteName(referenceRoot)} / {noteName((referenceRoot + 7) % 12)})
      </text>

      {/* Column headers */}
      <text x={leftX} y={startY - 30} textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_SM} fontWeight={600}>
        Original
      </text>
      <text x={rightX} y={startY - 30} textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_SM} fontWeight={600}>
        Negative
      </text>

      {/* 12 pitch class rows with mirror lines */}
      {Array.from({ length: 12 }, (_, i) => {
        const pc = (referenceRoot + i) % 12;
        const negPC = mapping.get(pc) ?? pc;
        const y = startY + i * noteSpacing;

        // Determine the row position of the negative note
        const negRow = ((negPC - referenceRoot) % 12 + 12) % 12;
        const negY = startY + negRow * noteSpacing;

        const isChordTone = activeChord
          ? chordPitchClasses(activeChord).includes(pc)
          : false;

        const dotRadius = 14;

        return (
          <g key={pc}>
            {/* Left dot (original) */}
            <circle
              cx={leftX}
              cy={y}
              r={dotRadius}
              fill={isChordTone ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}
              stroke={isChordTone ? '#3b82f6' : COLOR_RING_STROKE}
              strokeWidth={isChordTone ? 2 : 1}
            />
            <text
              x={leftX}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isChordTone ? COLOR_TEXT_PRIMARY : COLOR_TEXT_DIM}
              fontSize={FONT_SIZE_SM}
              fontWeight={isChordTone ? 700 : 400}
            >
              {noteName(pc)}
            </text>

            {/* Right dot (negative) */}
            <circle
              cx={rightX}
              cy={negY}
              r={dotRadius}
              fill={isChordTone ? 'rgba(236,72,153,0.3)' : 'rgba(255,255,255,0.05)'}
              stroke={isChordTone ? '#ec4899' : COLOR_RING_STROKE}
              strokeWidth={isChordTone ? 2 : 1}
            />
            <text
              x={rightX}
              y={negY + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isChordTone ? COLOR_TEXT_PRIMARY : COLOR_TEXT_DIM}
              fontSize={FONT_SIZE_SM}
              fontWeight={isChordTone ? 700 : 400}
            >
              {noteName(negPC)}
            </text>

            {/* Connecting line through axis */}
            {isChordTone && (
              <line
                x1={leftX + dotRadius + 2}
                y1={y}
                x2={rightX - dotRadius - 2}
                y2={negY}
                stroke={isChordTone ? '#ec4899' : COLOR_RING_STROKE}
                strokeWidth={1.5}
                opacity={0.6}
                strokeDasharray={isChordTone ? undefined : '4 3'}
              />
            )}
          </g>
        );
      })}

      {/* Chord labels at bottom */}
      {activeChord && negativeChord && (
        <g>
          <text
            x={leftX}
            y={startY + 12 * noteSpacing + 30}
            textAnchor="middle"
            fill="#3b82f6"
            fontSize={FONT_SIZE_2XL}
            fontWeight={700}
          >
            {chordName(activeChord)}
          </text>
          <text
            x={rightX}
            y={startY + 12 * noteSpacing + 30}
            textAnchor="middle"
            fill="#ec4899"
            fontSize={FONT_SIZE_2XL}
            fontWeight={700}
          >
            {chordName({ root: negativeChord.root, quality: negativeChord.quality })}
          </text>
        </g>
      )}

      {!activeChord && (
        <g>
          <text x={cx} y={height - 40} textAnchor="middle" fill={COLOR_TEXT_FAINT} fontSize={FONT_SIZE_LG}>
            Select a chord to see its negative
          </text>
        </g>
      )}
    </svg>
  );
};
