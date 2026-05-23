'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

type PaymentItem = {
  id: string;
  booking: string;
  tenant: string;
  property: string;
  amount: string;
  rawAmount: number;
  date: string;
  method: string;
  status: string;
  totalRevenue?: number;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments]     = useState<PaymentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/admin/payments?status=${statusFilter}`);
        if (!res.ok) throw new Error('Failed to load payments');
        setPayments(await res.json());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error loading payments');
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter]);

  // Summary as record to avoid re-renders
  const totalRevenue  = payments.reduce((s, p) => p.status === 'completed' ? s + p.rawAmount : s, 0);
  const pendingCount  = payments.filter(p => p.status === 'pending').length;
  const completedCount= payments.filter(p => p.status === 'completed').length;
  const failedCount   = payments.filter(p => p.status === 'failed').length;

  return (
    <div className="py-10 px-8">

      {/* ── Header ── */}
      <motion.div {...scrollReveal} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl font-bold leading-none">💳</span>
          <h1 className="
            font-serif font-black text-white
            text-[clamp(1.75rem,3.5vw,2.5rem)]
            leading-[0.95] tracking-[-0.025em]
          ">
            Payment Transactions
          </h1>
        </div>
        <p className="text-gray-400 font-light text-base">
          All payment records — PesaPal transactions and platform fees
        </p>
      </motion.div>

      {/* ── Summary strip ── */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-32" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8"
        >
          {[
            { label: 'Completed Revenue', value: `KES ${(totalRevenue / 1_000_000).toFixed(2)}M`, icon: '💵', accent: 'emerald' },
            { label: 'Pending',           value: pendingCount.toString(),           icon: '⏳', accent: 'yellow'  },
            { label: 'Completed',         value: completedCount.toString(),          icon: '✅', accent: 'blue'    },
            { label: 'Failed',            value: failedCount.toString(),             icon: '❌', accent: 'red'     },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassmorphicCard className="relative overflow-hidden py-6 px-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-500">{s.label}</span>
                  <span className="text-xl">{s.icon}</span>
                </div>
                <p className={`
                  font-black font-serif text-[clamp(1.2rem,2.5vw,1.75rem)]
                  ${s.accent === 'emerald' ? 'text-emerald-300'      : ''}
                  ${s.accent === 'yellow'  ? 'text-yellow-300'       : ''}
                  ${s.accent === 'blue'    ? 'text-blue-300'         : ''}
                  ${s.accent === 'red'     ? 'text-red-300'          : ''}
                `}>
                  {s.value}
                </p>
              </GlassmorphicCard>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex gap-3"
      >
        {(['all', 'pending', 'completed', 'failed'] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); }}
            className={`
              px-5 py-2.5 rounded-xl text-[11px] uppercase font-semibold tracking-[0.15em]
              transition-all duration-300
              ${statusFilter === s
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_24px_rgba(34,211,238,0.38)]'
                : 'bg-slate-900/50 text-gray-400 hover:text-white border border-white/[0.07]'}
            `}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </motion.div>

      {error && !loading && (
        <GlassmorphicCard className="border-red-400/20 bg-red-500/5 mb-8">
          <p className="text-red-400 text-sm">{error}</p>
        </GlassmorphicCard>
      )}

      {/* ── Payments table ── */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-20" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassmorphicCard className="overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-gray-500 text-sm">
                  {statusFilter !== 'all'
                    ? `No ${statusFilter} payment records.`
                    : 'No payment records yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Tenant
                      </th>
                      <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Property
                      </th>
                      <th className="text-right py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Method
                      </th>
                      <th className="text-center py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.018] transition-colors">
                        <td className="py-4 px-6 text-white font-medium text-sm">{p.tenant}</td>
                        <td className="py-4 px-6 text-gray-400 text-sm">{p.property}</td>
                        <td className="py-4 px-6 text-right text-cyan-300 font-bold text-sm">
                          {p.amount}
                        </td>
                        <td className="py-4 px-6 text-gray-500 text-[11px] font-mono">{p.date}</td>
                        <td className="py-4 px-6 text-gray-400 text-xs uppercase tracking-wider font-mono">
                          {p.method || '—'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`
                            inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border
                            ${p.status === 'completed'  ? 'bg-emerald-500/12 text-emerald-400 border-emerald-500/18'  : ''}
                            ${p.status === 'pending'    ? 'bg-yellow-500/12 text-yellow-400 border-yellow-500/18'  : ''}
                            ${p.status === 'failed'     ? 'bg-red-500/12 text-red-400 border-red-500/18'           : ''}
                            ${p.status === 'refunded'   ? 'bg-gray-500/12 text-gray-400 border-gray-500/18'        : ''}
                          `}>
                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassmorphicCard>
        </motion.div>
      )}
    </div>
  );
}
