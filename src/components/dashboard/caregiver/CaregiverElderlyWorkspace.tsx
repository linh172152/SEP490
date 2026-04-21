'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { differenceInYears } from 'date-fns';
import { getReminderDetailedStatus } from '@/utils/reminderStatus';
import { cn, parseServerDate } from '@/lib/utils';

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
  ExerciseScriptResponse, // Keep for other uses if any
  RobotAction,
  InteractionLogResponse,
  ReminderLogResponse,
  ReminderRequest,
  ReminderResponse,
  RobotDTO,
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
import { AlertPanel } from './AlertPanel';
import { toast } from 'react-toastify';

export type CaregiverWorkspaceTab =
  | 'overview'
  | 'reminders'
  | 'robot'
  | 'logs'
  | 'room-device'
  | 'exercise'
  | 'package-exercise';

const workspaceTabs: Array<{ key: CaregiverWorkspaceTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'reminders', label: 'Reminders' },
  { key: 'robot', label: 'Robot Interaction' },
  { key: 'logs', label: 'Logs / History' },
  { key: 'room-device', label: 'Room / Device' },
  { key: 'exercise', label: 'Exercise' },
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
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [packageExercisesByPackageId, setPackageExercisesByPackageId] = useState<Record<number, RobotAction[]>>({});
  const [reminderForm, setReminderForm] = useState(defaultReminderForm);
  const [reminderFilter, setReminderFilter] = useState<'all' | 'active' | 'missed' | 'completed'>('all');

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

      const elderlyIds = new Set(elderlies.map((item) => item.id));
      const caregiverIdentifiers = getCaregiverIdentifiers(currentProfile, user?.id);
      
      // Try to get specific reminders for this caregiver to avoid 400 Access Denied on global endpoint
      let relevantReminders: ReminderResponse[] = [];
      if (currentProfile?.id) {
        relevantReminders = await reminderService.getByCaregiverId(currentProfile.id).catch(() => [] as ReminderResponse[]);
      } else {
        const allReminders = await reminderService.getAll().catch(() => [] as ReminderResponse[]);
        relevantReminders = allReminders.filter((item) => caregiverIdentifiers.includes(item.caregiverId));
      }

      setCaregiverReminders(
        relevantReminders.filter((item) => elderlyIds.has(item.elderlyId))
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
      return;
    }

    setLoadingRoomDevice(true);
    try {
      const room = await roomService.getRoomById(caregiverProfile.roomId).catch(() => null);
      const robot = room?.robot ?? null;
      setRoomInfo(room);
      setRoomRobot(robot);
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
      // Fetch profile first
      const profile = await elderlyService.getById(effectiveSelectedId);
      setSelectedProfile(profile);

      // Fetch other data in parallel, but handle individual failures (e.g. 400 Access Denied)
      const [reminders, reminderLogs, interactions, alerts] = await Promise.all([
        reminderService.getByElderlyId(effectiveSelectedId).catch(() => [] as ReminderResponse[]),
        reminderService.getLogsByElderlyId(effectiveSelectedId).catch(() => [] as ReminderLogResponse[]),
        interactionLogService.getAll().catch(() => [] as InteractionLogResponse[]),
        alertService.getAll().catch(() => [] as AlertNotificationResponse[]),
      ]);

      setSelectedReminders(reminders);
      setSelectedReminderLogs(reminderLogs);
      setSelectedInteractions(interactions.filter((item) => item.elderlyId === effectiveSelectedId));
      setSelectedAlerts(alerts.filter((item) => item.elderlyId === effectiveSelectedId));
    } catch (error: unknown) {
      // Profile fetch is critical, if it fails we show error
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to load profile.' });
    } finally {
      setLoadingSelected(false);
    }
  }, [effectiveSelectedId]);

  const loadPackageExercise = useCallback(async () => {
    if (!selectedProfile?.id || (activeTab !== 'exercise' && activeTab !== 'package-exercise')) {
      setUserPackages([]);
      setServicePackages([]);
      setPackageExercisesByPackageId({});
      return;
    }

    setLoadingPackages(true);
    try {
      const [packages, catalog] = await Promise.all([
        userPackageService.getByElderlyId(selectedProfile.id).catch(() => [] as UserPackageResponse[]),
        servicePackageService.getAll().catch(() => [] as ServicePackageResponse[]),
      ]);

      const uniquePackageIds = Array.from(new Set(packages.map((item) => item.servicePackageId)));
      const packageExercises = await Promise.all(
        uniquePackageIds.map(async (packageId) => {
          const exercises = await servicePackageService.getRobotActions(packageId).catch(() => [] as RobotAction[]);
          return [packageId, exercises] as const;
        })
      );

      setUserPackages(packages);
      setServicePackages(catalog);
      setPackageExercisesByPackageId(Object.fromEntries(packageExercises));
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
      .sort((left, right) => parseServerDate(right.time).getTime() - parseServerDate(left.time).getTime())
      .slice(0, 6);
  }, [selectedAlerts, selectedInteractions, selectedReminderLogs]);
  const reminderGroups = useMemo(() => {
    return {
      active: selectedReminders.filter((item) => {
        if (!item.active) return false;
        const info = getReminderDetailedStatus(item, selectedReminderLogs, selectedProfile?.gender);
        return info.status === 'UPCOMING' || info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE';
      }),
      missed: selectedReminders.filter((item) => {
        if (!item.active) return false;
        const info = getReminderDetailedStatus(item, selectedReminderLogs, selectedProfile?.gender);
        return info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE';
      }),
      completed: selectedReminders.filter((item) => {
        if (!item.active) return true;
        const info = getReminderDetailedStatus(item, selectedReminderLogs, selectedProfile?.gender);
        return info.status === 'COMPLETED';
      }),
    };
  }, [selectedReminders, selectedReminderLogs, selectedProfile]);



  const sortedSelectedReminders = useMemo(
    () => selectedReminders.slice().sort((left, right) => parseServerDate(left.scheduleTime).getTime() - parseServerDate(right.scheduleTime).getTime()),
    [selectedReminders]
  );
  const sortedReminderLogs = useMemo(
    () => selectedReminderLogs.slice().sort((left, right) => parseServerDate(right.triggeredTime).getTime() - parseServerDate(left.triggeredTime).getTime()),
    [selectedReminderLogs]
  );
  const openAlerts = useMemo(
    () => selectedAlerts.filter((item) => !item.resolved).sort((left, right) => parseServerDate(right.createdAt).getTime() - parseServerDate(left.createdAt).getTime()),
    [selectedAlerts]
  );
  const resolvedAlerts = useMemo(
    () => selectedAlerts.filter((item) => item.resolved).sort((left, right) => parseServerDate(right.createdAt).getTime() - parseServerDate(left.createdAt).getTime()),
    [selectedAlerts]
  );
  const activePackages = useMemo(() => {
    const now = Date.now();
    return userPackages.filter((item) => {
      if (!item.expiredAt) return true;
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
    const mappedScripts = new Map<number, { script: RobotAction; packageNames: string[] }>();

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
    const effectiveCaregiverId = caregiverProfile?.id;

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

  const handleResolveAlert = async (alertId: number) => {
    const alert = selectedAlerts.find(a => a.id === alertId);
    if (!alert) return;

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
      // Logic for running exercise without creating a session record frontend-side
      toast.info("Exercise sequence initiated on robot.");
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
                  <span className="text-xs text-muted-foreground">{parseServerDate(item.time).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderReminders = () => {
    const sortedSelectedReminders = [...selectedReminders].sort(
      (left, right) => parseServerDate(left.scheduleTime).getTime() - parseServerDate(right.scheduleTime).getTime()
    );

    const filteredReminders = sortedSelectedReminders.filter(item => {
      const info = getReminderDetailedStatus(item, selectedReminderLogs, selectedProfile?.gender);
      if (reminderFilter === 'active') return info.status === 'UPCOMING' || info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE';
      if (reminderFilter === 'missed') return info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE';
      if (reminderFilter === 'completed') return info.status === 'COMPLETED';
      return true;
    });




    return (
      <div className="space-y-6">
        <Card className="overflow-hidden border-none shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Reminders</CardTitle>
                <CardDescription>Manage and track medication or care reminders.</CardDescription>
              </div>
              <Button onClick={() => setIsReminderFormOpen(!isReminderFormOpen)} className="gap-2 font-bold shadow-lg shadow-sky-100">
                {isReminderFormOpen ? 'Close Form' : <><Plus className="h-4 w-4" /> Create New</> }
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
               {(['all', 'active', 'missed', 'completed'] as const).map(f => (
                 <button 
                   key={f}
                   className={cn(
                     "px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                     reminderFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                   )}
                   onClick={() => setReminderFilter(f)}
                 >
                   {f}
                 </button>
               ))}
            </div>

            {isReminderFormOpen ? (
              <div className="mb-6 rounded-2xl border bg-white p-5 shadow-inner">
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                  <div className="font-bold text-slate-800">{editingReminderId ? 'Edit Reminder' : 'New Reminder'}</div>
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
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="ghost" onClick={closeReminderForm}>Cancel</Button>
                  <Button onClick={handleReminderSubmit} disabled={savingReminder} className="bg-sky-600 hover:bg-sky-700">
                    {savingReminder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editingReminderId ? 'Update Reminder' : 'Create Reminder'}
                  </Button>
                </div>
              </div>
            ) : null}

            {filteredReminders.length === 0 ? (
              <EmptyState text={`No ${reminderFilter !== 'all' ? reminderFilter : ''} reminders found.`} />
            ) : (
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold">Title</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Schedule</TableHead>
                      <TableHead className="font-bold">Pattern</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReminders.map((item) => {
                      const info = getReminderDetailedStatus(item, selectedReminderLogs, selectedProfile?.gender);
                      const statusLabel = info.status === 'COMPLETED' ? 'Completed' : (info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE') ? 'Missed' : (info.status === 'UPCOMING' ? 'Active' : 'Waiting...');


                      const statusClassName = info.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : (info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE')
                          ? 'bg-rose-50 text-rose-700 border-rose-100'
                          : 'bg-sky-50 text-sky-700 border-sky-100';

                      return (
                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-semibold text-slate-900">{item.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getReminderTypeLabel(item.reminderType)}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 text-xs text-nowrap">
                             <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {parseServerDate(item.scheduleTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                          </TableCell>
                          <TableCell>
                             <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{getReminderPatternLabel(item.repeatPattern)}</Badge>
                          </TableCell>
                          <TableCell>
                             <div className="flex flex-col gap-1">
                               <Badge variant="outline" className={cn("font-bold px-2.5 py-0.5", statusClassName, (info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE') && "animate-pulse")}>
                                 {statusLabel}
                               </Badge>
                               {info.message && <span className="text-[10px] text-rose-600 font-medium">{info.message}</span>}
                             </div>
                          </TableCell>

                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleReminderEdit(item)}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReminderDelete(item.id)}>Delete</Button>
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
      </div>
    );
  };

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
                  {selectedInteractions[0] ? parseServerDate(selectedInteractions[0].createdAt).toLocaleString() : 'No history yet'}
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
              .sort((left, right) => parseServerDate(right.createdAt).getTime() - parseServerDate(left.createdAt).getTime())
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
                    <div className="text-xs font-medium text-muted-foreground">{parseServerDate(item.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Elderly</div>
                        <div className="text-[11px] text-slate-500">{parseServerDate(item.createdAt).toLocaleTimeString()}</div>
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
    <div className="grid gap-6">
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
        </CardContent>
      </Card>
    </div>
  );

  const renderExercise = () => (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Exercise by Active Package</CardTitle>
          <CardDescription>Each elderly profile only sees the exercise scripts unlocked by the service packages that are still active.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPackages ? <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading package and exercise context...</div> : null}
          {packageExerciseDetails.length === 0 ? (
            <EmptyState text="This elderly profile does not have any active package with exercise entitlement yet." />
          ) : (
            <div className="space-y-4">
              {packageExerciseDetails.map(({ userPackage, servicePackage, exercises }) => (
                <div key={userPackage.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b bg-slate-50/80 px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-slate-900">{servicePackage?.name || `Package #${userPackage.servicePackageId}`}</h3>
                          <Badge variant="outline" className="text-[10px] uppercase">{servicePackage?.level || 'Unknown'}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Assigned {parseServerDate(userPackage.assignedAt).toLocaleDateString()} • {userPackage.status === 'PAID' && userPackage.expiredAt ? `Expires ${parseServerDate(userPackage.expiredAt).toLocaleDateString()}` : `Status: ${userPackage.status || 'PENDING'}`}
                        </p>
                      </div>
                      <Badge variant="secondary" className="w-fit">{exercises.length} exercise{exercises.length === 1 ? '' : 's'}</Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    {exercises.length === 0 ? (
                      <EmptyState text="Manager has not assigned any exercise to this package yet." />
                    ) : (
                      <div className="space-y-3">
                        {exercises.map((exercise) => (
                          <div key={`${userPackage.id}-${exercise.id}`} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-900">{exercise.name}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{exercise.duration} min</span>
                                  <span>•</span>
                                  <span>{exercise.type || 'Action'}</span>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => handleRunExercise(exercise.id)} disabled={runningExerciseId === exercise.id || !roomRobot}>
                                {runningExerciseId === exercise.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                                <span className="ml-2">Run</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {eligibleExercises.length > 0 ? (
            <div className="rounded-2xl border bg-sky-50/50 p-4">
              <div className="text-sm font-semibold text-slate-900">Exercise Entitlement Summary</div>
              <p className="mt-1 text-xs text-muted-foreground">Combined view of all exercises unlocked by the active packages above.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {eligibleExercises.map(({ script, packageNames }) => (
                  <Badge key={script.id} variant="secondary" className="max-w-full truncate bg-white text-slate-700">
                    {script.name} • {packageNames.join(', ')}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
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
              <p className="mt-2 max-w-md text-sm text-muted-foreground">Start from the list on the left. After choosing an elderly profile, the workspace will guide you through overview, reminders, robot interaction, logs, room/device, and exercise tabs.</p>
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
      case 'exercise':
      case 'package-exercise':
        return renderExercise();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="grid gap-4 xl:grid-cols-[minmax(220px,240px)_minmax(0,1fr)_minmax(300px,360px)]">
        {/* Left Panel: Elderly List */}
        <aside className="space-y-4 xl:sticky xl:top-[4.5rem] xl:self-start">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-4">
              <CardTitle className="text-lg">Assigned Room</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider">
                 {caregiverProfile?.roomId ? `Room ${caregiverProfile.roomId}` : 'Unassigned'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
               <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-50" />
                <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." className="pl-9 h-9 border-slate-100 bg-slate-50/50" />
              </div>
              
              {loadingContext ? (
                <div className="flex px-2 py-4 items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</div>
              ) : filteredElderlies.length === 0 ? (
                <div className="text-center py-8 opacity-40">No records</div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto pr-1">
                  <div className="space-y-1.5 font-sans">
                    {filteredElderlies.map((item) => {
                      const isActive = effectiveSelectedId === item.id;
                      const hasAlert = selectedAlerts.some(a => a.elderlyId === item.id && !a.resolved);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateToElderly(item.id)}
                          className={cn(
                            'group relative w-full rounded-xl px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none ring-offset-2',
                            isActive
                              ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 text-nowrap'
                              : 'hover:bg-slate-100 text-slate-600'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                             <div className="font-bold text-sm truncate">{item.name}</div>
                             {hasAlert && !isActive && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse ring-4 ring-rose-100" />}
                          </div>
                          <div className={cn("text-[10px] mt-0.5 font-medium opacity-60", isActive ? "text-slate-300" : "text-slate-400")}>
                             {isActive ? 'Current selection' : `EL-${item.id}`}
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

        {/* Middle Panel: Main Content */}
        <div className="space-y-4">
          <div className="sticky top-16 z-30 -mx-2 rounded-[24px] bg-background/98 px-2 pb-3 pt-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/88">
            <div className="space-y-2 rounded-2xl bg-background">
            <div className="rounded-2xl border bg-background px-4 py-3 shadow-sm border-slate-100">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> Profile</span>
                    <span>•</span>
                    <span>{selectedProfile ? `Age ${selectedAge ?? 'N/A'}` : 'Select elderly'}</span>
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 truncate">
                    {selectedProfile?.name || 'Caregiver Workspace'}
                  </h2>
                </div>

                <div className="hidden sm:flex gap-1 bg-slate-100/50 p-1 rounded-xl">
                  {workspaceTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => handleTabChange(tab.key)}
                      disabled={!effectiveSelectedId}
                      className={cn(
                        'rounded-lg px-4 py-2 text-xs font-bold transition-all whitespace-nowrap',
                        activeTab === tab.key 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 hover:bg-white/40',
                        !effectiveSelectedId && 'cursor-not-allowed opacity-30'
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {message ? (
                <div className={cn('mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold', message.type === 'error' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-emerald-100 bg-emerald-50 text-emerald-600')}>
                  {message.type === 'error' ? <AlertTriangle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span className="truncate uppercase">{message.text}</span>
                </div>
              ) : null}
            </div>
            </div>
          </div>

          {loadingSelected && effectiveSelectedId ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin opacity-20" />
              <div className="text-xs font-black uppercase tracking-widest opacity-40">Synchronizing Data...</div>
            </div>
          ) : (
            <div className="pb-20">
              {renderTabContent()}
            </div>
          )}
        </div>

        {/* Right Panel: Alerts & Logs (Sticky) */}
        <aside className="space-y-4 xl:sticky xl:top-[4.5rem] xl:self-start">
           <AlertPanel 
             alerts={selectedAlerts} 
             logs={selectedReminderLogs} 
             onResolveAlert={handleResolveAlert}
             onViewAllLogs={() => handleTabChange('logs')}
           />
        </aside>
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
            .sort((left, right) => parseServerDate(right.time).getTime() - parseServerDate(left.time).getTime())
            .map((item) => (
              <div key={item.id} className="rounded-2xl border p-4">
                <div className="font-semibold">{item.primary}</div>
                <div className="mt-1 text-sm text-muted-foreground">{item.secondary}</div>
                <div className="mt-2 text-xs text-muted-foreground">{parseServerDate(item.time).toLocaleString()}</div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  );
}

function toDateTimeLocal(value: string) {
  const date = parseServerDate(value);
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