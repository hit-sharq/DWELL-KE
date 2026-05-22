'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { StatsCard } from '@/components/StatsCard';
import { useState } from 'react';

const mockPayments = [
  { id: 1, booking: 'John Doe - Luxury Apartment', amount: 'KES 25,000', date: '2024-02-01', method: 'PesaPal', status: 'completed' },
  { id: 2, booking: 'Alice Brown - Modern Studio', amount: 'KES 18,000', date: '2024-02-05', method: 'PesaPal', status: 'pending' },
  { id: 3, booking: 'Bob Wilson - Family House', amount: 'KES 45,000', date: '2024-01-20', method: 'Card', status: 'completed' },
];

const paymentStats = [
  { label: 'Total Revenue', value: 'KES 5.2M', trend: '+15%', icon: '💰' },
  { label: 'Pending Payments', value: '12', trend: '-3%', icon: '⏳' },
  { label: 'Completed', value: '456', trend: '+22%', icon: '✅' },
  { label: 'Failed', value: '3', trend: '+1%', icon: '❌' },
];

export default function AdminPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  const filteredPayments = mockPayments.filter(
    (payment) => statusFilter === 'all' || payment.status === statusFilter
  );

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Payment Management</h1>
        <p className="text-gray-400">Monitor all transactions and revenue</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {paymentStats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
          />
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex gap-4">
        {['all', 'pending', 'completed', 'failed'].map((status) => (
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

      {/* Payments Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassmorphicCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-6 font-bold text-white">Booking</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Amount</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Date</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Method</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-white">{payment.booking}</td>
                    <td className="py-4 px-6 text-white font-medium">{payment.amount}</td>
                    <td className="py-4 px-6 text-gray-400">{payment.date}</td>
                    <td className="py-4 px-6 text-white">{payment.method}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                        View
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
