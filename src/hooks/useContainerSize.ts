import { useState, useEffect, useCallback, type RefObject } from 'react';

export function useContainerSize(ref: RefObject<HTMLElement | null>): { width: number; height: number } {
  const [size, setSize] = useState({ width: 600, height: 500 });

  const updateSize = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, [ref]);

  useEffect(() => {
    updateSize();

    const observer = new ResizeObserver(() => updateSize());
    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, updateSize]);

  return size;
}
