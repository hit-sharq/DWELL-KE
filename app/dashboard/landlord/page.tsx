'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/DashboardNav';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { Footer } from '@/components/Footer';
import { scrollReveal, scrollRevealStagger } from '@/lib/animations';

export default function LandlordDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="landlord" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div {...scrollReveal} className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Property Management Dashboard
            </h1>
            <p className="text-gray-400">
              Manage your properties, bookings, and earnings
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
                label="Active Properties"
                value={5}
                icon="🏢"
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Monthly Earnings"
                value="KES 287,500"
                icon="💰"
                trend={{ value: 15, direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Occupancy Rate"
                value="95%"
                icon="📊"
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Pending Inquiries"
                value={8}
                icon="📝"
              />
            </motion.div>
          </motion.div>

          {/* Revenue Overview and Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Revenue Chart */}
            <motion.div {...scrollReveal} className="lg:col-span-2">
              <GlassmorphicCard>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Revenue Overview
                </h2>
                <div className="h-64 bg-blue-500/5 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder</p>
                </div>
              </GlassmorphicCard>
            </motion.div>

            {/* Quick Stats */}
            <motion.div {...scrollReveal}>
              <GlassmorphicCard className="h-full">
                <h3 className="text-lg font-bold text-white mb-6">
                  Performance
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Avg Rating</p>
                    <p className="text-2xl font-bold text-cyan-400">4.9/5</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Verified</p>
                    <p className="text-emerald-400 font-bold">✓ Yes</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Member Since</p>
                    <p className="text-white font-bold">Jan 2024</p>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* Active Properties */}
          <motion.div {...scrollReveal}>
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-6">
                Active Properties
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between p-4 rounded-lg bg-blue-500/5 border border-blue-500/20"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-white">
                        Apartment {item} - Westlands
                      </p>
                      <p className="text-sm text-gray-400">
                        {6 + item} bookings • {90 + item}% occupancy
                      </p>
                    </div>
                    <div className="text-right mr-6">
                      <p className="font-bold text-cyan-400">
                        KES {45000 + item * 5000}
                      </p>
                      <p className="text-sm text-gray-400">/month</p>
                    </div>
                    <PremiumButton variant="outline" size="sm">
                      Manage
                    </PremiumButton>
                  </div>
                ))}
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
