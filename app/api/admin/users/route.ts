import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';

/** GET /api/admin/users
 *  Admin-only. Returns all platform users with optional role filter.
 *  Query: ?role=tenant|landlord|admin|all
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const roleParam = req.nextUrl.searchParams.get('role') || 'all';
    const searchParam = req.nextUrl.searchParams.get('search') || '';

    const where: Record<string, unknown> = {};
    if (roleParam !== 'all') where.role = roleParam;
    if (searchParam) {
      where.OR = [
        { firstName: { contains: searchParam, mode: 'insensitive' } },
        { lastName:  { contains: searchParam, mode: 'insensitive' } },
        { email:     { contains: searchParam, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { properties: true, bookings: true, messages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const shaped = users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      role: u.role,
      status: u.isVerified ? 'active' : 'unverified',
      joined: u.createdAt.toISOString().split('T')[0],
      propertiesCount: u._count.properties,
      bookingsCount: u._count.bookings,
    }));

    return NextResponse.json(shaped);
  } catch (error) {
    console.error('[Admin Users GET]', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
