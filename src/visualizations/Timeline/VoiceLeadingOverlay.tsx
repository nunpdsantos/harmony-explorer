import React from 'react';
import type { VoicedChord } from '../../core/voiceLeading';
import { VOICE_COLORS as THEME_VOICE_COLORS } from '../../styles/theme';

interface VoiceLeadingOverlayProps {
  voicings: VoicedChord[];
  cardWidth: number;
  gap: number;
  padding: number;
  height: number;
  playingIndex: number;
}

/** Colors for each voice position, bottom to top */
const VOICE_COLORS = THEME_VOICE_COLORS;

const VOICE_LABELS = ['B', 'T', 'A', 'S', '5'];

/**
 * SVG overlay showing voice-leading lines between consecutive chord voicings.
 * Each voice (bass, tenor, alto, soprano) gets a colored line.
 * Common tones are shown as dashed lines; moving voices as solid lines
 * with semitone distance labels.
 */
export const VoiceLeadingOverlay: React.FC<VoiceLeadingOverlayProps> = ({
  voicings,
  cardWidth,
  gap,
  padding,
  height,
  playingIndex,
}) => {
  if (voicings.length < 2) return null;

  // Find MIDI range across all voicings for y-mapping
  let minNote = Infinity;
  let maxNote = -Infinity;
  for (const v of voicings) {
    for (const n of v) {
      if (n < minNote) minNote = n;
      if (n > maxNote) maxNote = n;
    }
  }

  // Add padding to range so dots aren't at extreme edges
  const rangePad = 3;
  minNote -= rangePad;
  maxNote += rangePad;
  const noteRange = maxNote - minNote || 1;

  // Vertical mapping: higher pitch = lower y (top of SVG)
  const yPad = 8;
  const usableHeight = height - yPad * 2;
  const noteToY = (midi: number) => yPad + usableHeight * (1 - (midi - minNote) / noteRange);

  // X center of each chord card
  const chordX = (i: number) => padding + i * (cardWidth + gap) + cardWidth / 2;

  // Total SVG width
  const totalWidth = padding * 2 + voicings.length * cardWidth + (voicings.length - 1) * gap;

  const transitions: React.ReactNode[] = [];

  for (let i = 0; i < voicings.length - 1; i++) {
    const curr = voicings[i];
    const next = voicings[i + 1];
    const x1 = chordX(i);
    const x2 = chordX(i + 1);
    const minVoices = Math.min(curr.length, next.length);
    const isActiveTransition = i === playingIndex - 1 && playingIndex >= 0;

    // Draw lines for matching voice indices
    for (let v = 0; v < minVoices; v++) {
      const y1 = noteToY(curr[v]);
      const y2 = noteToY(next[v]);
      const semitones = Math.abs(next[v] - curr[v]);
      const isCommon = semitones === 0;
      const color = VOICE_COLORS[v % VOICE_COLORS.length];
      const opacity = isActiveTransition ? 1 : 0.5;

      // Control points for a gentle curve
      const midX = (x1 + x2) / 2;

      transitions.push(
        <g key={`${i}-${v}`}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth={isActiveTransition ? 2.5 : 1.5}
            strokeDasharray={isCommon ? '4 3' : 'none'}
            opacity={opacity}
          />
          {/* Semitone label at midpoint (only for moving voices) */}
          {!isCommon && (
            <text
              x={midX}
              y={(y1 + y2) / 2 - 4}
              textAnchor="middle"
              fill={color}
              fontSize={9}
              fontFamily="monospace"
              opacity={isActiveTransition ? 1 : 0.6}
            >
              {semitones}
            </text>
          )}
        </g>,
      );
    }

    // Extra voices appearing (next chord has more notes)
    for (let v = minVoices; v < next.length; v++) {
      const y2 = noteToY(next[v]);
      const color = VOICE_COLORS[v % VOICE_COLORS.length];
      const opacity = isActiveTransition ? 0.8 : 0.3;
      transitions.push(
        <circle
          key={`${i}-appear-${v}`}
          cx={x2}
          cy={y2}
          r={3}
          fill={color}
          opacity={opacity}
        />,
      );
    }

    // Extra voices disappearing (current chord has more notes)
    for (let v = minVoices; v < curr.length; v++) {
      const y1 = noteToY(curr[v]);
      const color = VOICE_COLORS[v % VOICE_COLORS.length];
      const opacity = isActiveTransition ? 0.8 : 0.3;
      transitions.push(
        <circle
          key={`${i}-disappear-${v}`}
          cx={x1}
          cy={y1}
          r={3}
          fill={color}
          opacity={opacity}
          strokeDasharray="2 2"
          stroke={color}
          strokeWidth={1}
        />,
      );
    }
  }

  // Voice dots at each chord position
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < voicings.length; i++) {
    const cx = chordX(i);
    const isPlaying = i === playingIndex;
    for (let v = 0; v < voicings[i].length; v++) {
      const cy = noteToY(voicings[i][v]);
      const color = VOICE_COLORS[v % VOICE_COLORS.length];
      dots.push(
        <circle
          key={`dot-${i}-${v}`}
          cx={cx}
          cy={cy}
          r={isPlaying ? 4 : 3}
          fill={color}
          opacity={isPlaying ? 1 : 0.7}
        />,
      );
    }
  }

  // Voice legend (top-left)
  const maxVoices = Math.max(...voicings.map(v => v.length));
  const legend: React.ReactNode[] = [];
  for (let v = 0; v < Math.min(maxVoices, VOICE_LABELS.length); v++) {
    legend.push(
      <g key={`legend-${v}`} transform={`translate(${4 + v * 20}, 10)`}>
        <circle cx={0} cy={0} r={3} fill={VOICE_COLORS[v]} />
        <text
          x={6}
          y={3}
          fill={VOICE_COLORS[v]}
          fontSize={8}
          fontFamily="monospace"
        >
          {VOICE_LABELS[v]}
        </text>
      </g>,
    );
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={totalWidth}
      height={height}
      aria-hidden="true"
    >
      {legend}
      {transitions}
      {dots}
    </svg>
  );
};
