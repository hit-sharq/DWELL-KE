'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/PremiumButton';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { DashboardNav } from '@/components/DashboardNav';
import { Footer } from '@/components/Footer';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  phoneNumber?: string;
  role: string;
  isVerified: boolean;
  _count: {
    properties: number;
    bookings: number;
    reviews: number;
  };
}

export default function TenantProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    profileImage: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        profileImage: data.profileImage || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      setSuccess('Profile updated successfully');
      fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <DashboardNav role="tenant" />

      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard/tenant">
                <button className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-400">Manage your account information</p>
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

          {/* Profile Form */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading profile...</div>
          ) : profile ? (
            <GlassmorphicCard>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-medium">{profile.email}</p>
                    <p className="text-gray-400 text-sm">
                      Role: <span className="capitalize">{profile.role}</span>
                      {profile.isVerified && (
                        <span className="ml-2 text-emerald-400">✓ Verified</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Member since {new Date(profile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center py-4 border-y border-slate-700">
                  <div>
                    <p className="text-2xl font-bold text-white">{profile._count.properties}</p>
                    <p className="text-gray-400 text-sm">Properties</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{profile._count.bookings}</p>
                    <p className="text-gray-400 text-sm">Bookings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{profile._count.reviews}</p>
                    <p className="text-gray-400 text-sm">Reviews</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+254 XXX XXX XXX"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <PremiumButton
                    type="submit"
                    variant="solid"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </PremiumButton>
                </div>
              </form>
            </GlassmorphicCard>
          ) : null}
        </div>
      </div>

      <Footer />
    </main>
  );
}