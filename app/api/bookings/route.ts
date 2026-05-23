import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all bookings for tenant or property
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

    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');

    let where: any = {};

    if (propertyId) {
      where.propertyId = propertyId;
    } else {
      where.tenantId = user.id;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            location: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('[Booking GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST create new booking
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

    const body = await req.json();
    const {
      propertyId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
    } = body;

    // Validate required fields
    if (!propertyId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get property to calculate total price
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalPrice = property.price * nights;

    // Check for booking conflicts
    const existingBooking = await prisma.booking.findFirst({
      where: {
        propertyId,
        AND: [
          { checkInDate: { lt: checkOut } },
          { checkOutDate: { gt: checkIn } },
        ],
        NOT: { status: 'cancelled' },
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Property is already booked for the selected dates' },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        tenantId: user.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: numberOfGuests || 1,
        totalPrice,
        specialRequests: specialRequests || '',
        status: 'pending',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('[Booking POST]', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH update booking status
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { property: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check authorization: tenant can cancel, landlord can confirm
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (booking.tenantId !== user.id && booking.property.landlordId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error: any) {
    console.error('[Booking PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
