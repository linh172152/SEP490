'use client';

import { SettingsData } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BellRing, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationSectionProps {
  settings: SettingsData;
  updateNotifications: (data: Partial<SettingsData['notifications']>) => Promise<void>;
  isSaving: boolean;
}

export function NotificationSection({ settings, updateNotifications, isSaving }: NotificationSectionProps) {
  
  const handleToggle = (
    category: keyof SettingsData['notifications'], 
    channel: keyof SettingsData['notifications']['criticalRisk'], 
    currentValue: boolean
  ) => {
    updateNotifications({
      [category]: {
        ...settings.notifications[category],
        [channel]: !currentValue
      }
    });
  };

  const NotificationRow = ({ 
    title, 
    description, 
    categoryKey 
  }: { 
    title: string; 
    description: string; 
    categoryKey: keyof SettingsData['notifications'] 
  }) => {
    const prefs = settings.notifications[categoryKey];
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 rounded-lg -mx-2 px-2 transition-colors">
        <div className="flex flex-col gap-1 max-w-[280px]">
          <Label className="text-base font-semibold">{title}</Label>
          <span className="text-sm text-muted-foreground">{description}</span>
        </div>
        <div className="flex items-center gap-6 sm:gap-8">
          <div className="flex flex-col items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Switch 
              checked={prefs.email} 
              onCheckedChange={() => handleToggle(categoryKey, 'email', prefs.email)}
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Switch 
              checked={prefs.sms} 
              onCheckedChange={() => handleToggle(categoryKey, 'sms', prefs.sms)}
              disabled={isSaving}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <Switch 
              checked={prefs.push} 
              onCheckedChange={() => handleToggle(categoryKey, 'push', prefs.push)}
              disabled={isSaving}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">Choose how and when you want to be alerted about patient events.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <BellRing className="h-5 w-5" />
            <CardTitle>Alert Channels</CardTitle>
          </div>
          <CardDescription>Configure multiple delivery methods for different alert severities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            <NotificationRow 
              title="Critical Risks" 
              description="Heart attacks, severe falls, critical vitals drops."
              categoryKey="criticalRisk"
            />
            <NotificationRow 
              title="Mood Anomalies" 
              description="Sudden depression signs or panic indicators."
              categoryKey="moodAnomaly"
            />
            <NotificationRow 
              title="Medication Non-compliance" 
              description="Missed doses or incorrect schedule adherence."
              categoryKey="medicationNonCompliance"
            />
            <NotificationRow 
              title="System Alerts" 
              description="Maintenance, device offline warnings, app updates."
              categoryKey="systemAlerts"
            />
        </CardContent>
      </Card>
    </div>
  );
}
