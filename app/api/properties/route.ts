import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { isAdminUser } from '@/lib/admin';
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
    const verifiedParam = searchParams.get('verified');

    const { userId } = await auth();
    const user = userId ? await prisma.user.findUnique({ where: { clerkId: userId } }) : null;
    const isAdmin = user ? user.role === 'admin' : false;
    const userLandlordId = user && user.role === 'landlord' ? user.id : null;

    // Build where conditions for access control
    const accessWhere: any = {};
    if (isAdmin) {
      // Admin sees everything, no restrictions
    } else if (userLandlordId !== null) {
      // Landlord sees verified properties plus their own
      accessWhere.OR = [
        { verified: true },
        { landlordId: userLandlordId },
      ];
    } else {
      // Unauthenticated or tenant sees only verified properties
      accessWhere.verified = true;
    }

    // Apply additional filters
    if (id) {
      // Single property lookup with access control
      const property = await prisma.property.findUnique({
        where: {
          id,
          ...accessWhere,
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

      if (!property) {
        return NextResponse.json([], { status: 200 });
      }

      return NextResponse.json([property], { status: 200 });
    }

    // Build where for search/filtering
    const where: any = { ...accessWhere };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (type) {
      where.type = type;
    }
    // Note: verified filter is already handled via accessWhere, but if explicitly requested, we can override?
    // We'll keep the accessWhere logic as the base, and if verifiedParam is provided, we can adjust.
    // However, to keep it simple, we'll ignore the verified query param for non-admins, as access already handles it.
    // For admins, they can see all regardless of verified param.
    // If we want to allow filtering by verified status for admins, we could do:
    // if (verifiedParam !== null && isAdmin) {
    //   where.verified = verifiedParam === 'true';
    // }
    // But for simplicity, we'll skip this and let admins see all; they can use the admin endpoint for filtered lists.
    // We'll leave it as is.

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

    // Check if user is landlord or admin (only these roles can create properties)
    if (user.role !== 'landlord' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden – only landlords and admins can create properties' },
        { status: 403 }
      );
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

    // Check authorization: user must be landlord who owns the property OR an admin
    const isLandlordOwner = property.landlordId === user.id;
    const isAdmin = user.role === 'admin';
    
    if (!isLandlordOwner && !isAdmin) {
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

    // Check authorization: user must be landlord who owns the property OR an admin
    const isLandlordOwner = property.landlordId === user.id;
    const isAdmin = user.role === 'admin';
    
    if (!isLandlordOwner && !isAdmin) {
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
