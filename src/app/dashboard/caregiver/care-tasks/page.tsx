'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { caregiverService } from '@/services/api/caregiverService';
import { reminderService } from '@/services/api/reminderService';
import { exerciseService } from '@/services/api/exerciseService';
import { roomService } from '@/services/api/roomService';
import type { CaregiverProfileResponse, ExerciseScriptResponse, ReminderResponse, RoomElderlySummary } from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, ArrowRight, Bell, Dumbbell, Loader2, Users } from 'lucide-react';

export default function CaregiverCareTasksPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<CaregiverProfileResponse | null>(null);
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [elderlies, setElderlies] = useState<RoomElderlySummary[]>([]);
  const [scripts, setScripts] = useState<ExerciseScriptResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const profiles = await caregiverService.getByAccountId(Number(user.id)).catch(() => [] as CaregiverProfileResponse[]);
        const currentProfile = profiles[0] ?? null;
        setProfile(currentProfile);

        const [reminderData, scriptData, elderlyData] = await Promise.all([
          currentProfile ? reminderService.getByCaregiverId(currentProfile.id).catch(() => [] as ReminderResponse[]) : Promise.resolve([] as ReminderResponse[]),
          exerciseService.getAllScripts().catch(() => [] as ExerciseScriptResponse[]),
          currentProfile?.roomId ? roomService.getElderliesByRoom(currentProfile.roomId).catch(() => [] as RoomElderlySummary[]) : Promise.resolve([] as RoomElderlySummary[]),
        ]);

        setReminders(reminderData);
        setScripts(scriptData);
        setElderlies(elderlyData);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Care Tasks</h1>
        <p className="mt-1 text-muted-foreground">Central workspace for reminders and exercise support for the elderly in your assigned room.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading care tasks...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Assigned Elderly</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{elderlies.length}</div><Users className="h-5 w-5 text-sky-500" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Reminders</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{reminders.length}</div><Bell className="h-5 w-5 text-amber-500" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Exercise Options</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{scripts.length}</div><Dumbbell className="h-5 w-5 text-emerald-500" /></CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-sky-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-sky-500" /> Reminders</CardTitle>
                <CardDescription>Create, update, and follow medication or routine reminders for your assigned elderly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Active caregiver profile: <span className="font-semibold text-foreground">{profile?.name || 'Not loaded'}</span></p>
                <Button asChild className="w-full justify-between">
                  <Link href="/dashboard/caregiver/reminders">Open Reminders <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-500" /> Exercise</CardTitle>
                <CardDescription>Review the exercise library and run suitable activities based on the elderly profile and package.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/dashboard/caregiver/exercises">Open Exercise Library <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}