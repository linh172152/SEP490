'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { socketService } from '@/services/socket';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // If no user, redirect to login
    if (!currentUser && !pathname.includes('/login')) {
      router.push('/login');
    } else if (currentUser) {
      // Client-side role guard
      if (pathname.startsWith('/dashboard/admin') && currentUser.role !== 'ADMIN') {
          router.push('/unauthorized');
      } else if (pathname.startsWith('/dashboard/doctor') && currentUser.role !== 'DOCTOR') {
          router.push('/unauthorized');
      } else if (pathname.startsWith('/dashboard/caregiver') && currentUser.role !== 'CAREGIVER') {
          router.push('/unauthorized');
      } else if (pathname.startsWith('/dashboard/family') && currentUser.role !== 'FAMILY') {
          router.push('/unauthorized');
      }
    }
  }, [currentUser, router, pathname, isMounted]);

  useEffect(() => {
    if (currentUser) {
      socketService.connect();
    }
    return () => {
      socketService.disconnect();
    };
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <Topbar />
      <Sidebar />
      <div className="p-4 sm:ml-64 sm:pt-20">
        <main className="mx-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
