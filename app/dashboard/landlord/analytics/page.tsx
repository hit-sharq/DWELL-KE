'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';

interface AnalyticsData {
  totalViews: number;
  occupancyRate: number;
  avgBookingValue: number;
  topPerforming: Array<{
    title: string;
    bookings: number;
    revenue: number;
  }>;
}

export default function LandlordAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      // Simulate API call - would be /api/landlord/analytics
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: AnalyticsData = {
        totalViews: 1247,
        occupancyRate: 78,
        avgBookingValue: 45000,
        topPerforming: [
          { title: 'Cozy Studio in Westlands', bookings: 12, revenue: 540000 },
          { title: 'Spacious 2BR Apartment', bookings: 8, revenue: 360000 },
          { title: 'Modern Apartment', bookings: 6, revenue: 240000 },
        ],
      };

      setAnalytics(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="landlord" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/landlord">
                <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Property Analytics</h1>
            <p className="text-gray-400">Performance metrics and insights</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading analytics...</div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <GlassmorphicCard>
                  <p className="text-gray-400 text-sm mb-2">Total Property Views</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {analytics.totalViews.toLocaleString()}
                  </p>
                </GlassmorphicCard>
                <GlassmorphicCard>
                  <p className="text-gray-400 text-sm mb-2">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {analytics.occupancyRate}%
                  </p>
                </GlassmorphicCard>
                <GlassmorphicCard>
                  <p className="text-gray-400 text-sm mb-2">Avg Booking Value</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    KES {analytics.avgBookingValue.toLocaleString()}
                  </p>
                </GlassmorphicCard>
              </div>

              {/* Top Performing Properties */}
              <GlassmorphicCard className="mb-12">
                <h2 className="text-xl font-bold text-white mb-6">Top Performing Properties</h2>
                <div className="space-y-4">
                  {analytics.topPerforming.map((prop, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/[0.04]"
                    >
                      <div>
                        <p className="font-bold text-white">{prop.title}</p>
                        <p className="text-sm text-gray-400">{prop.bookings} bookings</p>
                      </div>
                      <p className="text-cyan-400 font-bold">
                        KES {prop.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </>
          ) : null}
        </div>
      </div>

      <Footer />
    </main>
  );
}