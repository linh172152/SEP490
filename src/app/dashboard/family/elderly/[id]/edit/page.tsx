'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useElderlyProfileStore } from '@/store/useElderlyProfileStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { ChevronLeft, Save, UserPlus, HeartPulse, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const elderlyFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  healthNotes: z.string().min(1, 'Please provide some health background'),
  preferredLanguage: z.string().min(1, 'Language preference is required'),
  speakingSpeed: z.string().min(1, 'Speaking speed is required'),
});

type ElderlyFormValues = z.infer<typeof elderlyFormSchema>;

export default function EditElderlyPage() {
  const params = useParams();
  const router = useRouter();
  const elderlyId = Number(params.id);
  const { currentProfile, fetchProfileById, updateProfile, isLoading } = useElderlyProfileStore();

  const form = useForm<ElderlyFormValues>({
    resolver: zodResolver(elderlyFormSchema) as any,
    defaultValues: {
      name: '',
      dateOfBirth: '',
      healthNotes: '',
      preferredLanguage: 'Vietnamese',
      speakingSpeed: 'normal',
    },
  });

  useEffect(() => {
    if (Number.isFinite(elderlyId)) {
      fetchProfileById(elderlyId);
    }
  }, [elderlyId, fetchProfileById]);

  useEffect(() => {
    if (!currentProfile || currentProfile.id !== elderlyId) return;

    form.reset({
      name: currentProfile.name,
      dateOfBirth: currentProfile.dateOfBirth,
      healthNotes: currentProfile.healthNotes,
      preferredLanguage: currentProfile.preferredLanguage,
      speakingSpeed: currentProfile.speakingSpeed,
    });
  }, [currentProfile, elderlyId, form]);

  const onSubmit = async (data: ElderlyFormValues) => {
    try {
      await updateProfile(elderlyId, data);
      toast.success('Elderly profile updated successfully.');
      router.push('/dashboard/family/elderly');
    } catch (error) {
      toast.error('Failed to update elderly profile. Please try again.');
    }
  };

  if (!currentProfile || currentProfile.id !== elderlyId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Loading profile details...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link href="/dashboard/family/elderly">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Family Portal / Care Circle</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Edit Care Profile</h1>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Personal Identity</CardTitle>
                  <CardDescription>Update basic information for this elderly member.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</FormLabel>
                      <FormControl>
                        <Input className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" {...field} />
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
                        <Input type="date" className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Voice & Interaction</CardTitle>
                  <CardDescription>Update robot communication preferences.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Speech Speed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500">
                            <SelectValue placeholder="Select speed" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="slow">Slow</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border-l-4 border-l-rose-500">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Medical Overview</CardTitle>
                  <CardDescription>Update health details and care notes.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <FormField
                control={form.control}
                name="healthNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Health Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter medical conditions, special needs, or daily precautions."
                        className="min-h-[150px] bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-rose-500 p-4 resize-none leading-relaxed"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] italic">Displayed to caregivers and robot monitoring systems.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end items-center pt-2">
            <Button variant="ghost" type="button" onClick={() => router.back()} disabled={isLoading} className="h-12 px-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all">
              Discard
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white min-w-[200px] h-12 rounded-xl shadow-xl shadow-sky-100 dark:shadow-none font-bold transition-all active:scale-95">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
