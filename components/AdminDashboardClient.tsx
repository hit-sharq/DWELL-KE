'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal, scrollRevealStagger } from '@/lib/animations';

type RecentUser = {
  id: string; firstName: string; lastName: string; email: string; role: string; createdAt: string;
};
type TenantInfo = { firstName: string; lastName: string };
type PropInfo   = { title: string; location: string };
type BookingRow = {
  id: string; tenant: TenantInfo; property: PropInfo; totalPrice: number; status: string;
};
type LandlordInfo = { firstName: string; lastName: string };
type PropRow = {
  id: string; title: string; location: string; price: number; bedrooms: number;
  bathrooms: number; type: string; verified: boolean; featured: boolean; landlord: LandlordInfo;
  bookingsCount: number; reviewsCount: number;
};

interface Props {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
  completedPayments: number;
  failedPayments: number;
  pendingVerifications: number;
  recentUsers: RecentUser[];
  recentBookings: BookingRow[];
  recentProperties: PropRow[];
}

export default function AdminDashboardClient({
  totalUsers, totalProperties, totalBookings, totalRevenue,
  completedPayments, failedPayments, pendingVerifications,
  recentUsers, recentBookings, recentProperties,
}: Props) {
  const revenue  = totalRevenue / 1_000_000;
  const success  = completedPayments > 0
    ? Math.round((completedPayments / (completedPayments + failedPayments || 1)) * 100)
    : 100;

  return (
    <main className="min-h-screen bg-background">
      <div className="py-10 px-8">

        {/* ── Page header ── */}
           <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="
                  font-serif font-black text-white
                  text-[clamp(2rem,4vw,3rem)]
                  leading-[0.9] tracking-[-0.03em]
                ">Command Centre</h1>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px]
                               font-mono uppercase tracking-wider bg-emerald-500/12 text-emerald-400
                               border border-emerald-500/25">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>
              <p className="text-gray-400 font-light text-base">
                Platform-wide stats — sourced in real-time from Postgres
              </p>
            </div>
            <PremiumButton
              variant="outline"
              size="sm"
              asChild
              className="shrink-0"
            >
              <Link href="/">← Back to Website</Link>
            </PremiumButton>
          </div>

        <div className="max-w-7xl mx-auto space-y-10">

          {/* ════ KEY METRICS ════ */}
          <motion.div
            variants={scrollRevealStagger.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5"
          >
            {[
              { label: 'Total Users',       value: totalUsers.toLocaleString(),             icon: '👥', accent: 'from-cyan-300 to-blue-400',   delay: 0 },
              { label: 'Active Properties', value: totalProperties.toLocaleString(),         icon: '🏠', accent: 'from-blue-300 to-cyan-400',   delay: 0.06 },
              { label: 'Confirmed Bookings',value: totalBookings.toLocaleString(),           icon: '📅', accent: 'from-emerald-300 to-teal-400', delay: 0.12 },
              { label: 'Monthly Revenue',   value: `KES ${revenue.toFixed(1)}M`,             icon: '💵', accent: 'from-amber-300 to-yellow-400', delay: 0.18 },
              { label: 'Pending Review',    value: pendingVerifications.toLocaleString(),    icon: '⏳', accent: 'from-orange-300 to-amber-400', delay: 0.24, urgent: pendingVerifications > 5 },
              { label: 'Payment Health',    value: `${success}%`,                            icon: failedPayments > 0 ? '⚠️' : '✅', accent: failedPayments > 0 ? 'from-red-300 to-orange-400' : 'from-emerald-300 to-green-400', delay: 0.30 },
            ].map((m, i) => (
              <motion.div key={m.label} variants={scrollRevealStagger.item}>
                <GlassmorphicCard
                  className={`
                    relative overflow-hidden py-6 px-5
                    border border-cyan-400/[0.07]
                    hover:border-cyan-400/25 transition-all duration-500
                    ${m.urgent ? 'ring-1 ring-orange-500/25' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl">{m.icon}</span>
                    <span className={`
                      font-black font-serif text-[10px] uppercase tracking-[0.15em]
                      bg-clip-text text-transparent bg-gradient-to-r ${m.accent}
                    `}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.22em] font-mono text-gray-500 mb-1">{m.label}</p>
                  <p className="text-2xl font-bold font-serif text-white">{m.value}</p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* ════ TWO-COLUMN: QUEUES + RECENT USERS ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Pending Verifications */}
            <motion.div {...scrollReveal}>
              <GlassmorphicCard className="h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {pendingVerifications > 0
                      ? `${pendingVerifications} Awaiting Verification`
                      : 'Verification Queue'}
                  </h2>
                  <PremiumButton variant="ghost" size="sm" asChild>
                    <Link href="/admin/properties?status=pending">View All</Link>
                  </PremiumButton>
                </div>

                {pendingVerifications === 0 && recentProperties.every(p => p.verified) ? (
                  <div className="text-center py-10">
                    <div className="text-3xl mb-3">🎉</div>
                    <p className="text-emerald-400 font-medium text-sm">All listings verified — queue empty.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentProperties
                      .filter(p => !p.verified)
                      .slice(0, 5)
                      .map((p) => {
                        const llName = p.landlord ? `${p.landlord.firstName} ${p.landlord.lastName}` : 'Unknown';
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-4 p-4 rounded-xl
                                       bg-slate-900/40 border border-yellow-500/10 hover:border-yellow-500/25
                                       transition-all group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-sm truncate">{p.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {llName} · {p.location}
                                {' '}<span className="text-cyan-400/70">KES {p.price.toLocaleString()}/mo</span>
                              </p>
                            </div>
                            <PremiumButton variant="ghost" size="sm" asChild>
                              <Link href={`/properties/${p.id}`}>Review</Link>
                            </PremiumButton>
                          </div>
                        );
                      })}
                    {recentProperties.filter(p => !p.verified).length === 0 && (
                      <p className="text-gray-500 text-center text-sm py-6">No unverified properties in the latest batch.</p>
                    )}
                  </div>
                )}
              </GlassmorphicCard>
            </motion.div>

            {/* Recent Sign-ups */}
            <motion.div {...scrollReveal}>
              <GlassmorphicCard className="h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-bold text-white tracking-tight">Recent Sign-ups</h2>
                  <PremiumButton variant="ghost" size="sm" asChild>
                    <Link href="/admin/users">All Users</Link>
                  </PremiumButton>
                </div>

                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">No users yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3.5 rounded-xl
                                   bg-slate-900/40 hover:bg-slate-900/70 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{u.firstName} {u.lastName}</p>
                          <p className="text-[11px] text-gray-500 truncate">{u.email}</p>
                        </div>
                        <span className={`
                          px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                          ${u.role === 'landlord' ? 'bg-cyan-500/15 text-cyan-400' : ''}
                          ${u.role === 'tenant'   ? 'bg-blue-500/15 text-blue-400'   : ''}
                          ${u.role === 'admin'    ? 'bg-violet-500/15 text-violet-400' : ''}
                        `}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* ════ RECENT BOOKINGS ════ */}
          <motion.div {...scrollReveal}>
            <GlassmorphicCard>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-3">
                  Recent Bookings
                  <span className="text-[10px] font-mono text-gray-500 font-medium tracking-wider uppercase">Last 5</span>
                </h2>
                <PremiumButton variant="outline" size="sm" asChild>
                  <Link href="/admin/bookings">All Bookings</Link>
                </PremiumButton>
              </div>
              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-sm">No bookings yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left py-3.5 px-5 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">Tenant</th>
                        <th className="text-left py-3.5 px-5 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">Property</th>
                        <th className="text-left py-3.5 px-5 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">Location</th>
                        <th className="text-right py-3.5 px-5 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">Amount</th>
                        <th className="text-center py-3.5 px-5 text-[10px] uppercase tracking-[0.18em] font-mono text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.018] transition-colors">
                          <td className="py-4 px-5 text-sm text-white font-medium">{b.tenant.firstName} {b.tenant.lastName}</td>
                          <td className="py-4 px-5 text-sm text-gray-400">{b.property.title}</td>
                          <td className="py-4 px-5 text-sm text-gray-500">{b.property.location}</td>
                          <td className="py-4 px-5 text-right text-cyan-300 font-bold text-sm">KES {b.totalPrice.toLocaleString()}</td>
                          <td className="py-4 px-5 text-center">
                            <span className={`
                              inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                              ${b.status === 'confirmed' ? 'bg-emerald-500/12 text-emerald-400' : ''}
                              ${b.status === 'pending'   ? 'bg-yellow-500/12 text-yellow-400' : ''}
                              ${b.status === 'completed' ? 'bg-blue-500/12 text-blue-400'   : ''}
                              ${b.status === 'cancelled' ? 'bg-red-500/12 text-red-400'     : ''}
                            `}>
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

          {/* ════ LATEST LISTINGS ════ */}
          <motion.div {...scrollReveal}>
            <GlassmorphicCard>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-base font-bold text-white tracking-tight">Latest Listings</h2>
                <PremiumButton variant="outline" size="sm" asChild>
                  <Link href="/admin/properties">All Listings</Link>
                </PremiumButton>
              </div>
              {recentProperties.length === 0 ? (
                <p className="text-gray-500 text-center py-10 text-sm">No properties listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentProperties.map((p) => {
                    const llName = p.landlord ? `${p.landlord.firstName} ${p.landlord.lastName}` : 'Unknown';
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-4 p-5 rounded-xl
                                   bg-slate-900/40 border border-white/[0.04] hover:border-cyan-400/15
                                   transition-all"
                      >
                        <div className="
                          w-11 h-11 rounded-lg flex items-center justify-center text-base shrink-0
                          bg-gradient-to-br from-blue-500/15 to-cyan-500/10
                          border border-cyan-400/12 text-cyan-300/70
                        ">
                          {p.type.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">{p.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{llName} · {p.location}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-cyan-400 font-bold">KES {p.price.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">{p.bedrooms}bd · {p.bathrooms}ba</p>
                        </div>
                        <div className="shrink-0">
                          {p.verified ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase
                                             tracking-wider bg-emerald-500/12 text-emerald-400 border border-emerald-500/20">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase
                                             tracking-wider bg-yellow-500/12 text-yellow-400 border border-yellow-500/20">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassmorphicCard>
          </motion.div>

        </div>
      </div>
    </main>
  );
}
