import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Timeline } from '../Timeline';
import { chord } from '../../../core/chords';

const C = chord(0, 'major');
const G = chord(7, 'major');
const Am = chord(9, 'minor');

const defaultProps = {
  playingIndex: -1,
  selectedChord: null,
  onChordClick: vi.fn(),
  onRemove: vi.fn(),
  onReorder: vi.fn(),
  width: 600,
  height: 96,
};

describe('Timeline keyboard interaction', () => {
  it('renders chord cards with role="option"', () => {
    render(
      <Timeline
        {...defaultProps}
        progression={[C, G, Am]}
      />,
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('renders container with role="listbox"', () => {
    render(
      <Timeline
        {...defaultProps}
        progression={[C, G]}
      />,
    );

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeTruthy();
  });

  it('calls onReorder with (index, index-1) on ArrowLeft', () => {
    const onReorder = vi.fn();
    render(
      <Timeline
        {...defaultProps}
        onReorder={onReorder}
        progression={[C, G, Am]}
      />,
    );

    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[1], { key: 'ArrowLeft' });
    expect(onReorder).toHaveBeenCalledWith(1, 0);
  });

  it('calls onReorder with (index, index+1) on ArrowRight', () => {
    const onReorder = vi.fn();
    render(
      <Timeline
        {...defaultProps}
        onReorder={onReorder}
        progression={[C, G, Am]}
      />,
    );

    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[1], { key: 'ArrowRight' });
    expect(onReorder).toHaveBeenCalledWith(1, 2);
  });

  it('does not call onReorder on ArrowLeft at index 0', () => {
    const onReorder = vi.fn();
    render(
      <Timeline
        {...defaultProps}
        onReorder={onReorder}
        progression={[C, G, Am]}
      />,
    );

    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[0], { key: 'ArrowLeft' });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('does not call onReorder on ArrowRight at last index', () => {
    const onReorder = vi.fn();
    render(
      <Timeline
        {...defaultProps}
        onReorder={onReorder}
        progression={[C, G, Am]}
      />,
    );

    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[2], { key: 'ArrowRight' });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('calls onRemove on Delete key', () => {
    const onRemove = vi.fn();
    render(
      <Timeline
        {...defaultProps}
        onRemove={onRemove}
        progression={[C, G, Am]}
      />,
    );

    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[1], { key: 'Delete' });
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('calls onRemove on Backspace key', () => {
    const onRemove = vi.fn();
    render(
      <Timeline
        {...defaultProps}
        onRemove={onRemove}
        progression={[C, G, Am]}
      />,
    );

    const options = screen.getAllByRole('option');
    fireEvent.keyDown(options[2], { key: 'Backspace' });
    expect(onRemove).toHaveBeenCalledWith(2);
  });

  it('chord cards have descriptive aria-label', () => {
    render(
      <Timeline
        {...defaultProps}
        progression={[C, G]}
      />,
    );

    const options = screen.getAllByRole('option');
    expect(options[0].getAttribute('aria-label')).toContain('position 1 of 2');
    expect(options[1].getAttribute('aria-label')).toContain('position 2 of 2');
  });

  it('renders touch move buttons for reorder', () => {
    render(
      <Timeline
        {...defaultProps}
        progression={[C, G, Am]}
      />,
    );

    // Middle chord should have both left and right move buttons
    const moveLeftButtons = screen.getAllByLabelText(/Move .* left/);
    const moveRightButtons = screen.getAllByLabelText(/Move .* right/);

    // First chord: only right button, middle: both, last: only left
    expect(moveLeftButtons.length).toBeGreaterThanOrEqual(2);
    expect(moveRightButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('shows empty state when progression is empty', () => {
    render(
      <Timeline
        {...defaultProps}
        progression={[]}
      />,
    );

    expect(screen.getByText(/Click chords/)).toBeTruthy();
  });
});
