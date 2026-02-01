import React, { useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { qualityColor } from '../shared/colors';
import { chord, chordsEqual, chordKey, chordName, type Chord } from '../../core/chords';
import { CIRCLE_OF_FIFTHS_ORDER } from '../../core/constants';
import { isDominantOf, sharedNoteCount } from '../../core/relationships';
import { getDiatonicInfo, getNextMoves, functionColor, type NextMove } from '../../core/harmony';
import { getSecondaryDominants } from '../../core/secondaryDominants';
import { DominantChainOverlay } from './DominantChainOverlay';
import { useStore } from '../../state/store';
import {
  COLOR_FN_TONIC,
  COLOR_FN_SUBDOMINANT,
  COLOR_FN_DOMINANT,
  COLOR_MOVE_STRONG,
  COLOR_MOVE_COMMON,
  BRIDGE_TYPE_COLORS,
  SHARED_NOTE_COLORS,
  QUALITY_COLORS,
  COLOR_RING_STROKE,
  COLOR_RING_FILL,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_FAINT,
  COLOR_TEXT_DIM,
  COLOR_TEXT_DIMMER,
  FONT_SIZE_2XS,
  FONT_SIZE_XS,
  FONT_SIZE_SM,
  FONT_SIZE_BASE,
  FONT_SIZE_LG,
  FONT_SIZE_4XL,
} from '../../styles/theme';

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
  const showDom7Ring = useStore(s => s.showDom7Ring);
  const showSecondaryDominants = useStore(s => s.showSecondaryDominants);
  const showDominantChains = useStore(s => s.showDominantChains);
  const showIIVI = useStore(s => s.showIIVI);

  const progressionKeys = useMemo(
    () => new Set(progression.map(chordKey)),
    [progression]
  );

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const outerRadius = size * 0.38;
  const midRadius = size * 0.32; // Dom7 ring between outer and inner
  const innerRadius = size * 0.24;
  const bubbleRadius = size * 0.04;

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

  const dom7Positions: ChordPosition[] = useMemo(() => {
    return CIRCLE_OF_FIFTHS_ORDER.map((pc, i) => {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
      return {
        chord: chord(pc, 'dom7'),
        x: cx + Math.cos(angle) * midRadius,
        y: cy + Math.sin(angle) * midRadius,
        angle,
      };
    });
  }, [cx, cy, midRadius]);

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
    () => [...majorPositions, ...(showDom7Ring ? dom7Positions : []), ...minorPositions],
    [majorPositions, dom7Positions, minorPositions, showDom7Ring]
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

  // Secondary dominants
  const secondaryDoms = useMemo(
    () => getSecondaryDominants(referenceRoot),
    [referenceRoot]
  );

  // Active chord info
  const activeInfo = activeChord ? getDiatonicInfo(activeChord, referenceRoot) : null;

  function renderBubble(pos: ChordPosition, ring: 'major' | 'dom7' | 'minor') {
    const info = getDiatonicInfo(pos.chord, referenceRoot);
    const isDiatonic = info !== null;
    const isRef = chordsEqual(pos.chord, chord(referenceRoot, 'major'));
    const isActive = activeChord !== null && chordsEqual(pos.chord, activeChord);
    const nextMove = nextMoveKeys.get(chordKey(pos.chord));
    const hasActiveChord = activeChord !== null;
    const isDimmed = hasActiveChord
      ? !isActive && !nextMove && !isDiatonic
      : !isDiatonic;

    let fillColor = qualityColor(pos.chord.quality);
    if (info) {
      fillColor = functionColor(info.function);
    }

    const radiusScale = ring === 'major' ? 1 : ring === 'dom7' ? 0.78 : 0.85;

    return (
      <ChordBubble
        key={chordKey(pos.chord)}
        chord={pos.chord}
        x={pos.x}
        y={pos.y}
        radius={bubbleRadius * radiusScale}
        isSelected={selectedChord !== null && chordsEqual(pos.chord, selectedChord)}
        isHovered={hoveredChord !== null && chordsEqual(pos.chord, hoveredChord)}
        isInProgression={progressionKeys.has(chordKey(pos.chord))}
        isReference={isRef}
        isDiatonic={ring === 'dom7' ? true : isDiatonic}
        isDimmed={ring === 'dom7' ? false : isDimmed}
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Circle of Fifths in ${chordName(chord(referenceRoot, 'major'))} major`}>
      <title>Circle of Fifths - {chordName(chord(referenceRoot, 'major'))} major</title>
      <desc>Interactive circle of fifths diagram showing major and minor chords arranged by fifth relationships</desc>
      <defs>
        <marker id="arrow-dominant" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={QUALITY_COLORS.minor} />
        </marker>
        <marker id="arrow-next-strong" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLOR_MOVE_STRONG} />
        </marker>
        <marker id="arrow-next-common" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={COLOR_MOVE_COMMON} />
        </marker>
        <marker id="arrow-secondary-dom" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={BRIDGE_TYPE_COLORS['tritone-sub']} />
        </marker>
      </defs>

      {/* Background circles */}
      <circle cx={cx} cy={cy} r={outerRadius + bubbleRadius + 8} fill="none" stroke={COLOR_RING_STROKE} strokeWidth={1} />
      {showDom7Ring && (
        <circle cx={cx} cy={cy} r={midRadius + bubbleRadius * 0.78 + 6} fill="none" stroke={COLOR_RING_FILL} strokeWidth={1} />
      )}
      <circle cx={cx} cy={cy} r={innerRadius + bubbleRadius * 0.85 + 6} fill="none" stroke={COLOR_RING_STROKE} strokeWidth={1} />

      {/* Ring labels */}
      <text x={cx + outerRadius + bubbleRadius + 18} y={cy - outerRadius - bubbleRadius - 4} textAnchor="start" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_SM}>
        Major
      </text>
      {showDom7Ring && (
        <text x={cx + midRadius + bubbleRadius * 0.78 + 14} y={cy - midRadius - bubbleRadius * 0.78 - 2} textAnchor="start" fill={COLOR_TEXT_DIMMER} fontSize={FONT_SIZE_XS}>
          Dom 7th
        </text>
      )}
      <text x={cx + innerRadius + bubbleRadius * 0.85 + 14} y={cy - innerRadius - bubbleRadius * 0.85 - 2} textAnchor="start" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_SM}>
        Minor
      </text>

      {/* Relative major/minor lines */}
      {majorPositions.map((maj, i) => (
        <line
          key={`rel-${i}`}
          x1={maj.x} y1={maj.y} x2={minorPositions[i].x} y2={minorPositions[i].y}
          stroke={COLOR_RING_STROKE} strokeWidth={1}
        />
      ))}

      {/* Shared note highlight rings */}
      {activeChord && allPositions.map(pos => {
        const k = chordKey(pos.chord);
        const count = sharedHighlights.get(k);
        if (count === undefined || count === 0) return null;
        const colors = ['', SHARED_NOTE_COLORS[1], SHARED_NOTE_COLORS[2], SHARED_NOTE_COLORS[3]];
        return (
          <circle
            key={`shared-${k}`}
            cx={pos.x} cy={pos.y} r={bubbleRadius + 8}
            fill="none" stroke={colors[count]} strokeWidth={1.5} opacity={0.35}
          />
        );
      })}

      {/* Secondary dominant arrows */}
      {showSecondaryDominants && showDom7Ring && secondaryDoms.map((sd, i) => {
        const fromPos = dom7Positions.find(p => p.chord.root === sd.dom7.root);
        const toPos = majorPositions.find(p => p.chord.root === sd.target.root)
          ?? minorPositions.find(p => p.chord.root === sd.target.root);
        if (!fromPos || !toPos) return null;
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;
        const nx = dx / dist;
        const ny = dy / dist;

        // Label position
        const labelX = fromPos.x + dx * 0.4;
        const labelY = fromPos.y + dy * 0.4 - 6;

        return (
          <g key={`secdom-${i}`}>
            <line
              x1={fromPos.x + nx * (bubbleRadius * 0.78 + 4)}
              y1={fromPos.y + ny * (bubbleRadius * 0.78 + 4)}
              x2={toPos.x - nx * (bubbleRadius + 10)}
              y2={toPos.y - ny * (bubbleRadius + 10)}
              stroke={BRIDGE_TYPE_COLORS['tritone-sub']}
              strokeWidth={1.5}
              opacity={0.35}
              strokeDasharray="4 3"
              markerEnd="url(#arrow-secondary-dom)"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              fill={BRIDGE_TYPE_COLORS['tritone-sub']}
              fontSize={FONT_SIZE_2XS}
              opacity={0.5}
            >
              {sd.label}
            </text>
          </g>
        );
      })}

      {/* Dominant arrows */}
      {dominantArrows.map((arrow, i) => (
        <g key={`dom-arrow-${i}`}>
          {arrowLine(arrow.from, arrow.to, QUALITY_COLORS.minor, 0.6, 'arrow-dominant')}
        </g>
      ))}

      {/* Next move arrows */}
      {nextMoveArrows.map((arrow, i) => (
        <g key={`next-arrow-${i}`}>
          {arrowLine(
            arrow.from, arrow.to,
            arrow.move.strength === 'strong' ? COLOR_MOVE_STRONG : COLOR_MOVE_COMMON,
            arrow.move.strength === 'strong' ? 0.7 : 0.4,
            arrow.move.strength === 'strong' ? 'arrow-next-strong' : 'arrow-next-common',
            arrow.move.strength === 'common'
          )}
        </g>
      ))}

      {/* Dominant Chain / ii-V-I overlay */}
      {(showDominantChains || showIIVI) && showDom7Ring && (
        <DominantChainOverlay
          referenceRoot={referenceRoot}
          showChains={showDominantChains}
          showIIVI={showIIVI}
          hoveredChord={hoveredChord}
          selectedChord={selectedChord}
          dom7Positions={dom7Positions}
          majorPositions={majorPositions}
          minorPositions={minorPositions}
          bubbleRadius={bubbleRadius}
          cx={cx}
          cy={cy}
        />
      )}

      {/* Major chord bubbles */}
      {majorPositions.map(pos => renderBubble(pos, 'major'))}

      {/* Dom7 chord bubbles */}
      {showDom7Ring && dom7Positions.map(pos => renderBubble(pos, 'dom7'))}

      {/* Minor chord bubbles */}
      {minorPositions.map(pos => renderBubble(pos, 'minor'))}

      {/* Center info */}
      {activeChord && (
        <g>
          <text x={cx} y={cy - 20} textAnchor="middle" fill="white" fontSize={FONT_SIZE_4XL} fontWeight={700}>
            {chordName(activeChord)}
          </text>
          {activeInfo && (
            <>
              <text x={cx} y={cy + 2} textAnchor="middle" fill={COLOR_TEXT_SECONDARY} fontSize={FONT_SIZE_LG}>
                {activeInfo.roman} — {activeInfo.function}
              </text>
              <text x={cx} y={cy + 22} textAnchor="middle" fill={COLOR_TEXT_FAINT} fontSize={FONT_SIZE_BASE}>
                {nextMoves.filter(m => m.strength === 'strong').length} strong moves
                {' \u00B7 '}
                {nextMoves.filter(m => m.strength === 'common').length} common
              </text>
            </>
          )}
          {!activeInfo && (
            <text x={cx} y={cy + 2} textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_MD}>
              Not in key — click to hear
            </text>
          )}
        </g>
      )}
      {!activeChord && (
        <g>
          <text x={cx} y={cy - 8} textAnchor="middle" fill={COLOR_TEXT_FAINT} fontSize={FONT_SIZE_LG}>
            Key of {chordName(chord(referenceRoot, 'major'))}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill={COLOR_TEXT_DIMMER} fontSize={FONT_SIZE_BASE}>
            Hover a chord to explore
          </text>
        </g>
      )}

      {/* Legend */}
      <g transform={`translate(${width - 140}, ${height - 80})`}>
        <text x={0} y={0} fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_XS} fontWeight={600}>FUNCTION</text>
        <circle cx={8} cy={14} r={5} fill={COLOR_FN_TONIC} opacity={0.8} />
        <text x={18} y={18} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Tonic (T)</text>
        <circle cx={8} cy={30} r={5} fill={COLOR_FN_SUBDOMINANT} opacity={0.8} />
        <text x={18} y={34} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Subdominant (S)</text>
        <circle cx={8} cy={46} r={5} fill={COLOR_FN_DOMINANT} opacity={0.8} />
        <text x={18} y={50} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Dominant (D)</text>
      </g>
    </svg>
  );
};
