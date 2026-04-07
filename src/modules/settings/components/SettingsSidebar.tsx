import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RoleCapabilities } from '../types';
import { useI18nStore } from '@/store/useI18nStore';
import { 
    User, 
    BellRing, 
    SlidersHorizontal, 
    ShieldCheck, 
    Activity, 
    LockKeyhole, 
    DownloadCloud, 
    ScrollText 
} from 'lucide-react';

interface SettingsSidebarProps extends React.HTMLAttributes<HTMLElement> {
  activeTab: string;
  onTabChange: (tab: string) => void;
  capabilities: RoleCapabilities;
}

export function SettingsSidebar({ className, activeTab, onTabChange, capabilities, ...props }: SettingsSidebarProps) {
  const { t, language } = useI18nStore();

  const navItems = [
    { titleKey: 'settings.sidebar.profile', id: 'profile', icon: User, show: true },
    { titleKey: 'settings.sidebar.notifications', id: 'notifications', icon: BellRing, show: capabilities.canAccessNotifications },
    { titleKey: 'settings.sidebar.preferences', id: 'preferences', icon: SlidersHorizontal, show: true },
    { titleKey: 'settings.sidebar.security', id: 'security', icon: ShieldCheck, show: true },
    { titleKey: 'settings.sidebar.risk_management', id: 'risk', icon: Activity, show: capabilities.canEditRiskThreshold },
    { titleKey: 'settings.sidebar.role_access', id: 'role', icon: LockKeyhole, show: capabilities.canAccessRoleAccess },
    { titleKey: 'settings.sidebar.data_export', id: 'data', icon: DownloadCloud, show: capabilities.canAccessDataExport },
    { titleKey: 'settings.sidebar.audit_logs', id: 'audit', icon: ScrollText, show: capabilities.canAccessAuditLogs },
  ];

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 sticky min-w-[240px]',
        className
      )}
      {...props}
    >
      {navItems.filter(item => item.show).map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? 'secondary' : 'ghost'}
          className={cn(
            'justify-start font-medium',
            activeTab === item.id 
              ? 'bg-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800'
              : 'hover:bg-transparent hover:underline text-muted-foreground'
          )}
          onClick={() => onTabChange(item.id)}
        >
          <item.icon className="mr-2 h-4 w-4 shrink-0" />
          {t(item.titleKey)}
        </Button>
      ))}
    </nav>
  );
}
