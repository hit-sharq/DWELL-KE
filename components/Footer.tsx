'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BRAND, NAV_LINKS } from '@/lib/constants';

/* ─────────────────────────────────────
   FOOTER — Editorial Luxury Footer
   Cinematic column layout
───────────────────────────────────── */

const footerCols = [
  {
    title: 'Product',
    links: [
      { label: 'Properties', href: '/marketplace' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Landlord Portal', href: '/dashboard/landlord' },
      { label: 'Tenant App', href: '/dashboard/tenant' },
      { label: 'AI Tools', href: '/ai-tools' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Dwell KE', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'News', href: '/news' },
      { label: 'Help Centre', href: '/help' },
      { label: 'Safety Guide', href: '/safety' },
      { label: 'Property Guide', href: '/guide' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Licences', href: '/licenses' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* ─ Atmospheric top sweep ─ */}
      <div className="
        h-px
        bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent
      " />

      <div
        className="
          relative
          pt-20 pb-10
          radial-gradient: from-[rgba(34,211,238,0.025)] at 8% 50%,
                      radial-gradient: from-[rgba(139,92,246,0.02)] at 92% 70%
        "
        style={{
          background: `
            radial-gradient(ellipse 50% 70% at 8%  50%, rgba(34,211,238,0.025) 0%, transparent 70%),
            radial-gradient(ellipse 50% 70% at 92% 70%, rgba(139,92,246,0.02) 0%, transparent 70%),
            var(--bg-obsidian)
          `,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">

          {/* ─ Brand masthead ─ */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px 0px' }}
            transition={{ type: 'spring', damping: 24, stiffness: 100 }}
            className="mb-20"
          >
            <div className="
              glass-strong rounded-3xl p-10 md:p-14
              border border-cyan-400/8
              relative overflow-hidden
            ">
              {/* ─ Subtle grid overlay ─ */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.025]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(34,211,238,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.6) 1px,transparent 1px)',
                  backgroundSize: '60px 60px',
                }}
              />

              <div className="relative z-10 flex items-start justify-between gap-10 flex-col md:flex-row">
                <div className="max-w-md">
                  <h3 className="font-serif font-black tracking-tight text-white text-3xl md:text-4xl mb-4">
                    {BRAND.name}
                  </h3>
                  <p className="text-gray-400 font-light text-sm leading-relaxed max-w-xs">
                    {BRAND.description}
                  </p>
                </div>
                <p className="text-[9px] uppercase tracking-[0.35em] font-mono text-gray-600/60 pt-1 md:text-right">
                  &copy; {new Date().getFullYear()} {BRAND.name}<br />
                  All rights reserved &mdash; Nairobi, Kenya
                </p>
              </div>
            </div>
          </motion.div>

          {/* ─ Columns grid ─ */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            {/* Brand col — share of 5 */}
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              <h4 className="font-serif font-bold text-white text-xl mb-5 tracking-tight">
                {BRAND.name}
              </h4>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-[260px]">
                Verified properties, secure M-Pesa payments, and trusted landlord
                partnerships — all in one place.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map((s) => (
                  <Link
                    key={s}
                    href="#"
                    className="
                      text-[10px] uppercase tracking-[0.2em] font-mono
                      text-gray-500 no-underline
                      px-3 py-2 rounded-lg border border-white/[0.06]
                      hover:border-cyan-400/20 hover:text-cyan-300
                      transition-all duration-300
                    "
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

{/* Link columns */}
            {footerCols.map((col) => (
              <div key={col.title}>
                <p className="text-[9px] uppercase tracking-[0.3em] font-mono mb-5 text-cyan-400/40">
                  {col.title}
                </p>
                <ul className="space-y-3">
                  {col.links.map((link: any) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 no-underline hover:text-gray-200 transition-colors duration-250"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ─ Bottom bar ─ */}
          <div className="h-px bg-white/[0.04] mb-6" />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-gray-600/50">
              &copy; {new Date().getFullYear()} {BRAND.name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-gray-600/40">
              Crafted with &gt; precision in Kenya
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
