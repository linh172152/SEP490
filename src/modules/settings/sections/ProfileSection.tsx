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
import { Camera, Save, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/useAuthStore';
import { useCaregiverStore } from '@/store/useCaregiverStore';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  professionalId: z.string().optional(),
  department: z.string().optional(),
  relationship: z.string().optional(),
  notificationPreference: z.string().optional(),
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
    fetchProfileByAccountId, 
    updateProfile: updateCaregiverApi, 
    deleteProfile: deleteCaregiverApi, 
    createProfile: createCaregiverApi, 
    isLoading: isCaregiverLoading 
  } = useCaregiverStore();

  const [avatarPreview, setAvatarPreview] = useState(settings.profile.avatar);
  const isCaregiver = user?.role === 'CAREGIVER';

  useEffect(() => {
    if (isCaregiver && user?.id) {
      fetchProfileByAccountId(Number(user.id));
    }
  }, [isCaregiver, user?.id, fetchProfileByAccountId]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: settings.profile.firstName,
      lastName: settings.profile.lastName,
      email: settings.profile.email,
      phone: settings.profile.phone,
      professionalId: settings.profile.professionalId,
      department: settings.profile.department,
      relationship: '',
      notificationPreference: 'EMAIL',
    },
  });

  useEffect(() => {
    if (caregiverProfile) {
      form.setValue('relationship', caregiverProfile.relationship || '');
      form.setValue('notificationPreference', caregiverProfile.notificationPreference || 'EMAIL');
    }
  }, [caregiverProfile, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfile({ ...data, avatar: avatarPreview });
      
      if (isCaregiver && user?.id) {
        const payload = {
          accountId: Number(user.id),
          name: `${data.firstName} ${data.lastName}`,
          relationship: data.relationship || '',
          notificationPreference: data.notificationPreference || 'EMAIL',
        };
        
        if (caregiverProfile) {
          await updateCaregiverApi(caregiverProfile.id, payload);
          toast.success('Caregiver API profile updated successfully!');
        } else {
          await createCaregiverApi(payload);
          toast.success('Caregiver API profile created successfully!');
        }
      } else {
        toast.success('Profile settings updated successfully!');
      }
    } catch (error) {
       toast.error('Failed to update profile configurations.');
    }
  }

  const handleAvatarMockUpload = () => {
    const mockSeeds = ['Felix', 'Aneka', 'James', 'Sophie'];
    const randomSeed = mockSeeds[Math.floor(Math.random() * mockSeeds.length)];
    const randomAvatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${randomSeed}`;
    setAvatarPreview(randomAvatar);
    toast.success('Avatar updated (Mock)');
  };

  const handleDeleteCaregiverProfile = async () => {
    if (!caregiverProfile) return;
    if (confirm('Are you absolutely sure you want to permanently delete your Caregiver API profile? This cannot be undone.')) {
      try {
        await deleteCaregiverApi(caregiverProfile.id);
        toast.success('Caregiver API profile deleted successfully.');
        form.setValue('relationship', '');
        form.setValue('notificationPreference', 'EMAIL');
      } catch (error) {
        toast.error('Failed to delete Caregiver profile.');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Profile Overview</h3>
        <p className="text-sm text-muted-foreground">Manage your personal information and contact details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your avatar and basic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-slate-100 ring-4 ring-white dark:ring-slate-950">
                <AvatarImage src={avatarPreview} alt="User avatar" />
                <AvatarFallback className="text-2xl bg-sky-50 text-sky-600">
                  {settings.profile.firstName[0]}{settings.profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <button 
                type="button"
                onClick={handleAvatarMockUpload}
                className="absolute bottom-0 right-0 p-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 active:scale-95 shadow-sm"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-semibold text-lg">{settings.profile.firstName} {settings.profile.lastName}</h4>
              <p className="text-sm text-muted-foreground">{settings.profile.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-sky-50 text-sky-700 border-sky-200 uppercase tracking-wider dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-300">
                  {capabilities.canAccessProfessionalProfile ? 'Medical Professional' : (isCaregiver ? 'Caregiver' : 'Care Team')}
                </span>
                {isCaregiver && caregiverProfile && (
                   <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200 uppercase tracking-wider dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300">
                     API Linked
                   </span>
                )}
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCaregiver && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <FormField
                      control={form.control}
                      name="relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship to Elderly</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Son, Daughter, Nurse" {...field} />
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
                          <FormLabel>Notification Preference</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
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
                </>
              )}

              {capabilities.canAccessProfessionalProfile && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="professionalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional ID / License</FormLabel>
                          <FormControl>
                            <Input placeholder="MD-12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <FormControl>
                            <Input placeholder="Geriatrics" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isSaving || isCaregiverLoading || !form.formState.isDirty}>
                  {(isSaving || isCaregiverLoading) ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isCaregiver && caregiverProfile && (
        <Card className="border-rose-100 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20">
          <CardHeader>
            <CardTitle className="text-rose-600 flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-rose-600/80">
              Permanently remove your caregiver profile connection from the system API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDeleteCaregiverProfile} disabled={isCaregiverLoading}>
               {isCaregiverLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
               Delete Caregiver Profile
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
