import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePwaInstall } from '../usePwaInstall';

describe('usePwaInstall', () => {
  let listeners: Map<string, ((e: Event) => void)[]>;
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  beforeEach(() => {
    listeners = new Map();

    window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event)!.push(handler as (e: Event) => void);
    }) as typeof window.addEventListener;

    window.removeEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      const current = listeners.get(event) ?? [];
      listeners.set(event, current.filter(l => l !== handler));
    }) as typeof window.removeEventListener;
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it('initially returns canInstall false', () => {
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.canInstall).toBe(false);
  });

  it('listens for beforeinstallprompt', () => {
    renderHook(() => usePwaInstall());
    expect(listeners.has('beforeinstallprompt')).toBe(true);
    expect(listeners.get('beforeinstallprompt')!.length).toBe(1);
  });

  it('sets canInstall true on beforeinstallprompt', () => {
    const { result } = renderHook(() => usePwaInstall());
    expect(result.current.canInstall).toBe(false);

    const mockEvent = new Event('beforeinstallprompt');
    Object.assign(mockEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    });

    act(() => {
      for (const handler of listeners.get('beforeinstallprompt') ?? []) {
        handler(mockEvent);
      }
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('prevents default on beforeinstallprompt', () => {
    renderHook(() => usePwaInstall());

    const mockEvent = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(mockEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    });
    const preventSpy = vi.spyOn(mockEvent, 'preventDefault');

    act(() => {
      for (const handler of listeners.get('beforeinstallprompt') ?? []) {
        handler(mockEvent);
      }
    });

    expect(preventSpy).toHaveBeenCalled();
  });

  it('promptInstall calls deferred prompt', async () => {
    const { result } = renderHook(() => usePwaInstall());

    const mockPrompt = vi.fn().mockResolvedValue(undefined);
    const mockEvent = new Event('beforeinstallprompt');
    Object.assign(mockEvent, {
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });

    act(() => {
      for (const handler of listeners.get('beforeinstallprompt') ?? []) {
        handler(mockEvent);
      }
    });

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(mockPrompt).toHaveBeenCalled();
  });

  it('resets canInstall after accepted', async () => {
    const { result } = renderHook(() => usePwaInstall());

    const mockEvent = new Event('beforeinstallprompt');
    Object.assign(mockEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });

    act(() => {
      for (const handler of listeners.get('beforeinstallprompt') ?? []) {
        handler(mockEvent);
      }
    });
    expect(result.current.canInstall).toBe(true);

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(result.current.canInstall).toBe(false);
  });

  it('keeps canInstall true after dismissed', async () => {
    const { result } = renderHook(() => usePwaInstall());

    const mockEvent = new Event('beforeinstallprompt');
    Object.assign(mockEvent, {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
    });

    act(() => {
      for (const handler of listeners.get('beforeinstallprompt') ?? []) {
        handler(mockEvent);
      }
    });

    await act(async () => {
      await result.current.promptInstall();
    });

    // Stays true since user dismissed, not accepted
    expect(result.current.canInstall).toBe(true);
  });

  it('promptInstall does nothing when no deferred prompt', async () => {
    const { result } = renderHook(() => usePwaInstall());
    // Should not throw
    await act(async () => {
      await result.current.promptInstall();
    });
    expect(result.current.canInstall).toBe(false);
  });

  it('cleans up listener on unmount', () => {
    const { unmount } = renderHook(() => usePwaInstall());
    expect(listeners.get('beforeinstallprompt')!.length).toBe(1);
    unmount();
    expect(listeners.get('beforeinstallprompt')!.length).toBe(0);
  });
});
