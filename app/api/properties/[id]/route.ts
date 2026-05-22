import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: params.id },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            email: true,
            phoneNumber: true,
          },
        },
        reviews: true,
        bookings: {
          where: { status: 'confirmed' },
          select: { checkInDate: true, checkOutDate: true },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error: any) {
    console.error('[Property Detail GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
