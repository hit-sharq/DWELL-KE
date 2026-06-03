export function isAdminUser(clerkId: string | null | undefined): boolean {
  if (!clerkId) return false;

  const adminClerkIds = process.env.ADMIN_CLERK_IDS?.split(',') || [];
  return adminClerkIds.includes(clerkId.trim());
}

export function getAdminClerkIds(): string[] {
  return process.env.ADMIN_CLERK_IDS?.split(',').map((id) =>
    id.trim()
  ) || [];
}