import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/DashboardNav';
import { StatsCard } from '@/components/StatsCard';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default async function TenantDashboardPage() {
  const { userId, user } = await auth();
  if (!userId) redirect('/auth/login');

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profileImage: true,
      role: true,
    },
  });

  if (!dbUser) redirect('/auth/login');
  if (dbUser.role === 'admin') redirect('/dashboard/admin');
  if (dbUser.role === 'landlord') redirect('/dashboard/landlord');
  // If role is tenant, continue to render this page

  const userFullName = `${dbUser.firstName} ${dbUser.lastName}`.trim() || 'Tenant';

  // Real data from Postgres
  const [
    activeBookingsCount,
    savedPropertiesCount,
    unreadMessagesCount,
    recentBookings,
    savedProperties,
  ] = await Promise.all([
    prisma.booking.count({ where: { tenantId: dbUser.id, status: { in: ['pending', 'confirmed'] } } }),
    prisma.favorite.count({ where: { userId: dbUser.id } }),
    prisma.message.count({ where: { senderId: dbUser.id, isRead: false } }),
    prisma.booking.findMany({
      where: { tenantId: dbUser.id },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        property: { select: { id: true, title: true, location: true, images: true } },
      },
    }),
    prisma.favorite.findMany({
      where: { userId: dbUser.id },
      take: 6,
      include: {
        property: { select: { id: true, title: true, location: true, price: true, images: true, bedrooms: true, bathrooms: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="tenant" />

      <div className="py-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {userFullName}
            </h1>
            <p className="text-gray-400">Manage your bookings, favourites, and messages</p>
          </div>

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatsCard label="Active Bookings" value={activeBookingsCount} icon="🏠" />
            <StatsCard label="Saved Properties" value={savedPropertiesCount} icon="❤️" />
            <StatsCard label="Unread Messages" value={unreadMessagesCount} icon="💬" />
            <StatsCard label="Account Rating" value={'N/A'} icon="⭐" />
          </div>

          {/* ── Recent Bookings ── */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
              <Link href="/dashboard/tenant/bookings">
                <PremiumButton variant="outline" size="sm">
                  View All
                </PremiumButton>
              </Link>
            </div>
            <GlassmorphicCard>
              {recentBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven&apos;t made any bookings yet.</p>
                  <Link href="/marketplace">
                    <PremiumButton variant="solid" size="sm">
                      Browse Properties
                    </PremiumButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/15"
                    >
                      <div>
                        <p className="font-bold text-white">{booking.property.title}</p>
                        <p className="text-sm text-gray-400">
                          {booking.property.location} ·{' '}
                          {new Date(booking.checkInDate).toLocaleDateString('en-GB')} → {' '}
                          {new Date(booking.checkOutDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className={`font-bold ${
                          booking.status === 'confirmed'    ? 'text-emerald-400' :
                          booking.status === 'pending'      ? 'text-yellow-400'  :
                          booking.status === 'completed'    ? 'text-blue-400'   :
                                                                  'text-red-400'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </p>
                        <span className="text-gray-400 text-sm">
                          KES {booking.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassmorphicCard>
          </div>

          {/* ── Saved Properties ── */}
          {savedProperties.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Saved Properties</h2>
                <Link href="/dashboard/tenant/favorites">
                  <PremiumButton variant="outline" size="sm">
                    View All
                  </PremiumButton>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {savedProperties.slice(0, 6).map((fav) => (
                  <Link key={fav.id} href={`/properties/${fav.property.id}`}>
                    <GlassmorphicCard className="h-full hover:border-cyan-400/30 cursor-pointer group">
                      <div className="relative h-40 rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-slate-800 to-slate-900">
                        {fav.property.images?.[0] ? (
                          <Image
                            src={fav.property.images[0]}
                            alt={fav.property.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            Property Image
                          </div>
                        )}
                      </div>
                      <h3 className="font-bold text-white group-hover:text-cyan-200 transition-colors line-clamp-1">
                        {fav.property.title}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">{fav.property.location}</p>
                      <p className="text-cyan-400 font-bold mt-2">
                        KES {fav.property.price.toLocaleString()}
                        <span className="text-gray-500 font-normal text-sm"> /mo</span>
                      </p>
                    </GlassmorphicCard>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Quick Actions ── */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link href="/marketplace">
                <PremiumButton variant="outline" size="lg" className="w-full h-14">
                  Browse Properties
                </PremiumButton>
              </Link>
              <Link href="/dashboard/tenant/messages">
                <PremiumButton variant="outline" size="lg" className="w-full h-14">
                  View Messages
                </PremiumButton>
              </Link>
              <PremiumButton variant="solid" size="lg" className="w-full h-14">
                Edit Profile
              </PremiumButton>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}