import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { initiatePesapalPayment } from '@/lib/pesapal';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookingId } = await req.json();

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tenant: true, property: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if payment already exists and is completed
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      );
    }

    // Initiate PesaPal payment
    const pesapalResponse = await initiatePesapalPayment(
      bookingId,
      booking.totalPrice,
      booking.tenant.email,
      `${booking.tenant.firstName} ${booking.tenant.lastName}`
    );

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      update: {
        reference: pesapalResponse.reference,
        status: 'pending',
      },
      create: {
        bookingId,
        amount: booking.totalPrice,
        currency: 'KES',
        status: 'pending',
        paymentMethod: 'pesapal',
        reference: pesapalResponse.reference,
      },
    });

    return NextResponse.json({
      paymentId: payment.id,
      reference: pesapalResponse.reference,
      redirectUrl: pesapalResponse.redirectUrl,
    });
  } catch (error: any) {
    console.error('[Payment Initiate]', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
