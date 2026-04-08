'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { RoleType } from './types';
import { useSettings } from './hooks/useSettings';
import { useI18nStore } from '@/store/useI18nStore';
import { SettingsSidebar } from './components/SettingsSidebar';
import { ProfileSection } from './sections/ProfileSection';
import { NotificationSection } from './sections/NotificationSection';
import { PreferenceSection } from './sections/PreferenceSection';
import { SecuritySection } from './sections/SecuritySection';
import { RiskManagementSection } from './sections/RiskManagementSection';
import { RoleAccessSection } from './sections/RoleAccessSection';
import { DataExportSection } from './sections/DataExportSection';
import { AuditLogSection } from './sections/AuditLogSection';
import { Loader2 } from 'lucide-react';

interface SettingsModuleProps {
  role: RoleType;
}

export function SettingsModule({ role }: SettingsModuleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const { 
    isLoading, 
    isSaving, 
    settings, 
    capabilities, 
    auditLogs,
    updateProfile,
    updateNotifications,
    updatePreferences,
    updateSecurity,
    updateRiskManagement,
    revokeSession,
    fetchAuditLogs
  } = useSettings(role);

  const defaultTab = searchParams.get('section') || 'profile';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sync state with URL manually allowing deep linking
  useEffect(() => {
    if (activeTab !== defaultTab) {
       router.replace(`${pathname}?section=${activeTab}`, { scroll: false });
    }
  }, [activeTab, pathname, router, defaultTab]);

  useEffect(() => {
    if (activeTab === 'audit' && capabilities.canAccessAuditLogs) {
       fetchAuditLogs();
    }
  }, [activeTab, fetchAuditLogs, capabilities]);

  const { t, language } = useI18nStore();

  if (isLoading || !settings) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading enterprise configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 block">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">{t('settings.workspace_title')}</h2>
        <p className="text-muted-foreground">
          {t('settings.workspace_desc')}
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          <SettingsSidebar 
             capabilities={capabilities} 
             activeTab={activeTab} 
             onTabChange={setActiveTab} 
          />
        </aside>
        
        <div className="flex-1 lg:max-w-4xl min-h-[500px]">
          {activeTab === 'profile' && 
             <ProfileSection settings={settings} capabilities={capabilities} updateProfile={updateProfile} isSaving={isSaving} />
          }
          {activeTab === 'notifications' && capabilities.canAccessNotifications && 
             <NotificationSection settings={settings} updateNotifications={updateNotifications} isSaving={isSaving} />
          }
          {activeTab === 'preferences' && 
             <PreferenceSection settings={settings} updatePreferences={updatePreferences} isSaving={isSaving} />
          }
          {activeTab === 'security' && 
             <SecuritySection settings={settings} capabilities={capabilities} updateSecurity={updateSecurity} revokeSession={revokeSession} isSaving={isSaving} />
          }
          {activeTab === 'risk' && 
             <RiskManagementSection settings={settings} capabilities={capabilities} updateRiskManagement={updateRiskManagement} isSaving={isSaving} />
          }
          {activeTab === 'role' && 
             <RoleAccessSection capabilities={capabilities} />
          }
          {activeTab === 'data' && capabilities.canAccessDataExport && 
             <DataExportSection />
          }
          {activeTab === 'audit' && capabilities.canAccessAuditLogs && 
             <AuditLogSection capabilities={capabilities} auditLogs={auditLogs} />
          }
        </div>
      </div>
    </div>
  );
}
