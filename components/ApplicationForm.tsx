'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PremiumButton } from '@/components/PremiumButton';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface ApplicationFormProps {
  propertyId: string;
  propertyTitle: string;
  applicationFee: number;
  onApplied?: (propertyRequest: any) => void;
}

export function ApplicationForm({
  propertyId,
  propertyTitle,
  applicationFee,
  onApplied,
}: ApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<any>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowPaymentModal(false);

    try {
      const response = await fetch('/api/property-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          type: 'application',
          message: message.trim() || undefined,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: 'Server error — please try again later' };

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to submit application');
      }

      if (data.requiresPayment) {
        setCreatedRequest(data);
        setShowPaymentModal(true);
      } else {
        onApplied?.(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!createdRequest) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyRequestId: createdRequest.id,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: 'Server error — please try again later' };

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to initiate payment');
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
      setShowPaymentModal(false);
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setCreatedRequest(null);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-xl p-6 rounded-2xl bg-gradient-to-b from-slate-900/40 to-slate-900/20 border border-cyan-500/30 backdrop-blur"
    >
      <h3 className="text-xl font-bold text-white">Apply for this Property</h3>

      {error && (
        <motion.div
          variants={staggerItem}
          className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.form onSubmit={handleApply} variants={staggerContainer} className="space-y-6">
        <motion.div variants={staggerItem}>
          <p className="text-gray-300 text-sm">
            Apply to view this property. Your application fee of <span className="text-cyan-400 font-bold">KES {applicationFee.toLocaleString()}</span> gets you priority access. We'll contact the landlord and schedule a viewing for you.
          </p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <label className="block text-sm font-bold text-white mb-2">
            Message to Landlord (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself, mention your budget, preferred move-in date..."
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
          />
          <div className="text-xs text-gray-500 mt-1 text-right">{message.length}/500</div>
        </motion.div>

        <motion.div variants={staggerItem} className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Application Fee</span>
            <span className="font-bold text-cyan-400">KES {applicationFee.toLocaleString()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Covers property verification and viewing arrangements
          </div>
        </motion.div>

        <motion.div variants={staggerItem}>
          <PremiumButton
            variant="solid"
            size="lg"
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Processing...' : `Pay KES ${applicationFee.toLocaleString()} & Apply`}
          </PremiumButton>
        </motion.div>

        <motion.div variants={staggerItem} className="text-center">
          <p className="text-xs text-gray-500">
            By applying, you agree to our terms. We&apos;ll reach out within 24 hours.
          </p>
        </motion.div>
      </motion.form>

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-slate-900 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full space-y-6"
          >
            <h2 className="text-2xl font-bold text-white">Confirm Application</h2>

            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 space-y-2">
              <div className="text-sm text-gray-400">Property</div>
              <div className="text-white font-semibold">{propertyTitle}</div>
              <div className="border-t border-cyan-500/30 pt-2 mt-2 flex justify-between">
                <span className="text-gray-300">Application Fee</span>
                <span className="text-xl font-bold text-cyan-400">KES {applicationFee.toLocaleString()}</span>
              </div>
              <div className="text-gray-500 text-xs mt-2">
                Payment via PesaPal (M-Pesa, Airtel Money, Card)
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <PremiumButton
                variant="solid"
                size="lg"
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Redirecting to PesaPal...' : `Pay KES ${applicationFee.toLocaleString()}`}
              </PremiumButton>
              <button
                type="button"
                onClick={closeModal}
                className="w-full px-6 py-3 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
