'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18nStore } from '@/store/useI18nStore';
import { cn } from '@/lib/utils';
import { 
  Smile, 
  LayoutDashboard, 
  Users, 
  Bot, 
  Settings, 
  LogOut,
  Package,
  UserCog,
  Activity,
  ShieldCheck,
  Cpu,
  History,
  Bell,
  type LucideIcon
} from 'lucide-react';
import { Role } from '@/types';

interface NavItem {
  i18nKey: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Admin Routes (System & Platform Administration)
  { i18nKey: 'sidebar.overview', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.service_plans', href: '/dashboard/admin/service-packages', icon: Package, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.data_security', href: '/dashboard/admin/security', icon: ShieldCheck, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.robot_mgt', href: '/dashboard/admin/fleet', icon: Cpu, roles: ['ADMIN'] },
  { i18nKey: 'wellness.sidebar_label', href: '/dashboard/admin/wellness', icon: Smile, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/admin/settings', icon: Settings, roles: ['ADMIN'] },

  // Manager Routes (from main)
  { i18nKey: 'sidebar.overview', href: '/dashboard/manager', icon: LayoutDashboard, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.staff_mgt', href: '/dashboard/manager/staff', icon: Users, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.robot_fleet', href: '/dashboard/manager/robots', icon: Bot, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.service_plans', href: '/dashboard/manager/service-packages', icon: Package, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/manager/user-packages', icon: UserCog, roles: ['MANAGER'] },
  { i18nKey: 'wellness.sidebar_label', href: '/dashboard/manager/wellness', icon: Smile, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.ops_insights', href: '/dashboard/manager/analytics', icon: Activity, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/manager/settings', icon: Settings, roles: ['MANAGER'] },

  // Family / Elderly Routes (from tu2)
  { i18nKey: 'sidebar.overview', href: '/dashboard/family', icon: LayoutDashboard, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/family/elderly', icon: Users, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { i18nKey: 'sidebar.reminders', href: '/dashboard/family/reminders', icon: Bell, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { i18nKey: 'sidebar.exercises', href: '/dashboard/family/exercises', icon: Activity, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { i18nKey: 'sidebar.service_plans', href: '/dashboard/family/packages', icon: Package, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['ELDERLY', 'FAMILYMEMBER'] },

  // Caregiver Routes
  { i18nKey: 'sidebar.overview', href: '/dashboard/caregiver', icon: LayoutDashboard, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/caregiver/elderly', icon: Users, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.reminders', href: '/dashboard/caregiver/reminders', icon: Bell, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.exercises', href: '/dashboard/caregiver/exercises', icon: Activity, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.robot_fleet', href: '/dashboard/caregiver/robot', icon: Bot, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['CAREGIVER'] },

  // Common routes
  { i18nKey: 'sidebar.audit_logs', href: '/dashboard/logs', icon: History, roles: ['ADMIN', 'MANAGER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { t } = useI18nStore();

  const filteredItems = navItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role as Role);
  });

  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r bg-white flex flex-col shadow-sm">
      <div className="flex h-20 items-center border-b px-8 bg-slate-50/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900">
            CAREBOT<span className="text-primary font-light">MH</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        <nav className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200',
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                )}
              >
                <Icon className={cn('h-5 w-5 transition-transform group-hover:scale-110', 
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary')} />
                {t(item.i18nKey)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t bg-slate-50/30">
        <button
          onClick={() => logout()}
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 transition-all duration-200 hover:bg-rose-50 hover:translate-x-1"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
          {t('sidebar.logout')}
        </button>
      </div>
    </aside>
  );
}
