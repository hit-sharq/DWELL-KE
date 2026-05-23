import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { Footer } from '@/components/Footer';

export default async function LandlordDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth/login');

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser || dbUser.role !== 'landlord') redirect('/dashboard/tenant');

  // ── Aggregated metrics ──
  const [
    activeProperties,
    confirmedBookings,
    totalMonthlyRevenue,
    occupancyPct,
    pendingInquiriesCount,
    recentProperties,
    recentBookings,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.property.count({ where: { landlordId: dbUser.id } }),
    prisma.booking.count({
      where: {
        property:  { landlordId: dbUser.id },
        status:    { in: ['confirmed', 'completed'] },
      },
    }),
    (async () => {
      const props = await prisma.property.findMany({
        where: { landlordId: dbUser.id, bookings: { some: { status: { in: ['confirmed', 'completed'] } } } },
        include: { bookings: { where: { status: { in: ['confirmed', 'completed'] } } } },
      });
      return props.reduce((sum, p) => sum + p.bookings.reduce((s, b) => s + b.totalPrice, 0), 0);
    })(),
    (async () => { /* occupancy % */
      const props = await prisma.property.findMany({ where: { landlordId: dbUser.id } });
      if (props.length === 0) return 0;
      const occupied = props.filter((p) => p.status === 'occupied').length;
      return Math.round((occupied / props.length) * 100);
    })(),
    prisma.message.count({
      where: {
        property: { landlordId: dbUser.id },
        isRead:   false,
      },
    }),
    prisma.property.findMany({
      where:  { landlordId: dbUser.id },
      take:   4,
      orderBy: { createdAt: 'desc' },
      select: {
        id:         true,
        title:      true,
        location:   true,
        price:      true,
        status:     true,
        verified:   true,
        images:     true,
        _count:     { select: { bookings: true, reviews: true } },
      },
    }),
    prisma.booking.findMany({
      where:  { property: { landlordId: dbUser.id } },
      take:   5,
      orderBy: { createdAt: 'desc' },
      include: { tenant: { select: { firstName: true, lastName: true } }, property: { select: { title: true } } },
    }),
    // last 6 months revenue
    prisma.booking.findMany({
      where: { property: { landlordId: dbUser.id }, status: { in: ['confirmed', 'completed'] } },
      select: { totalPrice: true, checkInDate: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="landlord" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Property Management Dashboard</h1>
            <p className="text-gray-400">Live overview of your properties, bookings, and earnings</p>
          </div>

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatsCard label="Active Properties" value={activeProperties} icon="🏢" />
            <StatsCard
              label="Monthly Earnings"
              value={`KES ${(totalMonthlyRevenue / 1_000_000).toFixed(1)}M`}
              icon="💰"
              trend={{ value: 15, direction: 'up' }}
            />
            <StatsCard label="Occupancy Rate" value={`${occupancyPct}%`} icon="📊" />
            <StatsCard label="Pending Inquiries" value={pendingInquiriesCount} icon="📝" />
          </div>

          {/* ── Revenue + Performance ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Revenue Overview */}
            <GlassmorphicCard className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-6">Revenue Overview</h2>
              {monthlyRevenue.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No revenue data yet. Listings with confirmed bookings will appear here.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from(new Set(monthlyRevenue.map((b) => new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))))
                    .slice(-6)
                    .map((monthLabel) => {
                      const monthTotal = monthlyRevenue
                        .filter((b) => new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) === monthLabel)
                        .reduce((s, b) => s + b.totalPrice, 0);
                      return (
                        <div key={monthLabel} className="p-5 rounded-xl bg-slate-900/50 border border-white/[0.04]">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500 mb-2">{monthLabel}</p>
                          <p className="text-xl font-bold text-cyan-300">
                            KES {(monthTotal / 1_000_000).toFixed(2)}M
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </GlassmorphicCard>

            {/* Performance */}
            <GlassmorphicCard className="h-full">
              <h3 className="text-lg font-bold text-white mb-6">Performance</h3>
              <div className="space-y-5">
                <div>
                  <p className="text-gray-500 text-sm mb-1.5">Active Listings</p>
                  <p className="text-2xl font-bold text-cyan-400">{activeProperties}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1.5">Confirmed Bookings</p>
                  <p className="text-2xl font-bold text-emerald-400">{confirmedBookings}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1.5">Occupancy</p>
                  <p className="text-2xl font-bold text-blue-400">{occupancyPct}%</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1.5">Unread Inquiries</p>
                  <p className="text-2xl font-bold text-violet-400">{pendingInquiriesCount}</p>
                </div>
              </div>
            </GlassmorphicCard>
          </div>

          {/* ── Active Properties ── */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Active Properties</h2>
            <GlassmorphicCard>
              {recentProperties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven&apos;t listed any properties yet.</p>
                  <Link href="/dashboard/landlord/create-property">
                    <PremiumButton variant="solid" size="sm">
                      Create Your First Listing
                    </PremiumButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="flex items-start justify-between gap-4 p-5 rounded-xl bg-slate-900/40 border border-white/[0.04] hover:border-cyan-400/15 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-white">{prop.title}</p>
                          {prop.verified ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400">✓ Verified</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/15 text-yellow-400">Pending</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">
                          {prop.location} · {prop.bedrooms} bed · {prop.bathrooms} bath
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {prop._count.bookings} booking{prop._count.bookings !== 1 ? 's' : ''} · {prop._count.reviews} review{prop._count.reviews !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-cyan-400">KES {prop.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">/month</p>
                        </div>
                        <Link href={`/properties/${prop.id}`}>
                          <PremiumButton variant="outline" size="sm">
                            Manage
                          </PremiumButton>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>
          </div>

          {/* ── Recent Bookings ── */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Bookings</h2>
            <GlassmorphicCard>
              {recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No bookings yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                      <div>
                        <p className="font-bold text-white">{b.property.title}</p>
                        <p className="text-sm text-gray-400">
                          {b.tenant.firstName} {b.tenant.lastName} · KES {b.totalPrice.toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        b.status === 'confirmed'    ? 'bg-green-500/15 text-green-400' :
                        b.status === 'pending'      ? 'bg-yellow-500/15 text-yellow-400' :
                        b.status === 'completed'    ? 'bg-blue-500/15 text-blue-400' :
                                                        'bg-red-500/15 text-red-400'
                      }`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
