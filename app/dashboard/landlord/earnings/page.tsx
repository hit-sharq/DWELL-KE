'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';
import { format } from 'date-fns';

interface Booking {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  property: {
    title: string;
  };
  tenant: {
    firstName: string;
    lastName: string;
  };
  payment?: {
    status: string;
  };
}

export default function LandlordEarningsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch data');

      // Fetch all bookings for each property owned by the landlord
      const properties = await response.json();
      const allBookings: Booking[] = [];

      for (const prop of properties) {
        const bookingsRes = await fetch(`/api/bookings?propertyId=${prop.id}`);
        if (bookingsRes.ok) {
          const propBookings = await bookingsRes.json();
          allBookings.push(...propBookings);
        }
      }

      setBookings(allBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load earnings');
    } finally {
      setIsLoading(false);
    }
  };

  const totalEarnings = bookings
    .filter((b) => b.status === 'completed' && b.payment?.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const pendingEarnings = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'pending')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const thisMonthEarnings = bookings
    .filter((b) => {
      const date = new Date(b.checkInDate);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear() &&
        b.status === 'completed'
      );
    })
    .reduce((sum, b) => sum + b.totalPrice, 0);

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
            <h1 className="text-4xl font-bold text-white mb-2">Earnings Dashboard</h1>
            <p className="text-gray-400">Track your rental income and payments</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <GlassmorphicCard>
              <p className="text-gray-400 text-sm mb-2">Total Earnings</p>
              <p className="text-3xl font-bold text-cyan-400">
                KES {totalEarnings.toLocaleString()}
              </p>
            </GlassmorphicCard>
            <GlassmorphicCard>
              <p className="text-gray-400 text-sm mb-2">This Month</p>
              <p className="text-3xl font-bold text-emerald-400">
                KES {thisMonthEarnings.toLocaleString()}
              </p>
            </GlassmorphicCard>
            <GlassmorphicCard>
              <p className="text-gray-400 text-sm mb-2">Pending Payouts</p>
              <p className="text-3xl font-bold text-yellow-400">
                KES {pendingEarnings.toLocaleString()}
              </p>
            </GlassmorphicCard>
          </div>

          {/* Recent Transactions */}
          <GlassmorphicCard>
            <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>

            {isLoading ? (
              <div className="text-center py-8 text-gray-400">Loading transactions...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No transactions yet</div>
            ) : (
              <div className="space-y-3">
                {bookings
                  .filter((b) => b.status === 'completed')
                  .sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
                  .slice(0, 10)
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/[0.04]"
                    >
                      <div>
                        <p className="font-bold text-white">{booking.property.title}</p>
                        <p className="text-sm text-gray-400">
                          {booking.tenant.firstName} {booking.tenant.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(booking.checkInDate), 'PP')} - {format(new Date(booking.checkOutDate), 'PP')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold">
                          KES {booking.totalPrice.toLocaleString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.payment?.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {booking.payment?.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </GlassmorphicCard>
        </div>
      </div>

      <Footer />
    </main>
  );
}