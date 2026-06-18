import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { isAdminUser } from '@/lib/admin';
import { sendEmail, getLandlordApprovalEmail, getLandlordDenialEmail, getHotelApprovalEmail, getHotelDenialEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdminUser(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type') || 'landlord';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    if (type === 'hotel') {
      const [applications, total] = await Promise.all([
        prisma.hotelApplication.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.hotelApplication.count({ where }),
      ]);

      return NextResponse.json({
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    const [applications, total] = await Promise.all([
      prisma.landlordApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.landlordApplication.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdminUser(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, action, reviewNotes, denialReason, type } = body;

    if (!applicationId || !action) {
      return NextResponse.json(
        { error: 'Application ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'deny'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "deny"' },
        { status: 400 }
      );
    }

    if (action === 'deny' && !denialReason) {
      return NextResponse.json(
        { error: 'Denial reason is required when denying an application' },
        { status: 400 }
      );
    }

    const isHotelApp = type === 'hotel';

    const application = isHotelApp
      ? await prisma.hotelApplication.findUnique({ where: { id: applicationId } })
      : await prisma.landlordApplication.findUnique({ where: { id: applicationId } });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending' && application.status !== 'under_review') {
      return NextResponse.json(
        { error: 'This application has already been processed' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'approved' : 'denied';

    const updatedApplication = isHotelApp
      ? await prisma.hotelApplication.update({
          where: { id: applicationId },
          data: {
            status: newStatus,
            reviewNotes: reviewNotes || null,
            denialReason: action === 'deny' ? denialReason : null,
            reviewedBy: userId,
            reviewedAt: new Date(),
          },
        })
      : await prisma.landlordApplication.update({
          where: { id: applicationId },
          data: {
            status: newStatus,
            reviewNotes: reviewNotes || null,
            denialReason: action === 'deny' ? denialReason : null,
            reviewedBy: userId,
            reviewedAt: new Date(),
          },
        });

    if (action === 'approve') {
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: isHotelApp ? 'hotel' : 'landlord' },
      });

      if (isHotelApp) {
        await prisma.hotel.create({
          data: {
            userId: application.userId,
            name: (application as any).hotelName,
            description: null,
            location: (application as any).address || (application as any).hotelName,
            starRating: (application as any).starRating,
            amenities: [],
            images: [],
            verified: true,
            status: 'active',
          },
        });
      }
    }

    try {
      const hotelName = isHotelApp ? (application as any).hotelName : (application as any).fullName;
      const emailContent = action === 'approve'
        ? (isHotelApp ? getHotelApprovalEmail(hotelName) : getLandlordApprovalEmail(hotelName))
        : (isHotelApp ? getHotelDenialEmail(hotelName, denialReason) : getLandlordDenialEmail(hotelName, denialReason));

      await sendEmail({
        to: application.email,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      application: updatedApplication,
      message: `${isHotelApp ? 'Hotel' : 'Landlord'} application ${newStatus} successfully`,
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    return NextResponse.json(
      { error: 'Failed to review application' },
      { status: 500 }
    );
  }
}
