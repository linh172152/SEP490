'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useElderlyStore } from '@/store/useElderlyStore';
import { useI18nStore } from '@/store/useI18nStore';
import { cn } from '@/lib/utils';
import { 
  HeartPulse, 
  LayoutDashboard, 
  Users, 
  Bot, 
  Settings, 
  LogOut,
  Video,
  Bell,
  Package,
  FileText,
  UserCog
} from 'lucide-react';
import { Role } from '@/types';

interface NavItem {
  i18nKey: string;
  href: string;
  icon: any;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Admin Routes
  { i18nKey: 'sidebar.overview', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.robot_fleet', href: '/dashboard/admin/robots', icon: Bot, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.service_plans', href: '/dashboard/admin/service-packages', icon: Package, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/admin/user-packages', icon: UserCog, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.system_logs', href: '/dashboard/admin/system', icon: FileText, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/admin/settings', icon: Settings, roles: ['ADMIN'] },

  // Family / Elderly Routes
  { i18nKey: 'sidebar.overview', href: '/dashboard/family', icon: LayoutDashboard, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/family/elderly', icon: Users, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.reminders', href: '/dashboard/family/reminders', icon: Bell, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.service_plans', href: '/dashboard/family/packages', icon: Package, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['ELDERLY'] }, // Reuse caregiver settings for now

  // Manager / Doctor Routes
  { i18nKey: 'sidebar.overview', href: '/dashboard', icon: LayoutDashboard, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/patients', icon: Users, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/settings', icon: Settings, roles: ['MANAGER'] },

  // Caregiver Routes
  { i18nKey: 'sidebar.overview', href: '/dashboard/caregiver', icon: LayoutDashboard, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/caregiver/patients', icon: Users, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.robot_fleet', href: '/dashboard/caregiver/robot', icon: Bot, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/caregiver/alerts', icon: Bell, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['CAREGIVER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, language } = useI18nStore();
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const activeAlertsCount = useElderlyStore((state: any) => 
    currentUser?.role === 'CAREGIVER' ? state.getActiveAlertsByCaregiver(currentUser.id).length : 0
  );

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
            const isAlerts = item.i18nKey.includes('alerts'); // Using generic condition for alerts if needed
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground',
                    isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  )}
                >
                  <div className="relative">
                    <item.icon className="h-5 w-5" />
                    {isAlerts && activeAlertsCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white ring-2 ring-background">
                        {activeAlertsCount}
                      </span>
                    )}
                  </div>
                  <span className="ml-3">{t(item.i18nKey)}</span>
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
            <span className="ml-3">{t('sidebar.logout')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
