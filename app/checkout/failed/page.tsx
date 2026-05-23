'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function FailedPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

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
          {/* Failed Icon */}
          <motion.div
            variants={staggerItem}
            className="flex justify-center"
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div variants={staggerItem} className="space-y-3">
            <h1 className="text-4xl font-bold text-white">Payment Failed</h1>
            <p className="text-gray-400 text-lg">
              Unfortunately, your payment could not be processed. Please try again or
              use a different payment method.
            </p>
          </motion.div>

          {/* Error Details */}
          <motion.div
            variants={staggerItem}
            className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3 text-left"
          >
            <div className="font-bold text-red-300 mb-3">What You Can Do:</div>
            <ul className="space-y-2 text-sm text-red-200">
              <li className="flex gap-3">
                <span className="text-red-400">•</span>
                <span>Check your payment details and try again</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400">•</span>
                <span>Ensure you have sufficient balance</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400">•</span>
                <span>Try a different payment method</span>
              </li>
              <li className="flex gap-3">
                <span className="text-red-400">•</span>
                <span>Contact support if issues persist</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={staggerItem} className="flex flex-col gap-3">
            {bookingId && (
              <Link href={`/checkout?bookingId=${bookingId}`}>
                <button className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold">
                  Try Payment Again
                </button>
              </Link>
            )}
            <Link href="/dashboard/tenant">
              <button className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors">
                Go to Dashboard
              </button>
            </Link>
            <Link href="/contact">
              <button className="w-full px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                Contact Support
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}
