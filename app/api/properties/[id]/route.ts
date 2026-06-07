import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/** GET /api/properties/[id] — single public property */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        landlord: {
          select: { id: true, firstName: true, lastName: true, profileImage: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...property,
      createdAt: property.createdAt?.toISOString(),
      updatedAt: property.updatedAt?.toISOString(),
    });
  } catch (error: any) {
    console.error('[Property Detail GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch property', message: error?.message },
      { status: 500 }
    );
  }
}
