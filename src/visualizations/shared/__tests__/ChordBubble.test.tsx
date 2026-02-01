import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChordBubble } from '../ChordBubble';
import { chord } from '../../../core/chords';

const cMajor = chord(0, 'major');

const defaultProps = {
  chord: cMajor,
  x: 100,
  y: 100,
  radius: 30,
  isSelected: false,
  isHovered: false,
  isInProgression: false,
  isReference: false,
  isDiatonic: true,
  isDimmed: false,
  isNextMove: false,
  fillColor: '#3b82f6',
  onClick: vi.fn(),
  onHover: vi.fn(),
};

// ChordBubble is an SVG group, so wrap in SVG for rendering
function renderBubble(overrides = {}) {
  return render(
    <svg>
      <ChordBubble {...defaultProps} {...overrides} />
    </svg>,
  );
}

describe('ChordBubble', () => {
  it('renders with button role', () => {
    renderBubble();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible aria-label with chord name', () => {
    renderBubble();
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('C Major');
  });

  it('includes "selected" in aria-label when selected', () => {
    renderBubble({ isSelected: true });
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('selected');
  });

  it('includes "in progression" in aria-label when in progression', () => {
    renderBubble({ isInProgression: true });
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('in progression');
  });

  it('includes "reference chord" in aria-label when reference', () => {
    renderBubble({ isReference: true });
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('reference chord');
  });

  it('includes "suggested" in aria-label when next move', () => {
    renderBubble({ isNextMove: true, nextMoveStrength: 'strong' });
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('suggested');
  });

  it('sets aria-pressed when selected', () => {
    renderBubble({ isSelected: true });
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('sets aria-pressed=false when not selected', () => {
    renderBubble({ isSelected: false });
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('includes roman numeral label in aria-label', () => {
    renderBubble({ label: 'I' });
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-label')).toContain('I');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    renderBubble({ onClick });
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(cMajor);
  });

  it('calls onHover with chord on mouseEnter', () => {
    const onHover = vi.fn();
    renderBubble({ onHover });
    fireEvent.mouseEnter(screen.getByRole('button'));
    expect(onHover).toHaveBeenCalledWith(cMajor);
  });

  it('calls onHover with null on mouseLeave', () => {
    const onHover = vi.fn();
    renderBubble({ onHover });
    fireEvent.mouseLeave(screen.getByRole('button'));
    expect(onHover).toHaveBeenCalledWith(null);
  });

  it('calls onClick on Enter key', () => {
    const onClick = vi.fn();
    renderBubble({ onClick });
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(cMajor);
  });

  it('calls onClick on Space key', () => {
    const onClick = vi.fn();
    renderBubble({ onClick });
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ' });
    expect(onClick).toHaveBeenCalledWith(cMajor);
  });

  it('has tabIndex=0 for keyboard accessibility', () => {
    renderBubble();
    expect(screen.getByRole('button').getAttribute('tabindex')).toBe('0');
  });
});
