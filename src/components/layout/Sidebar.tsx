'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18nStore } from '@/store/useI18nStore';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
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
  Bell,
  Home,
  FileText,
  HeartPulse,
  X,
} from 'lucide-react';
import { Role } from '@/types';
import { Button } from '../ui/button';

interface NavItem {
  label?: string;
  i18nKey?: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
}

const platformNavItems: NavItem[] = [
  { i18nKey: 'sidebar.overview', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.user_mgt', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.data_security', href: '/dashboard/admin/security', icon: ShieldCheck, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.robot_mgt', href: '/dashboard/admin/fleet', icon: Cpu, roles: ['ADMIN'] },
  { label: 'Wellness Hub', href: '/dashboard/admin/wellness', icon: Smile, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/admin/settings', icon: Settings, roles: ['ADMIN'] },
  { i18nKey: 'sidebar.overview', href: '/dashboard/manager', icon: LayoutDashboard, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.rooms', href: '/dashboard/manager/rooms', icon: Home, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.staff_mgt', href: '/dashboard/manager/users', icon: Users, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.robot_fleet', href: '/dashboard/manager/robots', icon: Bot, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.subscriptions', href: '/dashboard/manager/subscriptions', icon: Package, roles: ['MANAGER'] },
  { label: 'Wellness Hub', href: '/dashboard/manager/wellness', icon: Smile, roles: ['MANAGER'] },
  { i18nKey: 'sidebar.settings', href: '/dashboard/manager/settings', icon: Settings, roles: ['MANAGER'] },
];

const careNavItems: NavItem[] = [
  { label: 'Overview', href: '/dashboard/family', icon: LayoutDashboard, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'My Elderly', href: '/dashboard/family/elderly', icon: HeartPulse, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Health & Activity', href: '/dashboard/family/health-activity', icon: Activity, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Alerts', href: '/dashboard/family/alerts', icon: Bell, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Service Plans', href: '/dashboard/family/packages', icon: Package, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Settings', href: '/dashboard/family/settings', icon: Settings, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Dashboard', href: '/dashboard/caregiver', icon: LayoutDashboard, roles: ['CAREGIVER'] },
  { label: 'Elderly', href: '/dashboard/caregiver/elderly', icon: Users, roles: ['CAREGIVER'] },
  { label: 'Care Tasks', href: '/dashboard/caregiver/care-tasks', icon: Activity, roles: ['CAREGIVER'] },
  { label: 'Robot Interaction', href: '/dashboard/caregiver/robot', icon: Bot, roles: ['CAREGIVER'] },
  { label: 'Alerts', href: '/dashboard/caregiver/alerts', icon: Bell, roles: ['CAREGIVER'] },
  { label: 'Reports', href: '/dashboard/caregiver/reports', icon: FileText, roles: ['CAREGIVER'] },
  { label: 'Settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['CAREGIVER'] },
];

const navItems: NavItem[] = [...platformNavItems, ...careNavItems];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { t } = useI18nStore();

  const getNavLabel = (item: NavItem) => item.label ?? (item.i18nKey ? t(item.i18nKey) : '');

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
            const isRootDashboard = ['/dashboard/admin', '/dashboard/manager', '/dashboard/family', '/dashboard/caregiver'].includes(item.href);
            const isActive = isRootDashboard
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                title={isCollapsed ? getNavLabel(item) : ''}
              >
                <Icon className={cn('h-5 w-5 transition-transform group-hover:scale-110 shrink-0', 
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary')} />
                {!isCollapsed && (
                  <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2">
                    {getNavLabel(item)}
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
