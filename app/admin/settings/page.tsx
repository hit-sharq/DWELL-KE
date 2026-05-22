'use client';

import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { useState } from 'react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    allowNewSignups: true,
    commissionRate: '10',
  });

  return (
    <div className="p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Platform Settings</h1>
        <p className="text-gray-400">Configure and manage platform settings</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* General Settings */}
        <GlassmorphicCard>
          <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({ ...settings, maintenanceMode: e.target.checked })
                }
                className="w-5 h-5 rounded accent-blue-500"
              />
              <div>
                <div className="font-medium text-white">Maintenance Mode</div>
                <div className="text-sm text-gray-400">
                  Disable platform access for maintenance
                </div>
              </div>
            </label>

            <label className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded accent-blue-500"
              />
              <div>
                <div className="font-medium text-white">Email Notifications</div>
                <div className="text-sm text-gray-400">
                  Send notifications for important events
                </div>
              </div>
            </label>

            <label className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={settings.allowNewSignups}
                onChange={(e) =>
                  setSettings({ ...settings, allowNewSignups: e.target.checked })
                }
                className="w-5 h-5 rounded accent-blue-500"
              />
              <div>
                <div className="font-medium text-white">Allow New Signups</div>
                <div className="text-sm text-gray-400">
                  Allow new users to register on the platform
                </div>
              </div>
            </label>
          </div>
        </GlassmorphicCard>

        {/* Financial Settings */}
        <GlassmorphicCard>
          <h2 className="text-xl font-bold text-white mb-6">Financial Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={settings.commissionRate}
                onChange={(e) =>
                  setSettings({ ...settings, commissionRate: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </GlassmorphicCard>

        {/* Save Button */}
        <div className="flex gap-4">
          <PremiumButton variant="solid">Save Settings</PremiumButton>
          <PremiumButton variant="outline">Cancel</PremiumButton>
        </div>
      </motion.div>
    </div>
  );
}
