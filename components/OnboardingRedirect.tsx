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
        }
        // If not approved, stay on current page; let user navigate to become-landlord via UI if they wish
      } catch (err) {
        console.warn('Failed to check landlord application status:', err);
      }
    }

    checkStatus();
  }, [user, isLoaded, pathname, router]);

  // Render nothing; this component only handles side effects
  return null;
}