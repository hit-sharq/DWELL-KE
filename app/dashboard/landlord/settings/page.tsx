'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';

interface NotificationSettings {
  emailBookings: boolean;
  emailPayments: boolean;
  emailMessages: boolean;
  pushNotifications: boolean;
}

export default function LandlordSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailBookings: true,
    emailPayments: true,
    emailMessages: true,
    pushNotifications: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (key: keyof NotificationSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      // Would call /api/landlord/settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="landlord" />

      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/landlord">
                <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">Manage your account preferences</p>
          </div>

          {/* Error/Success */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-400">
              {success}
            </div>
          )}

          {/* Notification Settings */}
          <GlassmorphicCard className="mb-8">
            <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(settings).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/[0.04]"
                >
                  <div>
                    <p className="font-medium text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </p>
                    <p className="text-sm text-gray-400">
                      {key === 'emailBookings' && 'Receive emails for new bookings'}
                      {key === 'emailPayments' && 'Receive emails for payment updates'}
                      {key === 'emailMessages' && 'Receive emails for new messages'}
                      {key === 'pushNotifications' && 'Enable push notifications in browser'}
                    </p>
                  </div>
                  <label className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-slate-700">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => handleChange(key as keyof NotificationSettings)}
                      className="sr-only"
                    />
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        value ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </label>
                </div>
              ))}
            </div>
          </GlassmorphicCard>

          {/* Account Actions */}
          <GlassmorphicCard>
            <h2 className="text-xl font-bold text-white mb-6">Account Actions</h2>
            <div className="space-y-4">
              <button className="w-full md:w-auto px-6 py-3 bg-slate-800 border border-slate-700 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors">
                Change Password
              </button>
              <button className="w-full md:w-auto px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors ml-4">
                Delete Account
              </button>
            </div>
          </GlassmorphicCard>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <PremiumButton variant="solid" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </PremiumButton>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}