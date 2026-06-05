import { auth } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let userId: string | null = null;
    try {
      const authResult = await auth();
      userId = authResult.userId;
    } catch {
      return NextResponse.json({ isAdmin: false });
    }
    const isAdmin = userId ? isAdminUser(userId) : false;
    return NextResponse.json({ isAdmin });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}