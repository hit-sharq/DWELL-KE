'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSignUp } from '@clerk/nextjs';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { AuthScene3D } from '@/components/AuthScene3D';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';

export default function SignupPage() {
  const [step, setStep] = useState<'role' | 'form' | 'verify'>('role');
  const [role, setRole] = useState<'tenant' | 'landlord' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();

  const handleRoleSelect = (selectedRole: 'tenant' | 'landlord') => {
    setRole(selectedRole);
    setStep('form');
    setError('');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp || !role) return;

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        firstName: formData.fullName.split(' ')[0],
        lastName: formData.fullName.split(' ').slice(1).join(' '),
        unsafeMetadata: {
          role,
        },
      });

      setStep('verify');
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-background grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-md"
        >
          {/* Header */}
          <motion.div variants={staggerItem} className="mb-8">
            <Link href="/" className="inline-block mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
                D
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white">
              {step === 'role'
                ? 'Choose Your Role'
                : step === 'form'
                ? 'Create Account'
                : 'Verify Email'}
            </h1>
            <p className="text-gray-400 mt-2">
              {step === 'role'
                ? 'Are you a tenant or landlord?'
                : step === 'form'
                ? `Sign up as a ${role}`
                : 'Check your email for verification code'}
            </p>
          </motion.div>

          {/* Role Selection Step */}
          {step === 'role' && (
            <motion.div variants={staggerItem} className="space-y-4">
              <button
                onClick={() => handleRoleSelect('tenant')}
                className="w-full p-6 rounded-lg border-2 border-slate-700 hover:border-blue-500 bg-slate-900 hover:bg-slate-800 transition-all text-left group"
              >
                <div className="text-2xl mb-2">🏠</div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                  Tenant
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  Looking for a place to stay
                </p>
              </button>
              <button
                onClick={() => handleRoleSelect('landlord')}
                className="w-full p-6 rounded-lg border-2 border-slate-700 hover:border-cyan-500 bg-slate-900 hover:bg-slate-800 transition-all text-left group"
              >
                <div className="text-2xl mb-2">🏢</div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Landlord
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  List your properties for rent
                </p>
              </button>
            </motion.div>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <motion.div
              variants={staggerItem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassmorphicCard>
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                      required
                    />
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-blue-500 mt-1"
                      required
                    />
                    <span className="text-sm text-gray-400">
                      I agree to the{' '}
                      <Link
                        href="#"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="#"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>

                  {/* Submit Button */}
                  <PremiumButton
                    variant="solid"
                    size="lg"
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </PremiumButton>
                </form>
              </GlassmorphicCard>

              <motion.button
                onClick={() => {
                  setStep('role');
                  setRole(null);
                  setError('');
                }}
                className="w-full mt-4 text-center text-gray-400 hover:text-white transition-colors"
              >
                Back
              </motion.button>
            </motion.div>
          )}

          {/* Footer */}
          {step !== 'verify' && (
            <motion.div variants={staggerItem} className="text-center mt-8">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Side - 3D Scene (hidden on mobile) */}
      <div className="hidden md:block h-screen sticky top-0">
        <AuthScene3D />
      </div>
    </main>
  );
}
