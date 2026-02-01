import React from 'react';
import { chordName, chordKey, chordPitchClasses, chordsEqual, type Chord } from '../../core/chords';
import { sharedNotes } from '../../core/relationships';
import { qualityColor, sharedNoteColor } from '../shared/colors';
import { noteName } from '../../core/constants';

interface TimelineProps {
  progression: Chord[];
  playingIndex: number;
  selectedChord: Chord | null;
  onChordClick: (chord: Chord, index: number) => void;
  onRemove: (index: number) => void;
  width: number;
  height: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  progression,
  playingIndex,
  selectedChord,
  onChordClick,
  onRemove,
  width,
  height,
}) => {
  if (progression.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-full text-white/30 text-sm"
        style={{ width, height }}
      >
        Click chords in the diagram to build a progression
      </div>
    );
  }

  const cardWidth = Math.min(100, (width - 40) / Math.max(progression.length, 1));

  return (
    <div
      className="flex items-center overflow-x-auto px-4 gap-2 scrollbar-thin"
      style={{ width, height }}
    >
      {progression.map((c, i) => {
        const isPlaying = i === playingIndex;
        const isSelected = selectedChord !== null && chordsEqual(c, selectedChord);
        const shared = i > 0 ? sharedNotes(progression[i - 1], c) : [];

        return (
          <div
            key={`${i}-${chordKey(c)}`}
            className="flex flex-col items-center flex-shrink-0 relative group"
            style={{ width: cardWidth }}
          >
            {/* Shared notes indicator between chords */}
            {i > 0 && (
              <div
                className="absolute -left-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                style={{ color: sharedNoteColor(shared.length) }}
                title={`Shared: ${shared.map(pc => noteName(pc)).join(', ')}`}
              >
                {shared.length}
              </div>
            )}

            {/* Chord card */}
            <button
              onClick={() => onChordClick(c, i)}
              className="rounded-lg px-2 py-3 text-white text-sm font-medium transition-all border-2"
              style={{
                backgroundColor: qualityColor(c.quality),
                borderColor: isPlaying
                  ? '#fbbf24'
                  : isSelected
                  ? '#fff'
                  : 'transparent',
                boxShadow: isPlaying
                  ? '0 0 12px rgba(251, 191, 36, 0.5)'
                  : 'none',
                transform: isPlaying ? 'scale(1.1)' : 'scale(1)',
                width: cardWidth - 4,
              }}
            >
              {chordName(c)}
            </button>

            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              x
            </button>

            {/* Pitch classes */}
            <div className="text-[9px] text-white/30 mt-1 tracking-wide">
              {chordPitchClasses(c).map(pc => noteName(pc)).join(' ')}
            </div>
          </div>
        );
      })}
    </div>
  );
};
