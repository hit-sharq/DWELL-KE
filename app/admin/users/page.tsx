'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joined: string;
  propertiesCount: number;
  bookingsCount: number;
};

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tenant' | 'landlord'>('all');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ role: roleFilter });
        if (search) params.append('search', search);
        const res = await fetch(`/api/admin/users?${params}`);
        if (!res.ok) throw new Error('Failed to load users');
        setUsers(await res.json());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error loading users');
      } finally {
        setLoading(false);
      }
    })();
  }, [roleFilter, search]);

  const roleBadge = (role: string) => {
    const map: Record<string,string> = {
      landlord:  'bg-cyan-500/12 text-cyan-400 border-cyan-500/18',
      tenant:    'bg-blue-500/12 text-blue-400 border-blue-500/18',
      admin:     'bg-violet-500/12 text-violet-400 border-violet-500/18',
    };
    return `px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border [${map[role] || map.tenant}]`;
  };

  return (
    <div className="py-10 px-8">

      {/* ── Header ── */}
      <motion.div {...scrollReveal} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl font-bold leading-none">👥</span>
          <h1 className="
            font-serif font-black text-white
            text-[clamp(1.75rem,3.5vw,2.5rem)]
            leading-[0.95] tracking-[-0.025em]
          ">
            User Management
          </h1>
        </div>
        <p className="text-gray-400 font-light text-base">
          Browse and manage all platform users — live from Postgres
        </p>
      </motion.div>

      {error && !loading && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <GlassmorphicCard className="border-red-400/20 bg-red-500/5 mb-8">
            <p className="text-red-400 text-sm">{error}</p>
          </GlassmorphicCard>
        </motion.div>
      )}

      {/* ── Toolbar: search + filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, type: 'spring', damping: 22, stiffness: 160 }}
        className="mb-8 flex flex-col sm:flex-row gap-4"
      >
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          className="flex-1 px-5 py-3 rounded-xl bg-slate-900/50 border border-white/[0.07]
                     text-white placeholder-gray-600 text-sm
                     focus:outline-none focus:border-cyan-400/30 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'tenant' | 'landlord')}
          className="px-5 py-3 rounded-xl bg-slate-900/50 border border-white/[0.07] text-white text-sm
                     focus:outline-none focus:border-cyan-400/30 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)]"
        >
          <option value="all">All Roles</option>
          <option value="tenant">Tenant</option>
          <option value="landlord">Landlord</option>
        </select>
        {(search || roleFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setRoleFilter('all'); }}
            className="px-5 py-3 rounded-xl text-sm text-gray-400 hover:text-white
                       border border-white/[0.07] hover:border-white/[0.12] bg-slate-900/30"
          >
            Clear
          </button>
        )}
      </motion.div>

      {/* ── Loading ── */}
      {loading && (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-24" />
          ))}
        </div>
      )}

      {/* ── Users list ── */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', damping: 22, stiffness: 160 }}
        >
          <GlassmorphicCard className="overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-gray-500 mb-2 text-sm">No matching users found.</p>
                {(search || roleFilter !== 'all') && (
                  <button
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                    onClick={() => { setSearch(''); setRoleFilter('all'); }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                          Name
                        </th>
                        <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                          Email
                        </th>
                        <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                          Role
                        </th>
                        <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                          Joined
                        </th>
                        <th className="text-right py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                          Props
                        </th>
                        <th className="text-right py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                          Bookings
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-white/[0.03] hover:bg-white/[0.018] transition-colors"
                        >
                          <td className="py-4 px-6 text-white font-medium">{user.name || '—'}</td>
                          <td className="py-4 px-6 text-gray-400 text-sm">{user.email}</td>
                          <td className="py-4 px-6">
                            <span className={roleBadge(user.role)}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`
                              px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                              ${user.status === 'active'     ? 'bg-emerald-500/12 text-emerald-400'  :
                                user.status === 'inactive'   ? 'bg-gray-500/15 text-gray-400'        :
                                                              'bg-amber-500/12 text-amber-400'}
                            `}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-500 font-mono text-xs">{user.joined}</td>
                          <td className="py-4 px-6 text-right text-gray-300">{user.propertiesCount}</td>
                          <td className="py-4 px-6 text-right text-gray-300">{user.bookingsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-white/[0.04]">
                  {users.map((user) => (
                    <div key={user.id} className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-white">{user.name || '—'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <span className={roleBadge(user.role)}>{user.role}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Joined: {user.joined}</span>
                        <span className={`
                          px-2 py-1 rounded-full text-[10px]
                          ${user.status === 'active'   ? 'bg-emerald-500/12 text-emerald-400' :
                            user.status === 'inactive' ? 'bg-gray-500/15 text-gray-400'       :
                                                         'bg-amber-500/12 text-amber-400'}
                        `}>
                          {user.status}
                        </span>
                      </div>
                      <div className="flex gap-4 pt-1">
                        <span className="text-[10px] text-gray-500">{user.propertiesCount} props</span>
                        <span className="text-[10px] text-gray-500">{user.bookingsCount} bookings</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}
