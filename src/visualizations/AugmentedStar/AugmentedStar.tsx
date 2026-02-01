import React, { useMemo, useState } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { chordName, chordKey, chordsEqual, chordPitchClasses } from '../../core/chords';
import { getAugmentedReachability, getUniqueAugmentedTriads } from '../../core/symmetricStructures';
import { noteName } from '../../core/constants';
import { qualityColor } from '../shared/colors';
import { useStore } from '../../state/store';
import {
  QUALITY_COLORS,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_FAINT,
  COLOR_TEXT_DIM,
  FONT_SIZE_XS,
  FONT_SIZE_SM,
  FONT_SIZE_BASE,
} from '../../styles/theme';

export const AugmentedStar: React.FC<VisualizationProps> = ({
  selectedChord,
  hoveredChord,
  onChordClick,
  onChordHover,
  width,
  height,
}) => {
  const progression = useStore(s => s.progression);
  const progressionKeys = useMemo(
    () => new Set(progression.map(chordKey)),
    [progression]
  );

  const uniqueAugs = useMemo(() => getUniqueAugmentedTriads(), []);
  const [augIndex, setAugIndex] = useState(0);

  const currentAug = uniqueAugs[augIndex];
  const reachability = useMemo(
    () => getAugmentedReachability(currentAug.root),
    [currentAug.root]
  );

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const spokeRadius = size * 0.34;
  const centerBubbleR = size * 0.06;
  const spokeBubbleR = size * 0.04;

  // Position 6 spokes evenly around the center
  const spokePositions = useMemo(() => {
    return reachability.reachableTriads.map((rt, i) => {
      const angle = (i * Math.PI * 2) / 6 - Math.PI / 2;
      return {
        ...rt,
        x: cx + Math.cos(angle) * spokeRadius,
        y: cy + Math.sin(angle) * spokeRadius,
        angle,
      };
    });
  }, [reachability, cx, cy, spokeRadius]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Augmented Star showing triads reachable from ${chordName(currentAug)}`}>
      <title>Augmented Star - {chordName(currentAug)}</title>
      <desc>Star diagram showing the six major and minor triads reachable by single semitone movement from the {chordName(currentAug)} augmented triad</desc>
      {/* Spoke lines from center to each reachable triad */}
      {spokePositions.map((sp, i) => (
        <line
          key={`spoke-${i}`}
          x1={cx}
          y1={cy}
          x2={sp.x}
          y2={sp.y}
          stroke={qualityColor(sp.triad.quality)}
          strokeWidth={1.5}
          opacity={0.25}
        />
      ))}

      {/* Spoke labels (which note moves and direction) */}
      {spokePositions.map((sp, i) => {
        const midX = (cx + sp.x) / 2;
        const midY = (cy + sp.y) / 2;
        const angle = sp.angle * (180 / Math.PI);
        return (
          <text
            key={`label-${i}`}
            x={midX}
            y={midY - 8}
            textAnchor="middle"
            fill={COLOR_TEXT_DIM}
            fontSize={FONT_SIZE_XS}
            transform={`rotate(${angle > 90 || angle < -90 ? angle + 180 : angle}, ${midX}, ${midY - 8})`}
          >
            {sp.description}
          </text>
        );
      })}

      {/* Reachable triad bubbles */}
      {spokePositions.map((sp, i) => (
        <ChordBubble
          key={`spoke-chord-${i}`}
          chord={sp.triad}
          x={sp.x}
          y={sp.y}
          radius={spokeBubbleR}
          isSelected={selectedChord !== null && chordsEqual(sp.triad, selectedChord)}
          isHovered={hoveredChord !== null && chordsEqual(sp.triad, hoveredChord)}
          isInProgression={progressionKeys.has(chordKey(sp.triad))}
          isReference={false}
          isDiatonic={true}
          isDimmed={false}
          isNextMove={false}
          fillColor={qualityColor(sp.triad.quality)}
          onClick={onChordClick}
          onHover={onChordHover}
        />
      ))}

      {/* Center augmented chord bubble */}
      <ChordBubble
        chord={currentAug}
        x={cx}
        y={cy}
        radius={centerBubbleR}
        isSelected={selectedChord !== null && chordsEqual(currentAug, selectedChord)}
        isHovered={hoveredChord !== null && chordsEqual(currentAug, hoveredChord)}
        isInProgression={progressionKeys.has(chordKey(currentAug))}
        isReference={true}
        isDiatonic={true}
        isDimmed={false}
        isNextMove={false}
        fillColor={qualityColor('augmented')}
        onClick={onChordClick}
        onHover={onChordHover}
      />

      {/* Center label */}
      <text
        x={cx}
        y={cy + centerBubbleR + 20}
        textAnchor="middle"
        fill={COLOR_TEXT_MUTED}
        fontSize={FONT_SIZE_SM}
      >
        Notes: {chordPitchClasses(currentAug).map(pc => noteName(pc)).join(', ')}
      </text>

      {/* Aug triad selector */}
      <g transform={`translate(${width - 140}, 20)`}>
        <text x={0} y={0} fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_XS} fontWeight={600}>SELECT AUG TRIAD</text>
        {uniqueAugs.map((aug, i) => (
          <g
            key={i}
            onClick={() => setAugIndex(i)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={0}
              y={10 + i * 24}
              width={120}
              height={20}
              rx={4}
              fill={i === augIndex ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)'}
              stroke={i === augIndex ? QUALITY_COLORS.augmented : 'transparent'}
              strokeWidth={1}
            />
            <text
              x={60}
              y={24 + i * 24}
              textAnchor="middle"
              fill={i === augIndex ? QUALITY_COLORS.augmented : COLOR_TEXT_FAINT}
              fontSize={FONT_SIZE_BASE}
              fontWeight={i === augIndex ? 600 : 400}
            >
              {chordName(aug)} ({chordPitchClasses(aug).map(pc => noteName(pc)).join(', ')})
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};
