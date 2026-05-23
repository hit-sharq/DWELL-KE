import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** PATCH /api/admin/bookings/:id
 *  Admin-only. Update booking status.
 *  Body: { status: 'pending' | 'confirmed' | 'completed' | 'cancelled' }
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
    const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        tenant:   { select: { firstName: true, lastName: true } },
        property: { select: { title: true } },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('[Admin Bookings PATCH]', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
