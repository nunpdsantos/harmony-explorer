import React, { useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { qualityColor, sharedNoteColor } from '../shared/colors';
import { chord, chordsEqual, chordKey, chordName } from '../../core/chords';
import { buildProximityPyramid } from '../../core/proximityPyramid';
import { getDiatonicInfo, functionColor } from '../../core/harmony';
import { useStore } from '../../state/store';

export const ProximityPyramid: React.FC<VisualizationProps> = ({
  referenceRoot,
  selectedChord,
  hoveredChord,
  onChordClick,
  onChordHover,
  width,
  height,
}) => {
  const progression = useStore(s => s.progression);
  const activeQualities = useStore(s => s.activeQualities);
  const progressionKeys = useMemo(
    () => new Set(progression.map(chordKey)),
    [progression]
  );

  const referenceChord = useMemo(
    () => chord(referenceRoot, 'major'),
    [referenceRoot]
  );

  const pyramid = useMemo(
    () => buildProximityPyramid(referenceChord, activeQualities),
    [referenceChord, activeQualities]
  );

  const bubbleRadius = Math.min(width, height) * 0.035;
  const paddingTop = 60;
  const paddingBottom = 30;
  const usableHeight = height - paddingTop - paddingBottom;
  const levelCount = pyramid.length + 1;
  const levelSpacing = usableHeight / Math.max(levelCount, 1);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Title */}
      <text x={width / 2} y={28} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={12}>
        Proximity Pyramid from {chordName(referenceChord)}
      </text>

      {/* Reference chord at top */}
      <ChordBubble
        chord={referenceChord}
        x={width / 2}
        y={paddingTop}
        radius={bubbleRadius * 1.3}
        isSelected={selectedChord !== null && chordsEqual(referenceChord, selectedChord)}
        isHovered={hoveredChord !== null && chordsEqual(referenceChord, hoveredChord)}
        isInProgression={progressionKeys.has(chordKey(referenceChord))}
        isReference={true}
        isDiatonic={true}
        isDimmed={false}
        isNextMove={false}
        fillColor={functionColor('tonic')}
        label="I"
        onClick={onChordClick}
        onHover={onChordHover}
      />

      {/* Pyramid levels */}
      {pyramid.map((level, levelIdx) => {
        const y = paddingTop + (levelIdx + 1) * levelSpacing;
        const chordsInLevel = level.chords;
        const totalWidth = width - 80;
        const spacing = totalWidth / Math.max(chordsInLevel.length + 1, 2);

        return (
          <g key={level.sharedCount}>
            {/* Level label */}
            <text x={16} y={y + 4} fill={sharedNoteColor(level.sharedCount)} fontSize={11} fontWeight={500}>
              {level.sharedCount}
            </text>

            {/* Connecting lines */}
            {chordsInLevel.map((c, i) => {
              const chordX = 40 + spacing * (i + 1);
              return (
                <line
                  key={`line-${chordKey(c)}`}
                  x1={width / 2} y1={paddingTop + bubbleRadius * 1.3}
                  x2={chordX} y2={y - bubbleRadius}
                  stroke={sharedNoteColor(level.sharedCount)}
                  strokeWidth={1} opacity={0.15}
                />
              );
            })}

            {/* Chord bubbles */}
            {chordsInLevel.map((c, i) => {
              const chordX = 40 + spacing * (i + 1);
              const info = getDiatonicInfo(c, referenceRoot);
              return (
                <ChordBubble
                  key={chordKey(c)}
                  chord={c}
                  x={chordX}
                  y={y}
                  radius={bubbleRadius}
                  isSelected={selectedChord !== null && chordsEqual(c, selectedChord)}
                  isHovered={hoveredChord !== null && chordsEqual(c, hoveredChord)}
                  isInProgression={progressionKeys.has(chordKey(c))}
                  isReference={false}
                  isDiatonic={info !== null}
                  isDimmed={false}
                  isNextMove={false}
                  fillColor={info ? functionColor(info.function) : qualityColor(c.quality)}
                  label={info?.roman}
                  onClick={onChordClick}
                  onHover={onChordHover}
                />
              );
            })}

            {/* Level description */}
            <text x={width - 16} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={10}>
              {level.sharedCount === 0 ? 'No shared notes' : `${level.sharedCount} shared note${level.sharedCount > 1 ? 's' : ''}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
