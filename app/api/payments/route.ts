import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Find the payment and ensure it belongs to a booking where the user is the tenant
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            tenant: {
              select: { id: true },
            },
            property: {
              select: { landlordId: true },
            },
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const isTenant = payment.booking.tenantId === user.id;
    const isAdmin = user.role === 'admin';

    if (!(isTenant || isAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Only allow updating if payment is pending
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payment is not in pending status' },
        { status: 400 }
      );
    }

    // Update the payment status to completed
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        reference: `simulated_${Date.now()}`, // Simulate a payment reference
      },
      include: {
        booking: {
          include: {
            property: {
              select: { landlordId: true },
            },
          },
        },
      },
    });

    // Update the booking status to confirmed
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'confirmed',
      },
    });

    // TODO: Notify the landlord that payment has been received and booking is confirmed.
    // TODO: Schedule payout to landlord (minus any fees) - we'll leave that for later.

    return NextResponse.json(updatedPayment);
  } catch (error: any) {
    console.error('[Payments POST]', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
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

    let where: any = {};

    if (bookingId) {
      where.bookingId = bookingId;
    }

    // Restrict to payments related to the user's bookings
    if (user.role === 'tenant') {
      where.booking = {
        tenantId: user.id,
      };
    } else if (user.role === 'landlord') {
      where.booking = {
        property: {
          landlordId: user.id,
        },
      };
    } else if (user.role === 'admin') {
      // Admin can see all payments
    } else {
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