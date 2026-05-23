import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** GET /api/admin/bookings
 *  Admin-only. Returns all bookings filtered by status.
 *  Query: ?status=pending|confirmed|completed|cancelled|all
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const statusParam = req.nextUrl.searchParams.get('status') || 'all';

    const where: Record<string, string> = {};
    if (statusParam !== 'all') where.status = statusParam;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
        property: { select: { id: true, title: true, location: true } },
        payment: { select: { id: true, status: true, paymentMethod: true, amount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('[Admin Bookings GET]', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
