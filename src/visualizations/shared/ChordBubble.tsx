import React from 'react';
import { chordName, type Chord } from '../../core/chords';

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
  const strokeColor = isSelected
    ? '#fff'
    : isHovered
    ? '#e2e8f0'
    : isNextMove
    ? nextMoveStrength === 'strong' ? '#fbbf24' : nextMoveStrength === 'common' ? '#a78bfa' : '#6b7280'
    : isReference
    ? '#fbbf24'
    : isDiatonic
    ? 'rgba(255,255,255,0.35)'
    : 'rgba(255,255,255,0.12)';

  const strokeWidth = isSelected || isHovered ? 3
    : isNextMove ? 2.5
    : isReference ? 2.5
    : isDiatonic ? 1.5
    : 1;

  const scale = isHovered ? 1.1 : isNextMove && nextMoveStrength === 'strong' ? 1.05 : 1;
  const opacity = isDimmed ? 0.25 : isNextMove ? 1 : isDiatonic ? 0.9 : 0.45;
  const name = chordName(chord);

  return (
    <g
      transform={`translate(${x},${y}) scale(${scale})`}
      style={{ cursor: 'pointer', transition: 'transform 0.15s ease, opacity 0.15s ease' }}
      onClick={() => onClick(chord)}
      onMouseEnter={() => onHover(chord)}
      onMouseLeave={() => onHover(null)}
      opacity={opacity}
    >
      {/* Next move glow */}
      {isNextMove && (
        <circle
          r={radius + 6}
          fill="none"
          stroke={nextMoveStrength === 'strong' ? '#fbbf24' : nextMoveStrength === 'common' ? '#a78bfa' : '#6b7280'}
          strokeWidth={2}
          opacity={0.5}
        >
          <animate attributeName="r" values={`${radius + 4};${radius + 8};${radius + 4}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Progression marker */}
      {isInProgression && (
        <circle
          r={radius + 4}
          fill="none"
          stroke="#fbbf24"
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
        fontSize={radius > 24 ? 14 : 11}
        fontWeight={isSelected ? 700 : 500}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        dy={label ? -3 : 0}
      >
        {name}
      </text>

      {/* Roman numeral label */}
      {label && (
        <text
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontSize={8}
          fontWeight={400}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          dy={radius + 14}
        >
          {label}
        </text>
      )}

      {/* Function sublabel */}
      {sublabel && (
        <text
          textAnchor="middle"
          fill={sublabel === 'T' ? '#22c55e' : sublabel === 'S' ? '#3b82f6' : '#ef4444'}
          fontSize={7}
          fontWeight={600}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          dy={radius + 24}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
};
