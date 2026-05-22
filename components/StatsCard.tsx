'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from './GlassmorphicCard';
import { scrollReveal } from '@/lib/animations';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; direction: 'up' | 'down' };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  trend,
}) => {
  return (
    <motion.div {...scrollReveal}>
      <GlassmorphicCard>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend && (
              <p
                className={`text-sm mt-2 ${
                  trend.direction === 'up'
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
              </p>
            )}
          </div>
          {icon && (
            <div className="text-3xl">{icon}</div>
          )}
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
};
