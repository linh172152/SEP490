'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { getReminderPatternLabel, getReminderTypeLabel, normalizeReminderType, REMINDER_PATTERN_OPTIONS, REMINDER_TYPE_OPTIONS } from '@/lib/reminderOptions';
import { caregiverService } from '@/services/api/caregiverService';
import { reminderService } from '@/services/api/reminderService';
import { exerciseService } from '@/services/api/exerciseService';
import { roomService } from '@/services/api/roomService';
import type { CaregiverProfileResponse, ExerciseScriptResponse, ReminderLogResponse, ReminderRequest, ReminderResponse, RoomElderlySummary } from '@/services/api/types';
import { getReminderDetailedStatus } from '@/utils/reminderStatus';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, ArrowRight, Bell, Dumbbell, Edit, ExternalLink, Loader2, Plus, RefreshCw, Trash2, Users } from 'lucide-react';

const getCaregiverIdentifiers = (profile: { id?: number | null; accountId?: number | null } | null, userId?: string) => {
  return Array.from(
    new Set(
      [profile?.id, profile?.accountId, userId ? Number(userId) : undefined].filter(
        (value): value is number => typeof value === 'number' && !Number.isNaN(value)
      )
    )
  );
};

const createDefaultReminderForm = (caregiverId = 0, elderlyId = 0): ReminderRequest => ({
  elderlyId,
  caregiverId,
  title: '',
  reminderType: 'medication',
  scheduleTime: new Date().toISOString(),
  repeatPattern: 'daily',
  active: true,
});

