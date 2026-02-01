import React, { useMemo } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { chordsEqual, chordKey, chordName, type Chord } from '../../core/chords';
import { CIRCLE_OF_FIFTHS_ORDER, noteName } from '../../core/constants';
import { getDiatonicChords, functionColor } from '../../core/harmony';
import { findCommonChords, findDiminishedPivots, findAugmentedPivots, keyDistance, type CommonChord, type DiminishedPivot, type AugmentedPivot } from '../../core/modulation';
import { useStore } from '../../state/store';
import {
  COLOR_FN_TONIC,
  COLOR_ACCENT,
  QUALITY_COLORS,
  COLOR_RING_STROKE,
  COLOR_TEXT_SECONDARY,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_FAINT,
  COLOR_TEXT_DIM,
  FONT_SIZE_3XS,
  FONT_SIZE_2XS,
  FONT_SIZE_XS,
  FONT_SIZE_SM,
  FONT_SIZE_BASE,
  FONT_SIZE_MD,
  FONT_SIZE_XL,
  FONT_SIZE_2XL,
} from '../../styles/theme';

/** Map pitch class → Circle of Fifths index (0-11) */
function cofIndex(pc: number): number {
  return CIRCLE_OF_FIFTHS_ORDER.indexOf(((pc % 12) + 12) % 12);
}

/** Angle on the circle for a given CoF index */
function cofAngle(idx: number): number {
  return (idx * Math.PI * 2) / 12 - Math.PI / 2;
}

interface RingChord {
  chord: Chord;
  x: number;
  y: number;
  angle: number;
  roman: string;
  fn: 'tonic' | 'subdominant' | 'dominant';
}

const FUNCTION_ABBREV = { tonic: 'T', subdominant: 'S', dominant: 'D' } as const;

