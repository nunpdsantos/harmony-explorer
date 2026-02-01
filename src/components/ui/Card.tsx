import React from 'react';

interface CardProps {
  title?: string;
  /** Right-aligned element next to the title */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Remove bottom border (e.g. last section in sidebar) */
  noBorder?: boolean;
}

export const Card: React.FC<CardProps> = ({ title, action, children, className = '', noBorder = false }) => {
  return (
    <div className={`px-4 py-3 ${noBorder ? '' : 'border-b border-white/10'} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-2">
          {title && (
            <div className="text-[10px] text-white/50 uppercase tracking-wider">{title}</div>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
};
