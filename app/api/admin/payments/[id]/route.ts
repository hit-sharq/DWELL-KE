import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** PATCH /api/admin/payments/:id
 *  Admin-only. Update payment status.
 *  Body: { status: 'pending' | 'completed' | 'failed' | 'refunded' }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id }  = await params;
    const { status } = await req.json();
    const allowed = ['pending', 'completed', 'failed', 'refunded'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: { status },
      include: {
        booking: {
          include: {
            tenant:    { select: { firstName: true, lastName: true } },
            property:  { select: { title: true } },
          },
        },
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('[Admin Payments PATCH]', error);
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}

/** GET returns 405 for unhandled requests */
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
