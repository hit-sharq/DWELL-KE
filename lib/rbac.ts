import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export type Role = 'tenant' | 'landlord' | 'admin';

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({ where: { clerkId: userId } });
}

export async function requireRole(allowed: Role[]) {
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
  // Prefer Clerk-managed admin list, so role changes can be done without DB edits.
  const { userId } = await auth();

  const adminClerkIds = process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS?.split(',') || [];
  if (userId && adminClerkIds.includes(userId.trim())) {
    // Keep the existing return shape.
    return { ok: true as const, status: 200, user: undefined };
  }

  // Fallback to DB role for backward compatibility.
  return requireRole(['admin']);
}


