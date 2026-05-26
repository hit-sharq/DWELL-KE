import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';

/** PATCH /api/admin/properties/:id
 *  Admin-only. Update property verification status.
 *  Body: { verified: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });


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
