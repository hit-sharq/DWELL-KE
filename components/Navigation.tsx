'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser, useClerk } from '@clerk/nextjs';
import { PremiumButton } from './PremiumButton';
import { NAV_LINKS, BRAND } from '@/lib/constants';
import { isAdminUser } from '@/lib/admin';

export const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const adminStatus = user ? isAdminUser(user.id) : false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glassmorphic-dark backdrop-blur-xl'
          : 'bg-gradient-to-b from-slate-900/50 to-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
                D
              </div>
              <span className="font-bold text-lg text-white hidden sm:inline">
                {BRAND.name}
              </span>
            </motion.div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            {isLoaded && user ? (
              <>
                {adminStatus && (
                  <Link href="/admin">
                    <PremiumButton variant="outline" size="sm">
                      Admin Panel
                    </PremiumButton>
                  </Link>
                )}
                <Link href="/dashboard/tenant">
                  <PremiumButton variant="outline" size="sm">
                    Dashboard
                  </PremiumButton>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-cyan-400 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <PremiumButton variant="outline" size="sm">
                    Sign In
                  </PremiumButton>
                </Link>
                <Link href="/auth/signup">
                  <PremiumButton variant="solid" size="sm">
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
};
