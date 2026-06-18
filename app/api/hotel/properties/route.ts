import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'hotel') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const hotel = await prisma.hotel.findFirst({
      where: { userId: user.id },
    });

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel profile not found' }, { status: 404 });
    }

    const properties = await prisma.property.findMany({
      where: { hotelId: hotel.id },
      orderBy: { createdAt: 'desc' },
    });

    const propertiesWithCounts = await Promise.all(
      properties.map(async (p) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        status: p.status,
        verified: p.verified,
        images: p.images,
        _count: {
          bookings: await prisma.booking.count({ where: { propertyId: p.id } }),
          reviews: await prisma.review.count({ where: { propertyId: p.id } }),
        },
      }))
    );

    return NextResponse.json(propertiesWithCounts);
  } catch (error: any) {
    console.error('[Hotel Properties GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.role !== 'hotel') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const hotel = await prisma.hotel.findFirst({
      where: { userId: user.id },
    });

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel profile not found' }, { status: 404 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property || property.hotelId !== hotel.id) {
      return NextResponse.json({ error: 'Property not found or not owned by you' }, { status: 404 });
    }

    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Hotel Properties DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}