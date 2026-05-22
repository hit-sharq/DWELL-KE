'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'solid' | 'outline' | 'ghost';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'solid',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'font-medium transition-all duration-300 rounded-lg cursor-pointer';

  const variantStyles = {
    solid: 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/20',
    outline: 'border border-blue-400/50 text-blue-300 hover:border-blue-300 hover:bg-blue-500/10',
    ghost: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/5',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
