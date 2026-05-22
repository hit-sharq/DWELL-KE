import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all properties or search
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const where: any = {};

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (type) {
      where.type = type;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: {
          select: { id: true, firstName: true, lastName: true, profileImage: true },
        },
      },
    });

    // Filter by price range in JS if needed
    const filtered = properties.filter(p => {
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

    const property = await prisma.property.create({
      data: {
        ...body,
        landlordId: user.id,
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
