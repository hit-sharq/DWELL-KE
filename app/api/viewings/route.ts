import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { propertyRequestId, scheduledDateTime, notes } = body;

    if (!propertyRequestId || !scheduledDateTime) {
      return NextResponse.json(
        { error: 'Property request ID and scheduled date/time are required' },
        { status: 400 }
      );
    }

    // Find the property request and ensure it's approved
    const propertyRequest = await prisma.propertyRequest.findUnique({
      where: { id: propertyRequestId },
      include: {
        property: {
          select: { landlordId: true, id: true, title: true },
        },
        tenant: {
          select: { id: true, firstName: true, lastName: true, clerkId: true },
        },
      },
    });

    if (!propertyRequest) {
      return NextResponse.json({ error: 'Property request not found' }, { status: 404 });
    }

    if (propertyRequest.status !== 'approved') {
      return NextResponse.json(
        { error: 'Property request must be approved to schedule a viewing' },
        { status: 400 }
      );
    }

    // Check if a viewing already exists for this request
    const existingViewing = await prisma.viewing.findFirst({
      where: { propertyRequestId },
    });

    if (existingViewing) {
      return NextResponse.json(
        { error: 'A viewing has already been scheduled for this request' },
        { status: 400 }
      );
    }

    // Create the viewing
    const viewing = await prisma.viewing.create({
      data: {
        propertyRequestId,
        scheduledDateTime: new Date(scheduledDateTime),
        notes: notes || null,
        propertyId: propertyRequest.property.id,
        tenantId: propertyRequest.tenant.id,
        landlordId: propertyRequest.property.landlordId,
      },
    });

    // Update the property request to link to the viewing (optional, but we have the relation)
    // Actually, the relation is already set via the propertyRequestId in the viewing.
    // We don't need to update the property request because the viewing has the propertyRequestId.
    // However, we have a relation from PropertyRequest to Viewing, so we can leave it as is.
    // Prisma will automatically set the reverse relation when we create the viewing with the propertyRequestId.

    // Notify the tenant and landlord? We'll leave that to a background process.

    return NextResponse.json(viewing, { status: 201 });
  } catch (error: any) {
    console.error('[Viewings POST]', error);
    return NextResponse.json(
      { error: 'Failed to schedule viewing' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');

    // Build where clause based on user role
    let where: any = {};

    if (user.role === 'tenant') {
      where = { tenantId: user.id };
    } else if (user.role === 'landlord') {
      where = { landlordId: user.id };
    } else if (user.role === 'admin') {
      // Admin can see all viewings, but we might want to filter by something else?
      // We'll leave it empty for now to get all.
    } else {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    if (status) {
      where.status = status;
    }

    const viewings = await prisma.viewing.findMany({
      where,
      include: {
        propertyRequest: {
          include: {
            property: {
              select: { title: true, location: true },
            },
            tenant: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        property: {
          select: { title: true, location: true, price: true },
        },
        tenant: {
          select: { firstName: true, lastName: true, profileImage: true },
        },
        landlord: {
          select: { firstName: true, lastName: true, profileImage: true },
        },
      },
      orderBy: { scheduledDateTime: 'asc' },
    });

    return NextResponse.json(viewings);
  } catch (error: any) {
    console.error('[Viewings GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch viewings' },
      { status: 500 }
    );
  }
}