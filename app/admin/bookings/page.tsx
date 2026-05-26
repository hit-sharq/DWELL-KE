'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

type BookingItem = {
  id: string;
  tenant: { firstName: string; lastName: string; email: string };
  property: { title: string; location: string };
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  payment: { status: string; paymentMethod: string | null } | null;
};

export default function AdminBookingsPage() {
  const [bookings, setBookings]   = useState<BookingItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/admin/bookings?status=${statusFilter}`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        setBookings(await res.json());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error fetching bookings');
      } finally {
        setLoading(false);
      }
    })();
  }, [statusFilter]);

  const statusPill = (s: string) => {
    const map: Record<string,string> = {
      confirmed:  'bg-emerald-500/12 text-emerald-400 border-emerald-500/18',
      pending:    'bg-yellow-500/12 text-yellow-400 border-yellow-500/18',
      completed:  'bg-blue-500/12 text-blue-400 border-blue-500/18',
      cancelled:  'bg-red-500/12 text-red-400 border-red-500/18',
    };
    return `px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border [${map[s] || map.pending}]`;
  };

  return (
    <div className="py-10 px-8">

      {/* ── Header ── */}
      <motion.div {...scrollReveal} className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl font-bold leading-none">📅</span>
          <h1 className="
            font-serif font-black text-white
            text-[clamp(1.75rem,3.5vw,2.5rem)]
            leading-[0.95] tracking-[-0.025em]
          ">
            Booking Management
          </h1>
        </div>
        <p className="text-gray-400 font-light text-base">
          Monitor and manage all property bookings across the platform
        </p>
      </motion.div>

{/* ── Filters ── */}
       <motion.div
         initial={{ opacity: 0, y: 18 }}
         animate={{ opacity: 1, y: 0 }}
         className="mb-8 flex flex-nowrap gap-3 overflow-x-auto pb-2"
       >
        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
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

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-24" />
          ))}
        </div>
      )}

      {/* ── Bookings table ── */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassmorphicCard className="overflow-hidden">
            {bookings.length === 0 ? (
              <div className="text-center py-14">
                <p className="text-gray-500 text-sm">No bookings match this filter.</p>
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
                      <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Location
                      </th>
                      <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Check In
                      </th>
                      <th className="text-left py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Check Out
                      </th>
                      <th className="text-right py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Amount
                      </th>
                      <th className="text-center py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Payment Status
                      </th>
                      <th className="text-center py-4 px-6 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">
                        Booking Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.018] transition-colors">
                        {/* Tenant name + email */}
                        <td className="py-4 px-6">
                          <p className="text-white font-medium text-sm">
                            {b.tenant.firstName} {b.tenant.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{b.tenant.email}</p>
                        </td>

                        {/* Property */}
                        <td className="py-4 px-6 text-gray-400 text-sm">{b.property.title}</td>

                        {/* Location */}
                        <td className="py-4 px-6 text-gray-500 text-[11px] font-mono">{b.property.location}</td>

                        {/* Check in */}
                        <td className="py-4 px-6 text-white text-sm">
                          {new Date(b.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Check out */}
                        <td className="py-4 px-6 text-white text-sm">
                          {new Date(b.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-6 text-right text-cyan-300 font-bold text-sm">
                          KES {b.totalPrice.toLocaleString()}
                        </td>

                        {/* Payment method + status */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={statusPill(b.payment?.status || 'pending')}>
                              {b.payment?.status ? `${b.payment.status.charAt(0).toUpperCase() + b.payment.status.slice(1)}` : 'Pending'}
                            </span>
                            {b.payment?.paymentMethod && (
                              <span className="text-[10px] text-gray-600 uppercase tracking-wider font-mono">
                                {b.payment.paymentMethod}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Booking status */}
                        <td className="py-4 px-6 text-center">
                          <span className={statusPill(b.status)}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
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
