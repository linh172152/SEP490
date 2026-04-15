'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { filterScriptsByQuota } from '@/utils/privilegeEngine';
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
  RobotResponse,
  RobotStatusLogResponse,
  RoomElderlySummary,
  ServicePackageResponse,
  UserPackageResponse,
} from '@/services/api/types';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Dumbbell,
  Link2,
  Loader2,
  MessageSquare,
  Package,
  Play,
  Plus,
  RefreshCw,
  UserRound,
} from 'lucide-react';

const mockUserPackages = (accountId: number): UserPackageResponse[] => {
  const now = new Date();
  const expiredAt = new Date(now);
  expiredAt.setMonth(expiredAt.getMonth() + 1);

  return [
    {
      id: 10001,
      accountId,
      servicePackageId: 1,
      assignedAt: now.toISOString(),
      expiredAt: expiredAt.toISOString(),
    },
  ];
};

export default function CaregiverElderlyPage() {
  const { user } = useAuthStore();

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingElderlies, setLoadingElderlies] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [caregiverProfile, setCaregiverProfile] = useState<CaregiverProfileResponse | null>(null);
  const [roomInput, setRoomInput] = useState('');
  const [resolvedRoomId, setResolvedRoomId] = useState<number | null>(null);

  const [elderliesByRoom, setElderliesByRoom] = useState<RoomElderlySummary[]>([]);
  const [selectedElderlyId, setSelectedElderlyId] = useState<number | null>(null);
  const [elderlyDetail, setElderlyDetail] = useState<ElderlyProfileResponse | null>(null);

  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLogResponse[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLogResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [exerciseSessions, setExerciseSessions] = useState<ExerciseSessionResponse[]>([]);
  const [exerciseScripts, setExerciseScripts] = useState<ExerciseScriptResponse[]>([]);

  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<Record<number, ServicePackageResponse>>({});
  const [isPackageMockMode, setIsPackageMockMode] = useState(false);
  const [roomRobot, setRoomRobot] = useState<RobotDTO | null>(null);
  const [availableRobots, setAvailableRobots] = useState<RobotResponse[]>([]);
  const [selectedRobotId, setSelectedRobotId] = useState<number | null>(null);
  const [robotStatusLogs, setRobotStatusLogs] = useState<RobotStatusLogResponse[]>([]);
  const [loadingRobot, setLoadingRobot] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  const [creatingReminder, setCreatingReminder] = useState(false);
  const [simulatingReminderId, setSimulatingReminderId] = useState<number | null>(null);
  const [escalatingReminderId, setEscalatingReminderId] = useState<number | null>(null);
  const [startingConversation, setStartingConversation] = useState(false);
  const [runningExerciseId, setRunningExerciseId] = useState<number | null>(null);
  const [reminderForm, setReminderForm] = useState<Omit<ReminderRequest, 'elderlyId' | 'caregiverId'>>({
    title: '',
    reminderType: 'medication',
    scheduleTime: new Date().toISOString(),
    repeatPattern: 'daily',
    active: true,
  });
  const [interactionForm, setInteractionForm] = useState({
    interactionType: 'qa',
    userInputText: 'Bac oi, hom nay con nen uong thuoc luc nao?',
    robotResponseText: 'Bac vui long uong thuoc theo lich da cai dat vao 20:00 toi nay.',
    emotionDetected: 'calm',
  });

  useEffect(() => {
    const loadCaregiverProfile = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      setGlobalError(null);

      try {
        const accountId = Number(user.id);
        const profiles = await caregiverService.getByAccountId(accountId);
        const profile = profiles[0] ?? null;
        setCaregiverProfile(profile);

        const profileRoomId = profile?.roomId ?? null;
        if (profileRoomId) {
          setResolvedRoomId(profileRoomId);
          setRoomInput(String(profileRoomId));
        }
      } catch (error) {
        setGlobalError('Khong the lay caregiver profile. Vui long kiem tra tai khoan va quyen truy cap API.');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadCaregiverProfile();
  }, [user?.id]);

  useEffect(() => {
    const loadElderliesByRoom = async () => {
      if (!resolvedRoomId) {
        setElderliesByRoom([]);
        setSelectedElderlyId(null);
        return;
      }

      setLoadingElderlies(true);
      setGlobalError(null);

      try {
        const data = await roomService.getElderliesByRoom(resolvedRoomId);
        setElderliesByRoom(data);

        if (data.length > 0) {
          setSelectedElderlyId((prev) => (prev && data.some((e) => e.id === prev) ? prev : data[0].id));
        } else {
          setSelectedElderlyId(null);
        }
      } catch (error) {
        setElderliesByRoom([]);
        setSelectedElderlyId(null);
        setGlobalError('Khong the lay danh sach elderly theo room.');
      } finally {
        setLoadingElderlies(false);
      }
    };

    loadElderliesByRoom();
  }, [resolvedRoomId]);

  const refreshRobotContext = async (preferredRobotId?: number) => {
    if (!resolvedRoomId && !preferredRobotId && !selectedElderlyId) {
      setRoomRobot(null);
      setAvailableRobots([]);
      setRobotStatusLogs([]);
      return;
    }

    setLoadingRobot(true);

    try {
      const robots = await robotService.getAll().catch(() => [] as RobotResponse[]);
      setAvailableRobots(robots);

      let robotSummary: RobotDTO | null = null;

      if (resolvedRoomId) {
        try {
          robotSummary = await roomService.getRobotByRoom(resolvedRoomId);
        } catch {
          robotSummary = null;
        }
      }

      if (!robotSummary) {
        const fallbackRobot =
          (preferredRobotId ? robots.find((item) => item.id === preferredRobotId) : undefined) ||
          (selectedRobotId ? robots.find((item) => item.id === selectedRobotId) : undefined) ||
          robots.find((item) => String(item.status || '').toUpperCase() === 'ACTIVE') ||
          robots.find((item) => String(item.status || '').toUpperCase() === 'ONLINE') ||
          robots[0];

        if (fallbackRobot) {
          robotSummary = {
            id: fallbackRobot.id,
            robotName: fallbackRobot.robotName,
            model: fallbackRobot.model,
          };
        }
      }

      setRoomRobot(robotSummary);
      setSelectedRobotId(robotSummary?.id ?? null);

      if (!robotSummary) {
        setRobotStatusLogs([]);
        return;
      }

      const logs = await robotService.getStatusLogsByRobot(robotSummary.id).catch(async () => {
        const allLogs = await robotService.getAllStatusLogs().catch(() => [] as RobotStatusLogResponse[]);
        return allLogs.filter((item) => item.robotId === robotSummary.id);
      });

      setRobotStatusLogs(
        [...logs].sort(
          (left, right) =>
            new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime()
        )
      );
    } finally {
      setLoadingRobot(false);
    }
  };

  const refreshSelectedElderlyData = async (elderlyId: number) => {
    setLoadingDetail(true);
    setGlobalError(null);

    try {
      const detail = await elderlyService.getById(elderlyId);
      setElderlyDetail(detail);

      const [elderlyReminders, elderlyReminderLogs, allInteractions, allAlerts, allSessions, allScripts] =
        await Promise.all([
          reminderService.getByElderlyId(elderlyId).catch(() => [] as ReminderResponse[]),
          reminderService.getLogsByElderlyId(elderlyId).catch(() => [] as ReminderLogResponse[]),
          interactionLogService.getAll().catch(() => [] as InteractionLogResponse[]),
          alertService.getAll().catch(() => [] as AlertNotificationResponse[]),
          exerciseService.getAllSessions().catch(() => [] as ExerciseSessionResponse[]),
          exerciseService.getAllScripts().catch(() => [] as ExerciseScriptResponse[]),
        ]);

      setReminders(elderlyReminders);
      setReminderLogs(elderlyReminderLogs);
      setInteractionLogs(allInteractions.filter((item) => item.elderlyId === elderlyId));
      setAlerts(allAlerts.filter((item) => item.elderlyId === elderlyId));
      setExerciseSessions(allSessions.filter((item) => item.elderlyId === elderlyId));
      setExerciseScripts(allScripts);

      const accountId = detail.accountId;
      let packages: UserPackageResponse[] = [];
      let usedMock = false;

      try {
        packages = await userPackageService.getByAccountId(accountId);
      } catch {
        try {
          const allPackages = await userPackageService.getAll();
          packages = allPackages.filter((item) => item.accountId === accountId);
        } catch {
          packages = mockUserPackages(accountId);
          usedMock = true;
        }
      }

      setIsPackageMockMode(usedMock);
      setUserPackages(packages);

      const uniqueServiceIds = Array.from(new Set(packages.map((item) => item.servicePackageId)));
      const packageEntries = await Promise.all(
        uniqueServiceIds.map(async (servicePackageId) => {
          try {
            const packageData = await servicePackageService.getById(servicePackageId);
            return [servicePackageId, packageData] as const;
          } catch {
            return null;
          }
        })
      );

      const packageMap: Record<number, ServicePackageResponse> = {};
      packageEntries.forEach((entry) => {
        if (entry) {
          packageMap[entry[0]] = entry[1];
        }
      });
      setServicePackages(packageMap);
    } catch (error) {
      setElderlyDetail(null);
      setGlobalError('Khong the tai du lieu chi tiet elderly.');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (!selectedElderlyId) {
      setElderlyDetail(null);
      setReminders([]);
      setReminderLogs([]);
      setInteractionLogs([]);
      setAlerts([]);
      setExerciseSessions([]);
      setExerciseScripts([]);
      setUserPackages([]);
      setServicePackages({});
      return;
    }

    refreshSelectedElderlyData(selectedElderlyId);
  }, [selectedElderlyId]);

  useEffect(() => {
    refreshRobotContext();
  }, [resolvedRoomId, selectedElderlyId]);

  const handleSelectRobot = async (robotId: number) => {
    setSelectedRobotId(robotId);
    setGlobalError(null);
    setActionMessage(null);
    await refreshRobotContext(robotId);
  };

  const selectedElderlyName = useMemo(() => {
    const match = elderliesByRoom.find((item) => item.id === selectedElderlyId);
    return match?.name || elderlyDetail?.name || 'Unknown';
  }, [elderliesByRoom, selectedElderlyId, elderlyDetail?.name]);

  const activeUserPackages = useMemo(
    () =>
      userPackages.filter((item) => {
        const expiredAt = Date.parse(item.expiredAt);
        return Number.isNaN(expiredAt) || expiredAt >= Date.now();
      }),
    [userPackages]
  );

  const eligibleExercises = useMemo(() => {
    const mappedScripts = new Map<number, { script: ExerciseScriptResponse; packageNames: string[] }>();

    activeUserPackages.forEach((item) => {
      const matchedPackage = servicePackages[item.servicePackageId];

      if (!matchedPackage) {
        return;
      }

      const packageScripts = matchedPackage.exerciseIds?.length
        ? exerciseScripts.filter((script) => matchedPackage.exerciseIds?.includes(script.id))
        : filterScriptsByQuota(exerciseScripts, matchedPackage.level);

      packageScripts.forEach((script) => {
        const existing = mappedScripts.get(script.id);
        if (existing) {
          if (!existing.packageNames.includes(matchedPackage.name)) {
            existing.packageNames.push(matchedPackage.name);
          }
          return;
        }

        mappedScripts.set(script.id, {
          script,
          packageNames: [matchedPackage.name],
        });
      });
    });

    return Array.from(mappedScripts.values());
  }, [activeUserPackages, exerciseScripts, servicePackages]);

  const handleApplyRoomId = () => {
    const next = Number(roomInput);
    if (!Number.isInteger(next) || next <= 0) {
      setGlobalError('Room ID phai la so nguyen duong.');
      setActionMessage(null);
      return;
    }

    setGlobalError(null);
    setActionMessage(null);
    setResolvedRoomId(next);
  };

  const handleCreateReminder = async () => {
    if (!selectedElderlyId || !caregiverProfile?.id) {
      setGlobalError('Thieu elderlyId hoac caregiverProfileId de tao reminder.');
      setActionMessage(null);
      return;
    }

    if (!reminderForm.title.trim()) {
      setGlobalError('Vui long nhap tieu de reminder.');
      setActionMessage(null);
      return;
    }

    setCreatingReminder(true);
    setGlobalError(null);
    setActionMessage(null);

    try {
      await reminderService.create({
        elderlyId: selectedElderlyId,
        caregiverId: caregiverProfile.id,
        title: reminderForm.title.trim(),
        reminderType: reminderForm.reminderType,
        scheduleTime: reminderForm.scheduleTime,
        repeatPattern: reminderForm.repeatPattern,
        active: reminderForm.active,
      });

      await refreshSelectedElderlyData(selectedElderlyId);
      setReminderForm((prev) => ({ ...prev, title: '' }));
      setActionMessage({
        type: 'success',
        text: 'Reminder da duoc tao. Ban co the chay Flow 1 hoac Flow 2 ngay trong danh sach ben duoi.',
      });
    } catch {
      setGlobalError('Tao reminder that bai.');
      setActionMessage(null);
    } finally {
      setCreatingReminder(false);
    }
  };

  const handleDeleteReminder = async (id: number) => {
    if (!selectedElderlyId) return;

    try {
      await reminderService.delete(id);
      await refreshSelectedElderlyData(selectedElderlyId);
      setActionMessage({ type: 'info', text: 'Reminder da duoc xoa khoi workflow hien tai.' });
    } catch {
      setGlobalError('Xoa reminder that bai.');
      setActionMessage(null);
    }
  };

  const handleConfirmReminderLog = async (id: number) => {
    if (!selectedElderlyId) return;

    try {
      await reminderService.confirmLog(id);
      await refreshSelectedElderlyData(selectedElderlyId);
      setActionMessage({ type: 'success', text: 'Reminder log da duoc confirm thanh cong.' });
    } catch {
      setGlobalError('Confirm reminder log that bai.');
      setActionMessage(null);
    }
  };

  const handleCompleteReminderFlow = async (reminder: ReminderResponse) => {
    if (!selectedElderlyId || !roomRobot) {
      setGlobalError('Can robot trong room de chay Flow 1.');
      setActionMessage(null);
      return;
    }

    setSimulatingReminderId(reminder.id);
    setGlobalError(null);
    setActionMessage(null);

    try {
      const reminderLog = await reminderService.createLog({
        reminderId: reminder.id,
        robotId: roomRobot.id,
        elderlyId: selectedElderlyId,
        triggeredTime: new Date().toISOString(),
      });

      await reminderService.confirmLog(reminderLog.id);
      await refreshSelectedElderlyData(selectedElderlyId);
      setActionMessage({
        type: 'success',
        text: `Flow 1 complete: ${roomRobot.robotName} da nhac "${reminder.title}" va elderly da phan hoi.`,
      });
    } catch {
      setGlobalError('Flow 1 that bai khi tao/confirm reminder log.');
      setActionMessage(null);
    } finally {
      setSimulatingReminderId(null);
    }
  };

  const handleEscalateReminderFlow = async (reminder: ReminderResponse) => {
    if (!selectedElderlyId || !roomRobot) {
      setGlobalError('Can robot trong room de chay Flow 2.');
      setActionMessage(null);
      return;
    }

    setEscalatingReminderId(reminder.id);
    setGlobalError(null);
    setActionMessage(null);

    try {
      await reminderService.createLog({
        reminderId: reminder.id,
        robotId: roomRobot.id,
        elderlyId: selectedElderlyId,
        triggeredTime: new Date().toISOString(),
      });

      await alertService.create({
        elderlyId: selectedElderlyId,
        alertType: 'medication_non_response',
        message: `${selectedElderlyName} khong phan hoi reminder "${reminder.title}". Da escalate cho caregiver ${caregiverProfile?.name || caregiverProfile?.id || ''}.`,
        resolved: false,
      });

      await refreshSelectedElderlyData(selectedElderlyId);
      setActionMessage({
        type: 'success',
        text: `Flow 2 complete: ${roomRobot.robotName} da thong bao, elderly khong phan hoi, alert da duoc tao cho caregiver.`,
      });
    } catch {
      setGlobalError('Flow 2 that bai khi tao alert hoac reminder log.');
      setActionMessage(null);
    } finally {
      setEscalatingReminderId(null);
    }
  };

  const handleStartRobotConversation = async () => {
    if (!selectedElderlyId || !roomRobot) {
      setGlobalError('Can robot trong room de chay Flow 3.');
      setActionMessage(null);
      return;
    }

    if (!interactionForm.userInputText.trim() || !interactionForm.robotResponseText.trim()) {
      setGlobalError('Can nhap cau hoi cua elderly va cau tra loi cua robot.');
      setActionMessage(null);
      return;
    }

    setStartingConversation(true);
    setGlobalError(null);
    setActionMessage(null);

    try {
      await robotService.createStatusLog({
        robotId: roomRobot.id,
        status: 'STARTED',
      });

      await interactionLogService.create({
        elderlyId: selectedElderlyId,
        robotId: roomRobot.id,
        interactionType: interactionForm.interactionType,
        userInputText: interactionForm.userInputText.trim(),
        robotResponseText: interactionForm.robotResponseText.trim(),
        emotionDetected: interactionForm.emotionDetected.trim() || undefined,
      });

      await Promise.all([
        refreshSelectedElderlyData(selectedElderlyId),
        refreshRobotContext(roomRobot.id),
      ]);

      setActionMessage({
        type: 'success',
        text: `Flow 3 complete: robot ${roomRobot.robotName} da start va interaction log da duoc luu.`,
      });
    } catch {
      setGlobalError('Flow 3 that bai khi ghi robot status log hoac interaction log.');
      setActionMessage(null);
    } finally {
      setStartingConversation(false);
    }
  };

  const handleRunExerciseFlow = async (script: ExerciseScriptResponse) => {
    if (!selectedElderlyId || !roomRobot) {
      setGlobalError('Can robot trong room de chay Flow 4.');
      setActionMessage(null);
      return;
    }

    setRunningExerciseId(script.id);
    setGlobalError(null);
    setActionMessage(null);

    const startedAt = new Date();
    const completedAt = new Date(startedAt.getTime() + script.durationMinutes * 60_000);

    try {
      await exerciseService.createSession({
        exerciseId: script.id,
        elderlyId: selectedElderlyId,
        robotId: roomRobot.id,
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        feedback: `Executed via caregiver workflow for ${selectedElderlyName}`,
      });

      await refreshSelectedElderlyData(selectedElderlyId);
      setActionMessage({
        type: 'success',
        text: `Flow 4 complete: bai tap "${script.name}" da duoc thuc thi cho ${selectedElderlyName}.`,
      });
    } catch {
      setGlobalError('Flow 4 that bai khi tao exercise session.');
      setActionMessage(null);
    } finally {
      setRunningExerciseId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Elderly</h1>
        <p className="text-muted-foreground">
          Select an elderly profile in your assigned room, review status, perform care actions, and follow logs in one place.
        </p>
      </div>

      {globalError && (
        <Card className="border-rose-200 bg-rose-50">
          <CardContent className="py-4 text-sm text-rose-700">{globalError}</CardContent>
        </Card>
      )}

      {actionMessage && (
        <Card className={actionMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50' : 'border-sky-200 bg-sky-50'}>
          <CardContent className="flex items-center gap-2 py-4 text-sm text-slate-700">
            <CheckCircle2 className={`h-4 w-4 ${actionMessage.type === 'success' ? 'text-emerald-600' : 'text-sky-600'}`} />
            {actionMessage.text}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Caregiver Identity</CardTitle>
            <CardDescription>Tu account ID sang caregiver profile ID.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {loadingProfile ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Dang tai profile...
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span>Account ID</span>
                  <Badge variant="outline">{user?.id || 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Caregiver Profile ID</span>
                  <Badge>{caregiverProfile?.id || 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Profile Name</span>
                  <span className="font-semibold">{caregiverProfile?.name || 'N/A'}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Room Resolution</CardTitle>
            <CardDescription>
              Neu BE chua tra roomId trong caregiver-profile, nhap roomId thu cong de demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  placeholder="Vi du: 1"
                />
              </div>
              <Button onClick={handleApplyRoomId}>
                <Link2 className="h-4 w-4 mr-2" /> Ap dung room
              </Button>
              <Button
                variant="outline"
                onClick={() => resolvedRoomId && refreshSelectedElderlyData(selectedElderlyId || 0)}
                disabled={!resolvedRoomId || !selectedElderlyId || loadingDetail}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh detail
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Room dang dung: <span className="font-semibold text-foreground">{resolvedRoomId || 'Chua co'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Elderly In Room</CardTitle>
            <CardDescription>GET /api/rooms/{'{'}roomId{'}'}/elderlies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingElderlies ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Dang tai elderlies...
              </div>
            ) : elderliesByRoom.length === 0 ? (
              <p className="text-sm text-muted-foreground">Khong co elderly trong room hien tai.</p>
            ) : (
              elderliesByRoom.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedElderlyId(item.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    selectedElderlyId === item.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">Elderly ID: {item.id}</div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Selected Elderly Detail</CardTitle>
            <CardDescription>GET /api/elderly-profile/{'{'}id{'}'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingDetail ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Dang tai chi tiet...
              </div>
            ) : !elderlyDetail ? (
              <p className="text-sm text-muted-foreground">
                {selectedElderlyId
                  ? 'Khong tai duoc chi tiet elderly da chon. Vui long thu lai.'
                  : 'Chua chon elderly.'}
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Name</div>
                    <div className="font-semibold">{elderlyDetail.name}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Date Of Birth</div>
                    <div className="font-semibold">{elderlyDetail.dateOfBirth}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Preferred Language</div>
                    <div className="font-semibold">{elderlyDetail.preferredLanguage}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Speaking Speed</div>
                    <div className="font-semibold">{elderlyDetail.speakingSpeed}</div>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Health Notes</div>
                  <div className="text-sm font-medium">{elderlyDetail.healthNotes || 'Khong co ghi chu suc khoe.'}</div>
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/caregiver/elderly/${elderlyDetail.id}`}>Mo trang detail day du</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="h-4 w-4" /> Room Robot Context
            </CardTitle>
            <CardDescription>GET /api/robots la nguon chinh; neu co thi uu tien room robot va sau do load robot status logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingRobot ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Dang tai robot trong room...
              </div>
            ) : !roomRobot ? (
              <p className="text-sm text-muted-foreground">Chua resolve duoc robot cho room hien tai. Flow 1-4 se bi khoa.</p>
            ) : (
              <>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{roomRobot.robotName}</div>
                      <div className="text-xs text-muted-foreground">Robot ID: {roomRobot.id} | Model: {roomRobot.model}</div>
                    </div>
                    <Badge variant="outline">Room #{resolvedRoomId || 'N/A'}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Available robots from GET /api/robots</div>
                  {availableRobots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Backend chua tra robot nao.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableRobots.map((item) => (
                        <Button
                          key={item.id}
                          type="button"
                          size="sm"
                          variant={roomRobot?.id === item.id ? 'default' : 'outline'}
                          onClick={() => handleSelectRobot(item.id)}
                        >
                          {item.robotName} ({item.status})
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Recent status logs</div>
                  {robotStatusLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chua co robot status log.</p>
                  ) : (
                    robotStatusLogs.slice(0, 4).map((item) => (
                      <div key={item.id} className="rounded-lg border p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">{item.status}</span>
                          <Badge variant="secondary">Log #{item.id}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Reported: {new Date(item.reportedAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Flow 3: Start Robot And Save Interaction
            </CardTitle>
            <CardDescription>POST robot status log + POST interaction log khi elderly hoi va robot tra loi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <div className="space-y-1">
                <Label htmlFor="interactionType">Interaction Type</Label>
                <Input
                  id="interactionType"
                  value={interactionForm.interactionType}
                  onChange={(e) =>
                    setInteractionForm((prev) => ({ ...prev, interactionType: e.target.value }))
                  }
                  placeholder="qa"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="userInputText">Elderly Question</Label>
                <Textarea
                  id="userInputText"
                  value={interactionForm.userInputText}
                  onChange={(e) =>
                    setInteractionForm((prev) => ({ ...prev, userInputText: e.target.value }))
                  }
                  placeholder="Nhap cau hoi cua elderly"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="robotResponseText">Robot Response</Label>
                <Textarea
                  id="robotResponseText"
                  value={interactionForm.robotResponseText}
                  onChange={(e) =>
                    setInteractionForm((prev) => ({ ...prev, robotResponseText: e.target.value }))
                  }
                  placeholder="Nhap cau tra loi cua robot"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emotionDetected">Emotion Detected</Label>
                <Input
                  id="emotionDetected"
                  value={interactionForm.emotionDetected}
                  onChange={(e) =>
                    setInteractionForm((prev) => ({ ...prev, emotionDetected: e.target.value }))
                  }
                  placeholder="calm"
                />
              </div>
            </div>

            <Button onClick={handleStartRobotConversation} disabled={startingConversation || !selectedElderlyId || !roomRobot}>
              {startingConversation ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start robot va luu hoi dap
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" /> User Packages
            </CardTitle>
            <CardDescription>
              Hien thi theo account cua elderly. Dang mock khi BE chua co endpoint account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {isPackageMockMode && (
              <Badge variant="secondary">Mock mode for user-packages</Badge>
            )}
            {userPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Khong co package gan voi elderly nay.</p>
            ) : (
              userPackages.map((item) => {
                const servicePkg = servicePackages[item.servicePackageId];
                return (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">Package ID: {item.id}</div>
                      <Badge variant="outline">Service #{item.servicePackageId}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {servicePkg ? `${servicePkg.name} - ${servicePkg.level}` : 'Service package detail chua san sang'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Assigned: {new Date(item.assignedAt).toLocaleString()} | Expired: {new Date(item.expiredAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="h-4 w-4" /> Flow 4: Package Matched Exercise
            </CardTitle>
            <CardDescription>Loc exercise theo package cua elderly, sau do tao exercise session khi su dung.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">
              Sessions cua {selectedElderlyName}: <span className="font-semibold">{exerciseSessions.length}</span>
            </div>
            <div className="text-sm">
              Tong script he thong: <span className="font-semibold">{exerciseScripts.length}</span>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Active packages</div>
              {activeUserPackages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Khong co package con han de match exercise.</p>
              ) : (
                activeUserPackages.map((item) => {
                  const matchedPackage = servicePackages[item.servicePackageId];
                  return (
                    <div key={item.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{matchedPackage?.name || `Service #${item.servicePackageId}`}</span>
                        <Badge variant="outline">{matchedPackage?.level || 'Unknown level'}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Hieu luc den {new Date(item.expiredAt).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Eligible exercises for selected elderly</div>
              {eligibleExercises.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chua co exercise nao phu hop voi package hien tai.</p>
              ) : (
                eligibleExercises.map(({ script, packageNames }) => (
                  <div key={script.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{script.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Package match: {packageNames.join(', ')} | Duration: {script.durationMinutes} phut | Difficulty: {script.difficultyLevel}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRunExerciseFlow(script)}
                        disabled={runningExerciseId === script.id || !roomRobot}
                      >
                        {runningExerciseId === script.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Use exercise
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Recent exercise sessions</div>
              {exerciseSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chua co exercise session.</p>
              ) : (
                exerciseSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="rounded-lg border p-3 text-sm">
                    <div className="font-semibold">{session.exerciseName || `Exercise #${session.exerciseId}`}</div>
                    <div className="text-muted-foreground">
                      Robot: {session.robotName || session.robotId} | Started: {new Date(session.startedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reminder CRUD (Theo Elderly)</CardTitle>
            <CardDescription>POST/GET/DELETE /api/reminders theo selected elderly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={reminderForm.title}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Vi du: Uong thuoc buoi toi"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="type">Reminder Type</Label>
                <Input
                  id="type"
                  value={reminderForm.reminderType}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, reminderType: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="repeat">Repeat Pattern</Label>
                <Input
                  id="repeat"
                  value={reminderForm.repeatPattern}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, repeatPattern: e.target.value }))}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="schedule">Schedule Time (ISO)</Label>
                <Input
                  id="schedule"
                  value={reminderForm.scheduleTime}
                  onChange={(e) => setReminderForm((prev) => ({ ...prev, scheduleTime: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={handleCreateReminder} disabled={creatingReminder || !selectedElderlyId}>
              {creatingReminder ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Tao reminder cho elderly hien tai
            </Button>

            <div className="space-y-2">
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chua co reminder.</p>
              ) : (
                reminders.map((item) => (
                  <div key={item.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{item.title}</div>
                      <Badge variant={item.active ? 'default' : 'secondary'}>
                        {item.active ? 'active' : 'inactive'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.reminderType} | {new Date(item.scheduleTime).toLocaleString()} | {item.repeatPattern}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCompleteReminderFlow(item)}
                        disabled={simulatingReminderId === item.id || escalatingReminderId === item.id || !roomRobot}
                      >
                        {simulatingReminderId === item.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        Flow 1: notify + confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalateReminderFlow(item)}
                        disabled={escalatingReminderId === item.id || simulatingReminderId === item.id || !roomRobot}
                      >
                        {escalatingReminderId === item.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 mr-2" />
                        )}
                        Flow 2: no response + alert
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteReminder(item.id)}>
                        Xoa
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reminder Logs</CardTitle>
            <CardDescription>GET /api/reminder-logs/elderly/{'{'}elderlyId{'}'} + confirm.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {reminderLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co reminder log.</p>
            ) : (
              reminderLogs.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold">{item.reminderTitle}</div>
                    <Badge variant={item.confirmed ? 'default' : 'secondary'}>
                      {item.confirmed ? 'confirmed' : 'pending'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Triggered: {new Date(item.triggeredTime).toLocaleString()} | Robot: {item.robotName || item.robotId}
                  </div>
                  {!item.confirmed && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => handleConfirmReminderLog(item.id)}
                    >
                      Confirm log
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Interaction Logs
            </CardTitle>
            <CardDescription>GET /api/interaction-logs (loc theo elderly).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {interactionLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co interaction log.</p>
            ) : (
              interactionLogs.slice(0, 10).map((item) => (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <div className="font-semibold">{item.interactionType}</div>
                  <div className="text-muted-foreground">Input: {item.userInputText || '-'}</div>
                  <div className="text-muted-foreground">Response: {item.robotResponseText || '-'}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Alerts
            </CardTitle>
            <CardDescription>GET /api/alerts (loc theo elderly).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Khong co alert.</p>
            ) : (
              alerts.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{item.alertType}</div>
                    <Badge variant={item.resolved ? 'default' : 'secondary'}>
                      {item.resolved ? 'resolved' : 'active'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{item.message}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Caregiver Overview Endpoint</CardTitle>
          <CardDescription>GET /api/reminders/caregiver/{'{'}caregiverId{'}'}.</CardDescription>
        </CardHeader>
        <CardContent>
          {caregiverProfile?.id ? (
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const overview = await reminderService.getByCaregiverId(caregiverProfile.id);
                  setGlobalError(`Da tai overview reminders: ${overview.length} ban ghi.`);
                } catch {
                  setGlobalError('Khong the lay overview reminders theo caregiverId.');
                }
              }}
            >
              <UserRound className="h-4 w-4 mr-2" /> Tai nhanh reminders theo caregiver
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Can caregiver profile id de goi API overview.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
