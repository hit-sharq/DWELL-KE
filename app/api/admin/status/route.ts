import { auth } from '@clerk/nextjs/server';
import { isAdminUser } from '@/lib/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  const isAdmin = userId ? isAdminUser(userId) : false;
  return NextResponse.json({ isAdmin });
}