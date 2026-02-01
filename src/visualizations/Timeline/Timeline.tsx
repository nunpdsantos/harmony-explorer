import React, { useState, useCallback } from 'react';
import { chordName, chordKey, chordPitchClasses, chordsEqual, type Chord } from '../../core/chords';
import { sharedNotes } from '../../core/relationships';
import { qualityColor, sharedNoteColor } from '../shared/colors';
import { noteName } from '../../core/constants';
import type { VoicedChord } from '../../core/voiceLeading';
import type { BridgeSuggestion, ChromaticBassSpan } from '../../core/bridgeChords';
import { VoiceLeadingOverlay } from './VoiceLeadingOverlay';
import { BRIDGE_TYPE_COLORS as THEME_BRIDGE_COLORS, COLOR_ACCENT, COLOR_SELECTED_BORDER, COLOR_PLAYING_GLOW } from '../../styles/theme';

interface TimelineProps {
  progression: Chord[];
  playingIndex: number;
  selectedChord: Chord | null;
  onChordClick: (chord: Chord, index: number) => void;
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onBridgeInsert?: (chord: Chord, afterIndex: number) => void;
  width: number;
  height: number;
  voicings?: VoicedChord[];
  showVoiceLeading?: boolean;
  bridgeSuggestions?: BridgeSuggestion[];
  chromaticBassSpans?: ChromaticBassSpan[];
  showBridgeChords?: boolean;
}

const TIMELINE_GAP = 8; // gap-2 = 8px
const TIMELINE_PADDING = 16; // px-4 = 16px

const BRIDGE_TYPE_COLORS = THEME_BRIDGE_COLORS;

