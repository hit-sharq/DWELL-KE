import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

/** GET /api/admin/properties  — list all properties (admin only) */
export async function GET(req: NextRequest) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });


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
  } catch (error: any) {
    console.error('[Admin Properties GET]', error);
    if (error instanceof PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      if (error.code === 'P2002') {
        // Unique constraint violation
        return NextResponse.json(
          { error: 'A property with that identifier already exists.' },
          { status: 400 }
        );
      }
      if (error.code === 'P2025') {
        // Record not found
        return NextResponse.json(
          { error: 'Requested resource not found.' },
          { status: 404 }
        );
      }
      // Add more error codes as needed
    }
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}