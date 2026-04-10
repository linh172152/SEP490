'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SettingsData, RoleCapabilities } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, Trash2, AlertTriangle, Loader2, HeartPulse, UserCircle } from 'lucide-react';
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/useAuthStore';
import { useCaregiverStore } from '@/store/useCaregiverStore';
import { useElderlyProfileStore } from '@/store/useElderlyProfileStore';
import { useI18nStore } from '@/store/useI18nStore';
import { Badge } from '@/components/ui/badge';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  // Caregiver fields
  relationship: z.string().optional(),
  notificationPreference: z.string().optional(),
  // Elderly fields
  elderlyName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  healthNotes: z.string().optional(),
  preferredLanguage: z.string().optional(),
  speakingSpeed: z.string().optional(),
  // Professional fields
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
  const { user } = useAuthStore();
  const { t } = useI18nStore();
  const {
    currentProfile: caregiverProfile,
    fetchProfileByAccountId: fetchCaregiverProfile,
    updateProfile: updateCaregiverApi,
    createProfile: createCaregiverApi,
    isLoading: isCaregiverLoading
  } = useCaregiverStore();

  const {
    currentProfile: elderlyProfile,
    fetchProfileByAccountId: fetchElderlyProfile,
    updateProfile: updateElderlyApi,
    createProfile: createElderlyApi,
    isLoading: isElderlyLoading
  } = useElderlyProfileStore();

  const [avatarPreview, setAvatarPreview] = useState(settings.profile.avatar);
  const isCaregiver = user?.role === 'CAREGIVER';
  const isFamily = user?.role === 'FAMILYMEMBER';
  const isProfessional = capabilities.canAccessProfessionalProfile;

  const loadedCaregiverName = caregiverProfile?.name || settings.profile.fullName || '';
  const loadedCaregiverEmail = caregiverProfile?.accountEmail || settings.profile.email || user?.email || '';

  useEffect(() => {
    if (user?.id) {
      const accountId = Number(user.id);
      if (isCaregiver) fetchCaregiverProfile(accountId);
      if (isCaregiver || isFamily) fetchElderlyProfile(accountId);
    }
  }, [user?.id, isCaregiver, isFamily, fetchCaregiverProfile, fetchElderlyProfile]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      fullName: settings.profile.fullName || '',
      email: settings.profile.email || '',
      phone: settings.profile.phone || '',
      relationship: '',
      notificationPreference: 'EMAIL',
      elderlyName: '',
      dateOfBirth: '',
      healthNotes: '',
      preferredLanguage: 'Vietnamese',
      speakingSpeed: 'normal',
      professionalId: (settings.profile as any).professionalId || '',
      department: (settings.profile as any).department || '',
    },
  });

  useEffect(() => {
    if (caregiverProfile) {
      form.setValue('fullName', caregiverProfile.name || '');
      form.setValue('email', caregiverProfile.accountEmail || settings.profile.email || user?.email || '');
      form.setValue('relationship', caregiverProfile.relationship || '');
      form.setValue('notificationPreference', caregiverProfile.notificationPreference || 'EMAIL');
    }

    if (elderlyProfile) {
      form.setValue('elderlyName', elderlyProfile.name || '');
      form.setValue('dateOfBirth', elderlyProfile.dateOfBirth ? elderlyProfile.dateOfBirth.split('T')[0] : '');
      form.setValue('healthNotes', elderlyProfile.healthNotes || '');
      form.setValue('preferredLanguage', elderlyProfile.preferredLanguage || 'Vietnamese');
      form.setValue('speakingSpeed', elderlyProfile.speakingSpeed || 'normal');
    }
  }, [caregiverProfile, elderlyProfile, form, settings.profile.email, user?.email]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      // 1. Update general settings (mock)
      await updateProfile({ 
        fullName: data.fullName,
        phone: data.phone,
        avatar: avatarPreview,
        professionalId: data.professionalId,
        department: data.department
      } as any);
      
      const accountId = Number(user?.id);

      // 2. Update Caregiver Profile if applicable
      if (isCaregiver && accountId) {
        const cgPayload = {
          accountId,
          name: data.fullName,
          relationship: data.relationship || '',
          notificationPreference: data.notificationPreference || 'EMAIL',
        };
        if (caregiverProfile) {
          await updateCaregiverApi(caregiverProfile.id, cgPayload);
        } else {
          await createCaregiverApi(cgPayload);
        }
      }

      // 3. Update Elderly Profile if applicable
      if ((isCaregiver || isFamily) && accountId && data.elderlyName) {
        const elderlyPayload = {
          name: data.elderlyName,
          dateOfBirth: data.dateOfBirth || new Date().toISOString(),
          healthNotes: data.healthNotes || '',
          preferredLanguage: data.preferredLanguage || 'Vietnamese',
          speakingSpeed: data.speakingSpeed || 'normal',
        };
        
        if (elderlyProfile) {
          await updateElderlyApi(elderlyProfile.id, elderlyPayload);
        } else {
          await createElderlyApi(accountId, elderlyPayload);
        }
      }

      toast.success('All profile details updated successfully!');
      form.reset(data);
    } catch (error) {
       toast.error('Failed to update one or more profile sections.');
    }
  }

  const isGlobalLoading = isSaving || isCaregiverLoading || isElderlyLoading;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1 pb-2 border-b border-border/40">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 italic">
            {t('settings.profile.title')}
        </h3>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Personal Account */}
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sky-600">
                <UserCircle className="h-5 w-5" />
                <CardTitle className="text-lg">{t('settings.profile.card_title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white ring-4 ring-slate-100 dark:ring-slate-800 shadow-xl overflow-hidden">
                    <AvatarFallback className={cn(
                      "text-2xl text-white font-black uppercase transition-all duration-500",
                      getAvatarColor(loadedCaregiverName)
                    )}>
                      {getInitials(loadedCaregiverName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-bold text-xl text-slate-900 dark:text-slate-100">{loadedCaregiverName || t('common.user_account') || 'User Account'}</h4>
                  <p className="text-sm text-slate-500 font-medium">{loadedCaregiverEmail}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 uppercase tracking-widest text-[10px] font-black px-3 py-1">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t('settings.profile.full_name')}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
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
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t('settings.profile.email')}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="john.doe@example.com" 
                          type="email" 
                          {...field} 
                          disabled
                          className="h-12 bg-slate-100 dark:bg-slate-800 border-none rounded-xl cursor-not-allowed text-muted-foreground" 
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
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {t('settings.profile.phone')}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
              </div>

              {isProfessional && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <FormField
                    control={form.control}
                    name="professionalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                           {t('settings.profile.professional_id')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="LICENSE-12345" 
                            {...field} 
                            className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500"
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
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">
                           {t('settings.profile.department')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Geriatrics" 
                            {...field} 
                            className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500"
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {isCaregiver && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('settings.profile.relationship')}</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Son, Daughter, Professional Nurse" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notificationPreference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('settings.profile.notification_channel')}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500">
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="SMS">SMS</SelectItem>
                            <SelectItem value="PUSH">Push Notification</SelectItem>
                            <SelectItem value="ALL">All Channels</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Care Recipient (Elderly Profile) */}
          {(isCaregiver || isFamily) && (
            <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border-l-4 border-l-sky-500">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sky-600">
                  <HeartPulse className="h-5 w-5" />
                  <CardTitle className="text-lg">{t('settings.profile.recipient_title')}</CardTitle>
                </div>
                <CardDescription>{t('settings.profile.recipient_desc')}</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="elderlyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('settings.profile.elderly_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name from citizen ID" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('manager.patients.table.dob')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500 [color-scheme:light] dark:[color-scheme:dark]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('user_modal.placeholders.lang')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'Vietnamese'}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="speakingSpeed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('user_modal.placeholders.speaking_speed')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'normal'}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500">
                              <SelectValue placeholder="Select speed" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="slow">Slow (Recommended)</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="healthNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('settings.profile.health_notes')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Mild memory loss, hypertension, requires meal reminders..." 
                          className="min-h-[120px] bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500 resize-none p-4" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 sticky bottom-8 z-20">
            <Button 
              type="submit" 
              disabled={isGlobalLoading || !form.formState.isDirty}
              className="bg-sky-600 hover:bg-sky-700 text-white min-w-[200px] h-14 rounded-2xl shadow-2xl shadow-sky-100 dark:shadow-none font-bold transition-all active:scale-95"
            >
              {isGlobalLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('common.processing')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  {t('common.save')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
