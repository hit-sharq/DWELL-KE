'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DashboardNav } from '@/components/DashboardNav';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { Footer } from '@/components/Footer';
import { scrollReveal, scrollRevealStagger } from '@/lib/animations';

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="admin" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div {...scrollReveal} className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">
              Platform overview and management
            </p>
          </motion.div>

          {/* Platform Stats */}
          <motion.div
            variants={scrollRevealStagger.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -100px 0px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Total Users"
                value="12,450"
                icon="👥"
                trend={{ value: 8, direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Total Properties"
                value="5,280"
                icon="🏠"
                trend={{ value: 12, direction: 'up' }}
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Monthly Revenue"
                value="KES 45.2M"
                icon="💵"
              />
            </motion.div>
            <motion.div variants={scrollRevealStagger.item}>
              <StatsCard
                label="Fraud Flags"
                value={12}
                icon="🚨"
                trend={{ value: 5, direction: 'down' }}
              />
            </motion.div>
          </motion.div>

          {/* System Health and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* System Health */}
            <motion.div {...scrollReveal} className="lg:col-span-2">
              <GlassmorphicCard>
                <h2 className="text-2xl font-bold text-white mb-6">
                  System Health
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">API Uptime</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <p className="text-emerald-400 font-bold">99.95%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Database Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <p className="text-emerald-400 font-bold">Optimal</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Active Sessions</p>
                    <p className="text-white font-bold">2,847</p>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div {...scrollReveal}>
              <GlassmorphicCard className="h-full">
                <h3 className="text-lg font-bold text-white mb-6">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <PremiumButton variant="outline" size="sm" className="w-full">
                    View Users
                  </PremiumButton>
                  <PremiumButton variant="outline" size="sm" className="w-full">
                    Review Properties
                  </PremiumButton>
                  <PremiumButton variant="solid" size="sm" className="w-full">
                    Check Alerts
                  </PremiumButton>
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* Flagged Items */}
          <motion.div {...scrollReveal}>
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Alerts
              </h2>
              <div className="space-y-4">
                {[
                  {
                    type: 'Fraud Flag',
                    description: 'Suspicious listing activity detected',
                    severity: 'high',
                  },
                  {
                    type: 'Payment Issue',
                    description: 'Failed transaction detected',
                    severity: 'medium',
                  },
                  {
                    type: 'Compliance',
                    description: 'Unverified landlord listing properties',
                    severity: 'high',
                  },
                ].map((alert, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      alert.severity === 'high'
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-yellow-500/5 border-yellow-500/20'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white">{alert.type}</p>
                      <p className="text-sm text-gray-400">
                        {alert.description}
                      </p>
                    </div>
                    <PremiumButton variant="outline" size="sm">
                      Review
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
