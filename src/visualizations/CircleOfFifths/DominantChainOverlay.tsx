import React, { useMemo } from 'react';
import { chordsEqual, type Chord } from '../../core/chords';
import { buildDominantChain, findIIVIs } from '../../core/dominantChains';
import {
  QUALITY_COLORS,
  FONT_SIZE_SM,
} from '../../styles/theme';

interface ChordPosition {
  chord: Chord;
  x: number;
  y: number;
  angle: number;
}

interface DominantChainOverlayProps {
  referenceRoot: number;
  showChains: boolean;
  showIIVI: boolean;
  hoveredChord: Chord | null;
  selectedChord: Chord | null;
  dom7Positions: ChordPosition[];
  majorPositions: ChordPosition[];
  minorPositions: ChordPosition[];
  bubbleRadius: number;
  cx: number;
  cy: number;
}

export const DominantChainOverlay: React.FC<DominantChainOverlayProps> = ({
  referenceRoot,
  showChains,
  showIIVI,
  hoveredChord,
  selectedChord,
  dom7Positions,
  majorPositions,
  minorPositions,
  bubbleRadius,
  cx,
  cy,
}) => {
  const activeChord = hoveredChord ?? selectedChord;
  const allPositions = useMemo(
    () => [...dom7Positions, ...majorPositions, ...minorPositions],
    [dom7Positions, majorPositions, minorPositions]
  );

  // Build a dominant chain from the active dom7 chord
  const chainArrows = useMemo(() => {
    if (!showChains || !activeChord || activeChord.quality !== 'dom7') return [];
    const chain = buildDominantChain(activeChord.root, 6);
    const arrows: { from: ChordPosition; to: ChordPosition; opacity: number }[] = [];

    for (let i = 0; i < chain.length - 1; i++) {
      const fromPos = dom7Positions.find(p => p.chord.root === chain[i].root);
      // Chain resolves: dom7 → major (next in chain is dom7 of the target)
      // The target is the root where the next chain chord resolves to
      const targetRoot = (chain[i].root + 5) % 12; // down a fifth
      const toPos = majorPositions.find(p => p.chord.root === targetRoot)
        ?? dom7Positions.find(p => p.chord.root === chain[i + 1].root);

      if (fromPos && toPos) {
        arrows.push({
          from: fromPos,
          to: toPos,
          opacity: Math.max(0.15, 0.7 - i * 0.12),
        });
      }
    }
    return arrows;
  }, [showChains, activeChord, dom7Positions, majorPositions]);

  // ii-V-I bracket arcs
  const iiviPatterns = useMemo(() => {
    if (!showIIVI) return [];
    return findIIVIs(referenceRoot);
  }, [showIIVI, referenceRoot]);

  const iiviArcs = useMemo(() => {
    if (!showIIVI) return [];
    return iiviPatterns.map(pattern => {
      // Find positions for ii (min7 or minor), V (dom7), I (major)
      const iiPos = minorPositions.find(p => p.chord.root === pattern.ii.root)
        ?? allPositions.find(p => p.chord.root === pattern.ii.root);
      const vPos = dom7Positions.find(p => p.chord.root === pattern.V.root)
        ?? majorPositions.find(p => p.chord.root === pattern.V.root);
      const iPos = majorPositions.find(p => p.chord.root === pattern.I.root)
        ?? minorPositions.find(p => p.chord.root === pattern.I.root);

      return {
        pattern,
        iiPos,
        vPos,
        iPos,
      };
    }).filter(a => a.iiPos && a.vPos && a.iPos);
  }, [showIIVI, iiviPatterns, dom7Positions, majorPositions, minorPositions, allPositions]);

  // Highlight primary ii-V-I or one targeting the hovered chord
  const activeIIVI = useMemo(() => {
    if (!showIIVI) return null;
    if (activeChord) {
      // Check if hovered chord is part of any ii-V-I
      return iiviArcs.find(a =>
        (a.iiPos && chordsEqual(a.iiPos.chord, activeChord)) ||
        (a.vPos && chordsEqual(a.vPos.chord, activeChord)) ||
        (a.iPos && a.pattern.I.root === activeChord.root)
      ) ?? iiviArcs[0]; // Fall back to primary
    }
    return iiviArcs[0]; // Primary by default
  }, [showIIVI, activeChord, iiviArcs]);

  return (
    <g>
      <defs>
        <marker id="chain-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={QUALITY_COLORS.dom7} />
        </marker>
        <marker id="iivi-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill={QUALITY_COLORS.augmented} />
        </marker>
      </defs>

      {/* Dominant chain arrows */}
      {chainArrows.map((arrow, i) => {
        const dx = arrow.to.x - arrow.from.x;
        const dy = arrow.to.y - arrow.from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return null;
        const nx = dx / dist;
        const ny = dy / dist;

        return (
          <line
            key={`chain-${i}`}
            x1={arrow.from.x + nx * (bubbleRadius + 4)}
            y1={arrow.from.y + ny * (bubbleRadius + 4)}
            x2={arrow.to.x - nx * (bubbleRadius + 10)}
            y2={arrow.to.y - ny * (bubbleRadius + 10)}
            stroke={QUALITY_COLORS.dom7}
            strokeWidth={2}
            opacity={arrow.opacity}
            markerEnd="url(#chain-arrow)"
          />
        );
      })}

      {/* ii-V-I bracket arcs */}
      {activeIIVI && activeIIVI.iiPos && activeIIVI.vPos && activeIIVI.iPos && (
        <g>
          {/* ii → V arrow */}
          {(() => {
            const from = activeIIVI.iiPos!;
            const to = activeIIVI.vPos!;
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
                stroke={QUALITY_COLORS.augmented}
                strokeWidth={2.5}
                opacity={0.7}
                markerEnd="url(#iivi-arrow)"
              />
            );
          })()}
          {/* V → I arrow */}
          {(() => {
            const from = activeIIVI.vPos!;
            const to = activeIIVI.iPos!;
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
                stroke={QUALITY_COLORS.augmented}
                strokeWidth={2.5}
                opacity={0.7}
                markerEnd="url(#iivi-arrow)"
              />
            );
          })()}
          {/* Bracket label */}
          <text
            x={cx}
            y={cy + (Math.min(activeIIVI.iiPos!.y, activeIIVI.vPos!.y, activeIIVI.iPos!.y) - cy) * 0.3 + cy * 0.2}
            textAnchor="middle"
            fill={QUALITY_COLORS.augmented}
            fontSize={FONT_SIZE_SM}
            fontWeight={600}
            opacity={0.8}
          >
            {activeIIVI.pattern.label}
          </text>
        </g>
      )}
    </g>
  );
};
