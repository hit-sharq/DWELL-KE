import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // Only landlords can update requests for their properties
    if (user.role !== 'landlord') {
      return NextResponse.json(
        { error: 'Forbidden – only landlords can update property requests' },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, message } = body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'declined', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Find the request and ensure it belongs to a property owned by this landlord
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

    if (request.property.landlordId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the request
    const updatedRequest = await prisma.propertyRequest.update({
      where: { id },
      data: {
        status: status ?? request.status,
        message: message !== undefined ? message : request.message,
      },
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
          },
        },
      },
    });

    // If the request is an application and approved, create a booking
    if (request.type === 'application' && (status ?? request.status) === 'approved') {
      // Fetch the request again to get checkInDate and checkOutDate
      const requestWithDates = await prisma.propertyRequest.findUnique({
        where: { id },
        select: {
          checkInDate: true,
          checkOutDate: true,
          tenantId: true,
          propertyId: true,
        },
      });

      if (!requestWithDates) {
        throw new Error('Failed to fetch request with dates');
      }

      const { checkInDate, checkOutDate, tenantId, propertyId } = requestWithDates;

      if (!checkInDate || !checkOutDate) {
        throw new Error('Check-in and check-out dates are required for application requests');
      }

      // Calculate duration in months (assuming monthly price)
      const oneMonth = 1000 * 60 * 60 * 24 * 30;
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const months = Math.max(1, Math.round(diffTime / oneMonth));

      // Fetch the property to get the price
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { price: true, landlordId: true },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      const totalPrice = property.price * months;

      // Create the booking
      const booking = await prisma.booking.create({
        data: {
          checkInDate,
          checkOutDate,
          numberOfGuests: 1, // Default, can be updated later
          totalPrice,
          status: 'pending', // Pending payment
          tenantId,
          propertyId,
        },
      });

      // Create a pending payment record
      await prisma.payment.create({
        data: {
          amount: totalPrice,
          status: 'pending', // Pending payment
          bookingId: booking.id,
          // We'll leave reference empty for now; it will be filled when payment is processed
        },
      });

      // TODO: Trigger payment process (e.g., send payment link to tenant via email or in-app notification)
    }

    // If the request is approved, we might want to create a viewing or notify the tenant.
    // We'll leave that to a background process or the frontend for now.

    return NextResponse.json(updatedRequest);
  } catch (error: any) {
    console.error('[Property Requests PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update property request' },
      { status: 500 }
    );
  }
}