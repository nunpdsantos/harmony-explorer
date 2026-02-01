import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VoiceLeadingOverlay } from '../VoiceLeadingOverlay';
import type { VoicedChord } from '../../../core/voiceLeading';

describe('VoiceLeadingOverlay', () => {
  const defaultProps = {
    cardWidth: 80,
    gap: 8,
    padding: 16,
    height: 96,
    playingIndex: -1,
  };

  it('returns null when fewer than 2 voicings', () => {
    const { container } = render(
      <VoiceLeadingOverlay
        {...defaultProps}
        voicings={[[60, 64, 67]]}
      />,
    );
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders SVG with aria-hidden', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67], // C E G
      [60, 65, 69], // C F A
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders voice dots for each note in each voicing', () => {
    const voicings: VoicedChord[] = [
      [48, 52, 55], // 3 notes
      [48, 52, 55, 60], // 4 notes
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    // Dots: 3 for first chord + 4 for second = 7
    const circles = container.querySelectorAll('circle');
    // Also includes legend circles + appearing dot (1 extra voice)
    // Legend: max voices = 4, so 4 legend circles
    // Dots: 3 + 4 = 7
    // Appearing circle: 1 (4th voice in second chord has no source)
    expect(circles.length).toBe(4 + 7 + 1); // legend + dots + appearing
  });

  it('renders path elements for voice-leading lines', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67],
      [60, 65, 69],
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const paths = container.querySelectorAll('path');
    // 3 matching voices = 3 paths
    expect(paths.length).toBe(3);
  });

  it('uses dashed lines for common tones', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67], // C E G
      [60, 65, 69], // C F A — C is common
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const paths = container.querySelectorAll('path');
    // First voice (60 → 60) is a common tone
    expect(paths[0].getAttribute('stroke-dasharray')).toBe('4 3');
    // Second voice (64 → 65) is moving
    expect(paths[1].getAttribute('stroke-dasharray')).toBe('none');
  });

  it('shows semitone distance for moving voices', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67], // C E G
      [60, 65, 69], // C F A
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const texts = container.querySelectorAll('text');
    // Legend: up to 3 voice labels + semitone labels for 2 moving voices
    const semitoneLabels = Array.from(texts).filter(
      t => !['B', 'T', 'A', 'S', '5'].includes(t.textContent ?? ''),
    );
    // Voice 0: 60 → 60 = 0 semitones (common, no label)
    // Voice 1: 64 → 65 = 1 semitone
    // Voice 2: 67 → 69 = 2 semitones
    expect(semitoneLabels.length).toBe(2);
    expect(semitoneLabels[0].textContent).toBe('1');
    expect(semitoneLabels[1].textContent).toBe('2');
  });

  it('highlights active transition based on playingIndex', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67],
      [62, 65, 69],
      [60, 64, 67],
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} playingIndex={1} />,
    );
    const paths = container.querySelectorAll('path');
    // Transition 0→1 is active (playingIndex=1 means transition 0 is active)
    // First 3 paths are transition 0→1, next 3 are transition 1→2
    const activeTransitionPaths = Array.from(paths).slice(0, 3);
    const inactiveTransitionPaths = Array.from(paths).slice(3, 6);

    // Active transition should have higher opacity
    for (const p of activeTransitionPaths) {
      expect(p.getAttribute('opacity')).toBe('1');
    }
    for (const p of inactiveTransitionPaths) {
      expect(p.getAttribute('opacity')).toBe('0.5');
    }
  });

  it('handles voicings with different chord sizes (triad → seventh)', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67],       // triad (3 notes)
      [60, 64, 67, 70],   // seventh (4 notes)
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const paths = container.querySelectorAll('path');
    // 3 matching voices = 3 paths
    expect(paths.length).toBe(3);

    // An appearing circle for the 4th voice
    const circles = container.querySelectorAll('circle');
    // Legend (4 voices) + dots (3+4) + 1 appearing = 12
    expect(circles.length).toBe(12);
  });

  it('handles voicings with different chord sizes (seventh → triad)', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67, 70],   // seventh (4 notes)
      [60, 64, 67],       // triad (3 notes)
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const paths = container.querySelectorAll('path');
    // 3 matching voices = 3 paths
    expect(paths.length).toBe(3);

    // A disappearing circle for the 4th voice of the first chord
    const circles = container.querySelectorAll('circle');
    // Legend (4 voices) + dots (4+3) + 1 disappearing = 12
    expect(circles.length).toBe(12);
  });

  it('renders voice legend', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67],
      [62, 65, 69],
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const texts = container.querySelectorAll('text');
    const legendLabels = Array.from(texts)
      .map(t => t.textContent)
      .filter(t => ['B', 'T', 'A'].includes(t ?? ''));
    expect(legendLabels).toEqual(['B', 'T', 'A']);
  });

  it('renders with multiple transitions', () => {
    const voicings: VoicedChord[] = [
      [60, 64, 67],
      [62, 65, 69],
      [60, 64, 67],
      [59, 62, 67],
    ];
    const { container } = render(
      <VoiceLeadingOverlay {...defaultProps} voicings={voicings} />,
    );
    const paths = container.querySelectorAll('path');
    // 3 transitions × 3 voices = 9 paths
    expect(paths.length).toBe(9);
  });
});
