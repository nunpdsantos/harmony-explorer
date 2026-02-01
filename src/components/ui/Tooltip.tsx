import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  delay = 300,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 8;

    switch (position) {
      case 'top':
        setCoords({ x: rect.left + rect.width / 2, y: rect.top - gap });
        break;
      case 'bottom':
        setCoords({ x: rect.left + rect.width / 2, y: rect.bottom + gap });
        break;
      case 'left':
        setCoords({ x: rect.left - gap, y: rect.top + rect.height / 2 });
        break;
      case 'right':
        setCoords({ x: rect.right + gap, y: rect.top + rect.height / 2 });
        break;
    }
  }, [position]);

  const show = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setVisible(true);
    }, delay);
  }, [delay, updatePosition]);

  const hide = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const transformOrigin = {
    top: 'translateX(-50%) translateY(-100%)',
    bottom: 'translateX(-50%)',
    left: 'translateX(-100%) translateY(-50%)',
    right: 'translateY(-50%)',
  }[position];

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
      } as Record<string, unknown>)}
      {visible &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[9999] px-2 py-1 text-xs text-white bg-gray-800 border border-white/10 rounded shadow-lg pointer-events-none max-w-xs"
            style={{
              left: coords.x,
              top: coords.y,
              transform: transformOrigin,
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
};
