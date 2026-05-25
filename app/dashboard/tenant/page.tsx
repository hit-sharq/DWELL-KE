'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { DashboardNav } from '@/components/DashboardNav';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { Footer } from '@/components/Footer';
import { useAuth } from '@clerk/nextjs';

interface DashboardStats {
  activeBookings: number;
  savedProperties: number;
  unreadMessages: number;
  recentBookings: Array<{
    id: string;
    status: string;
    totalPrice: number;
    checkInDate: string;
    checkOutDate: string;
    property: { title: string; location: string; images: string[] };
  }>;
  savedPropertiesList: Array<{
    id: string;
    property: {
      id: string;
      title: string;
      location: string;
      price: number;
      images: string[];
      bedrooms: number;
      bathrooms: number;
    };
  }>;
}

export default function TenantDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeBookings: 0,
    savedProperties: 0,
    unreadMessages: 0,
    recentBookings: [],
    savedPropertiesList: [],
  });
  const [userName, setUserName] = useState('Tenant');
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      window.location.href = '/auth/login';
      return;
    }

    const checkRoleAndFetchStats = async () => {
      let fetchedRole: string | null = null;

      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const userData = await res.json();
          fetchedRole = userData.role || null;

          // Redirect non-tenants away: landlords → landlord dashboard,
          // admins → admin dashboard.
          if (fetchedRole === 'landlord') {
            window.location.href = '/dashboard/landlord';
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

      const fetchStats = async () => {
        try {
          const response = await fetch('/api/dashboard/tenant/stats');
          if (response.ok) {
            const data = await response.json();
            setStats(data);
            setUserName(data.userName || 'Tenant');
          } else if (response.status === 401) {
            window.location.href = '/auth/login';
          }
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        }
      };
      fetchStats();
    };
    checkRoleAndFetchStats();
  }, [isLoaded, userId]);

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="tenant" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {userName}
            </h1>
            <p className="text-gray-400">Manage your bookings, favourites, and messages</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <StatsCard
              label="Active Bookings"
              value={stats.activeBookings}
              icon="🏠"
            />
            <StatsCard
              label="Saved Properties"
              value={stats.savedProperties}
              icon="❤️"
            />
            <StatsCard
              label="Unread Messages"
              value={stats.unreadMessages}
              icon="💬"
            />
          </motion.div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Bookings</h2>
              <Link href="/dashboard/tenant/bookings">
                <PremiumButton variant="outline" size="sm">View All</PremiumButton>
              </Link>
            </div>
            <GlassmorphicCard>
              {stats.recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
                  <Link href="/marketplace">
                    <PremiumButton variant="solid" size="sm">Browse Properties</PremiumButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentBookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 hover:bg-blue-500/10 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {booking.property.images?.[0] && (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={booking.property.images[0]}
                              alt={booking.property.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white">{booking.property.title}</p>
                          <p className="text-sm text-gray-400">{booking.property.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-500/15 text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' :
                          'bg-blue-500/15 text-blue-400'
                        }`}>
                          {booking.status}
                        </span>
                        <p className="text-cyan-400 font-bold mt-1">KES {booking.totalPrice.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>
          </motion.div>

          {/* Saved Properties */}
          {stats.savedPropertiesList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Saved Properties</h2>
                <Link href="/dashboard/tenant/favorites">
                  <PremiumButton variant="outline" size="sm">View All</PremiumButton>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.savedPropertiesList.slice(0, 3).map((fav) => (
                  <Link key={fav.id} href={`/properties/${fav.property.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      className="cursor-pointer"
                    >
                      <GlassmorphicCard className="h-full hover:border-cyan-400/30 transition-all">
                        <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                          {fav.property.images?.[0] ? (
                            <Image
                              src={fav.property.images[0]}
                              alt={fav.property.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                              <span className="text-gray-600">No Image</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-white mb-2 line-clamp-1">{fav.property.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{fav.property.location}</p>
                        <p className="text-cyan-400 font-bold">
                          KES {fav.property.price.toLocaleString()}
                          <span className="text-gray-500 text-xs">/mo</span>
                        </p>
                      </GlassmorphicCard>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/marketplace">
                <PremiumButton variant="outline" size="lg" className="w-full">
                  Browse Properties
                </PremiumButton>
              </Link>
              <Link href="/dashboard/tenant/messages">
                <PremiumButton variant="outline" size="lg" className="w-full">
                  Messages
                </PremiumButton>
              </Link>
              <Link href="/dashboard/tenant/profile">
                <PremiumButton variant="solid" size="lg" className="w-full">
                  Edit Profile
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