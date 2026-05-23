'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { StatsCard } from '@/components/StatsCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

type StatsResponse = {
  stats: Array<{ label: string; value: string; trend: string | null }>;
  alerts: Array<{ type: string; description: string; severity: string }>;
  recentUsers: Array<{ id: string; name: string; email: string; role: string; joined: string }>;
  recentBookings: Array<{ id: string; tenant: string; property: string; amount: string; status: string }>;
  monthlyBookings: Array<{ month: string; bookings: number }>;
};

export default function AdminReportsPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'Failed to load analytics');
        }
        setData(await res.json());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const severityStyles: Record<string, string> = {
    high:   'border-red-500/30 bg-red-500/8',
    medium: 'border-yellow-500/30 bg-yellow-500/8',
    low:    'border-blue-500/30 bg-blue-500/8',
  };
  const severityText: Record<string, string> = {
    high:   'text-red-400',
    medium: 'text-yellow-400',
    low:    'text-blue-400',
  };

  return (
    <div className="p-8 max-w-7xl">

      {/* Header */}
      <motion.div {...scrollReveal} className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-cyan-400/50 mb-3">Platform Insights</p>
        <h1 className="text-4xl font-bold text-white mb-2">Reports &amp; Analytics</h1>
        <p className="text-gray-400">Live platform metrics — data sourced directly from Postgres</p>
      </motion.div>

      {error && !loading && (
        <GlassmorphicCard className="border-red-400/20 bg-red-500/5 mb-8">
          <p className="text-red-400">{error}</p>
        </GlassmorphicCard>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-32" />
          ))}
        </div>
      ) : data && (
        <>

          {/* ── Platform Stats ── */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.07 },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px 0px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {data.stats.map((s) => (
              <motion.div key={s.label}>
                <StatsCard
                  label={s.label}
                  value={s.value}
                  trend={s.trend
                    ? { value: parseInt(s.trend.replace(/\D/g, '')) || 0, direction: s.trend.includes('pending') ? 'down' : 'up' }
                    : undefined}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* ── Alerts ── */}
          {data.alerts.length > 0 && (
            <motion.div {...scrollReveal} className="mb-12">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/70" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </span>
                Platform Alerts
              </h2>
              <div className="space-y-4">
                {data.alerts.map((a, i) => (
                  <GlassmorphicCard
                    key={i}
                    className={`border ${severityStyles[a.severity]} flex items-start gap-4`}
                  >
                    <span className={`text-base mt-0.5 ${severityText[a.severity]}`}>●</span>
                    <div>
                      <p className="text-white font-bold text-sm">{a.type}</p>
                      <p className="text-gray-400 text-sm">{a.description}</p>
                    </div>
                    <span className={`ml-auto text-[10px] uppercase font-mono tracking-wider px-2.5 py-1 rounded-full border ${severityStyles[a.severity].replace('bg-', 'bg-gradient-to-r from-transparent to-')} ${severityText[a.severity]}`}>
                      {a.severity}
                    </span>
                  </GlassmorphicCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Two-column grid: Recent Users &amp; Recent Bookings ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 22, stiffness: 160 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Recent Users */}
            <GlassmorphicCard>
              <h3 className="text-lg font-bold text-white mb-5 flex items-center justify-between">
                Recent Users
                <span className="text-[10px] font-mono text-cyan-400/50 tracking-wider uppercase">Live</span>
              </h3>
              {data.recentUsers.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No users yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">{u.name}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 uppercase tracking-wide">
                          {u.role}
                        </span>
                        <span className="text-[10px] text-gray-600 font-mono">{u.joined}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>

            {/* Recent Bookings */}
            <GlassmorphicCard>
              <h3 className="text-lg font-bold text-white mb-5 flex items-center justify-between">
                Recent Bookings
                <span className="text-[10px] font-mono text-cyan-400/50 tracking-wider uppercase">Live</span>
              </h3>
              {data.recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No bookings yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.recentBookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/40"
                    >
                      <div>
                        <p className="text-white font-medium text-sm">{b.tenant}</p>
                        <p className="text-gray-500 text-xs">{b.property}</p>
                      </div>
                      <div className="text-right flex items-center gap-2.5">
                        <span className="text-cyan-400 font-bold text-sm">{b.amount}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                          b.status === 'confirmed'  ? 'bg-emerald-500/15 text-emerald-400' :
                          b.status === 'pending'    ? 'bg-yellow-500/15 text-yellow-400' :
                          b.status === 'completed'  ? 'bg-blue-500/15 text-blue-400' :
                                                       'bg-red-500/15 text-red-400'
                        }`}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>
          </motion.div>

          {/* ── Monthly Booking Volume ── */}
          {data.monthlyBookings.length > 0 && (
            <motion.div {...scrollReveal}>
              <h2 className="text-xl font-bold text-white mb-5">Monthly Booking Volume</h2>
              <GlassmorphicCard>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3">
                  {data.monthlyBookings.map((m) => (
                    <div
                      key={m.month}
                      className="relative flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-transparent hover:border-cyan-400/20 transition-all"
                    >
                      <p className="text-[9px] uppercase font-mono text-gray-500 tracking-wider">{m.month}</p>
                      <p className="text-lg font-bold font-serif text-cyan-300">{m.bookings}</p>
                      <div
                        className="absolute bottom-1 rounded-full bg-gradient-to-t from-cyan-400/40 to-transparent transition-all"
                        style={{
                          width: '60%',
                          height: `${Math.max(4, Math.min(32, m.bookings * 3))}px`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </motion.div>
          )}

        </>
      )}
    </div>
  );
}
