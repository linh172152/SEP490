'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SettingsData, RoleCapabilities } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useI18nStore } from '@/store/useI18nStore';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  professionalId: z.string().optional(),
  department: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSectionProps {
  settings: SettingsData;
  capabilities: RoleCapabilities;
  updateProfile: (data: Partial<SettingsData['profile']>) => Promise<void>;
  isSaving: boolean;
}

export function ProfileSection({ settings, capabilities, updateProfile, isSaving }: ProfileSectionProps) {
  const { t } = useI18nStore();
  const [avatarPreview, setAvatarPreview] = useState(settings.profile.avatar);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: settings.profile.firstName,
      lastName: settings.profile.lastName,
      email: settings.profile.email,
      phone: settings.profile.phone,
      professionalId: settings.profile.professionalId,
      department: settings.profile.department,
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfile({ 
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || "",
          avatar: avatarPreview 
      });
      toast.success(t('settings.profile.save_success'));
      form.reset(data);
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleAvatarMockUpload = () => {
    toast.info('Tính năng tải ảnh lên đang được phát triển');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">{t('settings.profile.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('settings.profile.desc')}</p>
      </div>

      <Card className="border-none shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50">
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle>{t('settings.profile.card_title')}</CardTitle>
          <CardDescription>{t('settings.profile.card_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8 px-8">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-900 shadow-xl ring-2 ring-slate-100 dark:ring-slate-800">
                <AvatarImage src={avatarPreview} alt="User avatar" />
                <AvatarFallback className="text-3xl bg-indigo-50 text-indigo-600 font-bold">
                  {settings.profile.firstName?.[0]}{settings.profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <button 
                type="button"
                onClick={handleAvatarMockUpload}
                className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h4 className="font-black text-2xl text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {settings.profile.firstName} {settings.profile.lastName}
              </h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 justify-center sm:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {settings.profile.email}
              </p>
              <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                <span className="inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 uppercase tracking-widest">
                  {capabilities.canAccessProfessionalProfile ? t('settings.profile.role_medical') : t('settings.profile.role_care')}
                </span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t('settings.profile.first_name')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nguyễn" 
                          {...field} 
                          className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t('settings.profile.last_name')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Văn A" 
                          {...field} 
                          className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                         {t('settings.profile.email')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@example.com" 
                          type="email" 
                          {...field} 
                          disabled 
                          className="h-12 bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-muted-foreground cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                         {t('settings.profile.phone')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="09xx xxx xxx" 
                          {...field} 
                          className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {capabilities.canAccessProfessionalProfile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
                  <FormField
                    control={form.control}
                    name="professionalId"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                           {t('settings.profile.professional_id')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="LICENSE-12345" 
                            {...field} 
                            className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                           {t('settings.profile.department')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Geriatrics" 
                            {...field} 
                            className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 transition-all"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="pt-8 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving || !form.formState.isDirty}
                  className="h-12 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      {t('common.processing')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {t('common.save')}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
