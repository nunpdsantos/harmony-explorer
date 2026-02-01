import React, { useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { chordsEqual, chordKey } from '../../core/chords';
import { getDiatonicChords, getNextMoves, functionColor, type NextMove } from '../../core/harmony';
import { useStore } from '../../state/store';
import {
  COLOR_FN_TONIC,
  COLOR_FN_SUBDOMINANT,
  COLOR_FN_DOMINANT,
  COLOR_MOVE_STRONG,
  COLOR_MOVE_COMMON,
  COLOR_ACCENT,
  COLOR_TEXT_DIM,
  COLOR_TEXT_DIMMER,
  COLOR_LINE_FAINT,
  FONT_SIZE_BASE,
  FONT_SIZE_LG,
} from '../../styles/theme';

interface ColumnDef {
  label: string;
  fn: 'tonic' | 'subdominant' | 'dominant';
  degrees: number[];
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { label: 'Tonic (T)', fn: 'tonic', degrees: [0, 2, 5], color: COLOR_FN_TONIC },
  { label: 'Subdominant (S)', fn: 'subdominant', degrees: [1, 3], color: COLOR_FN_SUBDOMINANT },
  { label: 'Dominant (D)', fn: 'dominant', degrees: [4, 6], color: COLOR_FN_DOMINANT },
];

const FUNCTION_ABBREV = { tonic: 'T', subdominant: 'S', dominant: 'D' } as const;

// Harmonic flow arrows between functions
const FLOW_ARROWS: { from: number; to: number; label: string; strength: 'strong' | 'common' }[] = [
  { from: 0, to: 1, label: 'T→S', strength: 'common' },
  { from: 0, to: 2, label: 'T→D', strength: 'strong' },
  { from: 1, to: 2, label: 'S→D', strength: 'strong' },
  { from: 2, to: 0, label: 'D→T', strength: 'strong' },
  { from: 1, to: 0, label: 'S→T', strength: 'common' },
];

export const TonalFunctionChart: React.FC<VisualizationProps> = ({
  referenceRoot,
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

  const diatonic = useMemo(() => getDiatonicChords(referenceRoot), [referenceRoot]);
  const activeChord = hoveredChord ?? selectedChord;

  const nextMoves: NextMove[] = useMemo(() => {
    if (!activeChord) return [];
    return getNextMoves(activeChord, referenceRoot);
  }, [activeChord, referenceRoot]);

  const nextMoveKeys = useMemo(() => {
    const map = new Map<string, NextMove>();
    for (const m of nextMoves) {
      map.set(chordKey(m.chord), m);
    }
    return map;
  }, [nextMoves]);

  const bubbleRadius = Math.min(width, height) * 0.05;
  const colWidth = width / 3;
  const headerH = 60;
  const availH = height - headerH - 40;

  // Position chords in each column
  const columnPositions = useMemo(() => {
    return COLUMNS.map((col, ci) => {
      const colCx = colWidth * ci + colWidth / 2;
      const chords = col.degrees.map(deg => diatonic[deg]);
      const spacing = availH / (chords.length + 1);
      return chords.map((d, i) => ({
        chord: d.chord,
        info: d,
        x: colCx,
        y: headerH + spacing * (i + 1),
        colIndex: ci,
      }));
    });
  }, [diatonic, colWidth, availH]);

  const allPositions = useMemo(() => columnPositions.flat(), [columnPositions]);

  // Column center X positions
  const colCenters = COLUMNS.map((_, ci) => colWidth * ci + colWidth / 2);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tonal Function Chart showing Tonic, Subdominant, and Dominant chord groups">
      <title>Tonal Function Chart</title>
      <desc>Chart organizing diatonic chords by harmonic function: Tonic, Subdominant, and Dominant, with arrows showing common voice-leading paths</desc>
      <defs>
        <marker id="tfc-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLOR_TEXT_DIM} />
        </marker>
        <marker id="tfc-arrow-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLOR_ACCENT} />
        </marker>
      </defs>

      {/* Column backgrounds */}
      {COLUMNS.map((col, ci) => (
        <g key={col.label}>
          <rect
            x={colWidth * ci + 4}
            y={4}
            width={colWidth - 8}
            height={height - 8}
            rx={12}
            fill={col.color}
            opacity={0.04}
            stroke={col.color}
            strokeWidth={1}
            strokeOpacity={0.15}
          />
          {/* Column header */}
          <text
            x={colCenters[ci]}
            y={30}
            textAnchor="middle"
            fill={col.color}
            fontSize={FONT_SIZE_LG}
            fontWeight={600}
          >
            {col.label}
          </text>
        </g>
      ))}

      {/* Flow arrows between columns */}
      {FLOW_ARROWS.map((arrow, i) => {
        const fromX = colCenters[arrow.from];
        const toX = colCenters[arrow.to];
        const isActiveFlow = activeChord && diatonic.some(d =>
          chordsEqual(d.chord, activeChord) && COLUMNS[arrow.from].degrees.includes(d.degree)
        );

        // Curved path
        const midY = headerH + availH / 2;
        const yOffset = arrow.from < arrow.to ? -30 - i * 15 : 30 + i * 15;
        const cpY = midY + yOffset;

        return (
          <g key={`flow-${i}`}>
            <path
              d={`M ${fromX} ${midY} Q ${(fromX + toX) / 2} ${cpY} ${toX} ${midY}`}
              fill="none"
              stroke={isActiveFlow ? COLOR_ACCENT : COLOR_LINE_FAINT}
              strokeWidth={isActiveFlow ? 2 : 1}
              strokeDasharray={arrow.strength === 'common' ? '6 4' : undefined}
              markerEnd={isActiveFlow ? 'url(#tfc-arrow-active)' : 'url(#tfc-arrow)'}
            />
          </g>
        );
      })}

      {/* Chord bubbles */}
      {allPositions.map(pos => {
        const isActive = activeChord !== null && chordsEqual(pos.chord, activeChord);
        const nextMove = nextMoveKeys.get(chordKey(pos.chord));
        const hasActiveChord = activeChord !== null;
        const isDimmed = hasActiveChord ? !isActive && !nextMove : false;

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
            isReference={pos.info.degree === 0}
            isDiatonic={true}
            isDimmed={isDimmed}
            isNextMove={!!nextMove}
            nextMoveStrength={nextMove?.strength}
            fillColor={functionColor(pos.info.function)}
            label={pos.info.roman}
            sublabel={FUNCTION_ABBREV[pos.info.function]}
            onClick={onChordClick}
            onHover={onChordHover}
          />
        );
      })}

      {/* Next move arrows from active chord to targets */}
      {activeChord && allPositions
        .filter(p => chordsEqual(p.chord, activeChord))
        .map(fromPos =>
          nextMoves
            .filter(m => m.strength === 'strong' || m.strength === 'common')
            .map((m, i) => {
              const toPos = allPositions.find(p => chordsEqual(p.chord, m.chord));
              if (!toPos) return null;
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist === 0) return null;
              const nx = dx / dist;
              const ny = dy / dist;
              return (
                <line
                  key={`next-${i}`}
                  x1={fromPos.x + nx * (bubbleRadius + 4)}
                  y1={fromPos.y + ny * (bubbleRadius + 4)}
                  x2={toPos.x - nx * (bubbleRadius + 10)}
                  y2={toPos.y - ny * (bubbleRadius + 10)}
                  stroke={m.strength === 'strong' ? COLOR_MOVE_STRONG : COLOR_MOVE_COMMON}
                  strokeWidth={2}
                  opacity={m.strength === 'strong' ? 0.7 : 0.4}
                  strokeDasharray={m.strength === 'common' ? '6 4' : undefined}
                  markerEnd="url(#tfc-arrow-active)"
                />
              );
            })
        )}

      {/* Center info when no chord active */}
      {!activeChord && (
        <text
          x={width / 2}
          y={height - 16}
          textAnchor="middle"
          fill={COLOR_TEXT_DIMMER}
          fontSize={FONT_SIZE_BASE}
        >
          Hover a chord to see harmonic flow
        </text>
      )}
    </svg>
  );
};
