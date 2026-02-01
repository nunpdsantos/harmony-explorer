import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VizSelector } from '../VizSelector';
import { useStore } from '../../state/store';

describe('VizSelector', () => {
  beforeEach(() => {
    useStore.setState({ activeViz: 'circleOfFifths' });
  });

  it('renders all 7 visualization options', () => {
    render(<VizSelector />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(7);
  });

  it('renders category groups with radiogroup role', () => {
    render(<VizSelector />);
    const groups = screen.getAllByRole('radiogroup');
    expect(groups).toHaveLength(3);
  });

  it('shows Circle of Fifths as checked by default', () => {
    render(<VizSelector />);
    const circle = screen.getByRole('radio', { name: 'Circle of Fifths' });
    expect(circle).toHaveAttribute('aria-checked', 'true');
  });

  it('shows other options as unchecked', () => {
    render(<VizSelector />);
    const pyramid = screen.getByRole('radio', { name: 'Proximity Pyramid' });
    expect(pyramid).toHaveAttribute('aria-checked', 'false');
  });

  it('clicking a different visualization updates the store', async () => {
    const user = userEvent.setup();
    render(<VizSelector />);

    await user.click(screen.getByRole('radio', { name: 'Proximity Pyramid' }));
    expect(useStore.getState().activeViz).toBe('proximityPyramid');
  });

  it('updates checked state when store changes', () => {
    const { rerender } = render(<VizSelector />);
    useStore.setState({ activeViz: 'augmentedStar' });
    rerender(<VizSelector />);

    expect(screen.getByRole('radio', { name: 'Augmented Star' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Circle of Fifths' })).toHaveAttribute('aria-checked', 'false');
  });

  it('renders short labels as button text', () => {
    render(<VizSelector />);
    expect(screen.getByText('Circle')).toBeInTheDocument();
    expect(screen.getByText('Pyramid')).toBeInTheDocument();
    expect(screen.getByText('T/S/D')).toBeInTheDocument();
    expect(screen.getByText('Dim')).toBeInTheDocument();
    expect(screen.getByText('Aug')).toBeInTheDocument();
    expect(screen.getByText('Tri')).toBeInTheDocument();
    expect(screen.getByText('Neo-R')).toBeInTheDocument();
  });

  it('renders category labels', () => {
    render(<VizSelector />);
    expect(screen.getByText('Circle-based')).toBeInTheDocument();
    expect(screen.getByText('Function-based')).toBeInTheDocument();
    expect(screen.getByText('Symmetry')).toBeInTheDocument();
  });
});
