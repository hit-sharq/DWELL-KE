'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from './GlassmorphicCard';
import { FEATURES } from '@/lib/constants';
import { scrollReveal, scrollRevealStagger } from '@/lib/animations';

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          {...scrollReveal}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Dwell KE
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            We&apos;ve built a platform that puts your security and convenience first.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={scrollRevealStagger.container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              variants={scrollRevealStagger.item}
              whileHover={{ y: -5 }}
            >
              <GlassmorphicCard className="h-full">
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </GlassmorphicCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
