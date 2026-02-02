import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingTour } from '../OnboardingTour';

describe('OnboardingTour', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the tour on first visit (no localStorage flag)', () => {
    render(<OnboardingTour />);
    expect(screen.getByText('Welcome to Harmony Explorer')).toBeInTheDocument();
  });

  it('does not render when onboarding is already completed', () => {
    localStorage.setItem('harmony-explorer-onboarding-completed', 'true');
    const { container } = render(<OnboardingTour />);
    expect(container.innerHTML).toBe('');
  });

  it('shows step counter', () => {
    render(<OnboardingTour />);
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
  });

  it('has a dialog with correct aria attributes', () => {
    render(<OnboardingTour />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('clicking Next advances to step 2', async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);

    await user.click(screen.getByText('Next'));
    expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Key')).toBeInTheDocument();
  });

  it('Back button appears on step 2 but not step 1', async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);

    // Step 1: no Back button
    expect(screen.queryByText('Back')).not.toBeInTheDocument();

    // Go to step 2
    await user.click(screen.getByText('Next'));
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('clicking Back goes to previous step', async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);

    await user.click(screen.getByText('Next'));
    expect(screen.getByText('Step 2 of 8')).toBeInTheDocument();

    await user.click(screen.getByText('Back'));
    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
  });

  it('Skip closes the tour and sets localStorage', async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingTour />);

    await user.click(screen.getByText('Skip tour'));
    expect(container.innerHTML).toBe('');
    expect(localStorage.getItem('harmony-explorer-onboarding-completed')).toBe('true');
  });

  it('last step shows "Get Started" instead of "Next"', async () => {
    const user = userEvent.setup();
    render(<OnboardingTour />);

    // Navigate to last step (8 steps total, click Next 7 times)
    for (let i = 0; i < 7; i++) {
      await user.click(screen.getByText('Next'));
    }
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('clicking Get Started on last step closes tour', async () => {
    const user = userEvent.setup();
    const { container } = render(<OnboardingTour />);

    for (let i = 0; i < 7; i++) {
      await user.click(screen.getByText('Next'));
    }
    await user.click(screen.getByText('Get Started'));
    expect(container.innerHTML).toBe('');
    expect(localStorage.getItem('harmony-explorer-onboarding-completed')).toBe('true');
  });
});
