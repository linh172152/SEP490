'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { 
  HeartPulse, 
  LayoutDashboard, 
  Users, 
  Bot, 
  Activity, 
  Settings, 
  LogOut,
  Video,
  Bell
} from 'lucide-react';
import { Role } from '@/types';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Standard routes for other system roles
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DOCTOR', 'FAMILY'] },
  { title: 'Patients', href: '/dashboard/patients', icon: Users, roles: ['DOCTOR'] },
  { title: 'Robots', href: '/dashboard/robots', icon: Bot, roles: ['ADMIN'] },
  { title: 'System Stats', href: '/dashboard/stats', icon: Activity, roles: ['ADMIN'] },
  { title: 'Video Call', href: '/dashboard/call', icon: Video, roles: ['FAMILY'] },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN', 'DOCTOR', 'FAMILY'] },

  // Role 1 Full Feature Demo (CAREGIVER) Routes
  { title: 'Overview', href: '/dashboard/caregiver', icon: LayoutDashboard, roles: ['CAREGIVER'] },
  { title: 'Patients', href: '/dashboard/caregiver/patients', icon: Users, roles: ['CAREGIVER'] },
  { title: 'Robot', href: '/dashboard/caregiver/robot', icon: Bot, roles: ['CAREGIVER'] },
  { title: 'Alerts', href: '/dashboard/caregiver/alerts', icon: Bell, roles: ['CAREGIVER'] },
  { title: 'Settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['CAREGIVER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!currentUser) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background pt-16">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4">
        <div className="mb-6 flex items-center px-3">
          <HeartPulse className="mr-2 h-6 w-6 text-primary" />
          <span className="text-lg font-semibold tracking-tight">CareBot-MH</span>
        </div>
        <ul className="space-y-2 font-medium">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto">
          <button 
            className="flex w-full items-center rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-3">Log out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
