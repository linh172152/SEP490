'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { elderlyService } from '@/services/api/elderlyService';
import { roomService } from '@/services/api/roomService';
import { useAuthStore } from '@/store/useAuthStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import type { RoomResponse } from '@/services/api/types';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronLeft, HeartPulse, Loader2, MessageSquare, Save, UserCog } from 'lucide-react';

const MAX_DATE_OF_BIRTH = '1980-12-31';

const nameSuggestions = ['John Carter', 'Maria Lopez', 'David Nguyen', 'Emma Wilson'];
const healthNoteSuggestions = [
  'Hypertension, needs morning and evening blood pressure reminders.',
  'Type-2 diabetes, requires meal timing prompts and hydration checks.',
  'Reduced mobility, needs slow speaking guidance and walking support.',
  'Mild memory loss, needs medication confirmation and repetition.',
  'Sleep disturbance, prefers low-volume voice prompts at night.',
];

const editSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((v) => v <= MAX_DATE_OF_BIRTH, 'Year of birth must not be later than 1980'),
  healthNotes: z.string().min(1, 'Please provide health notes'),
  preferredLanguage: z.string().min(1, 'Please select language'),
  speakingSpeed: z.string().min(1, 'Please select speaking speed'),
  roomId: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function EditElderlyPage() {
  const params = useParams();
  const id = Number(params.id as string);
  const router = useRouter();
  const { user } = useAuthStore();
  const fetchDashboardData = useFamilyStore((s) => s.fetchDashboardData);

  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      dateOfBirth: '',
      healthNotes: '',
      preferredLanguage: 'Vietnamese',
      speakingSpeed: 'normal',
      roomId: '',
    },
  });

  // Load profile + rooms in parallel
  useEffect(() => {
    if (!Number.isFinite(id)) return;

    const load = async () => {
      setLoadingProfile(true);
      try {
        const [profile, allRooms] = await Promise.all([
          elderlyService.getById(id),
          roomService.getAllRooms().catch(() => [] as RoomResponse[]),
        ]);

        setRooms(allRooms);

        form.reset({
          name: profile.name,
          dateOfBirth: profile.dateOfBirth,
          healthNotes: profile.healthNotes ?? '',
          preferredLanguage: profile.preferredLanguage ?? 'Vietnamese',
          speakingSpeed: profile.speakingSpeed ?? 'normal',
          roomId: profile.roomId ? String(profile.roomId) : '',
        });
      } catch {
        toast.error('Unable to load profile information.');
        router.push('/dashboard/family/elderly');
      } finally {
        setLoadingProfile(false);
      }
    };

    load();
  }, [id, form, router]);

  const onSubmit = async (data: EditFormValues) => {
    try {
      await elderlyService.update(id, {
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        healthNotes: data.healthNotes,
        preferredLanguage: data.preferredLanguage,
        speakingSpeed: data.speakingSpeed,
        roomId: data.roomId ? Number(data.roomId) : null,
      });

      toast.success('Profile updated successfully!');
      if (user?.id) {
        await fetchDashboardData(Number(user.id));
      }
      router.push('/dashboard/family/elderly');
    } catch {
      toast.error('Update failed. Please try again.');
    }
  };

  const applyHealthNoteSuggestion = (value: string) => {
    form.setValue('healthNotes', value, { shouldDirty: true, shouldValidate: true });
  };

  if (loadingProfile) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
          <Link href="/dashboard/family/elderly">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
            <Link href="/dashboard/family" className="hover:text-sky-600 transition-colors">Portal</Link>
            <span className="opacity-30">/</span>
            <Link href="/dashboard/family/elderly" className="hover:text-sky-600 transition-colors">Elderly</Link>
            <span className="opacity-30">/</span>
            <span className="text-slate-500">Edit</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Edit Elderly Profile
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Identity */}
          <Card className="overflow-hidden rounded-2xl border-none bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:bg-slate-900/80 dark:shadow-none">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Basic Information</CardTitle>
                  <CardDescription>Name and date of birth of the elderly member.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</FormLabel>
                      <FormControl>
                        <Input list="elderly-name-suggestions" placeholder="Enter full name" className="h-10 rounded-xl border-none bg-slate-50 focus:ring-sky-500 dark:bg-slate-800" {...field} />
                      </FormControl>
                      <FormDescription className="text-[10px] italic">Quick examples: John Carter, Maria Lopez, David Nguyen.</FormDescription>
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
                          max={MAX_DATE_OF_BIRTH}
                          className="h-10 rounded-xl border-none bg-slate-50 focus:ring-sky-500 [color-scheme:light] dark:bg-slate-800 dark:[color-scheme:dark]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] italic">Year of birth must not be later than 1980.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice settings */}
          <Card className="overflow-hidden rounded-2xl border-none bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:bg-slate-900/80 dark:shadow-none">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Robot Communication</CardTitle>
                  <CardDescription>Preferred language and speaking speed.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl border-none bg-slate-50 focus:ring-sky-500 dark:bg-slate-800">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Japanese">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[10px] italic">Quick picks: Vietnamese, English, Japanese.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="speakingSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Speaking Speed</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl border-none bg-slate-50 focus:ring-sky-500 dark:bg-slate-800">
                            <SelectValue placeholder="Select speed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="slow">Slow</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[10px] italic">Quick picks: slow, normal, fast.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Health + Room */}
          <Card className="overflow-hidden rounded-2xl border-l-4 border-l-rose-500 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:bg-slate-900/80 dark:shadow-none">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Health & Room</CardTitle>
                  <CardDescription>Health notes and assigned room.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <FormField
                control={form.control}
                name="healthNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Health Notes</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {healthNoteSuggestions.map((suggestion) => (
                        <Button
                          key={suggestion}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 rounded-full px-3 text-[11px]"
                          onClick={() => applyHealthNoteSuggestion(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Example: Hypertension, Type-2 diabetes..."
                        className="rounded-xl border-none bg-slate-50 focus:ring-rose-400 dark:bg-slate-800"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] italic">Click one suggestion above to fill quickly.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {rooms.length > 0 && (
                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Room</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl border-none bg-slate-50 focus:ring-sky-500 dark:bg-slate-800">
                            <SelectValue placeholder="Unassigned room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Unassigned room</SelectItem>
                          {rooms.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)}>
                              {r.roomName} (ID: {r.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <datalist id="elderly-name-suggestions">
            {nameSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/family/elderly">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-sky-600 hover:bg-sky-700 min-w-[140px]"
            >
              {form.formState.isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
