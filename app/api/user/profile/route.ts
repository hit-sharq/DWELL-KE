import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sanitize, validateLength } from '@/lib/sanitize';
import { NextRequest, NextResponse } from 'next/server';

// GET current user profile
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            properties: true,
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error('[User Profile GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      phoneNumber,
      profileImage,
    }: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      profileImage?: string;
    } = body;

    if (firstName !== undefined && validateLength.short(firstName, 50)) {
      return NextResponse.json({ error: 'First name must be 50 characters or less' }, { status: 400 });
    }
    if (lastName !== undefined && validateLength.short(lastName, 50)) {
      return NextResponse.json({ error: 'Last name must be 50 characters or less' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        ...(firstName !== undefined && { firstName: sanitize.plain(firstName) }),
        ...(lastName !== undefined && { lastName: sanitize.plain(lastName) }),
        ...(phoneNumber !== undefined && { phoneNumber: sanitize.plain(phoneNumber) }),
        ...(profileImage !== undefined && { profileImage: sanitize.plain(profileImage) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[User Profile PUT]', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}