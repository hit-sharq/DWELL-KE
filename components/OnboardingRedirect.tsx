'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';

export default function OnboardingRedirect() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip if Clerk hasn't loaded yet
    if (!isLoaded) return;

    // Skip if not signed in
    if (!user) return;

    // Skip if already on auth, become-landlord, api, or dashboard/landlord (to avoid loops)
    const protectedPaths = ['/auth', '/become-landlord', '/api', '/dashboard/landlord'];
    if (protectedPaths.some(p => pathname.startsWith(p))) return;

    // Fetch application status to determine if user is an approved landlord
    // We'll rely on the user role from DB (updated via webhook) for simplicity.
    // If role is landlord, go to landlord dashboard.
    // If role is tenant (or not landlord) and has no approved application, go to become-landlord.
    // Since we don't have role in Clerk user object, we need to check via an endpoint or rely on middleware?
    // Simpler: check if user has landlord role by looking at a flag we could store in public metadata?
    // However, we already have the role in the DB; we can call /api/landlord/application-status.
    // If status is approved, treat as landlord.
    // If status is none/pending/denied, treat as not landlord.

    // We'll do a quick fetch; if it fails, we silently skip to avoid blocking UI.
    async function checkStatus() {
      try {
        const res = await fetch('/api/landlord/application-status');
        if (!res.ok) return;
        const data = await res.json();
        const status = data.status as 'none' | 'pending' | 'approved' | 'denied';

        if (status === 'approved') {
          // User is an approved landlord; redirect to landlord dashboard if not already there
          if (!pathname.startsWith('/dashboard/landlord')) {
            router.push('/dashboard/landlord');
          }
        } else {
          // User is not an approved landlord; send them to onboarding if not already there
          if (pathname !== '/become-landlord') {
            router.push('/become-landlord');
          }
        }
      } catch (err) {
        console.warn('Failed to check landlord application status:', err);
      }
    }

    checkStatus();
  }, [user, isLoaded, pathname, router]);

  // Render nothing; this component only handles side effects
  return null;
}