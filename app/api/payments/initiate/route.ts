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

      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const body = await req.json();
      const { bookingId, propertyRequestId } = body;

      let amount: number;
      let description: string;
      let customerEmail: string;
      let customerName: string;
      let customerPhone: string;
      let referenceId: string;
      let redirectType: 'booking' | 'propertyRequest';

      if (propertyRequestId) {
        const propertyRequest = await prisma.propertyRequest.findUnique({
          where: { id: propertyRequestId },
          include: { property: true, tenant: true },
        });

        if (!propertyRequest) {
          return NextResponse.json({ error: 'Property request not found' }, { status: 404 });
        }

        if (propertyRequest.tenantId !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (propertyRequest.status !== 'pending_payment') {
          return NextResponse.json(
            { error: 'This application has already been paid for' },
            { status: 400 }
          );
        }

        if (!propertyRequest.amount) {
          return NextResponse.json(
            { error: 'Application fee not set' },
            { status: 400 }
          );
        }

        amount = propertyRequest.amount;
        description = `Application fee for ${propertyRequest.property.title}`;
        customerEmail = propertyRequest.tenant.email;
        customerName = `${propertyRequest.tenant.firstName || ''} ${propertyRequest.tenant.lastName || ''}`.trim();
        customerPhone = (propertyRequest.tenant as any).phoneNumber || (propertyRequest.tenant as any).phone || '+254';
        referenceId = propertyRequest.id;
        redirectType = 'propertyRequest';
      } else if (bookingId) {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: { tenant: true, property: true },
        });

        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (booking.tenantId !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const existingBookingPayment = await prisma.payment.findUnique({
          where: { bookingId },
        });

        if (existingBookingPayment && existingBookingPayment.status === 'completed') {
          return NextResponse.json(
            { error: 'Payment already completed for this booking' },
            { status: 400 }
          );
        }

        amount = booking.totalPrice;
        description = `Booking for ${booking.property.title}`;
        customerEmail = booking.tenant.email;
        customerName = `${booking.tenant.firstName} ${booking.tenant.lastName}`;
        customerPhone = (booking.tenant as any).phoneNumber || (booking.tenant as any).phone || '+254';
        referenceId = booking.id;
        redirectType = 'booking';
      } else {
        return NextResponse.json(
          { error: 'Either bookingId or propertyRequestId is required' },
          { status: 400 }
        );
      }

      const paymentResponse = await initiatePayment({
        id: referenceId,
        amount,
        description,
        customerEmail,
        customerName,
        customerPhone,
        currency: 'KES',
        callbackType: redirectType,
      });

      const payment = await prisma.payment.create({
        data: {
          amount,
          currency: 'KES',
          status: 'pending',
          provider: 'pesapal',
          orderTrackingId: paymentResponse.order_tracking_id,
          merchantReference: paymentResponse.merchant_reference,
        } as any,
      });

      if (redirectType === 'booking') {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { bookingId: referenceId },
        });
      } else {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { propertyRequestId: referenceId },
        });
      }

      return NextResponse.json({
        payment: {
          ...payment,
          bookingId: redirectType === 'booking' ? referenceId : undefined,
          propertyRequestId: redirectType === 'propertyRequest' ? referenceId : undefined,
        },
        redirectUrl: paymentResponse.redirect_url,
        redirectType,
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
