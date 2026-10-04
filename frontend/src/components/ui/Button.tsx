import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-navy disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-navy text-paper hover:bg-navy-light shadow-sm active:translate-y-0.5',
    accent: 'bg-brass text-white hover:bg-brass-dark shadow-sm active:translate-y-0.5',
    secondary: 'bg-paper-dark text-charcoal hover:bg-paper-muted border border-charcoal-border',
    outline: 'bg-transparent text-navy border border-navy hover:bg-navy-50 active:translate-y-0.5',
    ghost: 'bg-transparent text-charcoal hover:bg-paper-dark',
    danger: 'bg-clay text-white hover:bg-clay-dark shadow-sm active:translate-y-0.5',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs font-semibold',
    md: 'px-4 py-2 text-sm font-semibold',
    lg: 'px-5 py-2.5 text-base font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2 inline-flex items-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
