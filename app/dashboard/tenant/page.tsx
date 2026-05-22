'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/DashboardNav';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { Footer } from '@/components/Footer';
import { scrollReveal, scrollRevealStagger } from '@/lib/animations';

export default function TenantDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="tenant" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div {...scrollReveal} className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, John
            </h1>
            <p className="text-gray-400">
              Manage your bookings, favorites, and messages
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={scrollRevealStagger.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Active Bookings"
                value={2}
                icon="🏠"
                trend={{ value: 20, direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Saved Properties"
                value={12}
                icon="❤️"
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Unread Messages"
                value={3}
                icon="💬"
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Account Rating"
                value="4.8/5"
                icon="⭐"
              />
            </motion.div>
          </motion.div>

          {/* Recent Bookings */}
          <motion.div {...scrollReveal} className="mb-12">
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Bookings
              </h2>
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-4 rounded-lg bg-blue-500/5 border border-blue-500/20"
                  >
                    <div>
                      <p className="font-bold text-white">
                        Luxury Apartment in Westlands
                      </p>
                      <p className="text-sm text-gray-400">
                        Booking ID: #{1000 + item}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cyan-400">Active</p>
                      <p className="text-sm text-gray-400">Mar 15 - Jun 15</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div {...scrollReveal}>
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PremiumButton variant="outline" size="lg" className="w-full">
                  Browse Properties
                </PremiumButton>
                <PremiumButton variant="outline" size="lg" className="w-full">
                  View Messages
                </PremiumButton>
                <PremiumButton variant="solid" size="lg" className="w-full">
                  Edit Profile
                </PremiumButton>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
