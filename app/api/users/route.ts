import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { isAdminUser } from '@/lib/admin';
import { NextRequest, NextResponse } from 'next/server';

type Role = 'tenant' | 'landlord' | 'admin';

// GET current user or auto-create if missing (server-side role source of truth)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Step A – create (or re-fetch) the user in the local DB so we have an
    // authorised PK to anchor on; it won't exist for a newly-signed-up user
    // because the clerk webhook fires asynchronously and may not yet have
    // landed.
    if (!dbUser) {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email:       user.emailAddresses[0]?.emailAddress || '',
          firstName:   user.firstName || '',
          lastName:    user.lastName || '',
          profileImage: user.imageUrl || '',
          role: (user.privateMetadata?.role ?? user.publicMetadata?.role ?? 'tenant') as string,
        },
      });
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

// PUT update user profile.
// Role changes are restricted to admins only — regular users can update name/phone/image.
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phoneNumber, profileImage, role } = body as {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      profileImage?: string;
      role?: string;
    };

    const VALID_ROLES: Role[] = ['tenant', 'landlord', 'admin'];

    if (role !== undefined) {
      if (!isAdminUser(userId)) {
        return NextResponse.json({ error: 'Forbidden – only admins can change roles' }, { status: 403 });
      }
      if (!VALID_ROLES.includes(role as Role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined)  updateData.lastName  = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (role !== undefined) updateData.role = role;

    const updated = await prisma.user.update({
      where: { clerkId: userId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[User PUT]', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A resource with this value already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// POST create or sync user with Clerk.
// Accepts an optional { role } in the body. When provided and the user is newly
// created the role is persisted to both the DB and Clerk's user metadata so
// the webhook (if enabled) will read it back with the correct value.
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

    const VALID_ROLES: Role[] = ['tenant', 'landlord', 'admin'];
    const rawRole = body.role || 'tenant';
    const role = VALID_ROLES.includes(rawRole as Role) ? rawRole : 'tenant';

    // If the user exists, update the role (so re-signup / role switch works)
    if (existingUser) {
      const updated = await prisma.user.update({
        where: { clerkId: user.id },
        data: { role },
      });

      return NextResponse.json(updated, { status: 200 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profileImage: user.imageUrl || '',
        role,
      },
    });

    // Promote the initial role into Clerk's immutable user metadata so any
    // future webhook delivery reads the authoritative value.
    try {
      await (user as any).unsafeMetadata?.({ role });
    } catch {
      // non-blocking: metadata may not be writable by this token
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('[User POST]', error);
    return NextResponse.json(
      { error: 'Failed to create/sync user' },
      { status: 500 }
    );
  }
}
