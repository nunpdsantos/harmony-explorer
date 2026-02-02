import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../useOnlineStatus';

describe('useOnlineStatus', () => {
  let onlineListeners: (() => void)[];
  let offlineListeners: (() => void)[];
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  beforeEach(() => {
    onlineListeners = [];
    offlineListeners = [];

    window.addEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'online') onlineListeners.push(handler as () => void);
      if (event === 'offline') offlineListeners.push(handler as () => void);
    }) as typeof window.addEventListener;

    window.removeEventListener = vi.fn((event: string, handler: EventListenerOrEventListenerObject) => {
      if (event === 'online') onlineListeners = onlineListeners.filter(l => l !== handler);
      if (event === 'offline') offlineListeners = offlineListeners.filter(l => l !== handler);
    }) as typeof window.removeEventListener;
  });

  afterEach(() => {
    window.addEventListener = originalAddEventListener;
    window.removeEventListener = originalRemoveEventListener;
  });

  it('returns true when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('returns false when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
    // Restore
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('listens for online and offline events', () => {
    renderHook(() => useOnlineStatus());
    expect(onlineListeners.length).toBe(1);
    expect(offlineListeners.length).toBe(1);
  });

  it('switches to false on offline event', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      for (const listener of offlineListeners) listener();
    });
    expect(result.current).toBe(false);
  });

  it('switches to true on online event', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      for (const listener of onlineListeners) listener();
    });
    expect(result.current).toBe(true);
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('cleans up listeners on unmount', () => {
    const { unmount } = renderHook(() => useOnlineStatus());
    expect(onlineListeners.length).toBe(1);
    expect(offlineListeners.length).toBe(1);

    unmount();
    expect(onlineListeners.length).toBe(0);
    expect(offlineListeners.length).toBe(0);
  });

  it('handles rapid online/offline toggling', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      for (const listener of offlineListeners) listener();
    });
    expect(result.current).toBe(false);

    act(() => {
      for (const listener of onlineListeners) listener();
    });
    expect(result.current).toBe(true);

    act(() => {
      for (const listener of offlineListeners) listener();
    });
    expect(result.current).toBe(false);
  });
});
