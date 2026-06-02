import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { initiatePayment, initPesaPal } from '@/lib/pesapal';
import { withRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

initPesaPal();

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { bookingId } = body;

      if (!bookingId) {
        return NextResponse.json(
          { error: 'Booking ID is required' },
          { status: 400 }
        );
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          tenant: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          property: {
            select: {
              title: true,
            },
          },
        },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!user || booking.tenantId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const existingPayment = await prisma.payment.findUnique({
        where: { bookingId },
      });

      if (existingPayment && existingPayment.status === 'completed') {
        return NextResponse.json(
          { error: 'Payment already completed for this booking' },
          { status: 400 }
        );
      }

      const paymentResponse = await initiatePayment({
        bookingId,
        amount: booking.totalPrice,
        description: `Booking for ${booking.property.title}`,
        customerEmail: booking.tenant.email,
        customerName: `${booking.tenant.firstName} ${booking.tenant.lastName}`,
        customerPhone: booking.tenant.phone || '+254',
        currency: 'KES',
      });

      const payment = await prisma.payment.upsert({
        where: { bookingId },
        create: {
          bookingId,
          amount: booking.totalPrice,
          currency: 'KES',
          status: 'pending',
          provider: 'pesapal',
          orderTrackingId: paymentResponse.order_tracking_id,
          merchantReference: paymentResponse.merchant_reference,
        },
        update: {
          orderTrackingId: paymentResponse.order_tracking_id,
          merchantReference: paymentResponse.merchant_reference,
          status: 'pending',
        },
      });

      return NextResponse.json({
        payment,
        redirectUrl: paymentResponse.redirect_url,
      });
    } catch (error: any) {
      console.error('[Payment Initiation]', error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to initiate payment',
        },
        { status: 500 }
      );
    }
  });
}
