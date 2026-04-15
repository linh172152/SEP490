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
  FileText,
  HeartPulse
} from 'lucide-react';
import { Role } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: Role[];
}

const navItems: NavItem[] = [
  // Admin Routes (System & Platform Administration)
  { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { label: 'User Management', href: '/dashboard/admin/users', icon: Users, roles: ['ADMIN'] },
  { label: 'Data Security', href: '/dashboard/admin/security', icon: ShieldCheck, roles: ['ADMIN'] },
  { label: 'Robot Management', href: '/dashboard/admin/fleet', icon: Cpu, roles: ['ADMIN'] },
  { label: 'Wellness Hub', href: '/dashboard/admin/wellness', icon: Smile, roles: ['ADMIN'] },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings, roles: ['ADMIN'] },

  // Manager Routes (Operational Hub)
  { label: 'Overview', href: '/dashboard/manager', icon: LayoutDashboard, roles: ['MANAGER'] },
  { label: 'Room Management', href: '/dashboard/manager/rooms', icon: Home, roles: ['MANAGER'] },
  { label: 'Staff Management', href: '/dashboard/manager/users', icon: Users, roles: ['MANAGER'] },
  { label: 'Robot Fleet', href: '/dashboard/manager/robots', icon: Bot, roles: ['MANAGER'] },
  { label: 'Subscriptions', href: '/dashboard/manager/subscriptions', icon: Package, roles: ['MANAGER'] },
  { label: 'Wellness Hub', href: '/dashboard/manager/wellness', icon: Smile, roles: ['MANAGER'] },
  { label: 'Settings', href: '/dashboard/manager/settings', icon: Settings, roles: ['MANAGER'] },


  // Family / Elderly Routes (from tu2)
  { label: 'Overview', href: '/dashboard/family', icon: LayoutDashboard, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'My Elderly', href: '/dashboard/family/elderly', icon: HeartPulse, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Health & Activity', href: '/dashboard/family/health-activity', icon: Activity, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Alerts', href: '/dashboard/family/alerts', icon: Bell, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Service Plans', href: '/dashboard/family/packages', icon: Package, roles: ['ELDERLY', 'FAMILYMEMBER'] },
  { label: 'Settings', href: '/dashboard/family/settings', icon: Settings, roles: ['ELDERLY', 'FAMILYMEMBER'] },

  // Caregiver Routes
  { label: 'Dashboard', href: '/dashboard/caregiver', icon: LayoutDashboard, roles: ['CAREGIVER'] },
  { label: 'Elderly', href: '/dashboard/caregiver/elderly', icon: Users, roles: ['CAREGIVER'] },
  { label: 'Care Tasks', href: '/dashboard/caregiver/care-tasks', icon: Activity, roles: ['CAREGIVER'] },
  { label: 'Robot Interaction', href: '/dashboard/caregiver/robot', icon: Bot, roles: ['CAREGIVER'] },
  { label: 'Alerts', href: '/dashboard/caregiver/alerts', icon: Bell, roles: ['CAREGIVER'] },
  { label: 'Reports', href: '/dashboard/caregiver/reports', icon: FileText, roles: ['CAREGIVER'] },
  { label: 'Settings', href: '/dashboard/caregiver/settings', icon: Settings, roles: ['CAREGIVER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  useI18nStore();

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
            const isRootDashboard = ['/dashboard/admin', '/dashboard/manager', '/dashboard/family', '/dashboard/caregiver'].includes(item.href);
            const isActive = isRootDashboard
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                {item.label}
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
          Log Out
        </button>
      </div>
    </aside>
  );
}
