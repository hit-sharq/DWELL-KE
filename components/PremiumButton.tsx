import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

type ButtonVariant = 'solid' | 'outline' | 'ghost';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asChild?: boolean;
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(function PremiumButton({
  variant = 'solid',
  size = 'md',
  className,
  children,
  asChild = false,
  ...props
}, ref) {
  const Comp = asChild ? Slot : 'button';
  const base =
    (asChild ? '' : 'relative overflow-hidden font-medium tracking-wide cursor-pointer rounded-xl transition-all duration-300 ease-out ') +
    'font-medium tracking-wide rounded-xl transition-all duration-300 ease-out';

  const sizes = {
    sm: 'px-4 py-2 text-[11px] uppercase tracking-[0.18em]',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-9 py-3.5 text-base',
  };

  const variants: Record<ButtonVariant, string> = {
    solid: `
      bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600
      text-white
      shadow-[0_0_22px_-4px_rgba(34,211,238,0.45)]
      hover:shadow-[0_0_44px_-4px_rgba(34,211,238,0.72)]
      hover:-translate-y-[1px]
      active:translate-y-0 active:shadow-[0_0_14px_-4px_rgba(34,211,238,0.35)]
    `,
    outline: `
      border border-cyan-400/40 text-cyan-300/90
      bg-white/[0.025]
      hover:bg-cyan-400/[0.08] hover:border-cyan-300/60 hover:shadow-[0_0_22px_-6px_rgba(34,211,238,0.28)]
      active:translate-y-[1px]
    `,
    ghost: `
      text-cyan-300/70
      hover:bg-cyan-400/[0.06] hover:text-cyan-200/90
      active:bg-cyan-400/[0.04]
    `,
  };

  return (
    <Comp
      ref={ref}
      className={cn(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </Comp>
  );
});
