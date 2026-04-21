'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getReminderPatternLabel, getReminderTypeLabel, normalizeReminderType, normalizeReminderPattern, REMINDER_PATTERN_OPTIONS, REMINDER_TYPE_OPTIONS } from '@/lib/reminderOptions';
import { alertService } from '@/services/api/alertService';
import { caregiverService } from '@/services/api/caregiverService';
import { reminderService } from '@/services/api/reminderService';
import { roomService } from '@/services/api/roomService';
import type { AlertNotificationResponse, CaregiverProfileResponse, ReminderLogResponse, ReminderRequest, ReminderResponse, RoomElderlySummary } from '@/services/api/types';
import { getReminderDetailedStatus } from '@/utils/reminderStatus';
import { cn, parseServerDate } from '@/lib/utils';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Bell, CheckCircle2, Clock, Edit, Loader2, Plus, RefreshCw, ShieldCheck, Trash2, Users } from 'lucide-react';

const getCaregiverIdentifiers = (profile: { id?: number | null; accountId?: number | null } | null, userId?: string) => {
  return Array.from(
    new Set(
      [profile?.id, profile?.accountId, userId ? Number(userId) : undefined].filter(
        (value): value is number => typeof value === 'number' && !Number.isNaN(value)
      )
    )
  );
};

