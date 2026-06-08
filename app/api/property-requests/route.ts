import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sanitize } from '@/lib/sanitize';
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

    if (user.role !== 'tenant') {
      return NextResponse.json(
        { error: 'Forbidden – only tenants can submit property requests' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { propertyId, type, message } = body;

    if (!propertyId || !type) {
      return NextResponse.json(
        { error: 'Property ID and request type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['viewing', 'interest', 'application'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, verified: true, landlordId: true, status: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.status === 'unavailable' || property.status === 'occupied') {
      return NextResponse.json(
        { error: 'Property is not available for applications' },
        { status: 400 }
      );
    }

    const count = await prisma.propertyRequest.count({
      where: {
        propertyId,
        tenantId: user.id,
        status: { notIn: ['cancelled', 'pending_payment'] },
      },
    });

    if (count > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a request for this property' },
        { status: 409 }
      );
    }

    if (type === 'application') {
      const request = await prisma.propertyRequest.create({
        data: {
          type,
          message: message ? sanitize.plain(message) : '',
          status: 'pending_payment',
          amount: 10,
          tenantId: user.id,
          propertyId,
        },
      });

      return NextResponse.json(
        { ...request, requiresPayment: true },
        { status: 201 }
      );
    }

    const request = await prisma.propertyRequest.create({
      data: {
        type,
        message: message ? sanitize.plain(message) : '',
        status: 'pending',
        tenantId: user.id,
        propertyId,
      },
    });

    return NextResponse.json({ ...request, requiresPayment: false }, { status: 201 });
  } catch (error: any) {
    console.error('[Property Requests POST]', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.substring(0, 200),
    });
    return NextResponse.json(
      { 
        error: 'Failed to submit property request', 
        message: error?.message,
        code: error?.code
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const propertyId = searchParams.get('propertyId');
    const status = searchParams.get('status');
    const requestId = searchParams.get('id');
    const { userId } = await auth();

    // If only checking if a request exists (from property page), allow unauthenticated
    if (propertyId && !requestId && !status && !userId) {
      try {
        const count = await prisma.propertyRequest.count({
          where: {
            propertyId,
            status: { notIn: ['cancelled'] },
          },
        });
        return NextResponse.json({ exists: count > 0, count });
      } catch (dbError: any) {
        console.error('[Property Requests GET - Public Check Error]', dbError?.message);
        return NextResponse.json({ exists: false, count: 0 });
      }
    }

    // For authenticated requests
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      console.error(`[Property Requests GET] User not found for clerkId: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (requestId) {
      const request = await prisma.propertyRequest.findUnique({
        where: { id: requestId },
        include: {
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              email: true,
              phoneNumber: true,
            },
          },
          property: {
            select: {
              id: true,
              title: true,
              location: true,
              price: true,
              images: true,
              landlord: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phoneNumber: true,
                  email: true,
                },
              },
            },
          },
          payment: {
            select: {
              id: true,
              status: true,
              reference: true,
              orderTrackingId: true,
            },
          },
        },
      });

      if (!request) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      const isTenant = request.tenantId === user.id;
      const isLandlord = request.property.landlord.id === user.id;
      const isAdmin = user.role === 'admin';

      if (!isTenant && !isLandlord && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(request);
    }

    const where: any = {};

    if (user.role === 'landlord') {
      where.property = { landlordId: user.id };
    } else if (user.role === 'tenant') {
      where.tenantId = user.id;
    } else {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

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
            images: true,
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      requests.map((r) => ({
        ...r,
        createdAt: r.createdAt?.toISOString(),
        updatedAt: r.updatedAt?.toISOString(),
      }))
    );
  } catch (error: any) {
    console.error('[Property Requests GET]', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack?.substring(0, 200),
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch property requests', 
        message: error?.message,
        code: error?.code
      },
      { status: 500 }
    );
  }
}