export default function CaregiverCareTasksPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<CaregiverProfileResponse | null>(null);
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLogResponse[]>([]);
  const [elderlies, setElderlies] = useState<RoomElderlySummary[]>([]);

  const [scripts, setScripts] = useState<ExerciseScriptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingReminders, setRefreshingReminders] = useState(false);
  const [actioningReminderId, setActioningReminderId] = useState<number | null>(null);
  const [savingReminder, setSavingReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderResponse | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [reminderForm, setReminderForm] = useState<ReminderRequest>(createDefaultReminderForm());
  const [error, setError] = useState<string | null>(null);

  const load = async (options?: { remindersOnly?: boolean }) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const remindersOnly = options?.remindersOnly ?? false;

    if (remindersOnly) {
      setRefreshingReminders(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      let currentProfile = profile;
      let elderlyData = elderlies;
      let scriptData = scripts;

      if (!remindersOnly) {
        const profiles = await caregiverService.getByAccountId(Number(user.id)).catch(() => [] as CaregiverProfileResponse[]);
        currentProfile = profiles[0] ?? null;
        setProfile(currentProfile);

        const [loadedScripts, loadedElderlies] = await Promise.all([
          exerciseService.getAllScripts().catch(() => [] as ExerciseScriptResponse[]),
          currentProfile?.roomId
            ? roomService.getElderliesByRoom(currentProfile.roomId).catch(() => [] as RoomElderlySummary[])
            : Promise.resolve([] as RoomElderlySummary[]),
        ]);

        const loadedLogs = currentProfile?.roomId 
          ? await Promise.all(loadedElderlies.map(e => reminderService.getLogsByElderlyId(e.id).catch(() => [] as ReminderLogResponse[]))).then(res => res.flat())
          : [];
        setReminderLogs(loadedLogs);


        scriptData = loadedScripts;
        elderlyData = loadedElderlies;
        setScripts(loadedScripts);
        setElderlies(loadedElderlies);
      }

      const elderlyIds = new Set(elderlyData.map((item) => item.id));
      const caregiverIdentifiers = getCaregiverIdentifiers(currentProfile, user?.id);

      // Try to get specific reminders for this caregiver to avoid 400 Access Denied on global endpoint
      let relevantReminders: ReminderResponse[] = [];
      if (currentProfile?.id) {
        relevantReminders = await reminderService.getByCaregiverId(currentProfile.id).catch(() => [] as ReminderResponse[]);
      } else {
        const allReminders = await reminderService.getAll().catch(() => [] as ReminderResponse[]);
        relevantReminders = allReminders.filter((item) => caregiverIdentifiers.includes(item.caregiverId));
      }

      setReminders(
        relevantReminders.filter((item) => elderlyIds.has(item.elderlyId))
      );
      setScripts(scriptData);
      setElderlies(elderlyData);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load caregiver care tasks.');
    } finally {
      if (remindersOnly) {
        setRefreshingReminders(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    load();
    // The shared load function is intentionally keyed to auth changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const sortedReminders = useMemo(
    () => reminders.slice().sort((left, right) => new Date(left.scheduleTime).getTime() - new Date(right.scheduleTime).getTime()),
    [reminders]
  );

  const activeReminderCount = useMemo(() => reminders.filter((item) => {
    if (!item.active) return false;
    const elderly = elderlies.find(e => e.id === item.elderlyId);
    const info = getReminderDetailedStatus(item, reminderLogs, elderly?.gender);
    return info.status !== 'COMPLETED';
  }).length, [reminders, reminderLogs, elderlies]);


  const overdueReminderCount = useMemo(
    () => reminders.filter((item) => {
      if (!item.active) return false;
      const elderly = elderlies.find(e => e.id === item.elderlyId);
      const info = getReminderDetailedStatus(item, reminderLogs, elderly?.gender);
      return info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE';
    }).length,
    [reminders, reminderLogs, elderlies]
  );



  const resetReminderForm = () => {
    setEditingReminder(null);
    setReminderForm(createDefaultReminderForm(profile?.id || 0, elderlies[0]?.id || 0));
  };

  const handleOpenCreateReminder = () => {
    resetReminderForm();
    setIsReminderDialogOpen(true);
  };

  const handleOpenEditReminder = (reminder: ReminderResponse) => {
    setEditingReminder(reminder);
    setReminderForm({
      elderlyId: reminder.elderlyId,
      caregiverId: profile?.id || reminder.caregiverId,
      title: reminder.title,
      reminderType: normalizeReminderType(reminder.reminderType),
      scheduleTime: reminder.scheduleTime,
      repeatPattern: reminder.repeatPattern,
      active: reminder.active,
    });
    setIsReminderDialogOpen(true);
  };

  const handleReminderDialogChange = (open: boolean) => {
    setIsReminderDialogOpen(open);
    if (!open) {
      resetReminderForm();
    }
  };

  const handleSubmitReminder = async () => {
    const effectiveCaregiverId = profile?.id;

    if (!effectiveCaregiverId) {
      setError('Caregiver profile not loaded.');
      return;
    }

    if (!reminderForm.elderlyId || !reminderForm.title.trim()) {
      setError('Reminder requires an elderly profile and title.');
      return;
    }

    setSavingReminder(true);
    setError(null);

    const payload: ReminderRequest = {
      ...reminderForm,
      caregiverId: effectiveCaregiverId,
      title: reminderForm.title.trim(),
      reminderType: normalizeReminderType(reminderForm.reminderType),
    };

    try {
      if (editingReminder) {
        await reminderService.update(editingReminder.id, payload);
      } else {
        await reminderService.create(payload);
      }

      await load({ remindersOnly: true });
      handleReminderDialogChange(false);
    } catch (actionError: unknown) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to save reminder.');
    } finally {
      setSavingReminder(false);
    }
  };

  const handleDeleteReminder = async (reminderId: number) => {
    setActioningReminderId(reminderId);
    setError(null);
    try {
      await reminderService.delete(reminderId);
      await load({ remindersOnly: true });
    } catch (actionError: unknown) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to delete reminder.');
    } finally {
      setActioningReminderId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Care Tasks</h1>
        <p className="mt-1 text-muted-foreground">Central workspace for reminders and exercise support for the elderly in your assigned room.</p>
      </div>

      {error ? (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-4 text-sm text-rose-700">{error}</CardContent>
        </Card>
      ) : null}

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
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-sky-500" /> Reminders</CardTitle>
                    <CardDescription>Create, update, and follow medication or routine reminders for your assigned elderly.</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleOpenCreateReminder} disabled={!profile?.id || elderlies.length === 0}>
                    <Plus className="mr-2 h-4 w-4" /> Quick Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 p-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Active caregiver profile</p>
                    <p className="font-semibold text-foreground">{profile?.name || 'Not loaded'} {profile?.id ? `• ID ${profile.id}` : ''}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => load({ remindersOnly: true })} disabled={refreshingReminders}>
                    {refreshingReminders ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Refresh
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <div className="text-xs font-bold uppercase text-muted-foreground">Active</div>
                    <div className="mt-2 text-2xl font-bold text-foreground">{activeReminderCount}</div>
                  </div>
                  <div className="rounded-xl border p-4">
                    <div className="text-xs font-bold uppercase text-muted-foreground">Overdue</div>
                    <div className="mt-2 text-2xl font-bold text-rose-600">{overdueReminderCount}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {sortedReminders.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                      No reminders found for this caregiver ID from GET /api/reminders.
                    </div>
                  ) : (
                    sortedReminders.map((reminder) => {
                      const isOverdue = reminder.active && new Date(reminder.scheduleTime).getTime() < Date.now();
                      const isBusy = actioningReminderId === reminder.id;

                      return (
                        <div key={reminder.id} className="rounded-xl border p-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="font-semibold text-foreground">{reminder.title}</div>
                                  <Badge variant={reminder.active ? 'default' : 'secondary'}>
                                    {reminder.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {(() => {
                                    const elderly = elderlies.find(e => e.id === reminder.elderlyId);
                                    const info = getReminderDetailedStatus(reminder, reminderLogs, elderly?.gender);
                                    if (info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE') {
                                      return <Badge variant="destructive" className="animate-pulse">{info.message || 'Overdue'}</Badge>;
                                    }
                                    if (info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE') {
                                      return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 animate-pulse">Waiting...</Badge>;
                                    }
                                    return null;
                                  })()}
                                </div>

                              <div className="text-sm text-muted-foreground">
                                {reminder.elderlyName || `Elderly #${reminder.elderlyId}`} • {getReminderTypeLabel(reminder.reminderType)} • {getReminderPatternLabel(reminder.repeatPattern)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Scheduled: {new Date(reminder.scheduleTime).toLocaleString()}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleOpenEditReminder(reminder)} disabled={isBusy}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/dashboard/caregiver/elderly/${reminder.elderlyId}/reminders`}>
                                  <ExternalLink className="mr-2 h-4 w-4" /> Open Elderly
                                </Link>
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteReminder(reminder.id)} disabled={isBusy}>
                                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button asChild className="w-full justify-between">
                  <Link href="/dashboard/caregiver/reminders">Open Full Reminders <ArrowRight className="h-4 w-4" /></Link>
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

      <Dialog open={isReminderDialogOpen} onOpenChange={handleReminderDialogChange}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingReminder ? 'Edit Reminder' : 'Quick Add Reminder'}</DialogTitle>
            <DialogDescription>
              Save a reminder for an elderly person in the currently assigned caregiver room.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="care-task-reminder-title">Title</Label>
              <Input
                id="care-task-reminder-title"
                value={reminderForm.title}
                onChange={(event) => setReminderForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Example: Evening medication"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Elderly</Label>
                <Select
                  value={String(reminderForm.elderlyId || '')}
                  onValueChange={(value) => setReminderForm((current) => ({ ...current, elderlyId: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select elderly" />
                  </SelectTrigger>
                  <SelectContent>
                    {elderlies.map((elderly) => (
                      <SelectItem key={elderly.id} value={String(elderly.id)}>{elderly.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={normalizeReminderType(reminderForm.reminderType)}
                  onValueChange={(value) => setReminderForm((current) => ({ ...current, reminderType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                      {REMINDER_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="care-task-reminder-time">Schedule Time</Label>
                <Input
                  id="care-task-reminder-time"
                  type="datetime-local"
                  value={reminderForm.scheduleTime.slice(0, 16)}
                  onChange={(event) => setReminderForm((current) => ({
                    ...current,
                    scheduleTime: new Date(event.target.value).toISOString(),
                  }))}
                />
              </div>

              <div className="grid gap-2">
                <Label>Repeat Pattern</Label>
                <Select
                  value={reminderForm.repeatPattern}
                  onValueChange={(value) => setReminderForm((current) => ({ ...current, repeatPattern: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                      {REMINDER_PATTERN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3 text-sm text-muted-foreground">
              Current selection: <span className="font-medium text-foreground">{getReminderTypeLabel(reminderForm.reminderType)} • {getReminderPatternLabel(reminderForm.repeatPattern)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleReminderDialogChange(false)} disabled={savingReminder}>Cancel</Button>
            <Button onClick={handleSubmitReminder} disabled={savingReminder || !profile?.id || elderlies.length === 0}>
              {savingReminder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingReminder ? 'Save Changes' : 'Create Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}