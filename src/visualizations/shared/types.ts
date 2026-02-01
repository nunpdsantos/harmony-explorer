import type { Chord } from '../../core/chords';

/** Common props interface for all visualization components */
export interface VisualizationProps {
  referenceRoot: number;
  selectedChord: Chord | null;
  hoveredChord: Chord | null;
  onChordClick: (chord: Chord) => void;
  onChordHover: (chord: Chord | null) => void;
  width: number;
  height: number;
}
