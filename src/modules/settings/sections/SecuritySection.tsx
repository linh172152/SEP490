'use client';

import { useState } from 'react';
import { SettingsData, RoleCapabilities } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from "react-toastify";
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
  const currentUser = useAuthStore((state: any) => state.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    if (newPassword !== confirmPassword) {
      toast.error(t('settings.security.error_mismatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('settings.security.validation.password_min_6'));
      return;
    }

    try {
      setIsChangingPwd(true);
      const success = await settingsService.changePassword(
        currentPassword, 
        newPassword, 
        confirmPassword
      );

      if (success) {
        toast.success(t('settings.security.success_update'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      toast.error(error.message || t('settings.security.error_failed'));
    } finally {
      setIsChangingPwd(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1 pb-2 border-b border-border/40">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 italic">
          {t('settings.security.title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('settings.security.desc')}
        </p>
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
                <div className="relative">
                  <Input
                    id="current-pwd"
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10"
                    value={currentPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
                    disabled={isChangingPwd}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * Hệ thống sẽ cập nhật mật khẩu mới trực tiếp vào tài khoản của bạn.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-pwd" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.security.new_password')}
                </Label>
                <div className="relative">
                  <Input
                    id="new-pwd"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10"
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    disabled={isChangingPwd}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pwd" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('settings.security.confirm_password')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-pwd"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 pr-10"
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    disabled={isChangingPwd}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 px-8 py-5 flex justify-end gap-3 mt-4 border-t">
              <Button
                type="submit"
                className="px-8 shadow-sm hover:shadow-md transition-all font-semibold"
                disabled={isChangingPwd || isSaving || !currentPassword || !newPassword || !confirmPassword}
              >
                {(isChangingPwd || isSaving) ? t('settings.security.button_updating') : t('settings.security.button_update')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
