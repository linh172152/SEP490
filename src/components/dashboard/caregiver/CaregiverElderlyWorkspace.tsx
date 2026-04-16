'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { differenceInYears } from 'date-fns';
import { cn } from '@/lib/utils';
import { getReminderPatternLabel, getReminderTypeLabel, normalizeReminderPattern, normalizeReminderType, REMINDER_PATTERN_OPTIONS, REMINDER_TYPE_OPTIONS } from '@/lib/reminderOptions';
import { useAuthStore } from '@/store/useAuthStore';
import { caregiverService } from '@/services/api/caregiverService';
import { roomService } from '@/services/api/roomService';
import { elderlyService } from '@/services/api/elderlyService';
import { reminderService } from '@/services/api/reminderService';
import { interactionLogService } from '@/services/api/interactionLogService';
import { alertService } from '@/services/api/alertService';
import { robotService } from '@/services/api/robotService';
import { userPackageService } from '@/services/api/userPackageService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { exerciseService } from '@/services/api/exerciseService';
import type {
  AlertNotificationResponse,
  CaregiverProfileResponse,
  ElderlyProfileResponse,
  ExerciseScriptResponse,
  ExerciseSessionResponse,
  InteractionLogResponse,
  ReminderLogResponse,
  ReminderRequest,
  ReminderResponse,
  RobotDTO,
  RobotStatusLogResponse,
  RoomElderlySummary,
  RoomResponse,
  ServicePackageResponse,
  UserPackageResponse,
} from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  MessageSquare,
  Pill,
  Plus,
  Search,
  User,
  Zap,
} from 'lucide-react';

export type CaregiverWorkspaceTab =
  | 'overview'
  | 'reminders'
  | 'robot'
  | 'logs'
  | 'room-device'
  | 'package-exercise';

const workspaceTabs: Array<{ key: CaregiverWorkspaceTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'robot', label: 'Robot Interaction' },
  { key: 'logs', label: 'Logs / History' },
  { key: 'room-device', label: 'Room / Device' },
  { key: 'package-exercise', label: 'Package / Exercise' },
];

const defaultReminderForm: Omit<ReminderRequest, 'elderlyId' | 'caregiverId'> = {
  title: '',
  reminderType: 'medication',
  scheduleTime: new Date().toISOString(),
  repeatPattern: 'daily',
  active: true,
};

const getCaregiverIdentifiers = (profile: { id?: number | null; accountId?: number | null } | null, userId?: string) => {
  return Array.from(
    new Set(
      [profile?.id, profile?.accountId, userId ? Number(userId) : undefined].filter(
        (value): value is number => typeof value === 'number' && !Number.isNaN(value)
      )
    )
  );
};

interface WorkspaceProps {
  activeTab: CaregiverWorkspaceTab;
  selectedElderlyId?: number;
}

