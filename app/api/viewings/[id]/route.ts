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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Viewing ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, notes, scheduledDateTime } = body;

    // Find the viewing and ensure the user is involved
    const viewing = await prisma.viewing.findUnique({
      where: { id },
      include: {
        propertyRequest: {
          include: {
            property: {
              select: { landlordId: true },
            },
            tenant: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 });
    }

    // Check if the user is the tenant, landlord, or admin
    const isTenant = viewing.tenantId === user.id;
    const isLandlord = viewing.propertyRequest.property.landlordId === user.id;
    const isAdmin = user.role === 'admin';

    if (!(isTenant || isLandlord || isAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses = ['scheduled', 'completed', 'cancelled', 'no_show'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Only admin can reschedule (change scheduledDateTime)
    if (scheduledDateTime !== undefined && !isAdmin) {
      return NextResponse.json(
        { error: 'Only admin can reschedule a viewing' },
        { status: 403 }
      );
    }

    // Update the viewing
    const updatedViewing = await prisma.viewing.update({
      where: { id },
      data: {
        status: status ?? viewing.status,
        notes: notes !== undefined ? notes : viewing.notes,
        scheduledDateTime: scheduledDateTime
          ? new Date(scheduledDateTime)
          : viewing.scheduledDateTime,
      },
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
    });

    return NextResponse.json(updatedViewing);
  } catch (error: any) {
    console.error('[Viewings PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update viewing' },
      { status: 500 }
    );
  }
}