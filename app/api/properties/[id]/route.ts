import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/** GET /api/properties/[id] — single property with landlord, no risky include joins */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const landlord = await prisma.user.findUnique({
      where: { id: property.landlordId },
      select: { id: true, firstName: true, lastName: true, profileImage: true },
    });

    const result = {
      ...property,
      landlord,
    };

    return NextResponse.json({
      ...result,
      createdAt: result.createdAt?.toISOString?.() ?? null,
      updatedAt: result.updatedAt?.toISOString?.() ?? null,
    });
  } catch (error: any) {
    console.error('[Property Detail GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch property', details: error?.message },
      { status: 500 }
    );
  }
}
