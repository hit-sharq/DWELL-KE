'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardNavProps {
  role: 'tenant' | 'landlord' | 'admin' | 'hotel';
}

export const DashboardNav: React.FC<DashboardNavProps> = ({ role }) => {
  const pathname = usePathname();

  const navItems = {
    tenant: [
      { label: 'Overview', href: '/dashboard/tenant' },
      { label: 'Bookings', href: '/dashboard/tenant/bookings' },
      { label: 'Favorites', href: '/dashboard/tenant/favorites' },
      { label: 'Messages', href: '/dashboard/tenant/messages' },
      { label: 'Profile', href: '/dashboard/tenant/profile' },
    ],
    landlord: [
      { label: 'Overview', href: '/dashboard/landlord' },
      { label: 'Properties', href: '/dashboard/landlord/properties' },
      { label: 'Bookings', href: '/dashboard/landlord/bookings' },
      { label: 'Earnings', href: '/dashboard/landlord/earnings' },
      { label: 'Analytics', href: '/dashboard/landlord/analytics' },
      { label: 'Settings', href: '/dashboard/landlord/settings' },
    ],
    admin: [
      { label: 'Overview', href: '/dashboard/admin' },
      { label: 'Users', href: '/dashboard/admin/users' },
      { label: 'Properties', href: '/dashboard/admin/properties' },
      { label: 'Analytics', href: '/dashboard/admin/analytics' },
      { label: 'Fraud Detection', href: '/dashboard/admin/fraud' },
    ],
    hotel: [
      { label: 'Overview', href: '/dashboard/hotel' },
      { label: 'Rooms', href: '/dashboard/hotel/properties' },
      { label: 'Bookings', href: '/dashboard/hotel/bookings' },
      { label: 'Earnings', href: '/dashboard/hotel/earnings' },
      { label: 'Analytics', href: '/dashboard/hotel/analytics' },
      { label: 'Settings', href: '/dashboard/hotel/settings' },
    ],
  };

  return (
    <nav className="glass border-b border-slate-700/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 py-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
              D
            </div>
            <span className="font-bold text-white hidden sm:inline">Dwell KE</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems[role].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ color: '#22D3EE' }}
                    className={cn(
                      'text-sm font-medium transition-colors duration-200 pb-4',
                      isActive
                        ? 'text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-gray-400 hover:text-cyan-400'
                    )}
                  >
                    {item.label}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Logout
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
