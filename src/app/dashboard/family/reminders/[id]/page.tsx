'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { reminderService } from '@/services/api/reminderService';
import { ReminderResponse } from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function FamilyReminderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reminder, setReminder] = useState<ReminderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const id = Number(params.id);

  useEffect(() => {
    const loadReminder = async () => {
      if (!id || Number.isNaN(id)) {
        setError('Reminder ID is invalid.');
        setIsLoading(false);
        return;
      }

      try {
        const data = await reminderService.getById(id);
        setReminder(data);
      } catch (err) {
        setError('Unable to load reminder details.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReminder();
  }, [id]);

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight mt-3">Reminder Details</h1>
          <p className="text-muted-foreground mt-1">Review the scheduled reminder and recipient details.</p>
        </div>
        <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white h-11 px-6">
          <Link href="/dashboard/family/reminders">Back to Reminders</Link>
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-white/95 dark:bg-slate-950/90">
        <CardHeader className="border-b px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>{reminder ? reminder.title : 'Loading reminder...'}</CardTitle>
              <CardDescription>
                {reminder ? `Assigned to ${reminder.elderlyName}` : 'Fetching reminder details.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 py-6 space-y-6">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-16">Loading reminder information...</div>
          ) : error ? (
            <div className="text-center text-rose-600 py-16">{error}</div>
          ) : reminder ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Type</p>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{reminder.reminderType}</div>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Repeat Pattern</p>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{reminder.repeatPattern}</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Scheduled Time</p>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{new Date(reminder.scheduleTime).toLocaleString()}</div>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Status</p>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{reminder.active ? 'Active' : 'Inactive'}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                  <span className="h-4 w-4 rounded-full bg-sky-100 text-sky-600 grid place-items-center">R</span> Description
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">Care reminder for {reminder.elderlyName} assigned by {reminder.caregiverName}. Follow the schedule exactly to maintain care continuity.</p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
