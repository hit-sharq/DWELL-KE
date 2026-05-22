export function isAdminUser(clerkId: string | null | undefined): boolean {
  if (!clerkId) return false;

  const adminClerkIds = process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS?.split(',') || [];
  return adminClerkIds.includes(clerkId.trim());
}

export function getAdminClerkIds(): string[] {
  return process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS?.split(',').map((id) =>
    id.trim()
  ) || [];
}
