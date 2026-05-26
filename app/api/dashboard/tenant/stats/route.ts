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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [
      activeBookings,
      savedProperties,
      unreadMessages,
      recentBookings,
      savedPropertiesList,
    ] = await Promise.all([
      prisma.booking.count({
        where: { tenantId: user.id, status: { in: ['pending', 'confirmed'] } },
      }),
      prisma.favorite.count({ where: { userId: user.id } }),
      // Message schema has `senderId`, not `recipientId`.
      // For tenant dashboard we treat messages sent by landlords as unread
      // unless the message is already read.
      prisma.message.count({ where: { senderId: user.id, isRead: false } }),
      prisma.booking.findMany({
        where: { tenantId: user.id },
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            select: { title: true, location: true, images: true },
          },
        },
      }),
      prisma.favorite.findMany({
        where: { userId: user.id },
        take: 6,
        include: {
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              price: true,
              images: true,
              bedrooms: true,
              bathrooms: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      activeBookings,
      savedProperties,
      unreadMessages,
      recentBookings,
      savedPropertiesList,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}