'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { caregiverService } from '@/services/api/caregiverService';
import { roomService } from '@/services/api/roomService';
import { reminderService } from '@/services/api/reminderService';
import { interactionLogService } from '@/services/api/interactionLogService';
import { robotService } from '@/services/api/robotService';
import type { CaregiverProfileResponse, InteractionLogResponse, ReminderLogResponse, RobotDTO, RobotStatusLogResponse, RoomElderlySummary } from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Clock, Loader2, MessageSquare, NotebookText } from 'lucide-react';

export default function CaregiverReportsPage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<CaregiverProfileResponse | null>(null);
  const [elderlies, setElderlies] = useState<RoomElderlySummary[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLogResponse[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLogResponse[]>([]);
  const [roomRobot, setRoomRobot] = useState<RobotDTO | null>(null);
  const [robotLogs, setRobotLogs] = useState<RobotStatusLogResponse[]>([]);
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

        const roomElderlies = currentProfile?.roomId
          ? await roomService.getElderliesByRoom(currentProfile.roomId).catch(() => [] as RoomElderlySummary[])
          : [];
        setElderlies(roomElderlies);

        const elderlyIds = new Set(roomElderlies.map((item) => item.id));
        const roomData = currentProfile?.roomId ? await roomService.getRoomById(currentProfile.roomId).catch(() => null) : null;
        const roomRobot = roomData?.robot ?? null;
        setRoomRobot(roomRobot);

        const [allReminderLogs, allInteractionLogs, allRobotLogs] = await Promise.all([
          reminderService.getAllLogs().catch(() => [] as ReminderLogResponse[]),
          interactionLogService.getAll().catch(() => [] as InteractionLogResponse[]),
          robotService.getAllStatusLogs().catch(() => [] as RobotStatusLogResponse[]),
        ]);

        setReminderLogs(allReminderLogs.filter((item) => elderlyIds.has(item.elderlyId)));
        setInteractionLogs(allInteractionLogs.filter((item) => elderlyIds.has(item.elderlyId)));
        setRobotLogs(roomRobot ? allRobotLogs.filter((item) => item.robotId === roomRobot.id) : []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  const recentReminderLogs = useMemo(() => reminderLogs.slice().sort((left, right) => new Date(right.triggeredTime).getTime() - new Date(left.triggeredTime).getTime()).slice(0, 5), [reminderLogs]);
  const recentInteractionLogs = useMemo(() => interactionLogs.slice().sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()).slice(0, 5), [interactionLogs]);
  const recentRobotLogs = useMemo(() => robotLogs.slice().sort((left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime()).slice(0, 5), [robotLogs]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-muted-foreground">Logs and history for reminders, robot activity, and elderly interactions in your room.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading reports...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Caregiver</CardTitle></CardHeader>
              <CardContent className="text-lg font-bold">{profile?.name || 'N/A'}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Elderly</CardTitle></CardHeader>
              <CardContent className="text-lg font-bold">{elderlies.length}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Reminder Logs</CardTitle></CardHeader>
              <CardContent className="text-lg font-bold">{reminderLogs.length}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Interaction Logs</CardTitle></CardHeader>
              <CardContent className="text-lg font-bold">{interactionLogs.length}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Room Robot</CardTitle></CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{roomRobot?.robotName || 'N/A'}</div>
                <div className="text-xs text-muted-foreground mt-1">{roomRobot ? `${roomRobot.model} • Robot ID ${roomRobot.id}` : 'No robot assigned'}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><NotebookText className="h-5 w-5 text-sky-500" /> Reminder History</CardTitle>
                <CardDescription>Medication and routine reminder delivery logs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReminderLogs.length === 0 ? <p className="text-sm text-muted-foreground">No reminder logs yet.</p> : recentReminderLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{log.reminderTitle}</span>
                      <Badge variant={log.confirmed ? 'default' : 'secondary'}>{log.confirmed ? 'Confirmed' : 'Pending'}</Badge>
                    </div>
                    <div className="mt-1 text-muted-foreground">{log.elderlyName}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-emerald-500" /> Interaction History</CardTitle>
                <CardDescription>Recent conversations between robot and elderly.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentInteractionLogs.length === 0 ? <p className="text-sm text-muted-foreground">No interaction logs yet.</p> : recentInteractionLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border p-3 text-sm">
                    <div className="font-semibold">{log.elderlyName}</div>
                    <div className="mt-1 text-muted-foreground line-clamp-2">{log.userInputText}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-amber-500" /> Robot Logs</CardTitle>
                <CardDescription>Latest status changes for the room robot.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRobotLogs.length === 0 ? <p className="text-sm text-muted-foreground">No robot logs yet.</p> : recentRobotLogs.map((log) => (
                  <div key={log.id} className="rounded-xl border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{log.robotName}</span>
                      <Badge variant="outline">{log.status}</Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> {new Date(log.reportedAt).toLocaleString()}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}