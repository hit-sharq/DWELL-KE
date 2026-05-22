import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET current user or check if exists
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(dbUser);
  } catch (error: any) {
    console.error('[User GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// POST create or sync user with Clerk
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (existingUser) {
      return NextResponse.json(existingUser, { status: 200 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImage: user.imageUrl || '',
        role: body.role || 'tenant',
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('[User POST]', error);
    return NextResponse.json(
      { error: 'Failed to create/sync user' },
      { status: 500 }
    );
  }
}
