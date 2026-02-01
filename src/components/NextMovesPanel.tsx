import React, { useMemo } from 'react';
import { chordName, type Chord } from '../core/chords';
import { getNextMoves, type NextMove } from '../core/harmony';
import { isDominantFamily, suggestResolutions } from '../core/alteredDominants';

interface NextMovesPanelProps {
  /** The chord to get next moves from (last in progression or selected) */
  sourceChord: Chord;
  keyRoot: number;
  onChordClick: (chord: Chord) => void;
  onChordHover: (chord: Chord | null) => void;
}

const STRENGTH_ORDER: NextMove['strength'][] = ['strong', 'common', 'creative'];
const STRENGTH_LABELS: Record<NextMove['strength'], string> = {
  strong: 'Strong',
  common: 'Common',
  creative: 'Creative',
};
const STRENGTH_COLORS: Record<NextMove['strength'], string> = {
  strong: 'bg-amber-400',
  common: 'bg-violet-400',
  creative: 'bg-gray-500',
};

export const NextMovesPanel: React.FC<NextMovesPanelProps> = ({
  sourceChord,
  keyRoot,
  onChordClick,
  onChordHover,
}) => {
  const moves = getNextMoves(sourceChord, keyRoot);

  // If source is a dominant chord, add altered resolution suggestions
  const alteredResolutions = useMemo(
    () => isDominantFamily(sourceChord.quality) ? suggestResolutions(sourceChord) : [],
    [sourceChord],
  );

  if (moves.length === 0 && alteredResolutions.length === 0) return null;

  // Group by strength
  const grouped = STRENGTH_ORDER
    .map(strength => ({
      strength,
      moves: moves.filter(m => m.strength === strength),
    }))
    .filter(g => g.moves.length > 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] text-white/40 uppercase tracking-wider">
        Next from {chordName(sourceChord)}
      </div>
      {grouped.map(group => (
        <div key={group.strength}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${STRENGTH_COLORS[group.strength]}`} />
            <span className="text-[10px] text-white/50">{STRENGTH_LABELS[group.strength]}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {group.moves.map((m, i) => (
              <button
                key={i}
                onClick={() => onChordClick(m.chord)}
                onMouseEnter={() => onChordHover(m.chord)}
                onMouseLeave={() => onChordHover(null)}
                title={m.reason}
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                {chordName(m.chord)}
                <span className="text-[10px] text-white/40 ml-1">{m.info.roman}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Altered dominant resolutions */}
      {alteredResolutions.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="text-[10px] text-white/50">Resolutions</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {alteredResolutions.map((r, i) => (
              <button
                key={i}
                onClick={() => onChordClick(r.chord)}
                onMouseEnter={() => onChordHover(r.chord)}
                onMouseLeave={() => onChordHover(null)}
                title={r.label}
                className="text-xs px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors border border-rose-500/20"
              >
                {chordName(r.chord)}
                <span className="text-[10px] text-rose-400/60 ml-1">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
