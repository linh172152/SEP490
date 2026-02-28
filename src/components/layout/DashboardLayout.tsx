'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { socketService } from '@/services/socket';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If no user, redirect to login
    if (!currentUser && !pathname.includes('/login')) {
      router.push('/login');
    }
  }, [currentUser, router, pathname]);

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
