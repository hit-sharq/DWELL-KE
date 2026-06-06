import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'landlord' && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, message } = body;

    const validStatuses = ['pending_payment', 'pending', 'approved', 'declined', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const request = await prisma.propertyRequest.findUnique({
      where: { id },
      include: {
        property: {
          select: { landlordId: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (user.role === 'landlord' && request.property.landlordId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedRequest = await prisma.propertyRequest.update({
      where: { id },
      data: {
        status: status ?? request.status,
        message: message !== undefined ? message : request.message,
        paidAt: request.status === 'pending_payment' && status === 'pending' ? new Date() : request.paidAt,
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            email: true,
            phone: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            images: true,
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

    return NextResponse.json(updatedRequest);
  } catch (error: any) {
    console.error('[Property Requests PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update property request' },
      { status: 500 }
    );
  }
}
