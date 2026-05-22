'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PremiumButton } from './PremiumButton';
import { BRAND } from '@/lib/constants';

/* ─────────────────────────────────────
   CTA SECTION — Cinematic Scene CTA
   Full-width immersive experience
   with glass landscape + parallax text
───────────────────────────────────── */

const stats = [
  { label: 'Verified Properties', val: '5K+', accent: 'text-cyan-300' },
  { label: 'Happy Tenants',       val: '10K+', accent: 'text-blue-300' },
  { label: 'Trusted Developers',  val: '500+', accent: 'text-emerald-300' },
];

export function CTASection() {
  return (
    <section className="relative py-28 overflow-hidden">
      {/* ─ Atmospheric background ─ */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 gradient-surface-alt" />
        {/* top sweep */}
        <div
          className="absolute top-0 left-0 right-0 h-px
                     bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent"
        />
        {/* radial glowing center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full
                        bg-[radial-gradient(circle,rgba(34,211,238,0.07)_0%,transparent_70%)]
                        pointer-events-none" />

        {/* Nebula orb 1 */}
        <motion.div
          className="absolute top-[10%] right-[15%] w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Nebula orb 2 */}
        <motion.div
          className="absolute bottom-[20%] left-[10%] w-72 h-72 rounded-full bg-violet-500/10 blur-[90px] pointer-events-none"
          animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* ─ LARGE EDITORIAL HEADLINE (asymmetric layout) ── */}
        <motion.div
          initial={{ opacity: 0, y: 52, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-80px 0px' }}
          transition={{ type: 'spring', damping: 22, stiffness: 90 }}
          className="mb-14"
        >
          <div className="flex items-start justify-between gap-8 flex-col md:flex-row">
            {/* Left: big headline */}
            <div className="max-w-3xl">
              <p className="
                text-[10px] uppercase tracking-[0.45em] font-mono
                text-cyan-400/45 mb-6
              ">
                {BRAND.name} — Start Your Journey
              </p>
              <h2 className="
                font-serif font-black tracking-[-0.035em]
                leading-[0.88]
                text-white
                text-[clamp(2.2rem,6vw,5rem)]
              ">
                Ready for a{' '}
                <span className="text-gradient">different</span>
                <br />kind of property search?
              </h2>
            </div>

            {/* Right: short col */}
            <div className="md:max-w-xs md:text-right pt-2">
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                Verified listings. Instant M-Pesa. Zero guesswork.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─ MASTER CTA STRIP ── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px 0px' }}
          transition={{ type: 'spring', damping: 30, stiffness: 100, delay: 0.1 }}
        >
          <div className="glass-strong rounded-3xl border border-cyan-400/10 p-10 md:p-14
                          relative overflow-hidden
                          group
                          shadow-[0_6px_80px_-20px_rgba(0,0,0,0.7)]">

            {/* ─ Diagonal light brush ─ */}
            <div className="
              pointer-events-none absolute inset-0
              bg-gradient-to-br from-cyan-400/[0.03] via-transparent to-violet-400/[0.02]
              opacity-0 group-hover:opacity-100 transition-opacity duration-1000
            " />

            {/* ─ Animated sweep band ─ */}
            <motion.div
              className="
                absolute -top-px left-0 right-0 h-[2px]
                bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent
              "
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">

              {/* ─ Left blurb ─ */}
              <div className="text-center lg:text-left max-w-lg">
                <p className="text-base md:text-lg text-gray-300/90 leading-relaxed font-light mb-1">
                  Join <span className="text-cyan-300 font-medium">{BRAND.name}</span> — the platform
                  redefining how Kenya lives.
                </p>
                <p className="text-sm text-gray-500/80 font-light">
                  M-Pesa payments · Animated 3D listings · AI-powered property matching
                </p>
              </div>

              {/* ─ Right CTAs ─ */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
                <Link href="/marketplace" className="group/btn">
                  <PremiumButton variant="solid" size="lg" className="
                    relative overflow-hidden min-w-[220px] font-semibold
                    shadow-[0_0_28px_-6px_rgba(34,211,238,0.4)]
                    hover:shadow-[0_0_52px_-10px_rgba(34,211,238,0.6)]
                  ">
                    Browse Properties
                    {/* Shine */}
                    <span className="pointer-events-none absolute inset-0
                      bg-gradient-to-r from-transparent via-white/15 to-transparent
                      translate-x-[-120%] group-hover/btn:translate-x-[220%] transition-all duration-700 ease-in-out" />
                  </PremiumButton>
                </Link>
                <Link href="/auth/signup">
                  <PremiumButton variant="outline" size="lg" className="min-w-[200px]">
                    Get Started &rarr;
                  </PremiumButton>
                </Link>
              </div>
            </div>

            {/* ─ Trust stats bar (bottom) ─ */}
            <div className="mt-12 pt-8 border-t border-white/[0.055]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: 'M-Pesa Integrated', icon: '💳' },
                  { label: 'AI Fraud Shield',    icon: '🛡️' },
                  { label: '24/7 Support',      icon: '🏠' },
                  { label: 'Instant Bookings',  icon: '⚡' },
                ].map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      damping: 28,
                      stiffness: 130,
                      delay: i * 0.09,
                    }}
                    className="flex items-center gap-3.5 text-gray-400/80 group cursor-default hover:text-cyan-300/80
                               transition-colors duration-350"
                  >
                    <span className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity">{s.icon}</span>
                    <span className="text-[11px] uppercase tracking-[0.18em] font-mono whitespace-nowrap">
                      {s.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
