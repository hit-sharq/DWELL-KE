'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardNav } from '@/components/DashboardNav';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { Footer } from '@/components/Footer';
import { useAuth } from '@clerk/nextjs';

interface LandlordDashboardData {
  activeProperties: number;
  confirmedBookings: number;
  totalRevenue: number;
  occupancyPct: number;
  pendingInquiries: number;
  recentProperties: Array<{
    id: string;
    title: string;
    location: string;
    price: number;
    status: string;
    verified: boolean;
    images: string[];
    _count: { bookings: number; reviews: number };
  }>;
  recentBookings: Array<{
    id: string;
    status: string;
    totalPrice: number;
    property: { title: string };
    tenant: { firstName: string; lastName: string };
  }>;
  monthlyData: Array<{ month: string; revenue: number }>;
}

export default function LandlordDashboardPage() {
  const [data, setData] = useState<LandlordDashboardData>({
    activeProperties: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    occupancyPct: 0,
    pendingInquiries: 0,
    recentProperties: [],
    recentBookings: [],
    monthlyData: [],
  });
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      window.location.href = '/auth/login';
      return;
    }

    const checkRoleAndFetchData = async () => {
      let fetchedRole: string | null = null;

      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const userData = await res.json();
          fetchedRole = userData.role || null;

          // Redirect non-landlords away: tenants → tenant dashboard,
          // admins → admin dashboard.
          if (fetchedRole === 'tenant') {
            window.location.href = '/dashboard/tenant';
            return;
          }
          if (fetchedRole === 'admin') {
            window.location.href = '/dashboard/admin';
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check role:', error);
      }

      const fetchData = async () => {
        try {
          // Gate the landlord dashboard behind onboarding approval
          // so landlords must complete the KYC/application flow.
          const statusRes = await fetch('/api/landlord/application-status');
          if (statusRes.ok) {
            const statusJson = await statusRes.json();
            if (statusJson?.status !== 'approved') {
              window.location.href = '/become-landlord';
              return;
            }
          }

          const response = await fetch('/api/dashboard/landlord/stats');
          if (response.ok) {
            const result = await response.json();
            setData(result);
          }
        } catch (error) {
          console.error('Failed to fetch landlord stats:', error);
        }
      };
      fetchData();
    };
    checkRoleAndFetchData();
  }, [isLoaded, userId]);

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="landlord" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-2">Property Management Dashboard</h1>
            <p className="text-gray-400">Live overview of your properties, bookings, and earnings</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            <StatsCard label="Active Properties" value={data.activeProperties} icon="🏢" />
            <StatsCard
              label="Monthly Earnings"
              value={`KES ${(data.totalRevenue / 1_000_000).toFixed(1)}M`}
              icon="💰"
              trend={{ value: 15, direction: 'up' }}
            />
            <StatsCard label="Occupancy Rate" value={`${data.occupancyPct}%`} icon="📊" />
            <StatsCard label="Pending Inquiries" value={data.pendingInquiries} icon="📝" />
          </motion.div>

          {/* Revenue Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <GlassmorphicCard>
              <h2 className="text-2xl font-bold text-white mb-6">Revenue Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {data.monthlyData.length > 0 ? (
                  data.monthlyData.map((item, idx) => (
                    <motion.div
                      key={item.month}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-5 rounded-xl bg-slate-900/50 border border-white/[0.04] text-center"
                    >
                      <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-2">{item.month}</p>
                      <p className="text-xl font-bold text-cyan-300">
                        KES {(item.revenue / 1_000_000).toFixed(2)}M
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    No revenue data yet. Listings with confirmed bookings will appear here.
                  </div>
                )}
              </div>
            </GlassmorphicCard>
          </motion.div>

          {/* Properties and Bookings Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Active Properties */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Active Properties</h2>
                <Link href="/dashboard/landlord/properties">
                  <PremiumButton variant="outline" size="sm">View All</PremiumButton>
                </Link>
              </div>
              <GlassmorphicCard>
                {data.recentProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">You haven't listed any properties yet.</p>
                    <Link href="/dashboard/landlord/create-property">
                      <PremiumButton variant="solid" size="sm">Create Your First Listing</PremiumButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.recentProperties.slice(0, 3).map((prop) => (
                      <motion.div
                        key={prop.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/40 border border-white/[0.04]"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          {prop.images?.[0] ? (
                            <Image src={prop.images[0]} alt={prop.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-gray-600">
                              <span className="text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white">{prop.title}</p>
                          <p className="text-sm text-gray-400">{prop.location}</p>
                        </div>
                        <p className="text-cyan-400 font-bold">KES {prop.price.toLocaleString()}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlassmorphicCard>
            </motion.div>

            {/* Recent Bookings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
                <Link href="/dashboard/landlord/bookings">
                  <PremiumButton variant="outline" size="sm">View All</PremiumButton>
                </Link>
              </div>
              <GlassmorphicCard>
                {data.recentBookings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No bookings yet.</div>
                ) : (
                  <div className="space-y-4">
                    {data.recentBookings.slice(0, 3).map((booking) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/10"
                      >
                        <div>
                          <p className="font-bold text-white">{booking.property.title}</p>
                          <p className="text-sm text-gray-400">
                            {booking.tenant.firstName} {booking.tenant.lastName}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-500/15 text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                          'bg-blue-500/15 text-blue-400'
                        }`}>
                          {booking.status}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/landlord/create-property">
                <PremiumButton variant="solid" size="lg" className="w-full">
                  Add New Property
                </PremiumButton>
              </Link>
              <Link href="/dashboard/landlord/earnings">
                <PremiumButton variant="outline" size="lg" className="w-full">
                  View Earnings
                </PremiumButton>
              </Link>
              <Link href="/dashboard/landlord/analytics">
                <PremiumButton variant="outline" size="lg" className="w-full">
                  Analytics
                </PremiumButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}