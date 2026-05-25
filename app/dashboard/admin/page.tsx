'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AdminNav } from '@/components/AdminNav';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  completedPayments: number;
  failedPayments: number;
  pendingVerifications: number;
  recentUsers: Array<{
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: string;
  }>;
  recentBookings: Array<{
    id: string;
    status: string;
    totalPrice: number;
    tenant: { firstName: string | null; lastName: string | null };
    property: { title: string; location: string };
  }>;
  recentProperties: Array<{
    id: string;
    title: string;
    landlord: { firstName: string | null; lastName: string | null };
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    totalRevenue: 0,
    completedPayments: 0,
    failedPayments: 0,
    pendingVerifications: 0,
    recentUsers: [],
    recentBookings: [],
    recentProperties: [],
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const successRate = stats.completedPayments + stats.failedPayments > 0
    ? Math.round((stats.completedPayments / (stats.completedPayments + stats.failedPayments)) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="py-10 px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-serif font-black text-white">
                Admin Command Centre
              </h1>
              <p className="text-gray-400 mt-2">Platform-wide analytics and controls</p>
            </div>
            <div className="flex gap-3">
              <PremiumButton variant="outline" size="sm" asChild>
                <Link href="/admin/properties?status=pending">Pending Reviews</Link>
              </PremiumButton>
              <PremiumButton variant="outline" size="sm" asChild>
                <Link href="/admin/analytics">Full Analytics</Link>
              </PremiumButton>
            </div>
          </motion.div>

          {/* Key Metrics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-cyan-400 to-blue-500' },
              { label: 'Properties', value: stats.totalProperties, icon: '🏠', color: 'from-emerald-400 to-teal-500' },
              { label: 'Bookings', value: stats.totalBookings, icon: '📅', color: 'from-purple-400 to-pink-500' },
              { label: 'Revenue', value: `KES ${(stats.totalRevenue / 1_000_000).toFixed(1)}M`, icon: '💰', color: 'from-amber-400 to-orange-500' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <GlassmorphicCard className="p-6">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <p className="text-sm text-gray-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <GlassmorphicCard className="p-6">
              <p className="text-sm text-gray-400 mb-2">Pending Verifications</p>
              <p className="text-3xl font-bold text-white">{stats.pendingVerifications}</p>
            </GlassmorphicCard>
            <GlassmorphicCard className="p-6">
              <p className="text-sm text-gray-400 mb-2">Payment Success Rate</p>
              <p className="text-3xl font-bold text-white">{successRate}%</p>
            </GlassmorphicCard>
            <GlassmorphicCard className="p-6">
              <p className="text-sm text-gray-400 mb-2">Failed Payments</p>
              <p className="text-3xl font-bold text-red-400">{stats.failedPayments}</p>
            </GlassmorphicCard>
          </motion.div>

          {/* Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassmorphicCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Recent Users</h3>
                  <Link href="/admin/users" className="text-cyan-400 text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {stats.recentUsers.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                        u.role === 'landlord' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </motion.div>

            {/* Recent Bookings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassmorphicCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Recent Bookings</h3>
                  <Link href="/admin/bookings" className="text-cyan-400 text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {stats.recentBookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40">
                      <div>
                        <p className="text-white font-medium text-sm">{b.property.title}</p>
                        <p className="text-gray-500 text-xs">
                          {b.tenant.firstName} {b.tenant.lastName}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        b.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                        b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </motion.div>

            {/* Recent Properties */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassmorphicCard>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Recent Properties</h3>
                  <Link href="/admin/properties" className="text-cyan-400 text-sm hover:underline">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {stats.recentProperties.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-3 rounded-lg bg-slate-900/40">
                      <p className="text-white font-medium text-sm">{p.title}</p>
                      <p className="text-gray-500 text-xs">
                        by {p.landlord.firstName} {p.landlord.lastName}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}