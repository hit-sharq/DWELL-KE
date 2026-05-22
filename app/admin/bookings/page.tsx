'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { useState } from 'react';

const mockBookings = [
  { id: 1, tenant: 'John Doe', property: 'Luxury Apartment', checkIn: '2024-02-01', checkOut: '2024-02-15', amount: 'KES 25,000', status: 'confirmed' },
  { id: 2, tenant: 'Alice Brown', property: 'Modern Studio', checkIn: '2024-02-05', checkOut: '2024-02-20', amount: 'KES 18,000', status: 'pending' },
  { id: 3, tenant: 'Bob Wilson', property: 'Family House', checkIn: '2024-01-20', checkOut: '2024-02-03', amount: 'KES 45,000', status: 'completed' },
];

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const filteredBookings = mockBookings.filter(
    (booking) => statusFilter === 'all' || booking.status === statusFilter
  );

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Bookings</h1>
        <p className="text-gray-400">Monitor and manage all property bookings</p>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex gap-4">
        {['all', 'pending', 'confirmed', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              statusFilter === status
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Bookings Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassmorphicCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-6 font-bold text-white">Tenant</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Property</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Check In</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Check Out</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Amount</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-white">{booking.tenant}</td>
                    <td className="py-4 px-6 text-gray-400">{booking.property}</td>
                    <td className="py-4 px-6 text-white">{booking.checkIn}</td>
                    <td className="py-4 px-6 text-white">{booking.checkOut}</td>
                    <td className="py-4 px-6 text-white font-medium">{booking.amount}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-500/20 text-green-400'
                            : booking.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassmorphicCard>
      </motion.div>
    </div>
  );
}
