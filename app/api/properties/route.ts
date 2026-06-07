import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (id) {
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
        id: property.id,
        title: property.title,
        description: property.description,
        type: property.type,
        price: property.price,
        location: property.location,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        amenities: property.amenities,
        images: property.images,
        verified: property.verified,
        featured: property.featured,
        status: property.status,
        landlord: property.landlord,
        createdAt: property.createdAt.toISOString(),
        updatedAt: property.updatedAt.toISOString(),
      });
    }

    const properties = await prisma.property.findMany({
      where: { verified: true },
      include: {
        landlord: {
          select: { id: true, firstName: true, lastName: true, profileImage: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      properties.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        type: p.type,
        price: p.price,
        location: p.location,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        amenities: p.amenities,
        images: p.images,
        verified: p.verified,
        featured: p.featured,
        status: p.status,
        landlord: p.landlord,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  } catch (error: any) {
    console.error('[Property GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties', message: error?.message },
      { status: 500 }
    );
  }
}
