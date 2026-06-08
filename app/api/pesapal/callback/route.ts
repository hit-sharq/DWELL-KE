import { prisma } from '@/lib/db';
import { getPaymentStatus, initPesaPal } from '@/lib/pesapal';
import { NextRequest, NextResponse } from 'next/server';

initPesaPal();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const pesapalReference = searchParams.get('pesapal_reference_id');
    const orderTrackingId = searchParams.get('orderTrackingId');

    if (!pesapalReference) {
      return NextResponse.json(
        { error: 'Missing reference' },
        { status: 400 }
      );
    }

    console.log('[PesaPal Callback GET] params', { pesapalReference, orderTrackingId });
    const paymentStatus = await getPaymentStatus(pesapalReference);
    console.log('[PesaPal Callback GET] paymentStatus keys', paymentStatus && typeof paymentStatus === 'object' ? Object.keys(paymentStatus) : paymentStatus);


    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Failed to query payment' },
        { status: 500 }
      );
    }

    // Your initiate flow stores PesaPal identifiers in orderTrackingId/merchantReference.
    // The PesaPal "pesapal_reference_id" may not map to the Prisma `reference` field.
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { reference: pesapalReference },
          { orderTrackingId: orderTrackingId || undefined },
          { merchantReference: (paymentStatus as any)?.merchant_reference || undefined },
        ],
      },
      include: {
        booking: true,
        propertyRequest: {
          include: { property: true },
        },
      },
    });

    if (!payment) {
      console.warn('[PesaPal Callback GET] payment not found', { pesapalReference, orderTrackingId });
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }


    let newStatus: 'completed' | 'failed' = paymentStatus.status === 'COMPLETED' ? 'completed' : 'failed';

    try {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          pesaPalReference: pesapalReference,
          merchantReference: payment.merchantReference,
          transactionCode: paymentStatus.transaction_code || paymentStatus.transactionId || null,
        },
      });
    } catch (updateError) {
      console.error('[Payment Update]', updateError);
    }

    let redirectTo = '/checkout/failed';
    let referenceId = payment.id;

    if (newStatus === 'completed') {
      if (payment.bookingId && payment.booking) {
        try {
          await prisma.booking.update({
            where: { id: payment.bookingId },
            data: { status: 'confirmed' },
          });
        } catch (e) {
          console.error('[Booking Update]', e);
        }
      }

      if (payment.propertyRequestId && payment.propertyRequest) {
        try {
          await prisma.propertyRequest.update({
            where: { id: payment.propertyRequestId },
            data: { status: 'pending', paidAt: new Date() },
          });
        } catch (e) {
          console.error('[PropertyRequest Update]', e);
        }
      }

      redirectTo = '/checkout/success';
    }

    const url = new URL(redirectTo, req.url);
    url.searchParams.set('status', newStatus);
    url.searchParams.set('orderTrackingId', orderTrackingId || payment.orderTrackingId || '');
    if (payment.bookingId) url.searchParams.set('bookingId', payment.bookingId);
    if (payment.propertyRequestId) url.searchParams.set('propertyRequestId', payment.propertyRequestId);

    return NextResponse.redirect(url, 302);
  } catch (error: any) {
    console.error('[PesaPal Callback]', error);
    try {
      return NextResponse.redirect(new URL('/checkout/failed', req.url), 302);
    } catch {
      return NextResponse.json(
        { error: 'Failed to process callback' },
        { status: 500 }
      );
    }
  }
}

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

    console.log('[PesaPal IPN] payload received', {
      OrderTrackingId,
      OrderMerchantReference,
      TransactionStatus,
      PaymentMethod,
    });


    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { merchantReference: OrderMerchantReference },
          { orderTrackingId: OrderTrackingId || undefined },
        ],
      },
      include: { booking: true, propertyRequest: { include: { property: true } } },
    }) as any;


    if (!payment) {
      console.warn('[PesaPal IPN] Payment not found', {
        OrderMerchantReference,
        OrderTrackingId,
      });
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }


    // Idempotency: never downgrade a completed payment.
    let newStatus: 'completed' | 'failed' | 'pending' = 'pending';
    let relatedStatus: string = '';

    if (TransactionStatus === 'COMPLETED') {
      newStatus = 'completed';
      relatedStatus = 'confirmed';
    } else if (TransactionStatus === 'FAILED' || TransactionStatus === 'INVALID') {
      newStatus = 'failed';
      relatedStatus = 'cancelled';
    }

    const isAlreadyCompleted = payment.status === 'completed';
    if (isAlreadyCompleted && newStatus !== 'completed') {
      // Still update transaction metadata, but do not change state or related entities.
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          pesaPalReference: PaymentMethod || null,
          transactionCode: TransactionCode || null,
        },
      });
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    const updateData: any = {
      status: isAlreadyCompleted ? 'completed' : newStatus,
      pesaPalReference: PaymentMethod || null,
      transactionCode: TransactionCode || null,
    };

    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
    });

    if (relatedStatus) {
      if (payment.bookingId && payment.booking) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: relatedStatus },
        });
      }

      if (payment.propertyRequestId && payment.propertyRequest) {
        const prStatus = relatedStatus === 'confirmed' ? 'pending' : 'cancelled';
        await prisma.propertyRequest.update({
          where: { id: payment.propertyRequestId },
          data: {
            status: prStatus,
            paidAt: relatedStatus === 'confirmed' ? new Date() : null,
          },
        });
      }
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error: any) {
    console.error('[PesaPal IPN]', error);
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }
}
