'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { scrollReveal } from '@/lib/animations';

type SettingsPayload = {
  maintenanceMode: boolean;
  emailNotifications: boolean;
  allowNewSignups:  boolean;
  fraudSensitivity: 'low' | 'medium' | 'high';
  commissionRate:   number;
};

const EMPTY_SETTINGS: SettingsPayload = {
  maintenanceMode:   false,
  emailNotifications: true,
  allowNewSignups:   true,
  fraudSensitivity:  'medium',
  commissionRate:    10,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsPayload>(EMPTY_SETTINGS);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');
  const initialRef  = useRef<SettingsPayload>(EMPTY_SETTINGS);

  // ── Load current settings on mount ──
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      setSaved(false);
      try {
        // Resolve settings directory for current index
        const res = await fetch('/api/admin/settings', {
          method: 'GET',
        });
        if (res.ok) {
          const body: Record<string, unknown> = await res.json();
          if (body.settings) {
            const parsed: SettingsPayload = {
              maintenanceMode:    Boolean(body.settings.maintenanceMode),
              emailNotifications: Boolean(body.settings.emailNotifications),
              allowNewSignups:    Boolean(body.settings.allowNewSignups),
              fraudSensitivity:   (body.settings.fraudSensitivity as SettingsPayload['fraudSensitivity']) || 'medium',
              commissionRate:     Number(body.settings.commissionRate) || 10,
            };
            setSettings(parsed);
            initialRef.current = { ...parsed };
          }
        }
      } catch {
        // Silently fall back to defaults — settings API is stubbed
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateFlag = (key: keyof SettingsPayload) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
  };

  const updateRate = (value: number) => {
    setSettings((p) => ({ ...p, commissionRate: value }));
  };

  const hasChanges =
    settings.maintenanceMode    !== initialRef.current.maintenanceMode ||
    settings.emailNotifications !== initialRef.current.emailNotifications ||
    settings.allowNewSignups    !== initialRef.current.allowNewSignups ||
    settings.fraudSensitivity   !== initialRef.current.fraudSensitivity ||
    settings.commissionRate     !== initialRef.current.commissionRate;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const body: Record<string, unknown> = await res.json().catch(() => ({}));
        throw new Error((body.error as string) || 'Failed to save settings');
      }
      initialRef.current = { ...settings };
      setSaved(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSettings({ ...initialRef.current });
    setSaved(false);
    setError('');
  };

  // Sensitivity color map
  const sensitivityMap: Record<string, { ring: string; text: string; bg: string }> = {
    low:    { ring: 'ring-emerald-400/30',  text: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
    medium: { ring: 'ring-yellow-400/30',   text: 'text-yellow-400',   bg: 'bg-yellow-400/10' },
    high:   { ring: 'ring-red-400/30',      text: 'text-red-400',      bg: 'bg-red-400/10' },
  };

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <motion.div {...scrollReveal} className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-cyan-400/50 mb-3">Configuration</p>
        <h1 className="text-4xl font-bold text-white mb-2">Platform Settings</h1>
        <p className="text-gray-400">
          Live platform configuration — persisted via <code className="text-cyan-400/70 font-mono text-xs">POST /api/admin/settings</code>
        </p>
      </motion.div>

      {/* Success / Error feedback */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm flex items-center gap-2.5"
        >
          <span>✓</span> Settings saved successfully.
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-slate-800/20 h-44" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >

          {/* ── General Settings ── */}
          <GlassmorphicCard>
            <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
            <div className="space-y-5">

              {/* Maintenance Mode */}
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={() => updateFlag('maintenanceMode')}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 rounded-full bg-slate-700 peer-checked:bg-cyan-500 transition-colors
                                  flex items-center px-0.5 before:content-[''] before:block before:w-5 before:h-5
                                  before:rounded-full before:bg-white before:transition-transform
                                  peer-checked:before:translate-x-5" />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-cyan-200 transition-colors">Maintenance Mode</p>
                  <p className="text-sm text-gray-400">
                    Restrict public access while performing platform updates
                  </p>
                </div>
                {settings.maintenanceMode && (
                  <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                                 bg-amber-500/12 text-amber-400 border border-amber-500/25">
                    Active
                  </span>
                )}
              </label>

              {/* Email Notifications */}
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={() => updateFlag('emailNotifications')}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 rounded-full bg-slate-700 peer-checked:bg-cyan-500 transition-colors
                                  flex items-center px-0.5 before:content-[''] before:block before:w-5 before:h-5
                                  before:rounded-full before:bg-white before:transition-transform
                                  peer-checked:before:translate-x-5" />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-cyan-200 transition-colors">Email Notifications</p>
                  <p className="text-sm text-gray-400">
                    Send email alerts for critical platform events and user actions
                  </p>
                </div>
              </label>

              {/* Allow New Signups */}
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.allowNewSignups}
                    onChange={() => updateFlag('allowNewSignups')}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 rounded-full bg-slate-700 peer-checked:bg-cyan-500 transition-colors
                                  flex items-center px-0.5 before:content-[''] before:block before:w-5 before:h-5
                                  before:rounded-full before:bg-white before:transition-transform
                                  peer-checked:before:translate-x-5" />
                </div>
                <div>
                  <p className="font-medium text-white group-hover:text-cyan-200 transition-colors">Allow New Signups</p>
                  <p className="text-sm text-gray-400">
                    Permit new tenants and landlords to register on the platform
                  </p>
                </div>
                {!settings.allowNewSignups && (
                  <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider
                                 bg-red-500/12 text-red-400 border border-red-500/25">
                    Closed
                  </span>
                )}
              </label>

            </div>
          </GlassmorphicCard>

          {/* ── Security &amp; Financial ── */}
          <GlassmorphicCard>
            <h2 className="text-xl font-bold text-white mb-6">Security &amp; Finance</h2>

            {/* Fraud Sensitivity */}
            <div className="mb-6">
              <p className="text-sm font-medium text-white mb-3">Fraud Detection Sensitivity</p>
              <div className="flex gap-3">
                {(['low', 'medium', 'high'] as const).map((level) => {
                  const s = sensitivityMap[level];
                  const active = settings.fraudSensitivity === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSettings((p) => ({ ...p, fraudSensitivity: level }))}
                      className={`
                        flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all border
                        ${active
                          ? `${s.bg} ${s.text} ${s.ring.replace('ring-', 'ring-2 ')} border-${s.text.replace('text-', '')}/20`
                          : 'bg-slate-900/60 text-gray-400 border-slate-700/50 hover:border-slate-600'
                        }
                      `}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Higher sensitivity flags more listings for manual review — may increase false positives.
              </p>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Platform Commission Rate (%) — {settings.commissionRate}%
              </label>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={settings.commissionRate}
                onChange={(e) => updateRate(parseFloat(e.target.value))}
                className="w-full h-2 rounded-full bg-slate-800 appearance-none
                           [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-cyan-400
                           [&::-webkit-slider-thumb]:to-blue-500 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(34,211,238,0.5)]"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-1.5">
                <span>0%</span>
                <span>12.5%</span>
                <span>25%</span>
              </div>
            </div>
          </GlassmorphicCard>

          {/* ── Action Buttons ── */}
          <div className="flex flex-wrap gap-4">
            <PremiumButton
              variant="solid"
              size="lg"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="min-w-[180px]"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </PremiumButton>
            <PremiumButton
              variant="outline"
              size="lg"
              onClick={handleCancel}
              disabled={saving || !hasChanges}
              className="min-w-[140px]"
            >
              Discard
            </PremiumButton>
            {hasChanges && (
              <p className="text-xs text-gray-500 flex items-center self-center ml-2">
                ⚠ &nbsp;Unsaved changes will be lost
              </p>
            )}
          </div>

        </motion.div>
      )}

    </div>
  );
}