const toDateTimeLocal = (isoString: string) => {
  const d = parseServerDate(isoString);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [elderlies, setElderlies] = useState<RoomElderlySummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshingReminders, setRefreshingReminders] = useState(false);
  const [actioningReminderId, setActioningReminderId] = useState<number | null>(null);
  const [resolvingAlertId, setResolvingAlertId] = useState<number | null>(null);
  const [savingReminder, setSavingReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderResponse | null>(null);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [reminderForm, setReminderForm] = useState<ReminderRequest>(createDefaultReminderForm());
  const [error, setError] = useState<string | null>(null);
  const [elderlyFilter, setElderlyFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'missed'>('all');

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

      if (!remindersOnly) {
        const profiles = await caregiverService.getByAccountId(Number(user.id)).catch(() => [] as CaregiverProfileResponse[]);
        currentProfile = profiles[0] ?? null;
        setProfile(currentProfile);

        const loadedElderlies = currentProfile?.roomId
          ? await roomService.getElderliesByRoom(currentProfile.roomId).catch(() => [] as RoomElderlySummary[])
          : [];

        const loadedLogs = loadedElderlies.length > 0
          ? await Promise.all(loadedElderlies.map(e => reminderService.getLogsByElderlyId(e.id).catch(() => [] as ReminderLogResponse[]))).then(res => res.flat())
          : [];
        setReminderLogs(loadedLogs);

        // Load unresolved alerts for room elderlies
        const elderlyIdSet = new Set(loadedElderlies.map((item) => item.id));
        const allAlerts = await alertService.getAll().catch(() => [] as AlertNotificationResponse[]);
        setAlerts(allAlerts.filter((a) => elderlyIdSet.has(a.elderlyId) && !a.resolved));

        elderlyData = loadedElderlies;
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
    () => reminders.slice().sort((left, right) => parseServerDate(left.scheduleTime).getTime() - parseServerDate(right.scheduleTime).getTime()),
    [reminders]
  );

  const filteredReminders = useMemo(() => {
    return sortedReminders.filter((r) => {
      if (elderlyFilter !== 'all' && r.elderlyId !== elderlyFilter) return false;
      const elderly = elderlies.find(e => e.id === r.elderlyId);
      const info = getReminderDetailedStatus(r, reminderLogs, elderly?.gender);
      if (info.status === 'COMPLETED') return false; // moves to Recent Activity
      if (statusFilter === 'active') return info.status === 'UPCOMING' || info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE';
      if (statusFilter === 'missed') return info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE';
      return true;
    });
  }, [sortedReminders, elderlyFilter, statusFilter, elderlies, reminderLogs]);

  /** Confirmed reminder-logs for "Recent Activity" section, newest first */
  const completedLogs = useMemo(
    () =>
      reminderLogs
        .filter((log) => log.confirmed)
        .sort(
          (a, b) =>
            parseServerDate(b.confirmedTime || b.triggeredTime).getTime() -
            parseServerDate(a.confirmedTime || a.triggeredTime).getTime(),
        ),
    [reminderLogs],
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

  /**
   * Mark an alert as resolved.
   * Business rule: if the alert links to a reminder, deactivate that reminder
   * so it moves out of the active table (COMPLETED status → Recent Activity).
   */
  const handleMarkAlertResolved = async (alert: AlertNotificationResponse) => {
    setResolvingAlertId(alert.id);
    setError(null);
    try {
      await alertService.update(alert.id, {
        elderlyId: alert.elderlyId,
        alertType: alert.alertType,
        message: alert.message,
        resolved: true,
        reminderId: alert.reminderId ?? null,
      });
      if (alert.reminderId) {
        const linked = reminders.find((r) => r.id === alert.reminderId);
        if (linked) {
          await reminderService.update(alert.reminderId, {
            elderlyId: linked.elderlyId,
            caregiverId: linked.caregiverId,
            title: linked.title,
            reminderType: normalizeReminderType(linked.reminderType),
            scheduleTime: linked.scheduleTime,
            repeatPattern: normalizeReminderPattern(linked.repeatPattern),
            active: false,
          });
        }
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resolve alert.');
    } finally {
      setResolvingAlertId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Care Tasks</h1>
        <p className="mt-1 text-muted-foreground">Manage reminders, handle open alerts, and review completed activity for your assigned elderly.</p>
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
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Assigned Elderly</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{elderlies.length}</div><Users className="h-5 w-5 text-sky-500" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Active Reminders</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{activeReminderCount}</div><Bell className="h-5 w-5 text-amber-500" /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Overdue</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between"><div className={cn('text-3xl font-bold', overdueReminderCount > 0 ? 'text-rose-600' : '')}>{overdueReminderCount}</div><Bell className={cn('h-5 w-5', overdueReminderCount > 0 ? 'text-rose-500' : 'text-slate-400')} /></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Open Alerts</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between"><div className={cn('text-3xl font-bold', alerts.length > 0 ? 'text-rose-600' : '')}>{alerts.length}</div><AlertTriangle className={cn('h-5 w-5', alerts.length > 0 ? 'text-rose-500' : 'text-slate-400')} /></CardContent>
            </Card>
          </div>

          {/* ── Open Alerts ── */}
          <Card className="border-rose-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <AlertTriangle className="h-5 w-5 text-rose-500" /> Open Alerts
                  </CardTitle>
                  <CardDescription>
                    Unresolved alert notifications for elderly in your assigned room. Mark resolved after handling.
                  </CardDescription>
                </div>
                {alerts.length > 0 && (
                  <Badge variant="destructive" className="text-sm px-3 py-1">
                    {alerts.length} open
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  <span>No open alerts — all clear!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-rose-100 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wide">
                            {alert.alertType}
                          </Badge>
                          <span className="text-sm font-semibold text-rose-900">{alert.elderlyName}</span>
                          {alert.reminderId && (
                            <Badge variant="outline" className="text-[10px] border-rose-200 text-rose-500">
                              Reminder #{alert.reminderId}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-rose-700 mb-1">{alert.message}</p>
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {parseServerDate(alert.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-rose-200 text-rose-700 hover:bg-rose-100 shrink-0"
                        disabled={resolvingAlertId === alert.id}
                        onClick={() => handleMarkAlertResolved(alert)}
                      >
                        {resolvingAlertId === alert.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 mr-1" />
                        )}
                        Mark Resolved
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-sky-100">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold"><Bell className="h-5 w-5 text-sky-500" /> Reminders</CardTitle>
                    <CardDescription>Active and upcoming reminders. Completed ones appear in Recent Activity below.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => load({ remindersOnly: true })} disabled={refreshingReminders}>
                      {refreshingReminders ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" onClick={handleOpenCreateReminder} disabled={!profile?.id || elderlies.length === 0}>
                      <Plus className="mr-2 h-4 w-4" /> Thêm mới
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                    {(['all', 'active', 'missed'] as const).map(f => (
                      <button
                        key={f}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all',
                          statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        )}
                        onClick={() => setStatusFilter(f)}
                      >
                        {f === 'all' ? 'Tất cả' : f === 'active' ? 'Đang chờ' : 'Trễ'}
                      </button>
                    ))}
                  </div>
                  <Select
                    value={elderlyFilter === 'all' ? 'all' : String(elderlyFilter)}
                    onValueChange={(v) => setElderlyFilter(v === 'all' ? 'all' : Number(v))}
                  >
                    <SelectTrigger className="h-9 w-full sm:w-52 text-xs">
                      <SelectValue placeholder="Lọc theo người cao tuổi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả người cao tuổi</SelectItem>
                      {elderlies.map(e => (
                        <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reminders table */}
                {filteredReminders.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-sm text-center text-muted-foreground">
                    {reminders.length === 0 ? 'Chưa có reminder nào được tạo.' : 'Không có reminder khớp với bộ lọc hiện tại.'}
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-100 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="font-bold">Người cao tuổi</TableHead>
                          <TableHead className="font-bold">Tiêu đề</TableHead>
                          <TableHead className="font-bold">Loại</TableHead>
                          <TableHead className="font-bold">Giờ hẹn</TableHead>
                          <TableHead className="font-bold">Lặp lại</TableHead>
                          <TableHead className="font-bold">Trạng thái</TableHead>
                          <TableHead className="text-right font-bold pr-4">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReminders.map((reminder) => {
                          const elderly = elderlies.find(e => e.id === reminder.elderlyId);
                          const info = getReminderDetailedStatus(reminder, reminderLogs, elderly?.gender);
                          const isBusy = actioningReminderId === reminder.id;

                          const statusLabel =
                            (info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE') ? 'Trễ' :
                            (info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE') ? 'Đang chờ...' :
                            'Sắp tới';

                          const statusClassName =
                            (info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE')
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : (info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE')
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-sky-50 text-sky-700 border-sky-100';

                          return (
                            <TableRow key={reminder.id} className="hover:bg-slate-50/50">
                              <TableCell className="font-medium text-slate-700 text-sm">
                                {reminder.elderlyName || elderly?.name || `#${reminder.elderlyId}`}
                              </TableCell>
                              <TableCell className="font-semibold text-slate-900">{reminder.title}</TableCell>
                              <TableCell className="text-sm">{getReminderTypeLabel(reminder.reminderType)}</TableCell>
                              <TableCell className="text-xs text-slate-600 text-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  {parseServerDate(reminder.scheduleTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
                                  {getReminderPatternLabel(reminder.repeatPattern)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'font-bold px-2.5 py-0.5',
                                      statusClassName,
                                      (info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE') && 'animate-pulse'
                                    )}
                                  >
                                    {statusLabel}
                                  </Badge>
                                  {info.message && <span className="text-[10px] text-rose-600 font-medium">{info.message}</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right pr-4">
                                <div className="flex justify-end gap-1">
                                  <Button size="sm" variant="outline" onClick={() => handleOpenEditReminder(reminder)} disabled={isBusy}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteReminder(reminder.id)} disabled={isBusy}>
                                    {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* ── Recent Activity ── */}
          <Card className="border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Recent Activity
              </CardTitle>
              <CardDescription>
                Reminders confirmed by the robot. When an alert is resolved and its linked reminder is deactivated, it also moves here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completedLogs.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-sm text-center text-muted-foreground">
                  No completed activity yet.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="font-bold">Người cao tuổi</TableHead>
                        <TableHead className="font-bold">Reminder</TableHead>
                        <TableHead className="font-bold">Kích hoạt lúc</TableHead>
                        <TableHead className="font-bold">Xác nhận lúc</TableHead>
                        <TableHead className="font-bold">Kết quả</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-slate-700 text-sm">{log.elderlyName}</TableCell>
                          <TableCell className="font-semibold text-slate-900">{log.reminderTitle}</TableCell>
                          <TableCell className="text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {parseServerDate(log.triggeredTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-emerald-700">
                            {log.confirmedTime ? (
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3 w-3" />
                                {parseServerDate(log.confirmedTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-2.5 py-0.5">
                              Hoàn thành
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
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
                  value={toDateTimeLocal(reminderForm.scheduleTime)}
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