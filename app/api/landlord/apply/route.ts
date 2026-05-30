import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Check if user already has an application
    const existingApp = await prisma.landlordApplication.findUnique({
      where: { userId: user.id },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: 'You already have a landlord application submitted' },
        { status: 400 }
      );
    }

    // Check if user is already a landlord
    if (user.role === 'landlord') {
      return NextResponse.json(
        { error: 'You are already a landlord' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      email,
      phoneNumber,
      businessName,
      kraPin,
      bankName,
      bankAccountNumber,
      bankAccountName,
      nationalIdUrl,
      titleDeedUrl,
      taxComplianceUrl,
      bankProofUrl,
      managementAgreementUrl,
      complianceCertUrl,
      safetyCertUrl,
      leaseTemplateUrl,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !kraPin || !bankName || !bankAccountNumber || !bankAccountName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate required document URLs
    if (!nationalIdUrl || !titleDeedUrl || !taxComplianceUrl || !bankProofUrl) {
      return NextResponse.json(
        { error: 'Missing required document URLs' },
        { status: 400 }
      );
    }

    // Create the application
    const application = await prisma.landlordApplication.create({
      data: {
        userId: user.id,
        fullName,
        email,
        phoneNumber,
        businessName: businessName || null,
        kraPin,
        bankName,
        bankAccountNumber,
        bankAccountName,
        nationalIdUrl,
        titleDeedUrl,
        taxComplianceUrl,
        bankProofUrl,
        managementAgreementUrl: managementAgreementUrl || null,
        complianceCertUrl: complianceCertUrl || null,
        safetyCertUrl: safetyCertUrl || null,
        leaseTemplateUrl: leaseTemplateUrl || null,
        status: 'pending',
      },
    });

    // TODO: Send confirmation email to user

    return NextResponse.json(
      { success: true, applicationId: application.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Landlord Apply POST]', error);
    return NextResponse.json(
      { error: 'Failed to submit landlord application' },
      { status: 500 }
    );
  }
}