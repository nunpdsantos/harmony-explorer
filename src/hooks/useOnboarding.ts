import { useState, useCallback, useEffect } from 'react';

const ONBOARDING_KEY = 'harmony-explorer-onboarding-completed';

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  next: () => void;
  back: () => void;
  skip: () => void;
  complete: () => void;
}

export function useOnboarding(totalSteps: number): OnboardingState {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        setIsActive(true);
      }
    } catch {
      // localStorage unavailable, skip tour
    }
  }, []);

  const markComplete = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  const next = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      markComplete();
      setIsActive(false);
    }
  }, [currentStep, totalSteps, markComplete]);

  const back = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skip = useCallback(() => {
    markComplete();
    setIsActive(false);
  }, [markComplete]);

  const complete = useCallback(() => {
    markComplete();
    setIsActive(false);
  }, [markComplete]);

  return { isActive, currentStep, totalSteps, next, back, skip, complete };
}
