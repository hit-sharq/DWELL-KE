import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all properties or search
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const verified = searchParams.get('verified');

    const where: any = {};

    if (id) {
      // Single property lookup
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
        },
      });

      if (!property) {
        return NextResponse.json([], { status: 200 });
      }

      return NextResponse.json([property], { status: 200 });
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (type) {
      where.type = type;
    }
    if (verified === 'true') {
      where.verified = true;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    // Filter by price range in JS if needed
    const filtered = properties.filter((p) => {
      if (minPrice && p.price < parseFloat(minPrice)) return false;
      if (maxPrice && p.price > parseFloat(maxPrice)) return false;
      return true;
    });

    return NextResponse.json(filtered);
  } catch (error: any) {
    console.error('[Property GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

// POST create new property
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Get user from database
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'price', 'bedrooms', 'bathrooms', 'type'];
    for (const field of requiredFields) {
      if (!(field in body) || body[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const property = await prisma.property.create({
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        price: parseFloat(body.price),
        bedrooms: parseInt(body.bedrooms, 10),
        bathrooms: parseInt(body.bathrooms, 10),
        type: body.type,
        amenities: body.amenities || [],
        images: body.images || [],
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        area: body.area ? parseFloat(body.area) : null,
        landlordId: user.id,
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    console.error('[Property POST]', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

// PUT update property
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check authorization
    if (property.landlordId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[Property PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE property
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check authorization
    if (property.landlordId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('[Property DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
