import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** GET /api/admin/properties  — list all properties (admin only) */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const statusParam = req.nextUrl.searchParams.get('status') || 'all';

    const where: Record<string, boolean> = {};
    if (statusParam === 'verified') where.verified = true;
    if (statusParam === 'pending')  where.verified = false;

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
        _count:   { select: { bookings: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const shaped = properties.map((p) => ({
      id:             p.id,
      title:          p.title,
      location:       p.location,
      price:          p.price,
      bedrooms:       p.bedrooms,
      bathrooms:      p.bathrooms,
      type:           p.type,
      status:         p.status,
      verified:       p.verified,
      featured:       p.featured,
      images:         p.images,
      landlord:       { firstName: p.landlord.firstName, lastName: p.landlord.lastName },
      bookingsCount:  p._count.bookings,
      reviewsCount:   p._count.reviews,
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error('[Admin Properties GET]', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

