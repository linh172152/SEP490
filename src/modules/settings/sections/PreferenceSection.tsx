'use client';

import { useTheme } from 'next-themes';
import { useI18nStore } from '@/store/useI18nStore';
import { SettingsData } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PreferenceSectionProps {
  settings: SettingsData;
  updatePreferences: (data: Partial<SettingsData['preferences']>) => Promise<void>;
  isSaving: boolean;
}

export function PreferenceSection({ isSaving }: PreferenceSectionProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18nStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch on theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">{t('settings.preferences.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('settings.preferences.desc')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences.display_card_title')}</CardTitle>
          <CardDescription>{t('settings.preferences.display_card_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Moon className="h-4 w-4" /> {t('settings.preferences.theme_label')}
              </Label>
              <Select 
                disabled={isSaving} 
                value={theme === 'dark' ? 'dark' : 'light'} 
                onValueChange={(v) => setTheme(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.preferences.theme_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.preferences.theme_light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.preferences.theme_dark')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Globe className="h-4 w-4" /> {t('settings.preferences.language_label')}
              </Label>
              <Select 
                disabled={isSaving} 
                value={language} 
                onValueChange={(v) => setLanguage(v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.preferences.language_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settings.preferences.lang_en')}</SelectItem>
                  <SelectItem value="vi">{t('settings.preferences.lang_vi')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
