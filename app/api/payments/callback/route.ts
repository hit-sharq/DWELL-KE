import { prisma } from '@/lib/db';
import { getPaymentStatus, initPesaPal } from '@/lib/pesapal';
import { NextRequest, NextResponse } from 'next/server';

// Initialize PesaPal on server start
initPesaPal();

/**
 * Handle payment callback from PesaPal
 * This is called when the user completes payment and is redirected back
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderTrackingId = searchParams.get('orderTrackingId');
    const bookingId = searchParams.get('bookingId');

    if (!orderTrackingId) {
      return NextResponse.json(
        { error: 'Order tracking ID is missing' },
        { status: 400 }
      );
    }

    // Get payment status from PesaPal
    const paymentStatus = await getPaymentStatus(orderTrackingId);

    // Update payment record with status
    if (bookingId) {
      const payment = await prisma.payment.findUnique({
        where: { bookingId },
      });

      if (payment) {
        let status = 'pending';

        if (paymentStatus.status_code === '0') {
          status = 'completed';

          // Update booking status to confirmed
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'confirmed' },
          });
        } else if (paymentStatus.status_code === '1') {
          status = 'failed';

          // Update booking status to cancelled
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'cancelled' },
          });
        }

        await prisma.payment.update({
          where: { bookingId },
          data: {
            status,
            pesaPalReference: paymentStatus.payment_method,
            transactionCode: paymentStatus.transaction_code,
          },
        });
      }
    }

    // Redirect to success or failure page
    if (paymentStatus.status_code === '0') {
      return NextResponse.redirect(
        new URL(`/checkout/success?bookingId=${bookingId}`, req.url)
      );
    } else {
      return NextResponse.redirect(
        new URL(`/checkout/failed?bookingId=${bookingId}`, req.url)
      );
    }
  } catch (error: any) {
    console.error('[Payment Callback]', error);
    return NextResponse.json(
      { error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}

/**
 * Handle IPN webhook from PesaPal
 * This is the server-to-server notification of payment status
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      OrderTrackingId,
      OrderMerchantReference,
      TransactionCode,
      TransactionStatus,
      PaymentMethod,
    } = body;

    console.log('[PesaPal IPN]', {
      OrderTrackingId,
      OrderMerchantReference,
      TransactionStatus,
    });

    // Find payment by merchant reference
    const payment = await prisma.payment.findFirst({
      where: { merchantReference: OrderMerchantReference },
      include: { booking: true },
    });

    if (!payment) {
      console.warn('[PesaPal IPN] Payment not found:', OrderMerchantReference);
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    let newStatus = 'pending';
    let bookingStatus = payment.booking.status;

    if (TransactionStatus === 'COMPLETED') {
      newStatus = 'completed';
      bookingStatus = 'confirmed';
    } else if (
      TransactionStatus === 'FAILED' ||
      TransactionStatus === 'INVALID'
    ) {
      newStatus = 'failed';
      bookingStatus = 'cancelled';
    }

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        transactionCode: TransactionCode,
        pesaPalReference: PaymentMethod,
      },
    });

    // Update booking if needed
    if (bookingStatus !== payment.booking.status) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: bookingStatus },
      });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('[PesaPal IPN]', error);
    // Return 200 to acknowledge receipt even if processing failed
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }
}
