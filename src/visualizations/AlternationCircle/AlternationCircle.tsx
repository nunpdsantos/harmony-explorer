import React, { useMemo, useCallback, useRef } from 'react';
import type { VisualizationProps } from '../shared/types';
import { ChordBubble } from '../shared/ChordBubble';
import { chordName, chordKey, chordsEqual } from '../../core/chords';
import { buildPLCycle } from '../../core/neoRiemannianCycle';
import { getDiatonicInfo, functionColor } from '../../core/harmony';
import { qualityColor } from '../shared/colors';
import { useStore } from '../../state/store';
import { initAudio, playChord, stopAll } from '../../audio/audioEngine';
import { getVoicing } from '../../audio/voicingEngine';

const TRANSFORM_COLORS: Record<string, string> = {
  P: '#f59e0b', // Amber - Parallel
  L: '#8b5cf6', // Purple - Leading-tone
  R: '#06b6d4', // Cyan - Relative
};

export const AlternationCircle: React.FC<VisualizationProps> = ({
  referenceRoot,
  selectedChord,
  hoveredChord,
  onChordClick,
  onChordHover,
  width,
  height,
}) => {
  const progression = useStore(s => s.progression);
  const audioReady = useStore(s => s.audioReady);
  const setAudioReady = useStore(s => s.setAudioReady);
  const progressionKeys = useMemo(
    () => new Set(progression.map(chordKey)),
    [progression]
  );

  const playingRef = useRef(false);
  const cancelRef = useRef<number | null>(null);

  const cx = width / 2;
  const cy = height / 2;
  const size = Math.min(width, height);
  const circleRadius = size * 0.40;
  const bubbleRadius = size * 0.032;

  const cycle = useMemo(() => buildPLCycle(referenceRoot), [referenceRoot]);

  // Position 24 chords around the circle
  const positions = useMemo(() => {
    return cycle.map((step, i) => {
      const angle = (i * Math.PI * 2) / 24 - Math.PI / 2;
      return {
        ...step,
        x: cx + Math.cos(angle) * circleRadius,
        y: cy + Math.sin(angle) * circleRadius,
        angle,
        index: i,
      };
    });
  }, [cycle, cx, cy, circleRadius]);

  const activeChord = hoveredChord ?? selectedChord;

  // Play cycle sequentially
  const handlePlayCycle = useCallback(async () => {
    if (playingRef.current) {
      playingRef.current = false;
      if (cancelRef.current) {
        clearTimeout(cancelRef.current);
        cancelRef.current = null;
      }
      stopAll();
      return;
    }

    if (!audioReady) {
      await initAudio();
      setAudioReady(true);
    }

    playingRef.current = true;
    const bpm = 100;
    const beatDuration = (60 / bpm) * 1000;

    for (let i = 0; i < positions.length; i++) {
      if (!playingRef.current) break;
      const voicing = getVoicing(positions[i].chord);
      playChord(voicing);
      await new Promise<void>(resolve => {
        cancelRef.current = window.setTimeout(resolve, beatDuration);
      });
    }
    playingRef.current = false;
    cancelRef.current = null;
  }, [positions, audioReady, setAudioReady]);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Neo-Riemannian Alternation Circle showing P/L cycle of major and minor triads">
      <title>Neo-Riemannian Alternation Circle</title>
      <desc>Circular diagram showing the Parallel-Leading-tone hexatonic cycle connecting major and minor triads through single-semitone voice-leading transformations</desc>
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={circleRadius + bubbleRadius + 10} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />

      {/* Transform labels on arcs between adjacent chords */}
      {positions.map((pos, i) => {
        if (i === 0) return null;
        const prev = positions[i - 1];
        const midAngle = (prev.angle + pos.angle) / 2;
        const labelR = circleRadius + bubbleRadius + 18;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;
        const t = pos.transform;
        if (!t) return null;

        return (
          <text
            key={`t-${i}`}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            fill={TRANSFORM_COLORS[t] ?? 'rgba(255,255,255,0.3)'}
            fontSize={8}
            fontWeight={600}
          >
            {t}
          </text>
        );
      })}

      {/* Connecting arcs between adjacent chords */}
      {positions.map((pos, i) => {
        if (i === 0) return null;
        const prev = positions[i - 1];
        const t = pos.transform;
        return (
          <line
            key={`arc-${i}`}
            x1={prev.x}
            y1={prev.y}
            x2={pos.x}
            y2={pos.y}
            stroke={t ? TRANSFORM_COLORS[t] : 'rgba(255,255,255,0.1)'}
            strokeWidth={1}
            opacity={0.2}
          />
        );
      })}
      {/* Close the loop */}
      {positions.length === 24 && (
        <line
          x1={positions[23].x}
          y1={positions[23].y}
          x2={positions[0].x}
          y2={positions[0].y}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
          opacity={0.2}
        />
      )}

      {/* Chord bubbles */}
      {positions.map(pos => {
        const info = getDiatonicInfo(pos.chord, referenceRoot);
        const isDiatonic = info !== null;

        return (
          <ChordBubble
            key={`cycle-${pos.index}`}
            chord={pos.chord}
            x={pos.x}
            y={pos.y}
            radius={bubbleRadius}
            isSelected={selectedChord !== null && chordsEqual(pos.chord, selectedChord)}
            isHovered={hoveredChord !== null && chordsEqual(pos.chord, hoveredChord)}
            isInProgression={progressionKeys.has(chordKey(pos.chord))}
            isReference={pos.index === 0}
            isDiatonic={isDiatonic}
            isDimmed={false}
            isNextMove={false}
            fillColor={info ? functionColor(info.function) : qualityColor(pos.chord.quality)}
            label={info?.roman}
            onClick={onChordClick}
            onHover={onChordHover}
          />
        );
      })}

      {/* Center info */}
      <g>
        <text x={cx} y={cy - 25} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={13} fontWeight={600}>
          P/L Alternation Cycle
        </text>
        <text x={cx} y={cy - 6} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={11}>
          24 major/minor triads
        </text>
        {activeChord && (
          <text x={cx} y={cy + 14} textAnchor="middle" fill="white" fontSize={16} fontWeight={700}>
            {chordName(activeChord)}
          </text>
        )}

        {/* Play cycle button */}
        <g
          onClick={handlePlayCycle}
          style={{ cursor: 'pointer' }}
        >
          <rect
            x={cx - 45}
            y={cy + 25}
            width={90}
            height={24}
            rx={12}
            fill="rgba(255,255,255,0.08)"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
          <text
            x={cx}
            y={cy + 41}
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize={10}
            fontWeight={500}
          >
            Play Cycle
          </text>
        </g>
      </g>

      {/* Legend */}
      <g transform={`translate(12, ${height - 50})`}>
        <text x={0} y={0} fill="rgba(255,255,255,0.3)" fontSize={9} fontWeight={600}>TRANSFORMS</text>
        {Object.entries(TRANSFORM_COLORS).map(([label, color], i) => (
          <g key={label}>
            <circle cx={8 + i * 70} cy={16} r={5} fill={color} opacity={0.8} />
            <text x={18 + i * 70} y={20} fill="rgba(255,255,255,0.5)" fontSize={9}>
              {label === 'P' ? 'Parallel' : label === 'L' ? 'Leading' : 'Relative'}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};
