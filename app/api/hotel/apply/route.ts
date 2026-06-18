import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (user.role === 'hotel') {
        return NextResponse.json(
          { error: 'You are already a hotel partner' },
          { status: 400 }
        );
      }

      const existingApp = await prisma.hotelApplication.findUnique({
        where: { userId: user.id },
      });

      if (existingApp) {
        return NextResponse.json(
          { error: 'You already have a hotel application submitted' },
          { status: 400 }
        );
      }

      const body = await req.json();
      const {
        fullName,
        email,
        phoneNumber,
        hotelName,
        businessName,
        kraPin,
        bankName,
        bankAccountNumber,
        bankAccountName,
        businessLicenseUrl,
        taxComplianceUrl,
        bankProofUrl,
        hotelRegistrationUrl,
        safetyCertUrl,
        insuranceCertUrl,
        starRating,
        expectedRooms,
        address,
      } = body;

      if (!fullName || !email || !phoneNumber || !hotelName || !kraPin || !bankName || !bankAccountNumber || !bankAccountName) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      if (!businessLicenseUrl || !taxComplianceUrl || !bankProofUrl) {
        return NextResponse.json(
          { error: 'Missing required document URLs' },
          { status: 400 }
        );
      }

      const application = await prisma.hotelApplication.create({
        data: {
          userId: user.id,
          fullName,
          email,
          phoneNumber,
          hotelName,
          businessName: businessName || null,
          kraPin,
          bankName,
          bankAccountNumber,
          bankAccountName,
          businessLicenseUrl,
          taxComplianceUrl,
          bankProofUrl,
          hotelRegistrationUrl: hotelRegistrationUrl || null,
          safetyCertUrl: safetyCertUrl || null,
          insuranceCertUrl: insuranceCertUrl || null,
          starRating: starRating || null,
          expectedRooms: expectedRooms || null,
          address: address || null,
          status: 'pending',
        },
      });

      return NextResponse.json(
        { success: true, applicationId: application.id },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[Hotel Apply POST]', error);
      return NextResponse.json(
        { error: 'Failed to submit hotel application' },
        { status: 500 }
      );
    }
  });
}