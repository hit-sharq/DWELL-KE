import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type OnboardingStatus = 'none' | 'pending' | 'approved' | 'denied';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ status: 'none' satisfies OnboardingStatus });
    }

    const app = await prisma.hotelApplication.findUnique({
      where: { userId: user.id },
      select: { status: true },
    });

    if (!app) {
      return NextResponse.json({ status: 'none' satisfies OnboardingStatus });
    }

    const normalized: OnboardingStatus =
      app.status === 'approved' ? 'approved' :
      app.status === 'denied' ? 'denied' :
      app.status === 'pending' || app.status === 'under_review' ? 'pending' :
      'none';

    return NextResponse.json({ status: normalized });
  } catch (error) {
    console.error('[hotel application-status]', error);
    return NextResponse.json({ error: 'Failed to fetch application status' }, { status: 500 });
  }
}