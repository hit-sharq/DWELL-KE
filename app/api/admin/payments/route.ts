import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** GET /api/admin/payments
 *  Admin-only. Returns all payments joined with booking + property + tenant info.
 *  Query: ?status=pending|completed|failed|refunded|all
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const statusParam = req.nextUrl.searchParams.get('status') || 'all';

    const where: Record<string, string> = {};
    if (statusParam !== 'all') where.status = statusParam;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        booking: {
          include: {
            tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
            property: { select: { id: true, title: true, location: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Shape for front-end (matches existing mock data shape)
    const shaped = payments.map((p) => {
      const tenantName = p.booking
        ? `${p.booking.tenant.firstName} ${p.booking.tenant.lastName}`
        : 'N/A';
      const propertyTitle = p.booking?.property?.title || 'N/A';
      return {
        id: p.id,
        booking: `${tenantName} — ${propertyTitle}`,
        tenant: tenantName,
        property: propertyTitle,
        amount: `KES ${p.amount.toLocaleString()}`,
        rawAmount: p.amount,
        date: p.createdAt.toISOString().split('T')[0],
        method: p.paymentMethod || 'PesaPal',
        status: p.status,
      };
    });

    return NextResponse.json(shaped);
  } catch (error) {
    console.error('[Admin Payments GET]', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
