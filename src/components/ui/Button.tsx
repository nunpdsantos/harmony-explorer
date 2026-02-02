import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-600/50',
  secondary: 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white disabled:text-white/30',
  ghost: 'text-white/50 hover:text-white/80 hover:bg-white/5 disabled:text-white/20',
  danger: 'bg-red-600/20 text-red-300 border border-red-500/20 hover:bg-red-600/30 disabled:text-red-300/40',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-2 py-1 rounded',
  md: 'text-sm px-3 py-1.5 rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'sm',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : null}
      {children}
    </button>
  );
};
