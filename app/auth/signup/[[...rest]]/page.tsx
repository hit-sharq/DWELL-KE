'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import { LuxuryCity3D } from '@/components/LuxuryCity3D';
import { motion } from 'framer-motion';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-stretch">
      <div className="flex-1 flex items-center justify-center px-6 py-14">
        <motion.div
          key="signup"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          <Link href="/" className="inline-block mb-8">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg
                            bg-gradient-to-br from-cyan-400 to-blue-600
                            shadow-[0_0_22px_-4px_rgba(34,211,238,0.55)]"
            >
              D
            </div>
          </Link>

          <h1 className="font-serif font-black text-3xl text-white tracking-tight mb-2">
            Create your account
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Start as a tenant. You can apply to become a landlord later.
          </p>

          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  'w-full px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold ' +
                  'shadow-[0_0_22px_-4px_rgba(34,211,238,0.45)] hover:shadow-[0_0_44px_-6px_rgba(34,211,238,0.65)] ' +
                  'transition-all hover:-translate-y-0.5',
                formFieldLabel: 'text-xs font-semibold text-gray-300 mb-1.5 block uppercase tracking-wider',
                formFieldInput:
                  'w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-white ' +
                  'placeholder-gray-600 focus:outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20 transition-all',
                footerActionLink: 'text-cyan-400 hover:text-cyan-300 font-semibold no-underline text-sm',
                socialButtonsIconButton:
                  'rounded-xl border border-slate-700/60 bg-slate-900/60 hover:border-cyan-400/30 ' +
                  'hover:bg-slate-800 text-white transition-all',
                socialButtonsBlockButton:
                  'rounded-xl border border-slate-700/60 bg-slate-900/60 hover:border-cyan-400/30 ' +
                  'hover:bg-slate-800 text-white transition-all text-sm',
                identityPreviewText: 'text-sm text-gray-300',
                identityPreviewEditButton: 'text-cyan-400 hover:text-cyan-300 text-xs',
              },
              layout: {
                socialButtonsPlacement: 'bottom',
                showFooter: false,
              },
            }}
            fallbackRedirectUrl={`/auth/verify`}
          />
        </motion.div>
      </div>

      <div className="hidden md:block relative flex-1">
        <LuxuryCity3D />
        <motion.div
          className="absolute bottom-10 left-10 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <p className="text-cyan-300/70 text-[10px] uppercase tracking-[0.4em] font-mono leading-relaxed">Dwell KE</p>
          <p className="text-white/50 text-[9px] uppercase tracking-[0.25em] font-mono mt-1">Smart Property Kenya</p>
        </motion.div>
      </div>
    </main>
  );
}
