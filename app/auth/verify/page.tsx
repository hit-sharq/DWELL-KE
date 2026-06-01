'use client';

import { useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function VerifyContent() {
  const { isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const checkAndRedirect = async () => {
      try {
        const res = await fetch('/api/users', { credentials: 'same-origin' });
        if (res.ok) {
          router.push('/dashboard/tenant');
        } else {
          router.push('/auth/login');
        }
      } catch {
        router.push('/auth/login');
      }
    };

    checkAndRedirect();
  }, [isLoaded, router]);

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

  return null;
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <motion.div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Verifying your email...</h2>
          <p className="text-gray-400">We're checking your email verification status.</p>
        </div>
      </motion.div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
