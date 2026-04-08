'use client';

import { useState } from 'react';
import { SettingsData, RoleCapabilities } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '../services/settings.service';
import { useI18nStore } from '@/store/useI18nStore';
import { useAuthStore } from '@/store/useAuthStore';

interface SecuritySectionProps {
  settings: SettingsData;
  capabilities: RoleCapabilities;
  updateSecurity: (data: Partial<SettingsData['security']>) => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  isSaving: boolean;
}

export function SecuritySection({ isSaving }: SecuritySectionProps) {
  const { t } = useI18nStore();
  const currentUser = useAuthStore((state) => state.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    if (newPassword !== confirmPassword) {
      toast.error(t('settings.security.error_mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsChangingPwd(true);
      // Backend UpdateAccount API allows setting password. 
      // We pass the new password directly.
      const success = await settingsService.changePassword(currentUser.id, newPassword);

      if (success) {
        toast.success(t('settings.security.success_update'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(t('settings.security.error_invalid'));
      }
    } catch (error) {
      toast.error(t('settings.security.error_failed'));
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">{t('settings.security.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('settings.security.desc')}</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-none shadow-md overflow-hidden bg-card">
          <CardHeader className="bg-primary/5 border-b pb-6">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-full">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>{t('settings.security.change_password_title')}</CardTitle>
                <CardDescription className="mt-1">{t('settings.security.change_password_desc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-5 pt-8 px-8">
              <div className="space-y-2">
                <Label htmlFor="current-pwd" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.security.current_password')}
                </Label>
                <Input
                  id="current-pwd"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPwd}
                  required
                />
                <p className="text-[10px] text-muted-foreground italic">
                  * Hệ thống sẽ cập nhật mật khẩu mới trực tiếp vào tài khoản của bạn.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pwd" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.security.new_password')}
                </Label>
                <Input
                  id="new-pwd"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPwd}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pwd" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.security.confirm_password')}
                </Label>
                <Input
                  id="confirm-pwd"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPwd}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 px-8 py-5 flex justify-end gap-3 mt-4 border-t">
              <Button
                type="submit"
                className="px-8 shadow-sm hover:shadow-md transition-all font-semibold"
                disabled={isChangingPwd || !currentPassword || !newPassword || !confirmPassword}
              >
                {isChangingPwd ? t('settings.security.button_updating') : t('settings.security.button_update')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