export function CaregiverElderlyWorkspace({ activeTab, selectedElderlyId }: WorkspaceProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [loadingRoomDevice, setLoadingRoomDevice] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [runningExerciseId, setRunningExerciseId] = useState<number | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<number | null>(null);
  const [isReminderFormOpen, setIsReminderFormOpen] = useState(false);
  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfileResponse | null>(null);
  const [roomElderlies, setRoomElderlies] = useState<RoomElderlySummary[]>([]);
  const [caregiverReminders, setCaregiverReminders] = useState<ReminderResponse[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ElderlyProfileResponse | null>(null);
  const [selectedReminders, setSelectedReminders] = useState<ReminderResponse[]>([]);
  const [selectedReminderLogs, setSelectedReminderLogs] = useState<ReminderLogResponse[]>([]);
  const [selectedInteractions, setSelectedInteractions] = useState<InteractionLogResponse[]>([]);
  const [selectedAlerts, setSelectedAlerts] = useState<AlertNotificationResponse[]>([]);
  const [roomInfo, setRoomInfo] = useState<RoomResponse | null>(null);
  const [roomRobot, setRoomRobot] = useState<RobotDTO | null>(null);
  const [robotLogs, setRobotLogs] = useState<RobotStatusLogResponse[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [packageExercisesByPackageId, setPackageExercisesByPackageId] = useState<Record<number, ExerciseScriptResponse[]>>({});
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSessionResponse[]>([]);
  const [reminderForm, setReminderForm] = useState(defaultReminderForm);

  const effectiveSelectedId = selectedElderlyId && Number.isFinite(selectedElderlyId) ? selectedElderlyId : undefined;

  const loadContext = useCallback(async () => {
    if (!user?.id) {
      setLoadingContext(false);
      return;
    }

    setLoadingContext(true);
    setMessage(null);
    try {
      const profiles = await caregiverService.getByAccountId(Number(user.id));
      const currentProfile = profiles[0] ?? null;
      setCaregiverProfile(currentProfile);

      if (!currentProfile?.roomId) {
        setRoomElderlies([]);
        setCaregiverReminders([]);
        setLoadingContext(false);
        return;
      }

      const elderlies = await roomService.getElderliesByRoom(currentProfile.roomId).catch(() => [] as RoomElderlySummary[]);
      setRoomElderlies(elderlies);

      const allReminders = await reminderService.getAll().catch(() => [] as ReminderResponse[]);
      const elderlyIds = new Set(elderlies.map((item) => item.id));
      const caregiverIdentifiers = getCaregiverIdentifiers(currentProfile, user?.id);
      setCaregiverReminders(
        allReminders.filter((item) => caregiverIdentifiers.includes(item.caregiverId) && elderlyIds.has(item.elderlyId))
      );
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load caregiver room context.' });
    } finally {
      setLoadingContext(false);
    }
  }, [user?.id]);

  const loadRoomDevice = useCallback(async () => {
    if (!caregiverProfile?.roomId) {
      setRoomInfo(null);
      setRoomRobot(null);
      setRobotLogs([]);
      return;
    }

    setLoadingRoomDevice(true);
    try {
      const room = await roomService.getRoomById(caregiverProfile.roomId).catch(() => null);

      const robot = room?.robot ?? null;

      setRoomInfo(room);
      setRoomRobot(robot);

      if (robot) {
        const logs = await robotService.getStatusLogsByRobot(robot.id).catch(async () => {
          const all = await robotService.getAllStatusLogs().catch(() => [] as RobotStatusLogResponse[]);
          return all.filter((item) => item.robotId === robot.id);
        });

        setRobotLogs(
          logs.slice().sort((left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime())
        );
      } else {
        setRobotLogs([]);
      }
    } finally {
      setLoadingRoomDevice(false);
    }
  }, [caregiverProfile?.roomId]);

  const loadSelectedElderly = useCallback(async () => {
    if (!effectiveSelectedId) {
      setSelectedProfile(null);
      setSelectedReminders([]);
      setSelectedReminderLogs([]);
      setSelectedInteractions([]);
      setSelectedAlerts([]);
      return;
    }

    setLoadingSelected(true);
    try {
      const [profile, reminders, reminderLogs, interactions, alerts] = await Promise.all([
        elderlyService.getById(effectiveSelectedId),
        reminderService.getByElderlyId(effectiveSelectedId).catch(() => [] as ReminderResponse[]),
        reminderService.getLogsByElderlyId(effectiveSelectedId).catch(() => [] as ReminderLogResponse[]),
        interactionLogService.getAll().catch(() => [] as InteractionLogResponse[]),
        alertService.getAll().catch(() => [] as AlertNotificationResponse[]),
      ]);

      setSelectedProfile(profile);
      setSelectedReminders(reminders);
      setSelectedReminderLogs(reminderLogs);
      setSelectedInteractions(interactions.filter((item) => item.elderlyId === effectiveSelectedId));
      setSelectedAlerts(alerts.filter((item) => item.elderlyId === effectiveSelectedId));
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load selected elderly details.' });
    } finally {
      setLoadingSelected(false);
    }
  }, [effectiveSelectedId]);

  const loadPackageExercise = useCallback(async () => {
    if (!selectedProfile?.id || activeTab !== 'package-exercise') {
      setUserPackages([]);
      setServicePackages([]);
      setPackageExercisesByPackageId({});
      setExerciseSessions([]);
      return;
    }

    setLoadingPackages(true);
    try {
      const [packages, catalog, sessions] = await Promise.all([
        userPackageService.getByElderlyId(selectedProfile.id).catch(() => [] as UserPackageResponse[]),
        servicePackageService.getAll().catch(() => [] as ServicePackageResponse[]),
        exerciseService.getAllSessions().catch(() => [] as ExerciseSessionResponse[]),
      ]);

      const uniquePackageIds = Array.from(new Set(packages.map((item) => item.servicePackageId)));
      const packageExercises = await Promise.all(
        uniquePackageIds.map(async (packageId) => {
          const exercises = await servicePackageService.getExercises(packageId).catch(() => [] as ExerciseScriptResponse[]);
          return [packageId, exercises] as const;
        })
      );

      setUserPackages(packages);
      setServicePackages(catalog);
      setPackageExercisesByPackageId(Object.fromEntries(packageExercises));
      setExerciseSessions(sessions.filter((item) => item.elderlyId === selectedProfile.id));
    } finally {
      setLoadingPackages(false);
    }
  }, [activeTab, selectedProfile?.id]);

  useEffect(() => {
    loadContext();
  }, [loadContext]);

  useEffect(() => {
    loadRoomDevice();
  }, [loadRoomDevice]);

  useEffect(() => {
    loadSelectedElderly();
  }, [loadSelectedElderly]);

  useEffect(() => {
    loadPackageExercise();
  }, [loadPackageExercise]);

  const filteredElderlies = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return roomElderlies;
    return roomElderlies.filter((item) => item.name.toLowerCase().includes(normalized));
  }, [roomElderlies, searchQuery]);

  const selectedAlertCount = useMemo(() => selectedAlerts.filter((item) => !item.resolved).length, [selectedAlerts]);
  const selectedAge = useMemo(() => {
    if (!selectedProfile?.dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(selectedProfile.dateOfBirth));
  }, [selectedProfile?.dateOfBirth]);
  const recentActivity = useMemo(() => {
    const activities = [
      ...selectedReminderLogs.map((item) => ({
        id: `reminder-log-${item.id}`,
        label: item.reminderTitle,
        detail: `${item.robotName}${item.confirmed ? ' confirmed' : ' pending'}`,
        time: item.confirmedTime || item.triggeredTime,
      })),
      ...selectedInteractions.map((item) => ({
        id: `interaction-${item.id}`,
        label: item.interactionType,
        detail: item.userInputText,
        time: item.createdAt,
      })),
      ...selectedAlerts.map((item) => ({
        id: `alert-${item.id}`,
        label: item.alertType,
        detail: item.message,
        time: item.createdAt,
      })),
    ];

    return activities
      .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
      .slice(0, 6);
  }, [selectedAlerts, selectedInteractions, selectedReminderLogs]);
  const reminderGroups = useMemo(() => {
    const now = Date.now();
    return {
      active: selectedReminders.filter((item) => item.active && new Date(item.scheduleTime).getTime() >= now),
      missed: selectedReminders.filter((item) => item.active && new Date(item.scheduleTime).getTime() < now),
      completed: selectedReminders.filter((item) => !item.active),
    };
  }, [selectedReminders]);
  const sortedSelectedReminders = useMemo(
    () => selectedReminders.slice().sort((left, right) => new Date(right.scheduleTime).getTime() - new Date(left.scheduleTime).getTime()),
    [selectedReminders]
  );
  const sortedReminderLogs = useMemo(
    () => selectedReminderLogs.slice().sort((left, right) => new Date(right.triggeredTime).getTime() - new Date(left.triggeredTime).getTime()),
    [selectedReminderLogs]
  );
  const openAlerts = useMemo(
    () => selectedAlerts.filter((item) => !item.resolved).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [selectedAlerts]
  );
  const resolvedAlerts = useMemo(
    () => selectedAlerts.filter((item) => item.resolved).sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
    [selectedAlerts]
  );
  const activePackages = useMemo(() => {
    const now = Date.now();
    return userPackages.filter((item) => {
      const expiresAt = Date.parse(item.expiredAt);
      return Number.isNaN(expiresAt) || expiresAt >= now;
    });
  }, [userPackages]);
  const packageExerciseDetails = useMemo(() => {
    return activePackages.map((userPackage) => ({
      userPackage,
      servicePackage: servicePackages.find((item) => item.id === userPackage.servicePackageId) || null,
      exercises: packageExercisesByPackageId[userPackage.servicePackageId] || [],
    }));
  }, [activePackages, packageExercisesByPackageId, servicePackages]);
  const eligibleExercises = useMemo(() => {
    const mappedScripts = new Map<number, { script: ExerciseScriptResponse; packageNames: string[] }>();

    packageExerciseDetails.forEach(({ servicePackage: matchedPackage, exercises }) => {
      if (!matchedPackage) return;

      exercises.forEach((script) => {
        const existing = mappedScripts.get(script.id);
        if (existing) {
          if (!existing.packageNames.includes(matchedPackage.name)) {
            existing.packageNames.push(matchedPackage.name);
          }
          return;
        }

        mappedScripts.set(script.id, { script, packageNames: [matchedPackage.name] });
      });
    });

    return Array.from(mappedScripts.values());
  }, [packageExerciseDetails]);

  const navigateToElderly = (elderlyId: number, tab: CaregiverWorkspaceTab = activeTab) => {
    router.push(`/dashboard/caregiver/elderly/${elderlyId}/${tab}`);
  };

  const handleTabChange = (tab: CaregiverWorkspaceTab) => {
    if (!effectiveSelectedId) return;
    router.push(`/dashboard/caregiver/elderly/${effectiveSelectedId}/${tab}`);
  };

  const handleReminderSubmit = async () => {
    const effectiveCaregiverId = caregiverProfile?.accountId || (user?.id ? Number(user.id) : undefined) || caregiverProfile?.id;

    if (!effectiveSelectedId || !effectiveCaregiverId || !reminderForm.title.trim()) {
      setMessage({ type: 'error', text: 'Reminder requires elderly, caregiver, and title.' });
      return;
    }

    setSavingReminder(true);
    setMessage(null);

    const payload: ReminderRequest = {
      elderlyId: effectiveSelectedId,
      caregiverId: effectiveCaregiverId,
      title: reminderForm.title.trim(),
      reminderType: reminderForm.reminderType,
      scheduleTime: reminderForm.scheduleTime,
      repeatPattern: reminderForm.repeatPattern,
      active: reminderForm.active,
    };

    try {
      if (editingReminderId) {
        await reminderService.update(editingReminderId, payload);
      } else {
        await reminderService.create(payload);
      }

      setReminderForm(defaultReminderForm);
      setEditingReminderId(null);
      setIsReminderFormOpen(false);
      await Promise.all([loadContext(), loadSelectedElderly()]);
      setMessage({ type: 'success', text: editingReminderId ? 'Reminder updated successfully.' : 'Reminder created successfully.' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to save reminder.' });
    } finally {
      setSavingReminder(false);
    }
  };

  const handleReminderEdit = (reminder: ReminderResponse) => {
    setEditingReminderId(reminder.id);
    setIsReminderFormOpen(true);
    setReminderForm({
      title: reminder.title,
      reminderType: reminder.reminderType,
      scheduleTime: reminder.scheduleTime,
      repeatPattern: reminder.repeatPattern,
      active: reminder.active,
    });
  };

  const handleReminderFormToggle = () => {
    if (isReminderFormOpen && editingReminderId) {
      setEditingReminderId(null);
      setReminderForm(defaultReminderForm);
    }
    setIsReminderFormOpen((current) => !current);
  };

  const closeReminderForm = () => {
    setEditingReminderId(null);
    setReminderForm(defaultReminderForm);
    setIsReminderFormOpen(false);
  };

  const handleReminderDelete = async (reminderId: number) => {
    try {
      await reminderService.delete(reminderId);
      await Promise.all([loadContext(), loadSelectedElderly()]);
      setMessage({ type: 'success', text: 'Reminder deleted.' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to delete reminder.' });
    }
  };

  const handleResolveAlert = async (alert: AlertNotificationResponse) => {
    try {
      await alertService.update(alert.id, {
        elderlyId: alert.elderlyId,
        alertType: alert.alertType,
        message: alert.message,
        resolved: true,
        reminderId: alert.reminderId ?? null,
      });
      await loadSelectedElderly();
      setMessage({ type: 'success', text: 'Alert marked as resolved.' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to resolve alert.' });
    }
  };

  const handleRunExercise = async (exerciseId: number) => {
    if (!effectiveSelectedId || !roomRobot) {
      setMessage({ type: 'error', text: 'Exercise requires selected elderly and room robot.' });
      return;
    }

    setRunningExerciseId(exerciseId);
    try {
      const startedAt = new Date();
      await exerciseService.createSession({
        exerciseId,
        elderlyId: effectiveSelectedId,
        robotId: roomRobot.id,
        startedAt: startedAt.toISOString(),
        completedAt: new Date(startedAt.getTime() + 30 * 60_000).toISOString(),
        feedback: `Started from caregiver workspace for elderly ${effectiveSelectedId}`,
      });
      await loadPackageExercise();
      setMessage({ type: 'success', text: 'Exercise session created.' });
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to create exercise session.' });
    } finally {
      setRunningExerciseId(null);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Open Alerts" value={selectedAlertCount} icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} />
        <MetricCard title="Active Reminders" value={reminderGroups.active.length} icon={<Pill className="h-5 w-5 text-amber-500" />} />
        <MetricCard title="Recent Logs" value={selectedReminderLogs.length} icon={<Clock className="h-5 w-5 text-sky-500" />} />
        <MetricCard title="Interactions" value={selectedInteractions.length} icon={<MessageSquare className="h-5 w-5 text-emerald-500" />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Health Summary</CardTitle>
            <CardDescription>Read-only profile summary and key care context for the selected elderly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoPair label="Date of Birth" value={selectedProfile?.dateOfBirth || 'N/A'} />
            <InfoPair label="Preferred Language" value={selectedProfile?.preferredLanguage || 'N/A'} />
            <InfoPair label="Speaking Speed" value={selectedProfile?.speakingSpeed || 'N/A'} />
            <InfoPair label="Assigned Room" value={roomInfo?.roomName || (caregiverProfile?.roomId ? `Room ${caregiverProfile.roomId}` : 'Unassigned')} />
            <div className="md:col-span-2 rounded-2xl border bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Health Notes</div>
              <p className="mt-2 text-sm text-slate-700">{selectedProfile?.healthNotes || 'No health notes recorded yet.'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Alerts</CardTitle>
            <CardDescription>The caregiver should see these first before taking actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedAlerts.filter((item) => !item.resolved).length === 0 ? (
              <EmptyState text="No active alerts for this elderly profile." />
            ) : (
              selectedAlerts
                .filter((item) => !item.resolved)
                .slice(0, 4)
                .map((item) => (
                  <div key={item.id} className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-rose-700">{item.alertType.replace(/_/g, ' ')}</span>
                      <Badge variant="destructive">Open</Badge>
                    </div>
                    <p className="mt-2 text-sm text-rose-700/90">{item.message}</p>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Quick timeline of reminders, alerts, and robot interactions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.length === 0 ? (
            <EmptyState text="No recent activity yet for this elderly profile." />
          ) : (
            recentActivity.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{new Date(item.time).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderReminders = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 p-3 sm:p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[360px]">
              <HeaderStat icon={<Pill className="h-4 w-4 text-amber-500" />} label="Active" value={reminderGroups.active.length} />
              <HeaderStat icon={<Clock className="h-4 w-4 text-rose-500" />} label="Missed" value={reminderGroups.missed.length} />
              <HeaderStat icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Completed" value={reminderGroups.completed.length} />
            </div>
            <div className="flex flex-wrap items-center gap-2 xl:justify-end">
              <p className="text-xs text-muted-foreground xl:max-w-[380px] xl:text-right">
                Missed = overdue reminders still active and waiting for caregiver attention.
              </p>
              <Button size="sm" variant="outline" onClick={handleReminderFormToggle}>
                <Plus className="mr-2 h-4 w-4" />
                {isReminderFormOpen ? 'Hide Form' : 'Create Reminder'}
              </Button>
            </div>
          </div>

          {isReminderFormOpen ? (
            <div className="rounded-2xl border bg-white p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground">{editingReminderId ? 'Edit Reminder' : 'Create Reminder'}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Add or update a reminder without pushing the table too far down.</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeReminderForm}>Close</Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <FormRow label="Title">
                  <Input value={reminderForm.title} onChange={(event) => setReminderForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Example: Evening medication" />
                </FormRow>
                <FormRow label="Type">
                  <Select value={normalizeReminderType(reminderForm.reminderType)} onValueChange={(value) => setReminderForm((prev) => ({ ...prev, reminderType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormRow>
                <FormRow label="Repeat Pattern">
                  <Select value={normalizeReminderPattern(reminderForm.repeatPattern)} onValueChange={(value) => setReminderForm((prev) => ({ ...prev, repeatPattern: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_PATTERN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormRow>
                <FormRow label="Schedule Time">
                  <Input
                    type="datetime-local"
                    value={toDateTimeLocal(reminderForm.scheduleTime)}
                    onChange={(event) => setReminderForm((prev) => ({ ...prev, scheduleTime: toIsoString(event.target.value) }))}
                  />
                </FormRow>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button onClick={handleReminderSubmit} disabled={savingReminder}>
                  {savingReminder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  {editingReminderId ? 'Save Changes' : 'Create Reminder'}
                </Button>
                <Button variant="outline" onClick={closeReminderForm}>Cancel</Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Created Reminders</CardTitle>
          <CardDescription>Quick reminder workspace for the selected elderly profile.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSelectedReminders.length === 0 ? (
            <EmptyState text="No reminders created for this elderly profile yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSelectedReminders.map((item) => {
                  const isMissed = item.active && new Date(item.scheduleTime).getTime() < Date.now();
                  const statusLabel = !item.active ? 'Completed' : isMissed ? 'Missed' : 'Active';
                  const statusClassName = !item.active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isMissed
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200';

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{getReminderTypeLabel(item.reminderType)}</TableCell>
                      <TableCell>{new Date(item.scheduleTime).toLocaleString()}</TableCell>
                      <TableCell>{getReminderPatternLabel(item.repeatPattern)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusClassName}>{statusLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleReminderEdit(item)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReminderDelete(item.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reminder Logs</CardTitle>
          <CardDescription>Robot delivery results for this elderly profile. Green means confirmed, red means not confirmed yet.</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedReminderLogs.length === 0 ? (
            <EmptyState text="No reminder logs for this elderly profile yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reminder</TableHead>
                  <TableHead>Robot</TableHead>
                  <TableHead>Triggered</TableHead>
                  <TableHead>Confirmed</TableHead>
                  <TableHead>Confirmed Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedReminderLogs.map((item) => (
                  <TableRow key={item.id} className={item.confirmed ? 'bg-emerald-50/70 hover:bg-emerald-50' : 'bg-rose-50/70 hover:bg-rose-50'}>
                    <TableCell className="font-medium">{item.reminderTitle}</TableCell>
                    <TableCell>{item.robotName}</TableCell>
                    <TableCell>{new Date(item.triggeredTime).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={item.confirmed ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}>
                        {item.confirmed ? 'Confirmed' : 'Not Confirmed'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.confirmedTime ? new Date(item.confirmedTime).toLocaleString() : 'Pending'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Open Alerts</CardTitle>
            <CardDescription>Caregiver should review these unresolved alerts and update them after handling the elderly.</CardDescription>
          </CardHeader>
          <CardContent>
            {openAlerts.length === 0 ? (
              <EmptyState text="No unresolved alerts for this elderly profile." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openAlerts.map((item) => (
                    <TableRow key={item.id} className="bg-rose-50/70 hover:bg-rose-50">
                      <TableCell className="font-medium">{item.alertType.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="max-w-[320px] whitespace-normal">{item.message}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <Button size="sm" onClick={() => handleResolveAlert(item)}>Mark Resolved</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolved Alerts</CardTitle>
            <CardDescription>Handled alerts are shown here with green rows for quick confirmation.</CardDescription>
          </CardHeader>
          <CardContent>
            {resolvedAlerts.length === 0 ? (
              <EmptyState text="No resolved alerts for this elderly profile yet." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedAlerts.map((item) => (
                    <TableRow key={item.id} className="bg-emerald-50/70 hover:bg-emerald-50">
                      <TableCell className="font-medium">{item.alertType.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="max-w-[320px] whitespace-normal">{item.message}</TableCell>
                      <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRobot = () => (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <Card>
        <CardHeader>
          <CardTitle>Robot Context</CardTitle>
          <CardDescription>Read-only details for the assigned robot and the interaction history of this elderly profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border bg-slate-50 p-4 text-sm">
            <div className="font-semibold">Assigned Robot</div>
            <p className="mt-1 text-muted-foreground">{roomRobot ? `${roomRobot.robotName} • ${roomRobot.model} • ${roomRobot.status}` : 'No robot assigned to this room.'}</p>
          </div>
          <InfoPair label="Robot Name" value={roomRobot?.robotName || 'No robot assigned'} />
          <InfoPair label="Model" value={roomRobot?.model || 'N/A'} />
          <InfoPair label="Status" value={roomRobot?.status || 'Unknown'} />
          <div className="rounded-2xl border bg-slate-50 p-4 text-sm">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Interaction Summary</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-white p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Total Interactions</div>
                <div className="mt-2 text-2xl font-bold text-foreground">{selectedInteractions.length}</div>
              </div>
              <div className="rounded-xl border bg-white p-3">
                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Latest Interaction</div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {selectedInteractions[0] ? new Date(selectedInteractions[0].createdAt).toLocaleString() : 'No history yet'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation Feed</CardTitle>
          <CardDescription>Detailed read-only history with timestamps, emotion labels, and both sides of the conversation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedInteractions.length === 0 ? (
            <EmptyState text="No robot interactions recorded yet." />
          ) : (
            selectedInteractions
              .slice()
              .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
              .map((item) => (
                <div key={item.id} className="rounded-2xl border p-4 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold uppercase tracking-wide text-sky-700">{item.interactionType}</span>
                        <Badge variant="outline">{item.emotionDetected || 'no emotion'}</Badge>
                        <Badge variant="secondary">{item.robotName}</Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Interaction ID #{item.id} • Elderly: {item.elderlyName}</p>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Elderly</div>
                        <div className="text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleTimeString()}</div>
                      </div>
                      <p className="mt-1">{item.userInputText}</p>
                    </div>
                    <div className="rounded-2xl bg-sky-50 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-sky-600">Robot</div>
                        <div className="text-[11px] text-sky-700/80">{item.robotName}</div>
                      </div>
                      <p className="mt-1 text-sky-900">{item.robotResponseText}</p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderLogs = () => (
    <div className="grid gap-6 xl:grid-cols-3">
      <LogCard title="Reminder Logs" items={selectedReminderLogs.map((item) => ({ id: item.id, primary: item.reminderTitle, secondary: `${item.robotName} • ${item.confirmed ? 'Confirmed' : 'Pending'}`, time: item.confirmedTime || item.triggeredTime }))} />
      <LogCard title="Interaction Logs" items={selectedInteractions.map((item) => ({ id: item.id, primary: item.interactionType, secondary: item.userInputText, time: item.createdAt }))} />
      <LogCard title="Alert History" items={selectedAlerts.map((item) => ({ id: item.id, primary: item.alertType.replace(/_/g, ' '), secondary: item.message, time: item.createdAt }))} />
    </div>
  );

  const renderRoomDevice = () => (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Room Context</CardTitle>
          <CardDescription>Operational context for caregiver and robot in the assigned room.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingRoomDevice ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading room and device context...</div> : null}
          <InfoPair label="Room" value={roomInfo?.roomName || (caregiverProfile?.roomId ? `Room ${caregiverProfile.roomId}` : 'Unassigned')} />
          <InfoPair label="Manager" value={roomInfo?.managerName || 'N/A'} />
          <InfoPair label="Robot" value={roomRobot?.robotName || 'No robot assigned'} />
          <InfoPair label="Robot Model" value={roomRobot?.model || 'N/A'} />
          <InfoPair label="Robot ID" value={roomRobot?.id ? `${roomRobot.id}` : 'N/A'} />
          <div className="rounded-2xl border bg-slate-50 p-4 text-sm">
            <div className="font-semibold">Device Health</div>
            <p className="mt-2 text-muted-foreground">{robotLogs[0] ? `Latest robot status: ${robotLogs[0].status}` : 'No robot device status logs yet.'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Robot Status History</CardTitle>
          <CardDescription>Recent device and room status changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {robotLogs.length === 0 ? (
            <EmptyState text="No robot status logs available." />
          ) : (
            robotLogs.map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{item.status}</span>
                  <Badge variant="outline">{item.robotName}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{new Date(item.reportedAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderPackageExercise = () => (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>Service Plan Context</CardTitle>
          <CardDescription>Not core to the caregiver workflow, but useful for exercise and entitlement checks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPackages ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading package and exercise context...</div> : null}
          <div className="rounded-2xl border bg-slate-50 p-4">
            <div className="text-sm font-semibold">Active Service Plans</div>
            <div className="mt-3 space-y-3">
              {packageExerciseDetails.length === 0 ? <Badge variant="secondary">No active plan</Badge> : packageExerciseDetails.map(({ userPackage, servicePackage, exercises }) => (
                <div key={userPackage.id} className="rounded-2xl border bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{servicePackage?.name || `Package #${userPackage.servicePackageId}`}</div>
                      <div className="text-xs text-muted-foreground">Assigned {new Date(userPackage.assignedAt).toLocaleDateString()} • Expires {new Date(userPackage.expiredAt).toLocaleDateString()}</div>
                    </div>
                    <Badge variant="outline">{servicePackage?.level || 'Unknown'}</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Included Exercises</div>
                    {exercises.length === 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">This package does not have an exercise list configured yet.</p>
                    ) : (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {exercises.map((exercise) => (
                          <Badge key={exercise.id} variant="secondary" className="max-w-full truncate">
                            {exercise.name} • {exercise.durationMinutes} min
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {eligibleExercises.length === 0 ? (
              <EmptyState text="No eligible exercises available for the current service plan." />
            ) : (
              eligibleExercises.map(({ script, packageNames }) => (
                <div key={script.id} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">{script.name}</div>
                      <div className="text-xs text-muted-foreground">{script.durationMinutes} min • {script.difficultyLevel || script.level || 'Unknown'}</div>
                    </div>
                    <Button size="sm" onClick={() => handleRunExercise(script.id)} disabled={runningExerciseId === script.id || !roomRobot}>
                      {runningExerciseId === script.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Unlocked by: {packageNames.join(', ')}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exercise Session History</CardTitle>
          <CardDescription>Recent exercise sessions executed for the selected elderly profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {exerciseSessions.length === 0 ? (
            <EmptyState text="No exercise sessions recorded yet." />
          ) : (
            exerciseSessions
              .slice()
              .sort((left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime())
              .map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{item.exerciseName}</span>
                    <Badge variant="outline">{item.robotName}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{new Date(item.startedAt).toLocaleString()}</p>
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    if (!effectiveSelectedId) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-sky-50 p-4 text-sky-600"><User className="h-8 w-8" /></div>
            <div>
              <h3 className="text-xl font-semibold">Select an elderly profile</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">Start from the list on the left. After choosing an elderly profile, the workspace will guide you through overview, reminders, robot interaction, logs, room/device, and package/exercise tabs.</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'reminders':
        return renderReminders();
      case 'robot':
        return renderRobot();
      case 'logs':
        return renderLogs();
      case 'room-device':
        return renderRoomDevice();
      case 'package-exercise':
        return renderPackageExercise();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(0,4fr)] 2xl:grid-cols-[240px_minmax(0,4.2fr)]">
        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Elderly</CardTitle>
              <CardDescription>Compact master list filtered by caregiver room context.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border bg-slate-50 p-4 text-sm">
                <div className="font-semibold">Caregiver</div>
                <p className="mt-1 text-muted-foreground">{loadingContext ? 'Loading...' : caregiverProfile?.name || 'No caregiver profile found'}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {caregiverProfile?.roomId ? `Room ${caregiverProfile.roomId}` : 'No room assigned'}</div>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search elderly name..." className="pl-9" />
              </div>
              {loadingContext ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading room elderly...</div>
              ) : filteredElderlies.length === 0 ? (
                <EmptyState text="No elderly profiles assigned to this caregiver room yet." />
              ) : (
                <div className="max-h-[56vh] overflow-y-auto pr-1">
                  <div className="space-y-2">
                    {filteredElderlies.map((item) => {
                      const reminderCount = caregiverReminders.filter((reminder) => reminder.elderlyId === item.id).length;
                      const isActive = effectiveSelectedId === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateToElderly(item.id)}
                          className={cn(
                            'group w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
                            isActive
                              ? 'border-sky-500 bg-sky-50 shadow-sm ring-1 ring-sky-200'
                              : 'border-slate-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50/60 hover:shadow-sm'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">ID {item.id}</div>
                            </div>
                            <ArrowRight
                              className={cn(
                                'mt-0.5 h-4 w-4 shrink-0 transition-transform duration-200',
                                isActive ? 'text-sky-600' : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-sky-500'
                              )}
                            />
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <Badge variant="outline" className="px-2 py-0 text-[10px]">{reminderCount} reminders</Badge>
                            <Badge variant="secondary" className="px-2 py-0 text-[10px]">Room</Badge>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-4">
          <div className="sticky top-20 z-30 -mx-2 rounded-[24px] bg-background/98 px-2 pb-3 pt-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/88">
            <div className="space-y-2 rounded-2xl bg-background">
            <div className="rounded-2xl border bg-background px-4 py-3 shadow-sm">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{selectedProfile ? `Age ${selectedAge ?? 'N/A'}` : 'Select elderly'}</span>
                    <span className={cn('rounded-full px-2.5 py-1', selectedAlertCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
                      {selectedAlertCount > 0 ? `${selectedAlertCount} open alerts` : 'No open alerts'}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{roomInfo?.roomName || (caregiverProfile?.roomId ? `Room ${caregiverProfile.roomId}` : 'No room')}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-lg font-bold tracking-tight text-foreground">{selectedProfile?.name || 'No elderly selected'}</h2>
                    {selectedProfile ? <span className="text-sm text-muted-foreground">{selectedProfile.preferredLanguage} • {selectedProfile.speakingSpeed}</span> : null}
                    {caregiverProfile?.name ? <span className="text-sm text-muted-foreground">Caregiver {caregiverProfile.name}</span> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="rounded-xl border bg-slate-50 px-3 py-1.5 text-right">
                    <div className="font-bold text-slate-500">Reminders</div>
                    <div className="text-sm font-semibold text-slate-900">{selectedReminders.length}</div>
                  </div>
                  <div className="rounded-xl border bg-slate-50 px-3 py-1.5 text-right">
                    <div className="font-bold text-slate-500">Robot</div>
                    <div className="text-sm font-semibold text-slate-900">{roomRobot?.robotName || 'N/A'}</div>
                  </div>
                  <div className="rounded-xl border bg-slate-50 px-3 py-1.5 text-right">
                    <div className="font-bold text-slate-500">Logs</div>
                    <div className="text-sm font-semibold text-slate-900">{selectedReminderLogs.length + selectedInteractions.length}</div>
                  </div>
                </div>
              </div>

              {message ? (
                <div className={cn('mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm', message.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')}>
                  {message.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span className="truncate">{message.text}</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border bg-background p-2 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {workspaceTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    disabled={!effectiveSelectedId}
                    className={cn(
                      'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                      activeTab === tab.key ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      !effectiveSelectedId && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>

          {loadingSelected && effectiveSelectedId ? (
            <Card>
              <CardContent className="flex min-h-[260px] items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" /> Loading selected elderly workspace...
              </CardContent>
            </Card>
          ) : renderTabContent()}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium uppercase text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfoPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4 text-sm">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-2 font-medium text-slate-800">{value}</div>
    </div>
  );
}

function HeaderStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-slate-50 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-[11px] font-bold uppercase tracking-wider">{label}</span></div>
      <div className="mt-1 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>;
}

function LogCard({ title, items }: { title: string; items: Array<{ id: number; primary: string; secondary: string; time: string }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <EmptyState text={`No entries in ${title.toLowerCase()}.`} />
        ) : (
          items
            .slice()
            .sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime())
            .map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="font-semibold">{item.primary}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.secondary}</div>
                <div className="mt-2 text-xs text-muted-foreground">{new Date(item.time).toLocaleString()}</div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIsoString(value: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}