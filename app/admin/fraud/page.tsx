'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';

interface FraudAlert {
  id: string;
  type: 'suspicious_booking' | 'payment_dispute' | 'fake_review' | 'account_spam';
  severity: 'low' | 'medium' | 'high';
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  resolved: boolean;
}

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      // Would call /api/admin/fraud
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockAlerts: FraudAlert[] = [
        {
          id: '1',
          type: 'suspicious_booking',
          severity: 'high',
          description: 'Multiple bookings from same IP within 24 hours',
          userId: 'user_123',
          userName: 'John Doe',
          createdAt: new Date().toISOString(),
          resolved: false,
        },
        {
          id: '2',
          type: 'fake_review',
          severity: 'medium',
          description: 'Review pattern indicates potential rating manipulation',
          userId: 'user_456',
          userName: 'Jane Smith',
          createdAt: new Date().toISOString(),
          resolved: false,
        },
      ];

      setAlerts(mockAlerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fraud alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, resolved: true } : alert
        )
      );
    } catch (err) {
      setError('Failed to resolve alert');
    }
  };

  const severityColors: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };

  const typeLabels: Record<string, string> = {
    suspicious_booking: 'Suspicious Booking',
    payment_dispute: 'Payment Dispute',
    fake_review: 'Fake Review',
    account_spam: 'Account Spam',
  };

  return (
    <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard/admin">
              <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                ← Back to Dashboard
              </button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Fraud Detection</h1>
          <p className="text-gray-400">Monitor and investigate suspicious activity</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <GlassmorphicCard>
            <p className="text-gray-400 text-sm mb-2">Total Alerts</p>
            <p className="text-3xl font-bold text-white">{alerts.length}</p>
          </GlassmorphicCard>
          <GlassmorphicCard>
            <p className="text-gray-400 text-sm mb-2">Unresolved</p>
            <p className="text-3xl font-bold text-red-400">
              {alerts.filter((a) => !a.resolved).length}
            </p>
          </GlassmorphicCard>
          <GlassmorphicCard>
            <p className="text-gray-400 text-sm mb-2">High Severity</p>
            <p className="text-3xl font-bold text-yellow-400">
              {alerts.filter((a) => a.severity === 'high' && !a.resolved).length}
            </p>
          </GlassmorphicCard>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <GlassmorphicCard>
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No fraud alerts detected</p>
            </div>
          </GlassmorphicCard>
        ) : (
          <GlassmorphicCard>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    alert.resolved
                      ? 'border-slate-700 bg-slate-800/30'
                      : 'border-red-500/30 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${severityColors[alert.severity]}`}>
                          {alert.severity} severity
                        </span>
                        <span className="text-gray-400 text-sm">
                          {typeLabels[alert.type]}
                        </span>
                        {alert.resolved && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/20 text-green-400">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-white mb-1">{alert.description}</p>
                      <p className="text-sm text-gray-400">
                        User: {alert.userName} • {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!alert.resolved && (
                      <PremiumButton variant="solid" size="sm" onClick={() => handleResolve(alert.id)}>
                        Resolve
                      </PremiumButton>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassmorphicCard>
        )}
      </div>
    </div>
  );
}