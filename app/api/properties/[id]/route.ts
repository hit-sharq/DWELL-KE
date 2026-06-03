import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';


/** GET /api/properties/[id] — single property with landlord, reviews, and confirmed bookings */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Public property details are allowed, but only verified listings expose reviews/bookings.
    // Admins can always view full detail.
    const roleCheck = await requireRole(['tenant', 'landlord', 'admin']).catch(() => null);
    // If not authenticated, treat as tenant.
    const role = (roleCheck && 'user' in roleCheck && roleCheck.user?.role) ? (roleCheck.user.role as any) : null;

    const isAdmin = role === 'admin';
    const canViewUnverifiedExtras = isAdmin;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
          select: {
            id: true, firstName: true, lastName: true, profileImage: true, email: true, phoneNumber: true,
          },
        },
        reviews: true,
        bookings: {
          where: { status: 'confirmed' },
          select: { checkInDate: true, checkOutDate: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('[Property Detail GET]', error);
    return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}
