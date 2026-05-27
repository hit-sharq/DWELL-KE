'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserButton } from '@clerk/nextjs';

const adminMenuItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
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

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 28, stiffness: 160 }}
      className="fixed left-0 top-0 bottom-0 w-64 glass-strong border-r border-cyan-400/[0.08] z-50 flex flex-col"
    >
      {/* ─ Header ─ */}
      <Link href="/admin" className="flex items-center gap-3 px-6 py-5 hover:bg-white/[0.03] transition-colors">
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

      {/* ─ Navigation ─ */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {adminMenuItems.map((item) => {
          const active = pathname === item.href
            || (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* ─ Footer: version + user ─ */}
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
    </motion.aside>
  );
}
