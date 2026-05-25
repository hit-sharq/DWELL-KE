'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useUser, useClerk } from '@clerk/nextjs';
import { PremiumButton } from './PremiumButton';
import { NAV_LINKS, BRAND } from '@/lib/constants';
import { isAdminUser } from '@/lib/admin';

/* ─────────────────────────────────────
   NAVIGATION — Floating Luxury Glass Bar
   Cinematic glass morphism, never cheap
 ───────────────────────────────────── */

const navSpring = { damping: 18, stiffness: 260 };

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userRole, setUserRole] = useState<'tenant' | 'landlord' | null>(null);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const adminStatus = user ? isAdminUser(user.id) : false;
  const mx = useMotionValue(0.5);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    const onMove  = (e: MouseEvent) =>
      mx.set(Math.min(1, Math.max(0, (e.clientX / window.innerWidth))));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMove);
    };
  }, [mx]);

  useEffect(() => {
    if (!isLoaded || !user) {
      setUserRole(null);
      return;
    }

    const fetchRole = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
        }
      } catch {
        setUserRole('tenant');
      }
    };
    fetchRole();
  }, [isLoaded, user]);

  const isLandlord = userRole === 'landlord';

  const accentH = useTransform(mx, [0, 1], [185, 220]);
  const accent   = useTransform(
    accentH,
    (h) => `hsl(${h}, 88%, 58%)`
  );

  const baseBg = isScrolled
    ? 'rgba(4,8,18,0.78)'
    : 'rgba(4,8,18,0.22)';

  return (
    <motion.nav
      role="navigation"
      aria-label="Primary navigation"
      initial={{ y: -120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 130, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-[100]"
    >
      <div
        className="absolute inset-0 -z-10 rounded-b-2xl transition-all duration-500"
        style={{
          background: baseBg,
          backdropFilter: isScrolled
            ? 'blur(28px) saturate(200%)'
            : 'blur(12px) saturate(160%)',
          WebkitBackdropFilter: isScrolled
            ? 'blur(28px) saturate(200%)'
            : 'blur(12px) saturate(160%)',
          borderBottom: `1px solid ${isScrolled ? 'rgba(34,211,238,0.08)' : 'rgba(34,211,238,0.04)'}`,
          boxShadow: isScrolled
            ? '0 20px 60px -12px rgba(0,0,0,0.8), 0 4px 20px -8px rgba(34,211,238,0.06)'
            : '0 -8px 32px -8px rgba(0,0,0,0.5)',
        }}
      />

      <motion.div
        className="pointer-events-none absolute inset-x-0 -top-[1px] h-px"
        style={{
          background: `linear-gradient(90deg,
            transparent  0%,
            ${accent as any as string} 40%,
            rgba(16,185,129,0.6) 60%,
            transparent 100%
          )`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3.5">
        <div className="flex items-center justify-between">

          <Link href="/" className="group flex items-center gap-2.5 no-underline">
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm
                         bg-gradient-to-br from-cyan-400 to-blue-600
                         shadow-[0_0_18px_-4px_rgba(34,211,238,0.6)]
                         group-hover:shadow-[0_0_30px_-4px_rgba(34,211,238,0.85)]
                         transition-shadow duration-400"
            >
              D
            </motion.div>
            <span className="font-serif font-bold text-base text-white/90 group-hover:text-white transition-colors hidden sm:inline">
              {BRAND.name}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="
                  relative text-[11px] uppercase tracking-[0.22em] font-mono
                  text-gray-400/80 hover:text-cyan-300 no-underline
                  py-1 transition-colors duration-250
                "
              >
                <span className="transition-colors duration-250">{link.label}</span>
                <motion.span
                  className="absolute -bottom-0.5 left-0 h-px bg-cyan-400/60"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ transformOrigin: 'left' }}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {isLoaded && user ? (
              <>
                {adminStatus && (
                  <Link href="/admin">
                    <PremiumButton variant="ghost" size="sm">
                      Admin
                    </PremiumButton>
                  </Link>
                )}
                <Link href={isLandlord ? '/dashboard/landlord' : '/dashboard/tenant'}>
                  <PremiumButton variant="ghost" size="sm">
                    Dashboard
                  </PremiumButton>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="
                    px-4 py-2 text-[11px] uppercase tracking-[0.18em] font-mono
                    text-gray-500/70 hover:text-cyan-300/90 no-underline
                    border border-transparent hover:border-cyan-400/15 rounded-lg
                    transition-all duration-300
                  "
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <PremiumButton variant="ghost" size="sm">
                    Sign In
                  </PremiumButton>
                </Link>
                <Link href="/auth/signup">
                  <PremiumButton variant="solid" size="sm" className="
                    bg-gradient-to-r from-cyan-500/90 to-blue-500/90
                    hover:from-cyan-400/90 hover:to-blue-400/90
                    shadow-[0_0_18px_-4px_rgba(34,211,238,0.45)]
                  ">
                    Get Started
                  </PremiumButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
