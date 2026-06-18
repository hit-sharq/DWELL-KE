import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (id) {
      try {
        const property = await prisma.property.findUnique({
          where: { id },
          include: {
            landlord: {
              select: { id: true, firstName: true, lastName: true, profileImage: true },
            },
            hotel: {
              select: { id: true, name: true, starRating: true },
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
          listingType: property.listingType,
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
          hotel: property.hotel,
          latitude: property.latitude,
          longitude: property.longitude,
          area: property.area,
          createdAt: property.createdAt.toISOString(),
          updatedAt: property.updatedAt.toISOString(),
        });
      } catch (err: any) {
        console.error('[Property GET by id]', err);
        return NextResponse.json(
          { error: 'Property not found or data error', message: err?.message },
          { status: 404 }
        );
      }
    }

    const properties = await prisma.property.findMany({
      where: { verified: true },
      include: {
        landlord: {
          select: { id: true, firstName: true, lastName: true, profileImage: true },
        },
        hotel: {
          select: { id: true, name: true, starRating: true },
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
        listingType: p.listingType,
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
        hotel: p.hotel,
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

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.role !== 'landlord' && user.role !== 'hotel') {
        return NextResponse.json(
          { error: 'Only landlords and hotel partners can create properties' },
          { status: 403 }
        );
      }

      const body = await req.json();
      const {
        title,
        description,
        type,
        location,
        price,
        bedrooms,
        bathrooms,
        amenities,
        images,
        listingType,
      } = body;

      if (!title || !description || !location || !price || !bedrooms || !bathrooms) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      let hotelId: string | null = null;
      if (user.role === 'hotel') {
        const hotel = await prisma.hotel.findFirst({ where: { userId: user.id } });
        hotelId = hotel ? hotel.id : null;
      }

      const property = await prisma.property.create({
        data: {
          title,
          description,
          type: type || 'apartment',
          location,
          price: parseFloat(price),
          bedrooms: parseInt(bedrooms, 10),
          bathrooms: parseInt(bathrooms, 10),
          amenities: amenities || [],
          images: images || [],
          listingType: listingType || 'rental',
          landlordId: user.role === 'landlord' ? user.id : undefined,
          hotelId: hotelId,
          status: 'available',
        },
      });

      return NextResponse.json({ success: true, property }, { status: 201 });
    } catch (error: any) {
      console.error('[Property POST]', error);
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      );
    }
  });
}