'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { BRAND } from '@/lib/constants';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-slate-500/5 rounded-full filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={staggerItem} className="flex justify-center">
            <div className="inline-block glassmorphic px-4 py-2">
              <p className="text-sm text-cyan-400 font-medium">
                ✨ Welcome to Premium Property Discovery
              </p>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={staggerItem}>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Home in Kenya
              </span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.div variants={staggerItem}>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover verified properties with secure bookings, trusted landlords, and
              seamless M-Pesa transactions. {BRAND.name} keeps your property search safe and simple.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/marketplace">
              <PremiumButton variant="solid" size="lg">
                Explore Properties
              </PremiumButton>
            </Link>
            <Link href="/auth/signup">
              <PremiumButton variant="outline" size="lg">
                Create Account
              </PremiumButton>
            </Link>
          </motion.div>

          {/* Trust Stats */}
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-3 gap-4 md:gap-8 pt-12 max-w-2xl mx-auto"
          >
            {[
              { number: '5K+', label: 'Verified Properties' },
              { number: '10K+', label: 'Happy Tenants' },
              { number: '500+', label: 'Trusted Landlords' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-cyan-400">
                  {stat.number}
                </p>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
