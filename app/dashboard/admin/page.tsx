import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { isAdminUser } from '@/lib/admin';
import { redirect } from 'next/navigation';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/auth/login');
  if (!isAdminUser(userId)) redirect('/dashboard/tenant');

  const [
    totalUsers,
    totalProperties,
    totalBookings,
    totalRevenue,
    completedPayments,
    failedPayments,
    pendingVerifications,
    recentUsers,
    recentBookings,
    recentProperties,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({ where: { status: 'completed' }, _sum: { amount: true } }),
    prisma.payment.count({ where: { status: 'completed' } }),
    prisma.payment.count({ where: { status: 'failed' } }),
    prisma.property.count({ where: { verified: false } }),
    prisma.user.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
    }),
    prisma.booking.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      include: {
        tenant:   { select: { firstName: true, lastName: true } },
        property: { select: { title: true, location: true } },
      },
    }),
    prisma.property.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      include: { landlord: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  return (
    <AdminDashboardClient
      totalUsers={totalUsers}
      totalProperties={totalProperties}
      totalBookings={totalBookings}
      totalRevenue={totalRevenue._sum.amount ?? 0}
      completedPayments={completedPayments}
      failedPayments={failedPayments}
      pendingVerifications={pendingVerifications}
      recentUsers={recentUsers}
      recentBookings={recentBookings}
      recentProperties={recentProperties}
    />
  );
}
