'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from './GlassmorphicCard';
import { PremiumButton } from './PremiumButton';
import { scrollReveal } from '@/lib/animations';

export const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl opacity-30" />
        </div>

        <motion.div {...scrollReveal}>
          <GlassmorphicCard className="text-center py-16 lg:py-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Find Your Perfect Home?
            </h2>
            <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
              Join thousands of satisfied tenants and landlords on Dwell KE. Start your property journey today with verified listings and secure transactions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <PremiumButton variant="solid" size="lg">
                  Browse Properties
                </PremiumButton>
              </Link>
              <Link href="/auth/signup">
                <PremiumButton variant="outline" size="lg">
                  Get Started Free
                </PremiumButton>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-center gap-8">
              {[
                { icon: '✓', label: 'Verified Properties' },
                { icon: '🔒', label: 'Secure Payments' },
                { icon: '⭐', label: '10K+ Reviews' },
              ].map((badge) => (
                <motion.div
                  key={badge.label}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-sm font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>
    </section>
  );
};
