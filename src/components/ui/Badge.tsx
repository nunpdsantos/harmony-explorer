import React from 'react';

type BadgeVariant = 'tonic' | 'subdominant' | 'dominant' | 'neutral' | 'success';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  tonic: 'bg-green-500/20 text-green-400 border-green-500/30',
  subdominant: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  dominant: 'bg-red-500/20 text-red-400 border-red-500/30',
  neutral: 'bg-white/5 text-white/50 border-white/10',
  success: 'bg-green-500/20 text-green-300 border-green-500/30',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
