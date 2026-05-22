'use client';

import { motion } from 'framer-motion';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

const mockStats = [
  { label: 'Total Users', value: '2,456', trend: '+12%', icon: '👥' },
  { label: 'Active Properties', value: '523', trend: '+8%', icon: '🏠' },
  { label: 'Bookings', value: '1,238', trend: '+23%', icon: '📅' },
  { label: 'Revenue', value: 'KES 2.4M', trend: '+18%', icon: '💰' },
];

const recentUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'tenant', joined: '2 hours ago' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'landlord', joined: '4 hours ago' },
  { id: 3, name: 'Peter Johnson', email: 'peter@example.com', role: 'tenant', joined: '1 day ago' },
];

const recentBookings = [
  { id: 1, tenant: 'John Doe', property: 'Luxury Apartment Downtown', amount: 'KES 25,000', status: 'confirmed' },
  { id: 2, tenant: 'Alice Brown', property: 'Modern Studio Kilimani', amount: 'KES 18,000', status: 'pending' },
  { id: 3, tenant: 'Bob Wilson', property: 'Family House Westlands', amount: 'KES 45,000', status: 'completed' },
];

export default function AdminDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Monitor and manage your Dwell KE platform</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {mockStats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <StatsCard
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              icon={stat.icon}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2"
        >
          <GlassmorphicCard>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white">Recent Users</h2>
            </div>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 hover:bg-slate-900 transition-colors"
                >
                  <div>
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {user.role}
                    </span>
                    <span className="text-sm text-gray-400">{user.joined}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphicCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <GlassmorphicCard>
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors text-sm">
                ➕ New User
              </button>
              <button className="w-full px-4 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-colors text-sm">
                ➕ New Property
              </button>
              <button className="w-full px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition-colors text-sm">
                📊 Generate Report
              </button>
              <button className="w-full px-4 py-3 rounded-lg border border-slate-700 text-white hover:bg-slate-900 transition-colors text-sm">
                ⚙️ Settings
              </button>
            </div>
          </GlassmorphicCard>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <GlassmorphicCard>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 font-bold text-white">Tenant</th>
                  <th className="text-left py-4 px-4 font-bold text-white">Property</th>
                  <th className="text-left py-4 px-4 font-bold text-white">Amount</th>
                  <th className="text-left py-4 px-4 font-bold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-white">{booking.tenant}</td>
                    <td className="py-4 px-4 text-gray-400">{booking.property}</td>
                    <td className="py-4 px-4 text-white font-medium">{booking.amount}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-500/20 text-green-400'
                            : booking.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
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
