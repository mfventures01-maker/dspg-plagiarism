import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  id?: string;
  variant?: 'primary' | 'gold' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  id,
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a2a6c] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#1a2a6c] hover:bg-[#142054] text-white shadow-sm border border-transparent',
    gold: 'bg-[#c9a84c] hover:bg-[#b0913a] text-white shadow-sm border border-transparent',
    secondary: 'bg-[#2d4059] hover:bg-[#202e40] text-white shadow-sm border border-transparent',
    outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent',
    ghost: 'hover:bg-slate-100 text-slate-600'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2'
  };

  return (
    <button
      id={id}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />}
      {!loading && icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
