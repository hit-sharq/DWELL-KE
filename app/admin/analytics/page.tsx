'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

type StatsApiResponse = {
  stats: Array<{ label: string; value: string; trend: string | null }>;
  alerts: Array<{ type: string; description: string; severity: string }>;
  recentUsers: Array<{ id: string; name: string; email: string; role: string; joined: string }>;
  recentBookings: Array<{ id: string; tenant: string; property: string; amount: string; status: string }>;
  recentProperties: Array<{ id: string; title: string; landlord: { firstName: string | null; lastName: string | null } }>;
  monthlyBookings: Array<{ month: string; bookings: number }>;
};


export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<StatsApiResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/admin">
                <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">System Analytics</h1>
            <p className="text-gray-400">Platform-wide performance metrics</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading analytics...</div>
          ) : analytics ? (
            <>
              {(() => {
                const byLabel = new Map(analytics.stats.map((s) => [s.label, s.value] as const));

                const get = (label: string) => byLabel.get(label) ?? '0';

                return (
                  <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                      <GlassmorphicCard>
                        <p className="text-gray-400 text-sm mb-2">Total Users</p>
                        <p className="text-3xl font-bold text-cyan-400">{get('Total Users')}</p>
                      </GlassmorphicCard>
                      <GlassmorphicCard>
                        <p className="text-gray-400 text-sm mb-2">Total Properties</p>
                        <p className="text-3xl font-bold text-emerald-400">
                          {get('Active Properties')}
                        </p>
                      </GlassmorphicCard>
                      <GlassmorphicCard>
                        <p className="text-gray-400 text-sm mb-2">Total Bookings</p>
                        <p className="text-3xl font-bold text-yellow-400">{get('Total Bookings')}</p>
                      </GlassmorphicCard>
                      <GlassmorphicCard>
                        <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
                        <p className="text-3xl font-bold text-purple-400">{get('Total Revenue')}</p>
                      </GlassmorphicCard>
                    </div>

                    {/* Payment Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      <GlassmorphicCard>
                        <p className="text-gray-400 text-sm mb-2">Completed Payments</p>
                        <p className="text-2xl font-bold text-green-400">{get('Completed Payments')}</p>
                      </GlassmorphicCard>
                      <GlassmorphicCard>
                        <p className="text-gray-400 text-sm mb-2">Failed Payments</p>
                        <p className="text-2xl font-bold text-red-400">{get('Failed Payments')}</p>
                      </GlassmorphicCard>
                      <GlassmorphicCard>
                        <p className="text-gray-400 text-sm mb-2">Pending Verification</p>
                        <p className="text-2xl font-bold text-yellow-400">{get('Pending Verification')}</p>
                      </GlassmorphicCard>
                    </div>
                  </>
                );
              })()}


              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Users */}
                <GlassmorphicCard>
                  <h2 className="text-xl font-bold text-white mb-4">Recent Users</h2>
                  <div className="space-y-3">
                    {analytics.recentUsers.map((user) => (

                      <div key={user.id} className="p-3 rounded-lg bg-slate-900/40 border border-white/[0.04]">
                        <p className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          user.role === 'landlord' ? 'bg-cyan-500/20 text-cyan-400' :
                          user.role === 'tenant' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassmorphicCard>

                {/* Recent Bookings */}
                <GlassmorphicCard>
                  <h2 className="text-xl font-bold text-white mb-4">Recent Bookings</h2>
                  <div className="space-y-3">
                    {analytics.recentBookings.map((booking) => (
                      <div key={booking.id} className="p-3 rounded-lg bg-slate-900/40 border border-white/[0.04]">
                        <p className="text-white font-medium">{booking.property.title}</p>
                        <p className="text-xs text-gray-400">
                          {booking.tenant.firstName} {booking.tenant.lastName}
                        </p>
                        <p className="text-cyan-400 text-sm">KES {booking.totalPrice.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </GlassmorphicCard>

                {/* Recent Properties */}
                <GlassmorphicCard>
                  <h2 className="text-xl font-bold text-white mb-4">Recent Properties</h2>
                  <div className="space-y-3">
                    {analytics.recentProperties.map((prop) => (
                      <div key={prop.id} className="p-3 rounded-lg bg-slate-900/40 border border-white/[0.04]">
                        <p className="text-white font-medium">{prop.title}</p>
                        <p className="text-xs text-gray-400">
                          by {prop.landlord.firstName} {prop.landlord.lastName}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassmorphicCard>
              </div>
            </>
          ) : null}
</div>
        </div>
      </div>
    );
}