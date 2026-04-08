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

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
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
      firstName: settings.profile.firstName,
      lastName: settings.profile.lastName,
      email: settings.profile.email,
      phone: settings.profile.phone,
      relationship: '',
      notificationPreference: 'EMAIL',
      elderlyName: '',
      dateOfBirth: '',
      healthNotes: '',
      preferredLanguage: 'Vietnamese',
      speakingSpeed: 'normal'
    },
  });

  useEffect(() => {
    if (caregiverProfile) {
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
  }, [caregiverProfile, elderlyProfile, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      // 1. Update general settings (mock)
      await updateProfile({ ...data, avatar: avatarPreview } as any);
      
      const accountId = Number(user?.id);

      // 2. Update Caregiver Profile if applicable
      if (isCaregiver && accountId) {
        const cgPayload = {
          accountId,
          name: `${data.firstName} ${data.lastName}`,
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

  const handleAvatarMockUpload = () => {
    const mockSeeds = ['Felix', 'Aneka', 'James', 'Sophie'];
    const randomSeed = mockSeeds[Math.floor(Math.random() * mockSeeds.length)];
    const randomAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${randomSeed}`;
    setAvatarPreview(randomAvatar);
    toast.success('Avatar updated (Mock)');
  };

  const isGlobalLoading = isSaving || isCaregiverLoading || isElderlyLoading;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">Profile Overview</h3>
        <p className="text-sm text-muted-foreground">Manage your personal account and care recipient information.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Personal Account */}
          <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-sky-600">
                <UserCircle className="h-5 w-5" />
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </div>
              <CardDescription>Update your basic account details and contact info.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-white ring-4 ring-slate-100 dark:ring-slate-800 shadow-xl overflow-hidden">
                    <AvatarImage src={avatarPreview} alt="User avatar" />
                    <AvatarFallback className="text-2xl bg-sky-50 text-sky-600 font-bold uppercase transition-transform group-hover:scale-110">
                      {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    type="button"
                    onClick={handleAvatarMockUpload}
                    className="absolute bottom-0 right-0 p-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 shadow-lg border-2 border-white"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h4 className="font-bold text-xl text-slate-900 dark:text-slate-100">{settings.profile.firstName} {settings.profile.lastName}</h4>
                  <p className="text-sm text-slate-500 font-medium">{settings.profile.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 uppercase tracking-widest text-[10px] font-black px-3 py-1">
                      {user?.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
                      </FormControl>
                      <FormMessage />
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCaregiver && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                  <FormField
                    control={form.control}
                    name="relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Relationship to Recipient</FormLabel>
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Notification Channel</FormLabel>
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
                  <CardTitle className="text-lg">Care Recipient Details</CardTitle>
                </div>
                <CardDescription>Configure the health profile and voice preferences for the elderly member.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="elderlyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Elderly Full Name</FormLabel>
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth</FormLabel>
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Language</FormLabel>
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
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">CareBot Voice Speed</FormLabel>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Health Notes & Conditions</FormLabel>
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
                  Synchronizing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Final Configurations
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
