import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint has been disabled. Payment completion must come from PesaPal via /api/pesapal/callback.',
      deprecated: true,
    },
    { status: 410 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = req.nextUrl;
    const bookingId = searchParams.get('bookingId');
    const propertyRequestId = searchParams.get('propertyRequestId');

    let where: any = {};

    if (bookingId) {
      where.bookingId = bookingId;
    }
    if (propertyRequestId) {
      where.propertyRequestId = propertyRequestId;
    }

    if (user.role === 'tenant') {
      where.OR = [
        { booking: { tenantId: user.id } },
        { propertyRequest: { tenantId: user.id } },
      ];
    } else if (user.role === 'landlord') {
      where.OR = [
        { booking: { property: { landlordId: user.id } } },
        { propertyRequest: { property: { landlord: { id: user.id } } } },
      ];
    } else if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            property: {
              select: { title: true, location: true },
            },
            tenant: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        propertyRequest: {
          include: {
            property: {
              select: { title: true, location: true },
            },
            tenant: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    console.error('[Payments GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
