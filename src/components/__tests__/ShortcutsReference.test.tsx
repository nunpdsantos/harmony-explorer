import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShortcutsReference } from '../ShortcutsReference';
import { useStore } from '../../state/store';

// Mock HTMLDialogElement methods (jsdom doesn't implement them)
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('ShortcutsReference', () => {
  beforeEach(() => {
    useStore.setState({ showShortcutsModal: false });
  });

  it('renders nothing when modal is closed', () => {
    const { container } = render(<ShortcutsReference />);
    expect(container.innerHTML).toBe('');
  });

  it('renders modal content when open', () => {
    useStore.setState({ showShortcutsModal: true });
    render(<ShortcutsReference />);
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('shows all shortcut groups', () => {
    useStore.setState({ showShortcutsModal: true });
    render(<ShortcutsReference />);
    expect(screen.getByText('Playback')).toBeInTheDocument();
    expect(screen.getByText('Chords (Explore mode)')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('shows individual shortcuts', () => {
    useStore.setState({ showShortcutsModal: true });
    render(<ShortcutsReference />);
    expect(screen.getByText('Play / Stop')).toBeInTheDocument();
    expect(screen.getByText('Toggle loop')).toBeInTheDocument();
    expect(screen.getByText('Remove last chord')).toBeInTheDocument();
  });

  it('shows keyboard keys in kbd elements', () => {
    useStore.setState({ showShortcutsModal: true });
    render(<ShortcutsReference />);
    expect(screen.getByText('Space')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('clicking close button hides the modal', async () => {
    const user = userEvent.setup();
    useStore.setState({ showShortcutsModal: true });
    render(<ShortcutsReference />);

    // Dialog content is inside a <dialog> which jsdom considers inert,
    // so we need { hidden: true } to reach its children
    const closeBtn = screen.getByRole('button', { name: 'Close dialog', hidden: true });
    await user.click(closeBtn);
    expect(useStore.getState().showShortcutsModal).toBe(false);
  });
});
