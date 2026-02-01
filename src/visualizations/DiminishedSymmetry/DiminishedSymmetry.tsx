import React, { useMemo, useState } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { chord, chordName, chordKey, chordsEqual, chordPitchClasses, type Chord } from '../../core/chords';
import { getDiminished7thGroups, getDiminishedResolutions } from '../../core/symmetricStructures';
import { noteName } from '../../core/constants';
import { useStore } from '../../state/store';

const GROUP_COLORS = ['#ef4444', '#3b82f6', '#22c55e']; // Red, Blue, Green for the 3 groups
const GROUP_LABELS = ['Group I', 'Group II', 'Group III'];

export const DiminishedSymmetry: React.FC<VisualizationProps> = ({
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

  const [selectedVertex, setSelectedVertex] = useState<Chord | null>(null);

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const circleRadius = size * 0.36;
  const bubbleRadius = size * 0.035;

  const groups = useMemo(() => getDiminished7thGroups(), []);

  // Position 12 chromatic notes around the circle
  const notePositions = useMemo(() => {
    return Array.from({ length: 12 }, (_, pc) => {
      const angle = (pc * Math.PI * 2) / 12 - Math.PI / 2;
      return {
        pc,
        x: cx + Math.cos(angle) * circleRadius,
        y: cy + Math.sin(angle) * circleRadius,
        angle,
      };
    });
  }, [cx, cy, circleRadius]);

  // Active dim7 for resolution display
  const activeDim7 = selectedVertex;
  const resolutions = useMemo(() => {
    if (!activeDim7) return [];
    return getDiminishedResolutions(activeDim7);
  }, [activeDim7]);

  const handleVertexClick = (c: Chord) => {
    setSelectedVertex(prev => prev && chordsEqual(prev, c) ? null : c);
    onChordClick(c);
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Diminished Symmetry diagram showing three diminished seventh chord groups and their resolutions">
      <title>Diminished Symmetry</title>
      <desc>Diagram showing the three diminished seventh chord groups that partition all 12 pitch classes, with resolution arrows to major and minor triads</desc>
      <defs>
        <marker id="dim-res-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#fbbf24" />
        </marker>
      </defs>

      {/* Background chromatic circle */}
      <circle cx={cx} cy={cy} r={circleRadius + bubbleRadius + 10} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

      {/* Draw inscribed squares for each dim7 group */}
      {groups.map((group, gi) => {
        const pcs = chordPitchClasses(group[0]); // Get the 4 pitch classes
        const positions = pcs.map(pc => notePositions[pc]);
        const isActive = activeDim7 && pcs.includes(activeDim7.root);

        // Draw square connecting the 4 notes
        const pathD = positions.map((p, i) =>
          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ') + ' Z';

        return (
          <g key={gi}>
            <path
              d={pathD}
              fill={GROUP_COLORS[gi]}
              fillOpacity={isActive ? 0.08 : 0.03}
              stroke={GROUP_COLORS[gi]}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeOpacity={isActive ? 0.7 : 0.3}
            />
          </g>
        );
      })}

      {/* Resolution arrows from selected dim7 vertex */}
      {activeDim7 && resolutions.map((res, i) => {
        const fromPc = chordPitchClasses(activeDim7)[i];
        const toPc = res.root;
        const from = notePositions[fromPc];
        // Resolution target is just outside the circle
        const toAngle = (toPc * Math.PI * 2) / 12 - Math.PI / 2;
        const resRadius = circleRadius + bubbleRadius + 30;
        const toX = cx + Math.cos(toAngle) * resRadius;
        const toY = cy + Math.sin(toAngle) * resRadius;

        const dx = toX - from.x;
        const dy = toY - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;

        return (
          <g key={`res-${i}`}>
            <line
              x1={from.x + nx * (bubbleRadius + 4)}
              y1={from.y + ny * (bubbleRadius + 4)}
              x2={toX - nx * 12}
              y2={toY - ny * 12}
              stroke="#fbbf24"
              strokeWidth={1.5}
              opacity={0.6}
              markerEnd="url(#dim-res-arrow)"
            />
            <text
              x={toX + nx * 4}
              y={toY + ny * 4}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#fbbf24"
              fontSize={10}
              fontWeight={600}
            >
              {chordName(res)}
            </text>
          </g>
        );
      })}

      {/* Chromatic note positions as clickable dim7 chord bubbles */}
      {notePositions.map(pos => {
        // Find which group this note belongs to
        const groupIndex = pos.pc % 3;
        const dim7Chord = chord(pos.pc, 'dim7');
        const isActive = activeDim7 && chordsEqual(activeDim7, dim7Chord);
        const groupPcs = chordPitchClasses(groups[groupIndex][0]);
        const isInActiveGroup = activeDim7 && groupPcs.includes(activeDim7.root) && groupPcs.includes(pos.pc);

        return (
          <ChordBubble
            key={`note-${pos.pc}`}
            chord={dim7Chord}
            x={pos.x}
            y={pos.y}
            radius={bubbleRadius}
            isSelected={isActive ?? false}
            isHovered={hoveredChord !== null && chordsEqual(hoveredChord, dim7Chord)}
            isInProgression={progressionKeys.has(chordKey(dim7Chord))}
            isReference={false}
            isDiatonic={true}
            isDimmed={activeDim7 !== null && !isInActiveGroup}
            isNextMove={false}
            fillColor={GROUP_COLORS[groupIndex]}
            label={noteName(pos.pc)}
            onClick={() => handleVertexClick(dim7Chord)}
            onHover={onChordHover}
          />
        );
      })}

      {/* Center info */}
      {activeDim7 ? (
        <g>
          <text x={cx} y={cy - 20} textAnchor="middle" fill="white" fontSize={18} fontWeight={700}>
            {chordName(activeDim7)}
          </text>
          <text x={cx} y={cy + 2} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={12}>
            Notes: {chordPitchClasses(activeDim7).map(pc => noteName(pc)).join(', ')}
          </text>
          <text x={cx} y={cy + 20} textAnchor="middle" fill="#fbbf24" fontSize={11}>
            Resolves to: {resolutions.map(r => chordName(r)).join(', ')}
          </text>
        </g>
      ) : (
        <g>
          <text x={cx} y={cy - 10} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={13}>
            Diminished 7th Symmetry
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={11}>
            Click a vertex to see resolutions
          </text>
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(${width - 130}, ${height - 70})`}>
        <text x={0} y={0} fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight={600}>DIM7 GROUPS</text>
        {GROUP_LABELS.map((label, i) => (
          <g key={label}>
            <circle cx={8} cy={14 + i * 16} r={5} fill={GROUP_COLORS[i]} opacity={0.8} />
            <text x={18} y={18 + i * 16} fill="rgba(255,255,255,0.5)" fontSize={9}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
};
