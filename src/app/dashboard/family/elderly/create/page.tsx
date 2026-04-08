'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import { ChevronLeft, UserPlus, Save, HeartPulse, MessageSquare, Volume2, Loader2 } from 'lucide-react';
import { useElderlyProfileStore } from '@/store/useElderlyProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

const elderlyFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  healthNotes: z.string().min(1, 'Please provide some health background'),
  preferredLanguage: z.string().min(1, 'Language preference is required'),
  speakingSpeed: z.string().min(1, 'Speaking speed is required'),
});

type ElderlyFormValues = z.infer<typeof elderlyFormSchema>;

export default function CreateElderlyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createProfile, isLoading } = useElderlyProfileStore();
  
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

  const onSubmit = async (data: ElderlyFormValues) => {
    if (!user?.id) {
      toast.error('Session expired: Please login again.');
      return;
    }

    try {
      await createProfile(Number(user.id), {
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        healthNotes: data.healthNotes,
        preferredLanguage: data.preferredLanguage,
        speakingSpeed: data.speakingSpeed,
      });

      toast.success(`Success! ${data.name}'s profile has been created.`);
      router.push('/dashboard/family/elderly');
    } catch (error) {
      toast.error('Failed to create elderly profile. Please try again.');
    }
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link href="/dashboard/family/elderly">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              <Link href="/dashboard/family" className="hover:text-sky-600 transition-colors">Portal</Link>
              <span className="opacity-30">/</span>
              <span className="text-slate-500">Care Circle</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">New Care Profile</h1>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Identity Card */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Personal Identity</CardTitle>
                  <CardDescription>Primary identification details for the care recipient.</CardDescription>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Nguyễn Văn A" className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500" {...field} />
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
                          className="h-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500 [color-scheme:light] dark:[color-scheme:dark]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice Interaction Card */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Voice & Interaction</CardTitle>
                  <CardDescription>Configure how CareBot communicates with the elderly member.</CardDescription>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Communication Language</FormLabel>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Robot Speech Speed</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </CardContent>
          </Card>

          {/* Medical Context Card */}
          <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border-l-4 border-l-rose-500">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-8 px-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Medical Overview</CardTitle>
                  <CardDescription>Primary diagnosis and daily care requirements.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              <FormField
                control={form.control}
                name="healthNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-slate-500">Health History & Daily Needs</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detail chronic conditions (e.g., Hypertension, Type-2 Diabetes), recent surgeries, or specific mobility notes..." 
                        className="min-h-[150px] bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-rose-500 p-4 resize-none leading-relaxed" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] italic">This information is used by CareBot for personalized risk monitoring.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end items-center pt-2">
            <Button variant="ghost" type="button" onClick={() => router.back()} disabled={isLoading} className="h-12 px-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all">
              Discard Changes
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 text-white min-w-[200px] h-12 rounded-xl shadow-xl shadow-sky-100 dark:shadow-none font-bold transition-all active:scale-95">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Profile...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Finalize & Create
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
