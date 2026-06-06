'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');
  const propertyRequestId = searchParams.get('propertyRequestId');
  const isPropertyRequest = !!propertyRequestId;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/dashboard/tenant');
    }, 8000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-12 flex items-center justify-center min-h-screen"
      >
        <motion.div
          variants={staggerItem}
          className="text-center space-y-8 max-w-md"
        >
          <motion.div
            variants={staggerItem}
            className="flex justify-center"
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-3">
            <h1 className="text-4xl font-bold text-white">
              {isPropertyRequest ? 'Application Submitted!' : 'Payment Successful!'}
            </h1>
            <p className="text-gray-400 text-lg">
              {isPropertyRequest
                ? 'Your application has been submitted. We\'ll contact the landlord and schedule a viewing within 24 hours.'
                : 'Your booking has been confirmed. You should receive a confirmation email shortly.'}
            </p>
          </motion.div>

          {(bookingId || propertyRequestId) && (
            <motion.div
              variants={staggerItem}
              className="p-6 rounded-xl bg-slate-900/50 border border-cyan-500/30 space-y-3"
            >
              <div className="text-sm text-gray-400">
                {isPropertyRequest ? 'Application' : 'Booking'} Reference
              </div>
              <div className="text-xl font-mono font-bold text-cyan-400">
                {(bookingId || propertyRequestId)?.substring(0, 8)?.toUpperCase()}
              </div>
              <p className="text-xs text-gray-500">
                Save this for your records
              </p>
            </motion.div>
          )}

          <motion.div
            variants={staggerItem}
            className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3 text-left"
          >
            <div className="font-bold text-blue-300 mb-3">Next Steps:</div>
            <ul className="space-y-2 text-sm text-blue-200">
              {isPropertyRequest ? (
                <>
                  <li className="flex gap-3">
                    <span className="text-blue-400">1.</span>
                    <span>We verify your payment and contact the landlord</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400">2.</span>
                    <span>We schedule a viewing at your convenience</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400">3.</span>
                    <span>View the property with our team</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400">4.</span>
                    <span>We help you negotiate the lease</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex gap-3">
                    <span className="text-blue-400">1.</span>
                    <span>Check your email for booking confirmation</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400">2.</span>
                    <span>View your booking in the dashboard</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400">3.</span>
                    <span>Connect with the landlord before move-in</span>
                  </li>
                </>
              )}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col gap-3">
            <Link href="/dashboard/tenant">
              <button className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold">
                Go to Dashboard
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                Browse More Properties
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
