'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { ReminderRequest } from '@/services/api/types';

const reminderSchema = z.object({
  title: z.string().min(3, 'Please enter a title'),
  elderlyId: z.number().min(1, 'Please select a family member'),
  reminderType: z.string().min(1),
  scheduleTime: z.string().min(1, 'Schedule time is required'),
  repeatPattern: z.string().min(1, 'Repeat pattern is required'),
  active: z.boolean(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

export default function CreateFamilyReminderPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { elderlyList, fetchDashboardData, createReminder, isLoading } = useFamilyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id && elderlyList.length === 0) {
      fetchDashboardData(Number(user.id));
    }
  }, [user?.id, elderlyList.length, fetchDashboardData]);

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: '',
      elderlyId: elderlyList[0]?.id ?? 0,
      reminderType: 'MEDICINE',
      scheduleTime: new Date().toISOString().slice(0, 16),
      repeatPattern: 'daily',
      active: true,
    },
  });

  const onSubmit = async (values: ReminderFormValues) => {
    if (!user?.id) {
      toast.error('Please login again to schedule reminders.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ReminderRequest = {
        elderlyId: values.elderlyId,
        caregiverId: 11,
        title: values.title,
        reminderType: values.reminderType,
        scheduleTime: new Date(values.scheduleTime).toISOString(),
        repeatPattern: values.repeatPattern,
        active: values.active,
      };
      await createReminder(payload);
      toast.success('Reminder scheduled successfully.');
      router.push('/dashboard/family/reminders');
    } catch {
      toast.error('Failed to schedule reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Link href="/dashboard/family/reminders">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-3">Schedule New Reminder</h1>
          <p className="text-muted-foreground mt-1">Create a new care reminder for a family member.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/95 dark:bg-slate-950/90">
        <CardHeader className="border-b px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Reminder Details</CardTitle>
              <CardDescription>Pick the recipient and set the care schedule.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Take blood pressure medication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="elderlyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Member</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select member" />
                          </SelectTrigger>
                          <SelectContent>
                            {elderlyList.map((elderly) => (
                              <SelectItem key={elderly.id} value={elderly.id.toString()}>
                                {elderly.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEDICINE">Medication</SelectItem>
                            <SelectItem value="EXERCISE">Exercise</SelectItem>
                            <SelectItem value="MEAL">Meal</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="scheduleTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repeatPattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat Pattern</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="once">Once</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Reminder Status</FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" asChild className="h-12">
                  <Link href="/dashboard/family/reminders">Cancel</Link>
                </Button>
                <Button type="submit" className="h-12 bg-sky-600 hover:bg-sky-700 text-white" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? 'Saving...' : 'Create Reminder'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
