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
  Video,
  Package,
  UserCog,
  Activity,
  ShieldCheck,
  Cpu,
  History,
  Bell,
  Home,
  X
} from 'lucide-react';
import { Role } from '@/types';
import { Button } from '../ui/button';

interface NavItem {
  i18nKey: string;
  href: string;
  icon: any;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Admin Routes (System & Platform Administration)
  { i18nKey: 'sidebar.overview', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.robot_mgt', href: '/dashboard/admin/fleet', icon: Cpu, roles: ['ADMIN'] },
  { i18nKey: 'wellness.sidebar_label', href: '/dashboard/admin/wellness', icon: Smile, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/admin/settings', icon: Settings, roles: ['ADMIN'] },

  // Manager Routes (Operational Hub)
  { i18nKey: 'sidebar.overview', href: '/dashboard/manager', icon: LayoutDashboard, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.rooms', href: '/dashboard/manager/rooms', icon: Home, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.staff_mgt', href: '/dashboard/manager/users', icon: Users, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.robot_fleet', href: '/dashboard/manager/robots', icon: Bot, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.subscriptions', href: '/dashboard/manager/subscriptions', icon: Package, roles: ['MANAGER'] },
  { i18nKey: 'wellness.sidebar_label', href: '/dashboard/manager/wellness', icon: Smile, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/manager/settings', icon: Settings, roles: ['MANAGER'] },


  // Family / Elderly Routes (from tu2)
  { i18nKey: 'sidebar.overview', href: '/dashboard/family', icon: LayoutDashboard, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/family/elderly', icon: Users, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.reminders', href: '/dashboard/family/reminders', icon: Bell, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.service_plans', href: '/dashboard/family/packages', icon: Package, roles: ['ELDERLY'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['ELDERLY'] },

  // Caregiver Routes
  { i18nKey: 'sidebar.overview', href: '/dashboard/caregiver', icon: LayoutDashboard, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/caregiver/elderly', icon: Users, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.reminders', href: '/dashboard/caregiver/reminders', icon: Bell, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.exercises', href: '/dashboard/caregiver/exercises', icon: Activity, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.robot_fleet', href: '/dashboard/caregiver/robot', icon: Bot, roles: ['CAREGIVER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['CAREGIVER'] },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { t } = useI18nStore();

  const filteredItems = navItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role as Role);
  });

  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out border-r bg-white flex flex-col shadow-sm",
      isCollapsed ? "w-20" : "w-72",
      isMobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
    )}>
      {/* Brand Logo Header */}
      <div className={cn(
        "flex h-20 items-center justify-between px-6 bg-slate-50/50 border-b",
        isCollapsed ? "justify-center px-2" : ""
      )}>
        <Link href="/" className="flex items-center gap-3 group overflow-hidden">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform shrink-0">
            <Bot className="h-6 w-6 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tighter text-slate-900 whitespace-nowrap animate-in fade-in slide-in-from-left-2">
              CAREBOT<span className="text-primary font-light">MH</span>
            </span>
          )}
        </Link>
        {isMobileOpen && (
           <Button variant="ghost" size="icon" onClick={onCloseMobile} className="sm:hidden">
              <X className="h-5 w-5" />
           </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        <nav className="space-y-1.5">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'group flex items-center transition-all duration-200 rounded-xl',
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3 text-sm font-bold',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20 translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                )}
                title={isCollapsed ? t(item.i18nKey) : ""}
              >
                <Icon className={cn('h-5 w-5 transition-transform group-hover:scale-110 shrink-0', 
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary')} />
                
                {!isCollapsed && (
                  <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                    {t(item.i18nKey)}
                  </span>
                )}
                
                {isActive && !isCollapsed && (
                   <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-50" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn("p-4 border-t bg-slate-50/30", isCollapsed ? "flex justify-center" : "")}>
        <button
          onClick={() => logout()}
          className={cn(
            "group flex items-center transition-all duration-200 text-rose-600 rounded-xl",
            isCollapsed ? "p-3" : "w-full gap-3 px-4 py-3 text-sm font-bold hover:bg-rose-50 hover:translate-x-1"
          )}
          title={isCollapsed ? t('sidebar.logout') : ""}
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:scale-110" />
          {!isCollapsed && <span>{t('sidebar.logout')}</span>}
        </button>
      </div>
    </aside>
  );
}
