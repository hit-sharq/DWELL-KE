import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const verifiedParam = searchParams.get('verified');
    const verified = verifiedParam === 'true' ? true : verifiedParam === 'false' ? false : undefined;

    const where: any = {};
    if (verified !== undefined) {
      where.verified = verified;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error('[Admin Properties GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { verified, verificationNote } = body;

    // Find the property
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Update the property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        verified: verified ?? property.verified,
        verifiedAt: verified ? new Date() : null,
        verifiedById: verified ? user.id : null,
        // We'll store the verification note in an ActivityLog
      },
      include: {
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    // Log the verification action
    if (verified !== property.verified) {
      await prisma.activityLog.create({
        data: {
          action: verified ? 'property_verified' : 'property_unverified',
          description: verificationNote || `Property ${verified ? 'verified' : 'unverified'} by admin`,
          userId: user.id,
          metadata: JSON.stringify({
            propertyId: property.id,
            propertyTitle: property.title,
            previousVerified: property.verified,
            newVerified: verified,
          }),
        },
      });
    }

    return NextResponse.json(updatedProperty);
  } catch (error: any) {
    console.error('[Admin Properties PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}