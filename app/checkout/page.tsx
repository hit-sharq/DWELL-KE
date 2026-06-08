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
  const propertyRequestId = searchParams.get('propertyRequestId');
  const paymentStatus = searchParams.get('status');

  const [booking, setBooking] = useState<any>(null);
  const [propertyRequest, setPropertyRequest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const isBooking = !!bookingId;
  const referenceId = bookingId || propertyRequestId;

  useEffect(() => {
    if (paymentStatus === 'completed' || paymentStatus === 'failed') {
      return;
    }

    if (!referenceId) {
      setError('No booking or property request found');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let data;
        if (isBooking) {
          const response = await fetch(`/api/property-requests?id=${bookingId}`);
          if (!response.ok) throw new Error('Failed to fetch booking');
          const bookings = await response.json();
          data = bookings.find((b: any) => b.id === bookingId);
        } else {
          const response = await fetch(`/api/property-requests?id=${propertyRequestId}`);
          if (!response.ok) throw new Error('Failed to fetch property request');
          data = await response.json();
        }

        if (!data) {
          setError('Not found');
          return;
        }

        if (isBooking) {
          setBooking(data);
        } else {
          setPropertyRequest(data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load details'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [referenceId, propertyRequestId, bookingId, isBooking, paymentStatus]);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

     try {
       const body = isBooking
         ? { bookingId }
         : { propertyRequestId };

       const response = await fetch('/api/payments/initiate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(body),
       });

       const contentType = response.headers.get('content-type') || '';
       let data: any = null;
       let rawText = '';

       if (contentType.includes('application/json')) {
         data = await response.json().catch(() => null);
       } else {
         rawText = await response.text().catch(() => '');
       }

       // Debug: helps identify when backend returns HTML (<!DOCTYPE ...)
       console.log('[checkout] initiate status', response.status, { contentType, rawTextSnippet: rawText.slice(0, 200) });

       if (!response.ok) {
         throw new Error(
           data?.error ||
             data?.message ||
             (rawText ? `Server error: ${rawText.slice(0, 200)}` : 'Failed to initiate payment')
         );
       }

       const redirectUrl =
         data?.redirectUrl ||
         data?.redirect_url ||
         data?.payment?.redirect_url;

       if (redirectUrl) {
         window.location.href = redirectUrl;
       } else {
         // In case API failed but returned non-JSON/HTML, include snippet in error.
         throw new Error(
           `No redirect URL received (status=${response.status}). Response: ${rawText ? rawText.slice(0, 300) : JSON.stringify(data).slice(0, 300)}`
         );
       }
     } catch (err) {
       setError(err instanceof Error ? err.message : 'An error occurred');
       setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading details...</div>
      </div>
    );
  }

  if (error && !booking && !propertyRequest) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl">{error}</div>
        <Link href="/marketplace">
          <button className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
            Back to Marketplace
          </button>
        </Link>
      </div>
    );
  }

  const item = isBooking ? booking : propertyRequest;
  const isPropertyRequest = !isBooking;

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="text-white text-xl">Loading application details...</div>
        <Link href="/marketplace">
          <button className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
            Back to Marketplace
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
          <Link href={`/properties/${item.property?.id}`}>
            <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
              <span>←</span>
              Back to Property
            </button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div variants={staggerItem} className="md:col-span-2">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/40 to-slate-900/20 backdrop-blur p-8 space-y-6">
              <h1 className="text-3xl font-bold text-white">
                {isPropertyRequest ? 'Application Details' : 'Order Summary'}
              </h1>

              {item && (
                <>
                  <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                    <h3 className="text-lg font-bold text-white">
                      {item.property?.title}
                    </h3>
                    <div className="flex items-start gap-4">
                      {item.property?.images?.[0] && (
                        <img
                          src={item.property.images[0]}
                          alt={item.property.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="text-gray-400">
                          📍 {item.property?.location}
                        </p>
                        <p className="text-gray-400">
                          💰 KES {item.property?.price?.toLocaleString()}/month
                        </p>
                        {item.message && (
                          <div className="mt-3 p-3 rounded bg-blue-500/10 border border-blue-500/30">
                            <p className="font-semibold text-blue-300 mb-1 text-sm">Your Message:</p>
                            <p className="text-blue-200 text-sm">{item.message}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                    <h3 className="font-bold text-white">
                      {isPropertyRequest ? 'Application Details' : 'Booking Details'}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>{isPropertyRequest ? 'Application ID:' : 'Booking ID:'}</span>
                        <span className="font-mono text-cyan-400">
                          {item.id.substring(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          item.status === 'pending_payment' ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400' :
                          item.status === 'pending' ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' :
                          item.status === 'approved' ? 'bg-green-500/20 border border-green-500/50 text-green-400' :
                          'bg-red-500/20 border border-red-500/50 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date Submitted:</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {isPropertyRequest && (
                    <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                      <h3 className="font-bold text-white">What Happens Next?</h3>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex gap-3">
                          <span className="text-cyan-400">1.</span>
                          <span>We verify your application fee payment</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-cyan-400">2.</span>
                          <span>Our team contacts the landlord to schedule a viewing</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-cyan-400">3.</span>
                          <span>We can accompany you to the property for the viewing</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-cyan-400">4.</span>
                          <span>If you like the property, we help with lease negotiations</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && !paymentStatus && (
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
              <h3 className="text-xl font-bold text-white">Payment Summary</h3>

              {item && (
                <>
                  <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                    {isPropertyRequest ? (
                      <>
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Application Fee</span>
                          <span>KES {item.amount?.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-cyan-500/30 pt-2 flex justify-between text-lg font-bold text-white">
                          <span>Total</span>
                          <span className="text-cyan-400">KES {item.amount?.toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>Rental Amount</span>
                          <span>KES {item.totalPrice?.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-cyan-500/30 pt-2 flex justify-between text-lg font-bold text-white">
                          <span>Total</span>
                          <span className="text-cyan-400">KES {item.totalPrice?.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {!paymentStatus || paymentStatus === 'failed' ? (
                    <>
                      <PremiumButton
                        variant="solid"
                        size="lg"
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        {isProcessing
                          ? 'Processing...'
                          : isPropertyRequest
                          ? `Pay KES ${item.amount?.toLocaleString()}`
                          : `Pay KES ${item.totalPrice?.toLocaleString()}`}
                      </PremiumButton>

                      <p className="text-xs text-gray-500 text-center">
                        {isPropertyRequest
                          ? 'Secure payment via PesaPal (M-Pesa, Airtel Money, Card)'
                          : 'Secure payment via PesaPal (M-Pesa, Airtel Money, Card)'}
                      </p>
                    </>
                  ) : paymentStatus === 'completed' ? (
                    <div className="text-center py-4">
                      <div className="text-green-400 text-lg font-bold mb-2">Payment Successful!</div>
                      <p className="text-gray-400 text-sm">Your {isPropertyRequest ? 'application' : 'booking'} has been confirmed.</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-red-400 text-lg font-bold mb-2">Payment Failed</div>
                      <p className="text-gray-400 text-sm">Please try again.</p>
                    </div>
                  )}
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
