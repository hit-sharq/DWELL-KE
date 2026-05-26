'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PremiumButton } from '@/components/PremiumButton';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, isLoaded } = useAuth();

  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('No booking found');
      setIsLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings`);
        if (!response.ok) throw new Error('Failed to fetch bookings');

        const bookings = await response.json();
        const found = bookings.find((b: any) => b.id === bookingId);

        if (!found) {
          setError('Booking not found');
          return;
        }

        setBooking(found);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load booking'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate payment');
      }

      const data = await response.json();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading booking details...</div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl">{error}</div>
        <Link href="/dashboard/tenant">
          <button className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <Navigation />
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="container mx-auto px-4 py-12"
      >
        <motion.div variants={staggerItem} className="mb-8">
          <Link href={`/properties/${booking?.propertyId}`}>
            <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <span>←</span>
              Back to Property
            </button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div variants={staggerItem} className="md:col-span-2">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur p-8 space-y-6">
              <h1 className="text-3xl font-bold text-white">Order Summary</h1>

              {booking && (
                <>
                  <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <h3 className="text-lg font-bold text-white">
                      {booking.property.title}
                    </h3>
                    <div className="flex items-start gap-4">
                      {booking.property.images[0] && (
                        <img
                          src={booking.property.images[0]}
                          alt={booking.property.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="text-gray-400">
                          📍 {booking.property.location}
                        </p>
                        <p className="text-gray-400">
                          📅{' '}
                          {new Date(booking.checkInDate).toLocaleDateString()} to{' '}
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400">
                          👥 {booking.numberOfGuests}{' '}
                          {booking.numberOfGuests === 1 ? 'Guest' : 'Guests'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-white">Booking Details</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Booking ID:</span>
                        <span className="font-mono text-cyan-400">
                          {booking.id.substring(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded-full capitalize">
                          {booking.status}
                        </span>
                      </div>
                      {booking.specialRequests && (
                        <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">
                          <p className="font-semibold mb-1">Special Requests:</p>
                          <p>{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <h3 className="font-bold text-white">Payment Information</h3>
                    <p className="text-gray-400 text-sm">
                      We accept payments via PesaPal. You'll be redirected to complete
                      your payment securely.
                    </p>
                    <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                      <div className="text-sm text-gray-400">Accepted Methods:</div>
                      <div className="text-cyan-400 text-sm space-y-1">
                        <div>✓ M-Pesa</div>
                        <div>✓ Airtel Money</div>
                        <div>✓ Bank Transfer</div>
                        <div>✓ Card Payments</div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
                      {error}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          <motion.div variants={staggerItem}>
            <div className="sticky top-8 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur p-8 space-y-6">
              <h3 className="text-xl font-bold text-white">Price Breakdown</h3>

              {booking && (
                <>
                  <div className="space-y-3 pb-4 border-b border-slate-700">
                    <div className="flex justify-between text-gray-300">
                      <span>
                        {Math.ceil(
                          (new Date(booking.checkOutDate).getTime() -
                            new Date(booking.checkInDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{' '}
                        nights
                      </span>
                      <span>
                        KES{' '}
                        {booking.property.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>× KES {booking.property.price}</span>
                      <span>
                        KES{' '}
                        {booking.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">Total Amount</div>
                    <div className="text-3xl font-bold text-cyan-400">
                      KES {booking.totalPrice.toLocaleString()}
                    </div>
                  </div>

                  <PremiumButton
                    variant="solid"
                    size="lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing
                      ? 'Processing...'
                      : 'Pay with PesaPal'}
                  </PremiumButton>

                  <p className="text-xs text-gray-500 text-center">
                    By proceeding, you agree to our booking terms and conditions.
                    Your payment is secure and processed by PesaPal.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-white text-xl">Loading...</div></div>}>
      <CheckoutContent />
    </Suspense>
  );
}