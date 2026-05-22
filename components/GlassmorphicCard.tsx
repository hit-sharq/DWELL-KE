'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { COLORS } from '@/lib/constants';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: boolean;
  glow?: boolean | string; // string can be: 'blue' | 'cyan' | 'emerald' | 'violet'
  animated?: boolean;
}

export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  className,
  depth = false,
  glow = false,
  animated = false,
}) => {
  // Convert color string to RGB values for shadow effects
  const getColorRgb = (colorKey: string): string => {
    const colorMap: Record<string, string> = {
      blue: COLORS.blue.substring(1), // Remove '#'
      cyan: COLORS.cyan.substring(1),
      emerald: COLORS.emerald.substring(1),
      violet: COLORS.violet.substring(1),
    };
    const hex = colorMap[colorKey] || COLORS.cyan.substring(1);
    // Convert hex to rgb
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r},${g},${b}`;
  };

  let glowClass = '';
  if (glow) {
    if (typeof glow === 'string') {
      const rgb = getColorRgb(glow);
      glowClass = `hover:shadow-[0_0_40px_rgba(${rgb},0.5)] hover:scale-[1.02]`;
    } else {
      // Default to cyan
      const rgb = getColorRgb('cyan');
      glowClass = `hover:shadow-[0_0_40px_rgba(${rgb},0.5)] hover:scale-[1.02]`;
    }
  }

  return (
    <div
      className={cn(
        'bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-600 relative overflow-hidden',
        depth && 'shadow-inner-lg hover:shadow-[0_0_50px_rgba(34,211,238,0.3)]',
        glowClass,
        animated && 'animate-float',
        className
      )}
    >
      {/* Animated gradient border for depth effect */}
      {depth && (
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/20 via-blue-400/10 to-emerald-400/20 animate-gradient-shift" />
        </div>
      )}
      {children}
    </div>
  );
};