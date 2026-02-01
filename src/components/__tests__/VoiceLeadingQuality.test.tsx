import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoiceLeadingQualityDisplay } from '../VoiceLeadingQuality';

describe('VoiceLeadingQualityDisplay', () => {
  it('returns null for fewer than 2 voicings', () => {
    const { container } = render(
      <VoiceLeadingQualityDisplay voicings={[[60, 64, 67]]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null for empty voicings', () => {
    const { container } = render(
      <VoiceLeadingQualityDisplay voicings={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders "Voice Leading" label', () => {
    render(
      <VoiceLeadingQualityDisplay
        voicings={[[60, 64, 67], [60, 64, 69]]}
      />,
    );
    expect(screen.getByText('Voice Leading')).toBeInTheDocument();
  });

  it('shows a smoothness rating badge', () => {
    render(
      <VoiceLeadingQualityDisplay
        voicings={[[60, 64, 67], [60, 64, 69]]}
      />,
    );
    // Rating should be one of: smooth, moderate, angular
    const rating = screen.getByText(/smooth|moderate|angular/);
    expect(rating).toBeInTheDocument();
  });

  it('shows smooth rating for minimal movement', () => {
    // C major [60,64,67] → Am [60,64,69]: only G→A = 2 semitones
    render(
      <VoiceLeadingQualityDisplay
        voicings={[[60, 64, 67], [60, 64, 69]]}
      />,
    );
    expect(screen.getByText('smooth')).toBeInTheDocument();
  });

  it('shows angular rating for large movement', () => {
    // Large voice movements: C4 [60,64,67] → Gb4 [78,82,85]
    render(
      <VoiceLeadingQualityDisplay
        voicings={[[60, 64, 67], [78, 82, 85]]}
      />,
    );
    expect(screen.getByText('angular')).toBeInTheDocument();
  });

  it('shows total semitone movement', () => {
    render(
      <VoiceLeadingQualityDisplay
        voicings={[[60, 64, 67], [60, 64, 69]]}
      />,
    );
    expect(screen.getByText(/Total: \d+ st/)).toBeInTheDocument();
  });

  it('shows average movement per chord', () => {
    render(
      <VoiceLeadingQualityDisplay
        voicings={[[60, 64, 67], [60, 64, 69]]}
      />,
    );
    expect(screen.getByText(/Avg: [\d.]+ st\/chord/)).toBeInTheDocument();
  });

  it('renders transition bars for each pair', () => {
    const voicings = [
      [60, 64, 67], // C
      [60, 64, 69], // Am
      [60, 65, 69], // F
    ];
    render(<VoiceLeadingQualityDisplay voicings={voicings} />);
    // 3 voicings = 2 transitions = 2 bar elements with title attributes
    const bars = screen.getAllByTitle(/→/);
    expect(bars).toHaveLength(2);
  });

  it('transition bar titles show semitone counts', () => {
    render(
      <VoiceLeadingQualityDisplay
        voicings={[[60, 64, 67], [60, 64, 69]]}
      />,
    );
    const bar = screen.getByTitle(/1→2: \d+ semitones/);
    expect(bar).toBeInTheDocument();
  });
});
