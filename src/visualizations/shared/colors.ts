import type { ChordQuality } from '../../core/constants';

/** Base colors for chord qualities */
const QUALITY_COLORS: Record<string, string> = {
  major:      '#3b82f6', // blue
  minor:      '#8b5cf6', // purple
  diminished: '#ef4444', // red
  augmented:  '#f59e0b', // amber
  dom7:       '#06b6d4', // cyan
  maj7:       '#2563eb', // deeper blue
  min7:       '#7c3aed', // deeper purple
  dim7:       '#dc2626', // deeper red
  halfDim7:   '#ea580c', // orange
  minMaj7:    '#9333ea', // violet
  aug7:       '#d97706', // darker amber
  sus4:       '#059669', // emerald
  sus2:       '#0d9488', // teal
};

/** Get fill color for a chord quality */
export function qualityColor(quality: ChordQuality): string {
  return QUALITY_COLORS[quality] ?? '#6b7280';
}

/** Get a color for shared-note count (0-3) */
export function sharedNoteColor(count: number): string {
  switch (count) {
    case 3: return '#22c55e'; // green — very close
    case 2: return '#3b82f6'; // blue — close
    case 1: return '#f59e0b'; // amber — moderate
    default: return '#ef4444'; // red — distant
  }
}

/** Get opacity based on relationship strength */
export function relationshipOpacity(sharedNotes: number): number {
  return 0.3 + sharedNotes * 0.2;
}
