'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';

const adminMenuItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Applications', href: '/admin/applications', icon: '📋' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Properties', href: '/admin/properties', icon: '🏠' },
  { label: 'Bookings', href: '/admin/bookings', icon: '📅' },
  { label: 'Payments', href: '/admin/payments', icon: '💳' },
  { label: 'Reports', href: '/admin/reports', icon: '📈' },
  { label: 'News', href: '/admin/news', icon: '📰' },
  { label: 'Blog', href: '/admin/blog', icon: '📝' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  { label: 'Back to System', href: '/', icon: '←' },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <>
      {/* Header */}
      <Link 
        href="/admin" 
        className="flex items-center gap-3 px-6 py-5 hover:bg-white/[0.03] transition-colors"
        onClick={onItemClick}
      >
        <div className="
          w-10 h-10 rounded-xl flex items-center justify-center text-white font-black font-serif text-base
          bg-gradient-to-br from-cyan-400 to-blue-600
          shadow-[0_0_20px_rgba(34,211,238,0.45)]
        ">
          D
        </div>
        <div>
          <div className="font-bold text-white text-sm tracking-tight">Dwell KE</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400/50">Admin</div>
        </div>
        <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {adminMenuItems.map((item) => {
          const active = pathname === item.href
            || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
            >
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer
                  font-medium text-[13px] tracking-wide
                  transition-all duration-250
                  ${active
                    ? 'bg-white/[0.07] text-cyan-200 border border-cyan-400/25 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-white border border-transparent'
                  }
                `}
              >
                {/* Active accent strip */}
                {active && (
                  <motion.div
                    layoutId="admin-accent"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-6 rounded-r-full
                               bg-gradient-to-b from-cyan-400 via-blue-400 to-cyan-400
                               shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                  />
                )}
                <span className="text-lg leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: version + user */}
      <div className="px-4 py-4 border-t border-cyan-400/[0.08]">
        <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-gray-600 mb-3 text-center">
          dwell • ke • admin v1.0
        </div>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-lg shadow-[0_0_12px_rgba(34,211,238,0.3)]',
                fallbackBox: 'w-8 h-8',
              },
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-semibold truncate">Admin</div>
            <div className="text-gray-500 text-[10px] font-mono truncate">Control Panel</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass-strong border-b border-cyan-400/[0.08] z-50 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="
            w-9 h-9 rounded-lg flex items-center justify-center text-white font-black font-serif text-sm
            bg-gradient-to-br from-cyan-400 to-blue-600
            shadow-[0_0_16px_rgba(34,211,238,0.4)]
          ">
            D
          </div>
          <div>
            <div className="font-bold text-white text-sm">Dwell KE</div>
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-cyan-400/50">Admin</div>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 rounded-lg',
              },
            }}
          />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            {/* Slide-in Menu */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-cyan-400/[0.08] z-50 flex flex-col"
            >
              <NavContent onItemClick={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 160 }}
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 glass-strong border-r border-cyan-400/[0.08] z-50 flex-col"
      >
        <NavContent />
      </motion.aside>

      {/* Mobile Spacer - pushes content below the fixed header */}
      <div className="lg:hidden h-16" />
    </>
  );
}
