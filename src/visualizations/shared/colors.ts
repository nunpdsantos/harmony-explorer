import type { ChordQuality } from '../../core/constants';
import { QUALITY_COLORS, COLOR_QUALITY_FALLBACK, SHARED_NOTE_COLORS } from '../../styles/theme';

/** Get fill color for a chord quality */
export function qualityColor(quality: ChordQuality): string {
  return QUALITY_COLORS[quality] ?? COLOR_QUALITY_FALLBACK;
}

/** Get a color for shared-note count (0-3) */
export function sharedNoteColor(count: number): string {
  return SHARED_NOTE_COLORS[count] ?? SHARED_NOTE_COLORS[0];
}

/** Get opacity based on relationship strength */
export function relationshipOpacity(sharedNotes: number): number {
  return 0.3 + sharedNotes * 0.2;
}
