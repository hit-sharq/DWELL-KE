import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'landlord') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
      prisma.property.count({ where: { landlordId: user.id } }),
      prisma.booking.count({
        where: {
          property: { landlordId: user.id },
          status: { in: ['confirmed', 'completed'] },
        },
      }),
      (async () => {
        const props = await prisma.property.findMany({
          where: { landlordId: user.id, bookings: { some: { status: { in: ['confirmed', 'completed'] } } } },
          include: { bookings: { where: { status: { in: ['confirmed', 'completed'] } } } },
        });
        return props.reduce((sum, p) => sum + p.bookings.reduce((s, b) => s + b.totalPrice, 0), 0);
      })(),
      (async () => {
        const props = await prisma.property.findMany({ where: { landlordId: user.id } });
        if (props.length === 0) return 0;
        const occupied = props.filter((p) => p.status === 'occupied').length;
        return Math.round((occupied / props.length) * 100);
      })(),
      prisma.message.count({
        where: {
          property: { landlordId: user.id },
          isRead: false,
        },
      }),
      prisma.property.findMany({
        where: { landlordId: user.id },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          location: true,
          price: true,
          status: true,
          verified: true,
          images: true,
          _count: { select: { bookings: true, reviews: true } },
        },
      }),
      prisma.booking.findMany({
        where: { property: { landlordId: user.id } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { firstName: true, lastName: true } },
          property: { select: { title: true } },
        },
      }),
      prisma.booking.findMany({
        where: { property: { landlordId: user.id }, status: { in: ['confirmed', 'completed'] } },
        select: { totalPrice: true, checkInDate: true },
      }),
    ]);

    const monthlyData = Array.from(
      new Set(monthlyRevenue.map((b) => new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })))
    )
      .slice(-6)
      .map((monthLabel) => {
        const monthTotal = monthlyRevenue
          .filter((b) => new Date(b.checkInDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) === monthLabel)
          .reduce((s, b) => s + b.totalPrice, 0);
        return { month: monthLabel, revenue: monthTotal };
      });

    return NextResponse.json({
      activeProperties,
      confirmedBookings,
      totalRevenue: totalMonthlyRevenue,
      occupancyPct,
      pendingInquiries: pendingInquiriesCount,
      recentProperties,
      recentBookings,
      monthlyData,
    });
  } catch (error) {
    console.error('Landlord dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}