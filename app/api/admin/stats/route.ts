import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** GET /api/admin/stats
 *  Admin-only. Returns aggregated platform statistics plus
 *  recent users and recent bookings for the dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // ── Aggregated counts ──
    const [
      totalUsers,
      totalProperties,
      totalBookings,
      pendingBookings,
      completedPayments,
      failedPayments,
      pendingVerifications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.payment.count({ where: { status: 'completed' } }),
      prisma.payment.count({ where: { status: 'failed' } }),
      prisma.property.count({ where: { verified: false } }),
    ]);

    // ── Revenue from completed payments ──
    const revenueResult = await prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    });
    const totalRevenue = revenueResult._sum.amount || 0;

    // ── Recent users ──
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // ── Recent bookings ──
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { firstName: true, lastName: true } },
        property: { select: { title: true } },
      },
    });

    // ── Monthly booking volume (last 12 months) ──
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyBookings = await prisma.booking.groupBy({
      by: ['checkInDate'],
      where: { checkInDate: { gte: twelveMonthsAgo } },
      _count: { _all: true },
      orderBy: { checkInDate: 'asc' },
    });

    return NextResponse.json({
      stats: [
        { label: 'Total Users',     value: totalUsers.toLocaleString(),      trend: null },
        { label: 'Active Properties', value: totalProperties.toLocaleString(),  trend: null },
        { label: 'Total Bookings',  value: totalBookings.toLocaleString(),    trend: null },
        { label: 'Total Revenue',   value: `KES ${(totalRevenue / 1000000).toFixed(1)}M`, trend: null },
        {
          label: 'Completed Payments',
          value: completedPayments.toLocaleString(),
          trend: pendingBookings > 0 ? `+${pendingBookings} pending` : 'All clear',
        },
        {
          label: 'Failed Payments',
          value: failedPayments.toLocaleString(),
          trend: null,
        },
        {
          label: 'Pending Verification',
          value: pendingVerifications.toLocaleString(),
          trend: pendingVerifications > 10 ? 'Needs attention' : 'On track',
        },
      ],
      alerts: [
        pendingVerifications > 0
          ? { type: 'Verification Queue', description: `${pendingVerifications} property listings awaiting admin review`, severity: pendingVerifications > 10 ? 'high' : 'medium' }
          : null,
        failedPayments > 0
          ? { type: 'Payment Alert', description: `${failedPayments} failed transactions detected`, severity: 'medium' }
          : null,
        { type: 'Compliance', description: 'New Clauses Terms of Service updates propagated', severity: 'low' },
      ].filter(Boolean) as Array<{ type: string; description: string; severity: string }>,
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        joined: calculateAgo(u.createdAt),
      })),
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        tenant: `${b.tenant.firstName} ${b.tenant.lastName}`,
        property: b.property.title,
        amount: `KES ${b.totalPrice.toLocaleString()}`,
        status: b.status,
      })),
      monthlyBookings: monthlyBookings.map((m) => ({
        month: new Date(m.checkInDate).toLocaleDateString('en-US', { month: 'short' }),
        bookings: m._count._all,
      })),
    });
  } catch (error) {
    console.error('[Admin Stats GET]', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

function calculateAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
