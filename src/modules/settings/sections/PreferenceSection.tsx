'use client';

import { SettingsData } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, LayoutTemplate, Moon, Clock } from 'lucide-react';

interface PreferenceSectionProps {
  settings: SettingsData;
  updatePreferences: (data: Partial<SettingsData['preferences']>) => Promise<void>;
  isSaving: boolean;
}

export function PreferenceSection({ settings, updatePreferences, isSaving }: PreferenceSectionProps) {
  
  const handleSelectChange = (key: keyof SettingsData['preferences'], value: string) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">System Preferences</h3>
        <p className="text-sm text-muted-foreground">Customize your viewing experience and localization parameters.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Display & Environment</CardTitle>
          <CardDescription>Adjust how the CareBot-MH interface looks and behaves for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Moon className="h-4 w-4" /> Theme Preference
              </Label>
              <Select 
                disabled={isSaving} 
                value={settings.preferences.theme} 
                onValueChange={(v) => handleSelectChange('theme', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Globe className="h-4 w-4" /> Language Setting
              </Label>
              <Select 
                disabled={isSaving} 
                value={settings.preferences.language} 
                onValueChange={(v) => handleSelectChange('language', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4" /> Device Timezone
              </Label>
              <Select 
                disabled={isSaving} 
                value={settings.preferences.timezone} 
                onValueChange={(v) => handleSelectChange('timezone', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC (Universal)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                  <SelectItem value="Asia/Ho_Chi_Minh">Indochina Time (ICT)</SelectItem>
                  <SelectItem value="Europe/London">British Summer Time (BST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <LayoutTemplate className="h-4 w-4" /> Data Table Density
              </Label>
              <Select 
                disabled={isSaving} 
                value={settings.preferences.tableDensity} 
                onValueChange={(v) => handleSelectChange('tableDensity', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact (More items)</SelectItem>
                  <SelectItem value="comfortable">Comfortable (Larger rows)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
