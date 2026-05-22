'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  className,
  hover = true,
}) => {
  return (
    <div
      className={cn(
        'glassmorphic rounded-lg p-6 transition-all duration-300',
        hover && 'hover:border-cyan-400/50 hover:bg-white/10',
        className
      )}
    >
      {children}
    </div>
  );
};
