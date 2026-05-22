'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { useState } from 'react';

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'tenant', status: 'active', joined: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'landlord', status: 'active', joined: '2024-01-10' },
  { id: 3, name: 'Peter Johnson', email: 'peter@example.com', role: 'tenant', status: 'inactive', joined: '2024-01-08' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'landlord', status: 'active', joined: '2024-01-05' },
  { id: 5, name: 'Bob Wilson', email: 'bob@example.com', role: 'tenant', status: 'active', joined: '2024-01-01' },
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tenant' | 'landlord'>('all');

  const filteredUsers = mockUsers.filter(
    (user) =>
      (roleFilter === 'all' || user.role === roleFilter) &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manage Users</h1>
        <p className="text-gray-400">View and manage all platform users</p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col sm:flex-row gap-4"
      >
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
        >
          <option value="all">All Roles</option>
          <option value="tenant">Tenant</option>
          <option value="landlord">Landlord</option>
        </select>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <GlassmorphicCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-6 font-bold text-white">Name</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Email</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Role</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Status</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Joined</th>
                  <th className="text-left py-4 px-6 font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-4 px-6 text-white">{user.name}</td>
                    <td className="py-4 px-6 text-gray-400">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">{user.joined}</td>
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
