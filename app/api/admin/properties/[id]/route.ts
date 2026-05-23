import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** PATCH /api/admin/properties/:id
 *  Admin-only. Update property verification status.
 *  Body: { verified: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id }    = await params;
    const { verified } = await req.json();

    const property = await prisma.property.update({
      where: { id },
      data: { verified: !!verified },
      include: {
        landlord: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        _count:   { select: { bookings: true, reviews: true } },
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('[Admin Properties PATCH]', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}
