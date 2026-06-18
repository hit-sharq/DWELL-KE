'use client';

import React from 'react';
import { DashboardNav } from '@/components/DashboardNav';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Footer } from '@/components/Footer';

export default function HotelSettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="hotel" />

      <div className="flex">
        <div className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard/hotel">
                  <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                    ← Back to Dashboard
                  </button>
                </Link>
                <h1 className="text-4xl font-bold text-white">Settings</h1>
              </div>
            </div>

            <GlassmorphicCard>
              <div className="text-center py-12">
                <p className="text-gray-400">Hotel settings coming soon</p>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}