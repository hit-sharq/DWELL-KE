import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/admin';
import { sanitize } from '@/lib/sanitize';
import { withRateLimit } from '@/lib/rate-limit';
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
        ...property,
        createdAt: property.createdAt?.toISOString(),
        updatedAt: property.updatedAt?.toISOString(),
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
        ...p,
        createdAt: p.createdAt?.toISOString(),
        updatedAt: p.updatedAt?.toISOString(),
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
      let userId: string | null = null;
      try {
        const authResult = await auth();
        userId = authResult.userId;
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();

      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isAdminByEnv = isAdminUser(userId);
      if (user.role !== 'landlord' && !isAdminByEnv) {
        return NextResponse.json(
          { error: 'Forbidden – only landlords and admins can create properties' },
          { status: 403 }
        );
      }


      const requiredFields = ['title', 'description', 'location', 'price', 'bedrooms', 'bathrooms', 'type'];
      for (const field of requiredFields) {
        if (!(field in body) || body[field] === null) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }
          );
        }
      }

      // Parse & validate numeric fields early to avoid Prisma throwing 500s.
      const price = Number(body.price);
      const bedrooms = Number(body.bedrooms);
      const bathrooms = Number(body.bathrooms);

      if (!Number.isFinite(price) || !Number.isFinite(bedrooms) || !Number.isFinite(bathrooms)) {
        return NextResponse.json(
          {
            error: 'Invalid numeric values',
            details: {
              price: body.price,
              bedrooms: body.bedrooms,
              bathrooms: body.bathrooms,
            },
          },
          { status: 400 }
        );
      }

      // Bedrooms/bathrooms are Int in Prisma. Reject non-integers.
      if (!Number.isInteger(bedrooms) || !Number.isInteger(bathrooms)) {
        return NextResponse.json(
          {
            error: 'Bedrooms and bathrooms must be integers',
            details: { bedrooms: body.bedrooms, bathrooms: body.bathrooms },
          },
          { status: 400 }
        );
      }

      const property = await prisma.property.create({
        data: {
          title: sanitize.plain(body.title),
          description: sanitize.description(body.description),
          location: sanitize.plain(body.location),
          price,
          bedrooms,
          bathrooms,
          type: sanitize.plain(body.type),
          amenities: Array.isArray(body.amenities) ? body.amenities.map((a: string) => sanitize.plain(a)) : [],
          images: Array.isArray(body.images) ? body.images : [],
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
        {
          error: 'Failed to create property',
          details: {
            message: error?.message,
            code: error?.code,
            name: error?.name,
          },
        },
        { status: 500 }
      );
    }

  });
}

export async function PUT(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      let userId: string | null = null;
      try {
        const authResult = await auth();
        userId = authResult.userId;
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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

      const isLandlordOwner = property.landlordId === user.id;
      const isAdmin = user.role === 'admin';

      if (!isLandlordOwner && !isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const sanitizedData: any = {};
      if (updateData.title !== undefined) sanitizedData.title = sanitize.plain(updateData.title);
      if (updateData.description !== undefined) sanitizedData.description = sanitize.description(updateData.description);
      if (updateData.location !== undefined) sanitizedData.location = sanitize.plain(updateData.location);
      if (updateData.type !== undefined) sanitizedData.type = sanitize.plain(updateData.type);
      if (updateData.amenities !== undefined) sanitizedData.amenities = Array.isArray(updateData.amenities) ? updateData.amenities.map((a: string) => sanitize.plain(a)) : [];
      if (updateData.images !== undefined) sanitizedData.images = Array.isArray(updateData.images) ? updateData.images : [];
      Object.assign(sanitizedData, updateData);

      const updated = await prisma.property.update({
        where: { id },
        data: sanitizedData,
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
  });
}

export async function DELETE(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      let userId: string | null = null;
      try {
        const authResult = await auth();
        userId = authResult.userId;
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
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
  });
}
