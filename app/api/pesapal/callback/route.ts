import { prisma } from '@/lib/db';
import { queryPesapalPayment } from '@/lib/pesapal';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pesapalReference = searchParams.get('pesapal_reference_id');
    const orderTrackingId = searchParams.get('orderTrackingId');

    if (!pesapalReference) {
      return NextResponse.json(
        { error: 'Missing reference' },
        { status: 400 }
      );
    }

    // Query payment status from PesaPal
    const paymentStatus = await queryPesapalPayment(pesapalReference);

    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Failed to query payment' },
        { status: 500 }
      );
    }

    // Find payment record by reference
    const payment = await prisma.payment.findUnique({
      where: { reference: pesapalReference },
      include: { booking: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status based on PesaPal response
    const newStatus =
      paymentStatus.status === 'COMPLETED' ? 'completed' : 'failed';

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: newStatus },
    });

    // If payment is completed, update booking status
    if (newStatus === 'completed') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'confirmed' },
      });
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      bookingId: payment.bookingId,
    });
  } catch (error: any) {
    console.error('[PesaPal Callback]', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}
