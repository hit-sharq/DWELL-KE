import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { isAdminUser } from '@/lib/admin';
import { AdminNav } from '@/components/AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/auth/login');

  if (!isAdminUser(userId)) redirect('/dashboard/tenant');

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <main className="ml-0 lg:ml-64 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
