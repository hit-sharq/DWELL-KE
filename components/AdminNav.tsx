'use client';

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
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border overflow-y-auto"
    >
      <div className="p-6 sticky top-0 bg-card border-b border-border">
        <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
            D
          </div>
          <div>
            <div className="font-bold text-white">Dwell Admin</div>
            <div className="text-xs text-gray-400">Control Panel</div>
          </div>
        </Link>
      </div>

      <nav className="p-4 space-y-2">
        {adminMenuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              pathname === item.href
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:bg-slate-900/50 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {pathname === item.href && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto w-2 h-2 rounded-full bg-blue-400"
              />
            )}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10',
            },
          }}
        />
      </div>
    </motion.div>
  );
}
