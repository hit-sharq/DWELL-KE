'use client';

import { ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAdminUser } from '@/lib/admin';
import { AdminNav } from '@/components/AdminNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userId && !isAdminUser(userId)) {
      router.push('/dashboard/tenant');
    }
  }, [userId, router]);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="flex">
        <div className="flex-1 ml-64">
          {children}
        </div>
      </div>
    </div>
  );
}
