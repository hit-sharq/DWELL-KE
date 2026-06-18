import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (id) {
      try {
        const hotel = await prisma.hotel.findUnique({
          where: { id },
          include: {
            properties: {
              where: { verified: true },
              select: {
                id: true,
                title: true,
                price: true,
                location: true,
                bedrooms: true,
                bathrooms: true,
                images: true,
                amenities: true,
              },
            },
          },
        });

        if (!hotel) {
          return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
        }

        return NextResponse.json({
          id: hotel.id,
          name: hotel.name,
          description: hotel.description,
          location: hotel.location,
          starRating: hotel.starRating,
          amenities: hotel.amenities,
          images: hotel.images,
          featured: hotel.featured,
          properties: hotel.properties,
        });
      } catch (err: any) {
        console.error('[Hotel GET by id]', err);
        return NextResponse.json(
          { error: 'Hotel not found or data error', message: err?.message },
          { status: 404 }
        );
      }
    }

    const hotels = await prisma.hotel.findMany({
      where: { verified: true },
      include: {
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      hotels.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        location: h.location,
        starRating: h.starRating,
        amenities: h.amenities,
        images: h.images,
        verified: h.verified,
        featured: h.featured,
        _count: h._count,
      }))
    );
  } catch (error: any) {
    console.error('[Hotels GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch hotels', message: error?.message },
      { status: 500 }
    );
  }
}