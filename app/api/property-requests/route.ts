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
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only tenants can submit requests
    if (user.role !== 'tenant') {
      return NextResponse.json(
        { error: 'Forbidden – only tenants can submit property requests' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { propertyId, type, message, preferredDateTime, budget, seriousness } = body;

    if (!propertyId || !type) {
      return NextResponse.json(
        { error: 'Property ID and request type are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['viewing', 'interest', 'application'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      );
    }

    // Check if property exists and is verified (for viewing and interest requests)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, verified: true, landlordId: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // For viewing and interest requests, property must be verified
    if (type === 'viewing' || type === 'interest') {
      if (!property.verified) {
        return NextResponse.json(
          { error: 'Property is not yet verified and cannot be requested' },
          { status: 400 }
        );
      }
    }

    // Create the request
    const request = await prisma.propertyRequest.create({
      data: {
        type,
        message: message || null,
        preferredDateTime: preferredDateTime ? new Date(preferredDateTime) : null,
        budget: budget ? parseFloat(budget) : null,
        seriousness,
        tenantId: user.id,
        propertyId,
      },
    });

    // Notify the landlord? We'll leave that to a background process or webhook for now.
    // For now, we just return the request.

    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error('[Property Requests POST]', error);
    return NextResponse.json(
      { error: 'Failed to submit property request' },
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

    // Only landlords can view requests for their properties
    if (user.role !== 'landlord') {
      return NextResponse.json(
        { error: 'Forbidden – only landlords can view property requests' },
        { status: 403 }
      );
    }

    const { searchParams } = req.nextUrl;
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');

    // Build where clause: requests for properties owned by this landlord
    const where: any = {
      property: {
        landlordId: user.id,
      },
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (status) {
      where.status = status;
    }

    const requests = await prisma.propertyRequest.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            verified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error('[Property Requests GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch property requests' },
      { status: 500 }
    );
  }
}