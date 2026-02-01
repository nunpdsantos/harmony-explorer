import React, { useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { qualityColor } from '../shared/colors';
import { chord, chordsEqual, chordKey, chordName, type Chord } from '../../core/chords';
import { CIRCLE_OF_FIFTHS_ORDER } from '../../core/constants';
import { isDominantOf, sharedNoteCount } from '../../core/relationships';
import { getDiatonicInfo, getNextMoves, functionColor, type NextMove } from '../../core/harmony';
import { useStore } from '../../state/store';

interface ChordPosition {
  chord: Chord;
  x: number;
  y: number;
  angle: number;
}

const FUNCTION_ABBREV = { tonic: 'T', subdominant: 'S', dominant: 'D' } as const;

export const CircleOfFifths: React.FC<VisualizationProps> = ({
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

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const outerRadius = size * 0.38;
  const innerRadius = size * 0.26;
  const bubbleRadius = size * 0.045;

  // Position chords around the circle
  const majorPositions: ChordPosition[] = useMemo(() => {
    return CIRCLE_OF_FIFTHS_ORDER.map((pc, i) => {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
      return {
        chord: chord(pc, 'major'),
        x: cx + Math.cos(angle) * outerRadius,
        y: cy + Math.sin(angle) * outerRadius,
        angle,
      };
    });
  }, [cx, cy, outerRadius]);

  const minorPositions: ChordPosition[] = useMemo(() => {
    return CIRCLE_OF_FIFTHS_ORDER.map((pc, i) => {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
      const minorRoot = (pc + 9) % 12;
      return {
        chord: chord(minorRoot, 'minor'),
        x: cx + Math.cos(angle) * innerRadius,
        y: cy + Math.sin(angle) * innerRadius,
        angle,
      };
    });
  }, [cx, cy, innerRadius]);

  const allPositions = useMemo(
    () => [...majorPositions, ...minorPositions],
    [majorPositions, minorPositions]
  );

  // Active chord for highlighting
  const activeChord = hoveredChord ?? selectedChord;

  // Compute next moves from the active chord
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

  // Dominant arrows
  const dominantArrows = useMemo(() => {
    if (!activeChord) return [];
    const arrows: { from: ChordPosition; to: ChordPosition; type: string }[] = [];
    for (const pos of allPositions) {
      if (isDominantOf(activeChord, pos.chord)) {
        const fromPos = allPositions.find(p => chordsEqual(p.chord, activeChord));
        if (fromPos) arrows.push({ from: fromPos, to: pos, type: 'dominant' });
      }
      if (isDominantOf(pos.chord, activeChord)) {
        const toPos = allPositions.find(p => chordsEqual(p.chord, activeChord));
        if (toPos) arrows.push({ from: pos, to: toPos, type: 'resolve' });
      }
    }
    return arrows;
  }, [activeChord, allPositions]);

  // Next move arrows
  const nextMoveArrows = useMemo(() => {
    if (!activeChord) return [];
    const fromPos = allPositions.find(p => chordsEqual(p.chord, activeChord));
    if (!fromPos) return [];
    return nextMoves
      .filter(m => m.strength === 'strong' || m.strength === 'common')
      .map(m => {
        const toPos = allPositions.find(p => chordsEqual(p.chord, m.chord));
        if (!toPos) return null;
        return { from: fromPos, to: toPos, move: m };
      })
      .filter(Boolean) as { from: ChordPosition; to: ChordPosition; move: NextMove }[];
  }, [activeChord, allPositions, nextMoves]);

  // Shared note highlights
  const sharedHighlights = useMemo(() => {
    if (!activeChord) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const pos of allPositions) {
      if (!chordsEqual(pos.chord, activeChord)) {
        map.set(chordKey(pos.chord), sharedNoteCount(activeChord, pos.chord));
      }
    }
    return map;
  }, [activeChord, allPositions]);

  // Active chord info
  const activeInfo = activeChord ? getDiatonicInfo(activeChord, referenceRoot) : null;

  function renderBubble(pos: ChordPosition, isMajorRing: boolean) {
    const info = getDiatonicInfo(pos.chord, referenceRoot);
    const isDiatonic = info !== null;
    const isRef = chordsEqual(pos.chord, chord(referenceRoot, 'major'));
    const isActive = activeChord !== null && chordsEqual(pos.chord, activeChord);
    const nextMove = nextMoveKeys.get(chordKey(pos.chord));
    const hasActiveChord = activeChord !== null;
    // Dim non-diatonic chords when nothing is selected, or dim chords that aren't next moves when something is active
    const isDimmed = hasActiveChord
      ? !isActive && !nextMove && !isDiatonic
      : !isDiatonic;

    let fillColor = qualityColor(pos.chord.quality);
    if (info) {
      // Tint by tonal function
      const fc = functionColor(info.function);
      fillColor = fc;
    }

    return (
      <ChordBubble
        key={chordKey(pos.chord)}
        chord={pos.chord}
        x={pos.x}
        y={pos.y}
        radius={isMajorRing ? bubbleRadius : bubbleRadius * 0.85}
        isSelected={selectedChord !== null && chordsEqual(pos.chord, selectedChord)}
        isHovered={hoveredChord !== null && chordsEqual(pos.chord, hoveredChord)}
        isInProgression={progressionKeys.has(chordKey(pos.chord))}
        isReference={isRef}
        isDiatonic={isDiatonic}
        isDimmed={isDimmed}
        isNextMove={!!nextMove}
        nextMoveStrength={nextMove?.strength}
        fillColor={fillColor}
        label={info?.roman}
        sublabel={info ? FUNCTION_ABBREV[info.function] : undefined}
        onClick={onChordClick}
        onHover={onChordHover}
      />
    );
  }

  function arrowLine(
    from: ChordPosition, to: ChordPosition,
    color: string, opacity: number, markerId: string, dashed?: boolean
  ) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return null;
    const nx = dx / dist;
    const ny = dy / dist;
    return (
      <line
        x1={from.x + nx * (bubbleRadius + 4)}
        y1={from.y + ny * (bubbleRadius + 4)}
        x2={to.x - nx * (bubbleRadius + 10)}
        y2={to.y - ny * (bubbleRadius + 10)}
        stroke={color}
        strokeWidth={2}
        opacity={opacity}
        strokeDasharray={dashed ? '6 4' : undefined}
        markerEnd={`url(#${markerId})`}
      />
    );
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <marker id="arrow-dominant" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#8b5cf6" />
        </marker>
        <marker id="arrow-next-strong" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#fbbf24" />
        </marker>
        <marker id="arrow-next-common" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#a78bfa" />
        </marker>
      </defs>

      {/* Background circles */}
      <circle cx={cx} cy={cy} r={outerRadius + bubbleRadius + 8} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      <circle cx={cx} cy={cy} r={innerRadius + bubbleRadius + 8} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

      {/* Ring labels */}
      <text x={cx + outerRadius + bubbleRadius + 18} y={cy - outerRadius - bubbleRadius - 4} textAnchor="start" fill="rgba(255,255,255,0.3)" fontSize={10}>
        Major
      </text>
      <text x={cx + innerRadius + bubbleRadius + 18} y={cy - innerRadius - bubbleRadius - 4} textAnchor="start" fill="rgba(255,255,255,0.3)" fontSize={10}>
        Minor
      </text>

      {/* Relative major/minor lines */}
      {majorPositions.map((maj, i) => (
        <line
          key={`rel-${i}`}
          x1={maj.x} y1={maj.y} x2={minorPositions[i].x} y2={minorPositions[i].y}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1}
        />
      ))}

      {/* Shared note highlight rings */}
      {activeChord && allPositions.map(pos => {
        const k = chordKey(pos.chord);
        const count = sharedHighlights.get(k);
        if (count === undefined || count === 0) return null;
        const colors = ['', '#f59e0b', '#3b82f6', '#22c55e'];
        return (
          <circle
            key={`shared-${k}`}
            cx={pos.x} cy={pos.y} r={bubbleRadius + 8}
            fill="none" stroke={colors[count]} strokeWidth={1.5} opacity={0.35}
          />
        );
      })}

      {/* Dominant arrows */}
      {dominantArrows.map((arrow, i) => (
        <g key={`dom-arrow-${i}`}>
          {arrowLine(arrow.from, arrow.to, '#8b5cf6', 0.6, 'arrow-dominant')}
        </g>
      ))}

      {/* Next move arrows */}
      {nextMoveArrows.map((arrow, i) => (
        <g key={`next-arrow-${i}`}>
          {arrowLine(
            arrow.from, arrow.to,
            arrow.move.strength === 'strong' ? '#fbbf24' : '#a78bfa',
            arrow.move.strength === 'strong' ? 0.7 : 0.4,
            arrow.move.strength === 'strong' ? 'arrow-next-strong' : 'arrow-next-common',
            arrow.move.strength === 'common'
          )}
        </g>
      ))}

      {/* Major chord bubbles */}
      {majorPositions.map(pos => renderBubble(pos, true))}

      {/* Minor chord bubbles */}
      {minorPositions.map(pos => renderBubble(pos, false))}

      {/* Center info */}
      {activeChord && (
        <g>
          <text x={cx} y={cy - 20} textAnchor="middle" fill="white" fontSize={20} fontWeight={700}>
            {chordName(activeChord)}
          </text>
          {activeInfo && (
            <>
              <text x={cx} y={cy + 2} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={13}>
                {activeInfo.roman} — {activeInfo.function}
              </text>
              <text x={cx} y={cy + 22} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={11}>
                {nextMoves.filter(m => m.strength === 'strong').length} strong moves
                {' \u00B7 '}
                {nextMoves.filter(m => m.strength === 'common').length} common
              </text>
            </>
          )}
          {!activeInfo && (
            <text x={cx} y={cy + 2} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={12}>
              Not in key — click to hear
            </text>
          )}
        </g>
      )}
      {!activeChord && (
        <g>
          <text x={cx} y={cy - 8} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={13}>
            Key of {chordName(chord(referenceRoot, 'major'))}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={11}>
            Hover a chord to explore
          </text>
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(${width - 140}, ${height - 80})`}>
        <text x={0} y={0} fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight={600}>FUNCTION</text>
        <circle cx={8} cy={14} r={5} fill="#22c55e" opacity={0.8} />
        <text x={18} y={18} fill="rgba(255,255,255,0.5)" fontSize={9}>Tonic (T)</text>
        <circle cx={8} cy={30} r={5} fill="#3b82f6" opacity={0.8} />
        <text x={18} y={34} fill="rgba(255,255,255,0.5)" fontSize={9}>Subdominant (S)</text>
        <circle cx={8} cy={46} r={5} fill="#ef4444" opacity={0.8} />
        <text x={18} y={50} fill="rgba(255,255,255,0.5)" fontSize={9}>Dominant (D)</text>
      </g>
    </svg>
  );
};
