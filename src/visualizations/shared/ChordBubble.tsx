import React, { useCallback } from 'react';
import { chordName, chordFullName, type Chord } from '../../core/chords';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import {
  COLOR_SELECTED_BORDER, COLOR_HOVERED_BORDER, COLOR_ACCENT,
  COLOR_MOVE_STRONG, COLOR_MOVE_COMMON, COLOR_MOVE_CREATIVE,
  COLOR_DIATONIC_STROKE, COLOR_NON_DIATONIC_STROKE,
  COLOR_FN_TONIC, COLOR_FN_SUBDOMINANT, COLOR_FN_DOMINANT,
  COLOR_TEXT_SECONDARY,
  FONT_SIZE_2XS, FONT_SIZE_XS, FONT_SIZE_XL,
} from '../../styles/theme';

interface ChordBubbleProps {
  chord: Chord;
  x: number;
  y: number;
  radius: number;
  isSelected: boolean;
  isHovered: boolean;
  isInProgression: boolean;
  isReference: boolean;
  isDiatonic: boolean;
  isDimmed: boolean;
  isNextMove: boolean;
  nextMoveStrength?: 'strong' | 'common' | 'creative';
  fillColor: string;
  label?: string;          // Roman numeral or other label below
  sublabel?: string;       // function label (T/S/D)
  onClick: (chord: Chord) => void;
  onHover: (chord: Chord | null) => void;
}

export const ChordBubble: React.FC<ChordBubbleProps> = ({
  chord,
  x,
  y,
  radius,
  isSelected,
  isHovered,
  isInProgression,
  isReference,
  isDiatonic,
  isDimmed,
  isNextMove,
  nextMoveStrength,
  fillColor,
  label,
  sublabel,
  onClick,
  onHover,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const strokeColor = isSelected
    ? COLOR_SELECTED_BORDER
    : isHovered
    ? COLOR_HOVERED_BORDER
    : isNextMove
    ? nextMoveStrength === 'strong' ? COLOR_MOVE_STRONG : nextMoveStrength === 'common' ? COLOR_MOVE_COMMON : COLOR_MOVE_CREATIVE
    : isReference
    ? COLOR_ACCENT
    : isDiatonic
    ? COLOR_DIATONIC_STROKE
    : COLOR_NON_DIATONIC_STROKE;

  const strokeWidth = isSelected || isHovered ? 3
    : isNextMove ? 2.5
    : isReference ? 2.5
    : isDiatonic ? 1.5
    : 1;

  const scale = isHovered ? 1.1 : isNextMove && nextMoveStrength === 'strong' ? 1.05 : 1;
  const opacity = isDimmed ? 0.25 : isNextMove ? 1 : isDiatonic ? 0.9 : 0.45;
  const name = chordName(chord);

  // Build accessible description
  const fullName = chordFullName(chord);
  const parts = [fullName];
  if (label) parts.push(label);
  if (isReference) parts.push('reference chord');
  if (isSelected) parts.push('selected');
  if (isInProgression) parts.push('in progression');
  if (isNextMove) parts.push(`suggested ${nextMoveStrength ?? ''} move`);
  const ariaLabel = parts.join(', ');

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(chord);
      }
    },
    [onClick, chord],
  );

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      transform={`translate(${x},${y}) scale(${scale})`}
      style={{ cursor: 'pointer', transition: 'transform 0.15s ease, opacity 0.15s ease' }}
      onClick={() => onClick(chord)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(chord)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(chord)}
      onBlur={() => onHover(null)}
      opacity={opacity}
    >
      {/* Invisible touch target — ensures 44px minimum hit area */}
      {radius < 22 && (
        <circle r={22} fill="transparent" />
      )}

      {/* Next move glow */}
      {isNextMove && (
        <circle
          r={radius + 6}
          fill="none"
          stroke={nextMoveStrength === 'strong' ? COLOR_MOVE_STRONG : nextMoveStrength === 'common' ? COLOR_MOVE_COMMON : COLOR_MOVE_CREATIVE}
          strokeWidth={2}
          opacity={0.5}
        >
          {!prefersReducedMotion && (
            <>
              <animate attributeName="r" values={`${radius + 4};${radius + 8};${radius + 4}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
            </>
          )}
        </circle>
      )}

      {/* Progression marker */}
      {isInProgression && (
        <circle
          r={radius + 4}
          fill="none"
          stroke={COLOR_ACCENT}
          strokeWidth={2}
          strokeDasharray="4 3"
          opacity={0.7}
        />
      )}

      {/* Main circle */}
      <circle
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      {/* Chord name */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={radius > 24 ? FONT_SIZE_XL : FONT_SIZE_XS + 2}
        fontWeight={isSelected ? 700 : 500}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        dy={label ? -3 : 0}
        aria-hidden="true"
      >
        {name}
      </text>

      {/* Roman numeral label */}
      {label && (
        <text
          textAnchor="middle"
          fill={COLOR_TEXT_SECONDARY}
          fontSize={FONT_SIZE_2XS}
          fontWeight={400}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          dy={radius + 14}
          aria-hidden="true"
        >
          {label}
        </text>
      )}

      {/* Function sublabel */}
      {sublabel && (
        <text
          textAnchor="middle"
          fill={sublabel === 'T' ? COLOR_FN_TONIC : sublabel === 'S' ? COLOR_FN_SUBDOMINANT : COLOR_FN_DOMINANT}
          fontSize={FONT_SIZE_2XS - 1}
          fontWeight={600}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          dy={radius + 24}
          aria-hidden="true"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
};
