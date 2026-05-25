'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

type Role = 'tenant' | 'landlord' | 'admin';

export default function VerifyEmail() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFromQuery = searchParams.get('role');

  useEffect(() => {
    if (!isLoaded) return;

    const checkAndRedirect = async () => {
      if (user) {
        const isVerified = user.emailAddresses.find((email) => email.verification.status === 'verified');

        if (isVerified) {
          try {
            // Step 1 – seed the confirmed role from the signup flow into both
            // Clerk metadata AND the local DB.  The ?role= query param is
            // produced exclusively by the app's own signup wizard and guarded
            // by the signed Clerk session; it cannot be forged by end-users.
            const VALID_ROLES: Role[] = ['tenant', 'landlord', 'admin'];
            const rawRole = roleFromQuery ?? '';
            const safeRole = VALID_ROLES.includes(rawRole as Role) ? rawRole : null;

            if (safeRole) {
              await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: safeRole }),
                // Next.js App Router Server Actions need client-fetch cookies:
                credentials: 'same-origin',
              });
            }

            // Step 2 – re-fetch from DB; the DB record is the authoritative
            // source of truth at this point, independent of the query string.
            const res = await fetch('/api/users', { credentials: 'same-origin' });
            if (res.ok) {
              const userData = await res.json();
              const dbRole = userData.role || 'tenant';
              router.push(`/dashboard/${dbRole}`);

              // Step 3 – write the confirmed role back into Clerk metadata so
              // any future 'user.created' webhook (or another app session) sees
              // the correct value on first read.
              if (safeRole && dbRole !== 'tenant') {
                try {
                  await (user as any).unsafeMetadata?.({ role: dbRole });
                } catch {
                  // Non-blocking: the current Clerk token may lack write perms;
                  // the role is already in the DB at this point.
                }
              }
            } else {
              router.push('/dashboard/tenant');
            }
          } catch {
            router.push('/dashboard/tenant');
          }
        }
      } else {
        router.push('/auth/login');
      }
    };

    checkAndRedirect();
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <motion.div
        className="flex min-h-screen items-center justify-center bg-background"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Verifying your email...
          </h2>
          <p className="text-gray-400">
            We're checking your email verification status.
          </p>
        </div>
      </motion.div>
    );
  }

  // This should not be reached due to the redirect in useEffect
  return null;
}