export const Timeline: React.FC<TimelineProps> = ({
  progression,
  playingIndex,
  selectedChord,
  onChordClick,
  onRemove,
  onReorder,
  onBridgeInsert,
  width,
  height,
  voicings,
  showVoiceLeading = false,
  bridgeSuggestions,
  chromaticBassSpans,
  showBridgeChords = false,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== null && index !== dragIndex) {
      setDropTarget(index);
    }
  }, [dragIndex]);

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex && onReorder) {
      onReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDropTarget(null);
  }, [dragIndex, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropTarget(null);
  }, []);

  /** Keyboard handler for chord card reordering and deletion */
  const handleCardKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowLeft' && onReorder && index > 0) {
      e.preventDefault();
      onReorder(index, index - 1);
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && onReorder && index < progression.length - 1) {
      e.preventDefault();
      onReorder(index, index + 1);
      setFocusedIndex(index + 1);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemove(index);
      // Focus the previous card, or the next one, or nothing
      if (progression.length > 1) {
        setFocusedIndex(Math.min(index, progression.length - 2));
      } else {
        setFocusedIndex(null);
      }
    }
  }, [onReorder, onRemove, progression.length]);

  // Focus management: set focus when focusedIndex changes
  const cardRefCallback = useCallback((el: HTMLButtonElement | null, index: number) => {
    if (el && focusedIndex === index) {
      el.focus();
      setFocusedIndex(null); // Reset after focusing
    }
  }, [focusedIndex]);

  if (progression.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full text-white/50 text-sm"
        style={{ width, height }}
      >
        Click chords in the diagram to build a progression
      </div>
    );
  }

  const cardWidth = Math.min(100, (width - 40) / Math.max(progression.length, 1));

  // Build bridge suggestion lookup: position → BridgeSuggestion
  const bridgeMap = new Map<number, BridgeSuggestion>();
  if (showBridgeChords && bridgeSuggestions) {
    for (const s of bridgeSuggestions) {
      bridgeMap.set(s.position, s);
    }
  }

  // Build chromatic bass set: chord indices that are part of chromatic bass lines
  const chromaticBassIndices = new Set<number>();
  if (chromaticBassSpans) {
    for (const span of chromaticBassSpans) {
      for (let i = span.start; i <= span.end; i++) {
        chromaticBassIndices.add(i);
      }
    }
  }

  return (
    <div
      className="relative overflow-x-auto scrollbar-thin"
      style={{ width, height }}
    >
      {/* Voice leading overlay (behind chord cards) */}
      {showVoiceLeading && voicings && voicings.length >= 2 && (
        <VoiceLeadingOverlay
          voicings={voicings}
          cardWidth={cardWidth}
          gap={TIMELINE_GAP}
          padding={TIMELINE_PADDING}
          height={height}
          playingIndex={playingIndex}
        />
      )}

      {/* Chord cards */}
      <div
        className="flex items-center px-4 gap-2 h-full"
        role="listbox"
        aria-label="Chord progression"
      >
        {progression.map((c, i) => {
          const isPlaying = i === playingIndex;
          const isSelected = selectedChord !== null && chordsEqual(c, selectedChord);
          const shared = i > 0 ? sharedNotes(progression[i - 1], c) : [];
          const isDragging = i === dragIndex;
          const isDropTarget = i === dropTarget;
          const isChromaticBass = chromaticBassIndices.has(i);
          const bridgeAfter = bridgeMap.get(i);

          return (
            <React.Fragment key={`${i}-${chordKey(c)}`}>
              <div
                className={`flex flex-col items-center flex-shrink-0 relative group ${
                  isDragging ? 'opacity-40' : ''
                }`}
                style={{ width: cardWidth }}
                draggable={!!onReorder}
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={handleDragEnd}
              >
                {/* Drop indicator */}
                {isDropTarget && dragIndex !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-30"
                    style={{ left: dragIndex < i ? 'auto' : -5, right: dragIndex < i ? -5 : 'auto' }}
                  />
                )}

                {/* Shared notes indicator between chords */}
                {i > 0 && !showVoiceLeading && !showBridgeChords && (
                  <div
                    className="absolute -left-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                    style={{ color: sharedNoteColor(shared.length) }}
                    title={`Shared: ${shared.map(pc => noteName(pc)).join(', ')}`}
                  >
                    {shared.length}
                  </div>
                )}

                {/* Chromatic bass indicator */}
                {isChromaticBass && (
                  <div
                    className="absolute -bottom-0.5 left-1 right-1 h-0.5 rounded-full z-10"
                    style={{ backgroundColor: BRIDGE_TYPE_COLORS['tritone-sub'] }}
                    title="Chromatic bass line"
                  />
                )}

                {/* Chord card */}
                <button
                  ref={(el) => cardRefCallback(el, i)}
                  onClick={() => onChordClick(c, i)}
                  onKeyDown={(e) => handleCardKeyDown(e, i)}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={`${chordName(c)}, position ${i + 1} of ${progression.length}${isPlaying ? ', playing' : ''}`}
                  tabIndex={0}
                  className={`rounded-lg px-2 py-3 text-white text-sm font-medium transition-all border-2 relative z-10 ${
                    onReorder ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  style={{
                    backgroundColor: qualityColor(c.quality),
                    borderColor: isPlaying
                      ? COLOR_ACCENT
                      : isSelected
                      ? COLOR_SELECTED_BORDER
                      : isDropTarget
                      ? COLOR_ACCENT
                      : 'transparent',
                    boxShadow: isPlaying
                      ? `0 0 12px ${COLOR_PLAYING_GLOW}`
                      : 'none',
                    transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                    width: cardWidth - 4,
                  }}
                >
                  {chordName(c)}
                </button>

                {/* Remove button — visual target small, touch target 44px */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  aria-label={`Remove ${chordName(c)}`}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-20"
                  style={{ touchAction: 'manipulation' }}
                >
                  x
                  {/* Invisible touch target */}
                  <span className="absolute inset-0 -m-3" aria-hidden="true" />
                </button>

                {/* Touch-friendly move buttons — shown on focus within */}
                {onReorder && (
                  <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity z-20">
                    {i > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReorder(i, i - 1); }}
                        aria-label={`Move ${chordName(c)} left`}
                        className="w-5 h-5 rounded bg-white/10 text-white/60 text-[10px] flex items-center justify-center hover:bg-white/20"
                        tabIndex={-1}
                      >
                        ←
                      </button>
                    )}
                    {i < progression.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onReorder(i, i + 1); }}
                        aria-label={`Move ${chordName(c)} right`}
                        className="w-5 h-5 rounded bg-white/10 text-white/60 text-[10px] flex items-center justify-center hover:bg-white/20"
                        tabIndex={-1}
                      >
                        →
                      </button>
                    )}
                  </div>
                )}

                {/* Pitch classes */}
                <div className="text-[10px] text-white/50 mt-1 tracking-wide relative z-10">
                  {chordPitchClasses(c).map(pc => noteName(pc)).join(' ')}
                </div>
              </div>

              {/* Bridge chord suggestion between this chord and the next */}
              {bridgeAfter && (
                <button
                  onClick={() => onBridgeInsert?.(bridgeAfter.bridge.chord, i + 1)}
                  title={bridgeAfter.bridge.reason}
                  className="flex flex-col items-center flex-shrink-0 opacity-40 hover:opacity-80 transition-opacity"
                  style={{ width: cardWidth * 0.6 }}
                >
                  <div
                    className="rounded px-1 py-1.5 text-white text-[10px] font-medium border border-dashed"
                    style={{
                      backgroundColor: BRIDGE_TYPE_COLORS[bridgeAfter.bridge.type] + '33',
                      borderColor: BRIDGE_TYPE_COLORS[bridgeAfter.bridge.type] + '66',
                      width: cardWidth * 0.6 - 4,
                    }}
                  >
                    {chordName(bridgeAfter.bridge.chord)}
                  </div>
                  <div className="text-[8px] text-white/30 mt-0.5">
                    {bridgeAfter.bridge.type === 'tritone-sub' ? 'tri' :
                     bridgeAfter.bridge.type === 'passing-dim' ? 'dim' : 'V7'}
                  </div>
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
