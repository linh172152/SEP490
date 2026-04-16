'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { socketService } from '@/services/socket';
import { useAlertSimulation } from '@/hooks/useAlertSimulation';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((state) => state.user);
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  
  // Sidebar states
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Activate alert simulation
  useAlertSimulation();

  useEffect(() => {
    setIsMounted(true);
    // Initialize collapsed state from local storage if needed
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // If no user, redirect to login
    if (!currentUser && !pathname.includes('/login')) {
      router.push('/login');
    } else if (currentUser) {
      // Client-side role guard
      if (pathname.startsWith('/dashboard/admin') && !currentUser.role?.toLowerCase().includes('admin')) {
          router.push('/unauthorized');
      } else if (pathname.startsWith('/dashboard/manager') && !currentUser.role?.toLowerCase().includes('manager')) {
          router.push('/unauthorized');
      } else if (pathname.startsWith('/dashboard/caregiver') && !currentUser.role?.toLowerCase().includes('caregiver')) {
          router.push('/unauthorized');
      } else if (pathname.startsWith('/dashboard/elderly') && !currentUser.role?.toLowerCase().includes('elderly')) {
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

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <Topbar onMenuClick={toggleMobileMenu} onSidebarToggle={toggleSidebar} isSidebarCollapsed={isCollapsed} />
      <Sidebar 
        isCollapsed={isCollapsed} 
        isMobileOpen={isMobileOpen} 
        onCloseMobile={() => setIsMobileOpen(false)} 
      />
      <div className={cn(
        "p-4 pt-20 transition-all duration-300 ease-in-out",
        isCollapsed ? "sm:ml-20" : "sm:ml-72"
      )}>
        <main className="mx-auto max-w-7xl">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm sm:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
