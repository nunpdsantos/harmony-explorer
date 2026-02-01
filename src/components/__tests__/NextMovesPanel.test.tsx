import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextMovesPanel } from '../NextMovesPanel';
import { chord } from '../../core/chords';

const cMajor = chord(0, 'major');

describe('NextMovesPanel', () => {
  it('renders "Next from C" header', () => {
    render(
      <NextMovesPanel
        sourceChord={cMajor}
        keyRoot={0}
        onChordClick={vi.fn()}
        onChordHover={vi.fn()}
      />,
    );
    expect(screen.getByText(/Next from C/)).toBeInTheDocument();
  });

  it('renders strength group labels', () => {
    render(
      <NextMovesPanel
        sourceChord={cMajor}
        keyRoot={0}
        onChordClick={vi.fn()}
        onChordHover={vi.fn()}
      />,
    );
    // C major in key of C should have strong moves (V→I resolution suggestions)
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('renders chord buttons for suggested moves', () => {
    render(
      <NextMovesPanel
        sourceChord={cMajor}
        keyRoot={0}
        onChordClick={vi.fn()}
        onChordHover={vi.fn()}
      />,
    );
    // Should have at least some chord buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('calls onChordClick when a move button is clicked', () => {
    const onChordClick = vi.fn();
    render(
      <NextMovesPanel
        sourceChord={cMajor}
        keyRoot={0}
        onChordClick={onChordClick}
        onChordHover={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onChordClick).toHaveBeenCalledTimes(1);
    // Argument should be a Chord object
    expect(onChordClick.mock.calls[0][0]).toHaveProperty('root');
    expect(onChordClick.mock.calls[0][0]).toHaveProperty('quality');
  });

  it('calls onChordHover on mouse enter/leave', () => {
    const onChordHover = vi.fn();
    render(
      <NextMovesPanel
        sourceChord={cMajor}
        keyRoot={0}
        onChordClick={vi.fn()}
        onChordHover={onChordHover}
      />,
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.mouseEnter(buttons[0]);
    expect(onChordHover).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(buttons[0]);
    expect(onChordHover).toHaveBeenCalledWith(null);
  });

  it('each move button has a title with the reason', () => {
    render(
      <NextMovesPanel
        sourceChord={cMajor}
        keyRoot={0}
        onChordClick={vi.fn()}
        onChordHover={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    // Every button should have a title attribute (from m.reason)
    for (const btn of buttons) {
      expect(btn.getAttribute('title')).toBeTruthy();
    }
  });

  it('shows multiple strength groups for a tonic chord', () => {
    render(
      <NextMovesPanel
        sourceChord={cMajor}
        keyRoot={0}
        onChordClick={vi.fn()}
        onChordHover={vi.fn()}
      />,
    );
    // Tonic chord should have strong and common moves at minimum
    const texts = screen.getAllByText(/Strong|Common|Creative/);
    expect(texts.length).toBeGreaterThanOrEqual(2);
  });
});
