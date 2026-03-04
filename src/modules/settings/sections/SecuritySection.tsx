'use client';

import { useState } from 'react';
import { SettingsData, RoleCapabilities } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShieldAlert, ShieldCheck, KeyRound, MonitorSmartphone, Globe, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { settingsService } from '../services/settings.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SecuritySectionProps {
  settings: SettingsData;
  capabilities: RoleCapabilities;
  updateSecurity: (data: Partial<SettingsData['security']>) => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  isSaving: boolean;
}

export function SecuritySection({ settings, capabilities, updateSecurity, revokeSession, isSaving }: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setIsChangingPwd(true);
      const success = await settingsService.changePassword(currentPassword, newPassword);
      if (success) {
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error('Invalid current password or new password too short');
      }
    } catch {
      toast.error('Failed to change password');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleMfaToggle = () => {
    updateSecurity({ mfaEnabled: !settings.security.mfaEnabled });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Security & Authentication</h3>
        <p className="text-sm text-muted-foreground">Manage your password, 2FA, and active sessions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <KeyRound className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pwd">Current Password</Label>
                <Input 
                  id="current-pwd" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isChangingPwd}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pwd">New Password</Label>
                <Input 
                  id="new-pwd" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPwd}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pwd">Confirm New Password</Label>
                <Input 
                  id="confirm-pwd" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPwd}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end bg-slate-50/50 dark:bg-slate-900/50 mt-4 pt-6 border-t">
              <Button type="submit" disabled={isChangingPwd || !currentPassword || !newPassword || !confirmPassword}>
                {isChangingPwd ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              {settings.security.mfaEnabled ? (
                 <ShieldCheck className="h-5 w-5 text-emerald-600" />
              ) : (
                 <ShieldAlert className="h-5 w-5 text-rose-500" />
              )}
              <CardTitle>Two-Factor Authentication</CardTitle>
            </div>
            <CardDescription>Add an extra layer of security to your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="space-y-0.5 max-w-[280px]">
                <Label className="text-base text-slate-900 dark:text-slate-100">Authenticator App</Label>
                <p className="text-sm text-muted-foreground">
                  Use an app like Google Authenticator or Authy to generate one-time codes.
                </p>
              </div>
              <Switch
                checked={settings.security.mfaEnabled}
                onCheckedChange={handleMfaToggle}
                disabled={isSaving}
              />
            </div>

            {settings.security.mfaEnabled && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 border rounded-lg flex items-start gap-3">
                   <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                   <div>
                     <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">MFA is active</h4>
                     <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                        Your account is currently protected. You'll be prompted for a code when logging in from new devices.
                     </p>
                     <Button variant="outline" size="sm" className="mt-4 bg-white dark:bg-slate-950 border-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900">
                         View Backup Codes
                     </Button>
                   </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <MonitorSmartphone className="h-5 w-5" />
            <CardTitle>Active Sessions</CardTitle>
          </div>
          <CardDescription>Manage devices that are currently logged into your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             {settings.sessions.map((session) => (
               <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4">
                 <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-1">
                       <MonitorSmartphone className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold">{session.deviceName} {session.isCurrent && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full dark:bg-sky-900 dark:text-sky-300">This Device</span>}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground mt-1">
                         <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> {session.ipAddress}</span>
                         <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                         <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Last active: {new Date(session.lastActivity).toLocaleDateString()}</span>
                      </div>
                    </div>
                 </div>
                 
                 {!session.isCurrent && (
                   <AlertDialog>
                     <AlertDialogTrigger asChild>
                       <Button variant="outline" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 bg-white dark:bg-slate-950 dark:hover:bg-rose-950 self-start sm:self-center">
                         <Trash2 className="h-4 w-4 mr-2" />
                         Revoke
                       </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                       <AlertDialogHeader>
                         <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                         <AlertDialogDescription>
                           Are you sure you want to sign out of the <span className="font-semibold">{session.deviceName}</span> session?
                         </AlertDialogDescription>
                       </AlertDialogHeader>
                       <AlertDialogFooter>
                         <AlertDialogCancel>Cancel</AlertDialogCancel>
                         <AlertDialogAction 
                            onClick={() => revokeSession(session.id)}
                            className="bg-rose-600 hover:bg-rose-700"
                         >
                           Revoke Session
                         </AlertDialogAction>
                       </AlertDialogFooter>
                     </AlertDialogContent>
                   </AlertDialog>
                 )}
               </div>
             ))}
             {settings.sessions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No active sessions found.</p>
             )}
          </div>
         
        </CardContent>
      </Card>
    </div>
  );
}
