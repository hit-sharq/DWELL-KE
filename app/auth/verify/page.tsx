'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function VerifyEmail() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      // If email is verified, redirect to dashboard based on role
      if (user.emailAddresses.find(email => email.verification.status === 'verified')) {
        const role = user.unsafeMetadata?.role;
        if (role === 'tenant') {
          router.push('/dashboard/tenant');
        } else if (role === 'landlord') {
          router.push('/dashboard/landlord');
        } else {
          router.push('/dashboard/tenant');
        }
      }
    } else {
      // If no user, redirect to sign in
      router.push('/auth/login');
    }
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