export const ModulationMap: React.FC<VisualizationProps> = ({
  referenceRoot,
  selectedChord,
  hoveredChord,
  onChordClick,
  onChordHover,
  width,
  height,
}) => {
  const modulationTarget = useStore(s => s.modulationTarget);
  const setModulationTarget = useStore(s => s.setModulationTarget);
  const progression = useStore(s => s.progression);

  const progressionKeys = useMemo(
    () => new Set(progression.map(chordKey)),
    [progression],
  );

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const selectorRadius = size * 0.44;
  const outerRadius = size * 0.34;
  const innerRadius = size * 0.22;
  const bubbleRadius = size * 0.035;

  const sourceRoot = referenceRoot;
  const targetRoot = modulationTarget;

  // Source key diatonic chords on outer ring
  const sourceChords: RingChord[] = useMemo(() => {
    const diatonic = getDiatonicChords(sourceRoot);
    return diatonic.map(d => {
      const angle = cofAngle(cofIndex(d.chord.root));
      return {
        chord: d.chord,
        x: cx + Math.cos(angle) * outerRadius,
        y: cy + Math.sin(angle) * outerRadius,
        angle,
        roman: d.roman,
        fn: d.function,
      };
    });
  }, [sourceRoot, cx, cy, outerRadius]);

  // Target key diatonic chords on inner ring
  const targetChords: RingChord[] = useMemo(() => {
    const diatonic = getDiatonicChords(targetRoot);
    return diatonic.map(d => {
      const angle = cofAngle(cofIndex(d.chord.root));
      return {
        chord: d.chord,
        x: cx + Math.cos(angle) * innerRadius,
        y: cy + Math.sin(angle) * innerRadius,
        angle,
        roman: d.roman,
        fn: d.function,
      };
    });
  }, [targetRoot, cx, cy, innerRadius]);

  // Common (pivot) chords
  const commonChords: CommonChord[] = useMemo(
    () => findCommonChords(sourceRoot, targetRoot),
    [sourceRoot, targetRoot],
  );

  const commonKeys = useMemo(
    () => new Set(commonChords.map(c => chordKey(c.chord))),
    [commonChords],
  );

  // Diminished pivots
  const dimPivots: DiminishedPivot[] = useMemo(
    () => findDiminishedPivots(targetRoot),
    [targetRoot],
  );

  // Augmented pivots
  const augPivots: AugmentedPivot[] = useMemo(
    () => findAugmentedPivots(targetRoot),
    [targetRoot],
  );

  // Key distance
  const dist = useMemo(() => keyDistance(sourceRoot, targetRoot), [sourceRoot, targetRoot]);

  // Active chord for highlighting
  const activeChord = hoveredChord ?? selectedChord;

  // Target key selector positions (12 faint dots at outermost ring)
  const selectorPositions = useMemo(() => {
    return CIRCLE_OF_FIFTHS_ORDER.map((pc, i) => {
      const angle = cofAngle(i);
      return {
        pc,
        x: cx + Math.cos(angle) * selectorRadius,
        y: cy + Math.sin(angle) * selectorRadius,
        angle,
      };
    });
  }, [cx, cy, selectorRadius]);

  // Find connecting lines between common chords on outer and inner rings
  const pivotConnections = useMemo(() => {
    const connections: { src: RingChord; tgt: RingChord; common: CommonChord }[] = [];
    for (const c of commonChords) {
      const src = sourceChords.find(s => chordsEqual(s.chord, c.chord));
      const tgt = targetChords.find(t => chordsEqual(t.chord, c.chord));
      if (src && tgt) {
        connections.push({ src, tgt, common: c });
      }
    }
    return connections;
  }, [commonChords, sourceChords, targetChords]);

  function renderSourceBubble(rc: RingChord) {
    const isPivot = commonKeys.has(chordKey(rc.chord));
    const isActive = activeChord !== null && chordsEqual(rc.chord, activeChord);

    return (
      <ChordBubble
        key={`src-${chordKey(rc.chord)}`}
        chord={rc.chord}
        x={rc.x}
        y={rc.y}
        radius={bubbleRadius}
        isSelected={selectedChord !== null && chordsEqual(rc.chord, selectedChord)}
        isHovered={hoveredChord !== null && chordsEqual(rc.chord, hoveredChord)}
        isInProgression={progressionKeys.has(chordKey(rc.chord))}
        isReference={rc.chord.root === sourceRoot && rc.chord.quality === 'major'}
        isDiatonic={true}
        isDimmed={false}
        isNextMove={isPivot && !isActive}
        nextMoveStrength={isPivot ? 'strong' : undefined}
        fillColor={functionColor(rc.fn)}
        label={rc.roman}
        sublabel={FUNCTION_ABBREV[rc.fn]}
        onClick={onChordClick}
        onHover={onChordHover}
      />
    );
  }

  function renderTargetBubble(rc: RingChord) {
    const isPivot = commonKeys.has(chordKey(rc.chord));
    const isActive = activeChord !== null && chordsEqual(rc.chord, activeChord);

    return (
      <ChordBubble
        key={`tgt-${chordKey(rc.chord)}`}
        chord={rc.chord}
        x={rc.x}
        y={rc.y}
        radius={bubbleRadius * 0.85}
        isSelected={selectedChord !== null && chordsEqual(rc.chord, selectedChord)}
        isHovered={hoveredChord !== null && chordsEqual(rc.chord, hoveredChord)}
        isInProgression={progressionKeys.has(chordKey(rc.chord))}
        isReference={rc.chord.root === targetRoot && rc.chord.quality === 'major'}
        isDiatonic={true}
        isDimmed={false}
        isNextMove={isPivot && !isActive}
        nextMoveStrength={isPivot ? 'common' : undefined}
        fillColor={functionColor(rc.fn)}
        label={rc.roman}
        sublabel={FUNCTION_ABBREV[rc.fn]}
        onClick={onChordClick}
        onHover={onChordHover}
      />
    );
  }

  const sameKey = sourceRoot === targetRoot;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Modulation map from ${noteName(sourceRoot)} major to ${noteName(targetRoot)} major`}
    >
      <title>Modulation Map - {noteName(sourceRoot)} → {noteName(targetRoot)}</title>
      <desc>Interactive modulation map showing pivot chords between {noteName(sourceRoot)} major and {noteName(targetRoot)} major</desc>

      {/* Background rings */}
      <circle cx={cx} cy={cy} r={outerRadius + bubbleRadius + 8} fill="none" stroke={COLOR_RING_STROKE} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={innerRadius + bubbleRadius * 0.85 + 8} fill="none" stroke={COLOR_RING_STROKE} strokeWidth={1} />

      {/* Ring labels */}
      <text x={cx + outerRadius + bubbleRadius + 16} y={cy - outerRadius - bubbleRadius - 4} textAnchor="start" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_SM}>
        Source: {noteName(sourceRoot)}
      </text>
      <text x={cx + innerRadius + bubbleRadius * 0.85 + 14} y={cy - innerRadius - bubbleRadius * 0.85 - 2} textAnchor="start" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_SM}>
        Target: {noteName(targetRoot)}
      </text>

      {/* Target key selector — 12 clickable circles at outermost edge */}
      {selectorPositions.map(pos => {
        const isSource = pos.pc === sourceRoot;
        const isTarget = pos.pc === targetRoot;
        return (
          <g key={`sel-${pos.pc}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={size * 0.018}
              fill={isTarget ? COLOR_ACCENT : isSource ? COLOR_FN_TONIC : 'rgba(255,255,255,0.08)'}
              stroke={isTarget ? COLOR_ACCENT : isSource ? COLOR_FN_TONIC : 'rgba(255,255,255,0.15)'}
              strokeWidth={1}
              opacity={isTarget ? 0.9 : isSource ? 0.7 : 0.5}
              style={{ cursor: 'pointer' }}
              onClick={() => setModulationTarget(pos.pc)}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={isTarget || isSource ? 'white' : COLOR_TEXT_FAINT}
              fontSize={size * 0.018 > 8 ? FONT_SIZE_2XS : FONT_SIZE_3XS}
              fontWeight={isTarget || isSource ? 700 : 400}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {noteName(pos.pc)}
            </text>
          </g>
        );
      })}

      {/* Pivot connection arcs between common chords on outer and inner rings */}
      {pivotConnections.map(({ src, tgt, common }) => {
        const isActiveConnection = activeChord !== null && chordsEqual(activeChord, common.chord);
        // Curved path via center-ish control point
        const midX = cx + (src.x + tgt.x - 2 * cx) * 0.3;
        const midY = cy + (src.y + tgt.y - 2 * cy) * 0.3;
        return (
          <path
            key={`pivot-${chordKey(common.chord)}`}
            d={`M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`}
            fill="none"
            stroke={COLOR_ACCENT}
            strokeWidth={isActiveConnection ? 2.5 : 1.5}
            opacity={isActiveConnection ? 0.8 : 0.25}
            strokeDasharray="6 4"
          />
        );
      })}

      {/* Diminished pivot indicators — small diamonds near inner ring */}
      {!sameKey && dimPivots.slice(0, 4).map((dp, i) => {
        // Position the dim7 indicator near the target chord it resolves to
        const tgtChord = targetChords.find(t => chordsEqual(t.chord, dp.resolvesTo));
        if (!tgtChord) return null;
        const offset = bubbleRadius * 0.85 + 18;
        const dx = tgtChord.x - cx;
        const dy = tgtChord.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;
        const nx = dx / dist;
        const ny = dy / dist;
        const px = tgtChord.x - nx * offset;
        const py = tgtChord.y - ny * offset;

        return (
          <g key={`dim-${i}`} opacity={0.6}>
            <title>{dp.description}</title>
            <rect
              x={px - 4}
              y={py - 4}
              width={8}
              height={8}
              rx={1}
              fill={QUALITY_COLORS.diminished}
              transform={`rotate(45 ${px} ${py})`}
            />
            <text
              x={px}
              y={py + 12}
              textAnchor="middle"
              fill={QUALITY_COLORS.diminished}
              fontSize={FONT_SIZE_3XS}
              opacity={0.7}
            >
              {chordName(dp.dim7Chord)}
            </text>
          </g>
        );
      })}

      {/* Augmented pivot indicators — small triangles */}
      {!sameKey && augPivots.slice(0, 4).map((ap, i) => {
        const tgtChord = targetChords.find(t => chordsEqual(t.chord, ap.reachesChord));
        if (!tgtChord) return null;
        // Position slightly offset from the dim pivots
        const offset = bubbleRadius * 0.85 + 30;
        const dx = tgtChord.x - cx;
        const dy = tgtChord.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d === 0) return null;
        const nx = dx / d;
        const ny = dy / d;
        const px = tgtChord.x - nx * offset;
        const py = tgtChord.y - ny * offset;

        return (
          <g key={`aug-${i}`} opacity={0.5}>
            <title>{ap.description}</title>
            <polygon
              points={`${px},${py - 5} ${px - 4.5},${py + 3} ${px + 4.5},${py + 3}`}
              fill={QUALITY_COLORS.augmented}
            />
          </g>
        );
      })}

      {/* Source key chord bubbles (outer ring) */}
      {sourceChords.map(rc => renderSourceBubble(rc))}

      {/* Target key chord bubbles (inner ring) */}
      {targetChords.map(rc => renderTargetBubble(rc))}

      {/* Center info */}
      <g>
        {sameKey ? (
          <>
            <text x={cx} y={cy - 10} textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XL} fontWeight={600}>
              {noteName(sourceRoot)} major
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_BASE}>
              Select a target key
            </text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 28} textAnchor="middle" fill={COLOR_TEXT_SECONDARY} fontSize={FONT_SIZE_2XL} fontWeight={700}>
              {noteName(sourceRoot)} → {noteName(targetRoot)}
            </text>
            <text x={cx} y={cy - 10} textAnchor="middle" fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_BASE}>
              {dist} fifth{dist !== 1 ? 's' : ''} apart
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill={COLOR_ACCENT} fontSize={FONT_SIZE_MD} fontWeight={500}>
              {commonChords.length} pivot chord{commonChords.length !== 1 ? 's' : ''}
            </text>
            <text x={cx} y={cy + 24} textAnchor="middle" fill={QUALITY_COLORS.diminished} fontSize={FONT_SIZE_SM} opacity={0.7}>
              {dimPivots.length} dim7 path{dimPivots.length !== 1 ? 's' : ''}
            </text>
            <text x={cx} y={cy + 38} textAnchor="middle" fill={QUALITY_COLORS.augmented} fontSize={FONT_SIZE_SM} opacity={0.7}>
              {augPivots.length} aug path{augPivots.length !== 1 ? 's' : ''}
            </text>
          </>
        )}
      </g>

      {/* Active chord detail */}
      {activeChord && !sameKey && (() => {
        const common = commonChords.find(c => chordsEqual(c.chord, activeChord));
        if (!common) return null;
        return (
          <text x={cx} y={cy + 56} textAnchor="middle" fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_SM}>
            {common.sourceInfo.roman} in {noteName(sourceRoot)} = {common.targetInfo.roman} in {noteName(targetRoot)}
          </text>
        );
      })()}

      {/* Legend */}
      <g transform={`translate(${width - 140}, ${height - 90})`}>
        <text x={0} y={0} fill={COLOR_TEXT_DIM} fontSize={FONT_SIZE_XS} fontWeight={600}>PIVOT TYPES</text>

        <line x1={0} y1={12} x2={20} y2={12} stroke={COLOR_ACCENT} strokeWidth={2} strokeDasharray="4 3" opacity={0.6} />
        <text x={26} y={16} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Common chord</text>

        <rect x={4} y={24} width={8} height={8} rx={1} fill={QUALITY_COLORS.diminished} opacity={0.6} transform="rotate(45 8 28)" />
        <text x={26} y={32} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Dim7 pivot</text>

        <polygon points="8,40 3.5,48 12.5,48" fill={QUALITY_COLORS.augmented} opacity={0.6} />
        <text x={26} y={48} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Aug pivot</text>

        <circle cx={8} cy={62} r={5} fill={COLOR_FN_TONIC} opacity={0.7} />
        <text x={26} y={66} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Source key</text>

        <circle cx={8} cy={78} r={5} fill={COLOR_ACCENT} opacity={0.7} />
        <text x={26} y={82} fill={COLOR_TEXT_MUTED} fontSize={FONT_SIZE_XS}>Target key</text>
      </g>
    </svg>
  );
};
