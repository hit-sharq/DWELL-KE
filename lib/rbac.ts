import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export type Role = 'tenant' | 'landlord' | 'admin';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({ where: { clerkId: userId } });
}

export async function requireRole(allowed: Role[]) {
  // Clerk is the source of truth for admin.
  // For tenant/landlord we still rely on DB role (used by the UI dashboards).
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' };
  }

  const role = user.role as Role;
  if (!allowed.includes(role)) {
    return { ok: false as const, status: 403, error: 'Forbidden' };
  }

  return { ok: true as const, status: 200, user };
}

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return { ok: false as const, status: 401, error: 'Unauthorized' };

  const adminClerkIds = process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS?.split(',') || [];
  if (adminClerkIds.includes(userId.trim())) {
    return { ok: true as const, status: 200, user: undefined };
  }

  return { ok: false as const, status: 403, error: 'Forbidden' };
}



