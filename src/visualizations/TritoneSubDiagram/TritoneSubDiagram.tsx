import React, { useMemo, useState } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { chord, chordName, chordKey, chordsEqual, type Chord } from '../../core/chords';
import { getTritoneSubPairs } from '../../core/symmetricStructures';
import { CIRCLE_OF_FIFTHS_ORDER, noteName } from '../../core/constants';
import { qualityColor } from '../shared/colors';
import { useStore } from '../../state/store';

const PAIR_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

export const TritoneSubDiagram: React.FC<VisualizationProps> = ({
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

  const [selectedPairIndex, setSelectedPairIndex] = useState<number | null>(null);

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const circleRadius = size * 0.36;
  const bubbleRadius = size * 0.04;

  const pairs = useMemo(() => getTritoneSubPairs(), []);

  // Position 12 dom7 chords around circle by fifths
  const dom7Positions = useMemo(() => {
    return CIRCLE_OF_FIFTHS_ORDER.map((pc, i) => {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
      return {
        chord: chord(pc, 'dom7'),
        x: cx + Math.cos(angle) * circleRadius,
        y: cy + Math.sin(angle) * circleRadius,
        angle,
        pc,
      };
    });
  }, [cx, cy, circleRadius]);

  // Map each dom7 root to its pair index
  const rootToPairIndex = useMemo(() => {
    const map = new Map<number, number>();
    pairs.forEach((pair, i) => {
      map.set(pair.dom7.root, i);
      map.set(pair.tritoneSubDom7.root, i);
    });
    return map;
  }, [pairs]);

  const handleDom7Click = (c: Chord) => {
    const pairIdx = rootToPairIndex.get(c.root);
    if (pairIdx !== undefined) {
      setSelectedPairIndex(prev => prev === pairIdx ? null : pairIdx);
    }
    onChordClick(c);
  };

  const activePair = selectedPairIndex !== null ? pairs[selectedPairIndex] : null;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tritone Substitution diagram showing six dominant seventh chord pairs a tritone apart">
      <title>Tritone Substitution Diagram</title>
      <desc>Circle diagram showing the six pairs of dominant seventh chords related by tritone substitution, each pair sharing the same tritone interval</desc>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={circleRadius + bubbleRadius + 10} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

      {/* Tritone pair lines through center */}
      {pairs.map((pair, i) => {
        const pos1 = dom7Positions.find(p => p.pc === pair.dom7.root);
        const pos2 = dom7Positions.find(p => p.pc === pair.tritoneSubDom7.root);
        if (!pos1 || !pos2) return null;
        const isActive = selectedPairIndex === i;

        return (
          <line
            key={`pair-${i}`}
            x1={pos1.x}
            y1={pos1.y}
            x2={pos2.x}
            y2={pos2.y}
            stroke={PAIR_COLORS[i]}
            strokeWidth={isActive ? 3 : 1.5}
            opacity={isActive ? 0.7 : selectedPairIndex !== null ? 0.1 : 0.2}
          />
        );
      })}

      {/* Dom7 chord bubbles */}
      {dom7Positions.map(pos => {
        const pairIdx = rootToPairIndex.get(pos.pc);
        const isInActivePair = activePair && (
          pos.pc === activePair.dom7.root || pos.pc === activePair.tritoneSubDom7.root
        );
        const isDimmed = selectedPairIndex !== null && !isInActivePair;

        return (
          <ChordBubble
            key={chordKey(pos.chord)}
            chord={pos.chord}
            x={pos.x}
            y={pos.y}
            radius={bubbleRadius}
            isSelected={selectedChord !== null && chordsEqual(pos.chord, selectedChord)}
            isHovered={hoveredChord !== null && chordsEqual(pos.chord, hoveredChord)}
            isInProgression={progressionKeys.has(chordKey(pos.chord))}
            isReference={false}
            isDiatonic={true}
            isDimmed={isDimmed ?? false}
            isNextMove={isInActivePair ?? false}
            nextMoveStrength={isInActivePair ? 'strong' : undefined}
            fillColor={pairIdx !== undefined ? PAIR_COLORS[pairIdx] : qualityColor('dom7')}
            onClick={() => handleDom7Click(pos.chord)}
            onHover={onChordHover}
          />
        );
      })}

      {/* Center info */}
      {activePair ? (
        <g>
          <text x={cx} y={cy - 30} textAnchor="middle" fill="white" fontSize={16} fontWeight={700}>
            {chordName(activePair.dom7)} \u2194 {chordName(activePair.tritoneSubDom7)}
          </text>
          <text x={cx} y={cy - 8} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={12}>
            Shared tritone: {noteName(activePair.sharedTritone[0])} &amp; {noteName(activePair.sharedTritone[1])}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fill="#fbbf24" fontSize={12}>
            Both resolve to {chordName(activePair.commonResolution)}
          </text>
          <text x={cx} y={cy + 32} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={10}>
            Roots a tritone (6 semitones) apart
          </text>
        </g>
      ) : (
        <g>
          <text x={cx} y={cy - 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={13}>
            Tritone Substitutions
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={11}>
            Click a chord to highlight its tritone pair
          </text>
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(12, ${height - 20})`}>
        <text x={0} y={0} fill="rgba(255,255,255,0.25)" fontSize={9}>
          6 tritone pairs {'\u00B7'} 12 dom7 chords arranged by circle of fifths
        </text>
      </g>
    </svg>
  );
};
