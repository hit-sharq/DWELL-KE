'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSignIn } from '@clerk/nextjs';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { PremiumButton } from '@/components/PremiumButton';
import { AuthScene3D } from '@/components/AuthScene3D';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        router.push('/dashboard/tenant');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background grid grid-cols-1 md:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center px-6 py-12">
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
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-gray-400 mt-2">
              Sign in to your Dwell KE account
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div variants={staggerItem}>
            <GlassmorphicCard>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                    required
                  />
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                </div>

                {/* Submit Button */}
                <PremiumButton
                  variant="solid"
                  size="lg"
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </PremiumButton>
              </form>
            </GlassmorphicCard>
          </motion.div>

          {/* Footer */}
          <motion.div variants={staggerItem} className="text-center mt-8">
            <p className="text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - 3D Scene (hidden on mobile) */}
      <div className="hidden md:block h-screen sticky top-0">
        <AuthScene3D />
      </div>
    </main>
  );
}
