'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { caregiverService } from '@/services/api/caregiverService';
import { roomService } from '@/services/api/roomService';
import { alertService } from '@/services/api/alertService';
import { reminderService } from '@/services/api/reminderService';
import { robotService } from '@/services/api/robotService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, Bot, Loader2, Users } from 'lucide-react';
import type {
  AlertNotificationResponse,
  CaregiverProfileResponse,
  ReminderResponse,
  RobotResponse,
  RobotStatusLogResponse,
  RoomElderlySummary,
} from '@/services/api/types';

export default function CaregiverOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CaregiverProfileResponse | null>(null);
  const [roomElderlies, setRoomElderlies] = useState<RoomElderlySummary[]>([]);
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [roomRobot, setRoomRobot] = useState<RobotResponse | null>(null);
  const [robotLogs, setRobotLogs] = useState<RobotStatusLogResponse[]>([]);

  useEffect(() => {
    const loadOverview = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const profiles = await caregiverService.getByAccountId(Number(user.id));
        const currentProfile = profiles[0] ?? null;
        setProfile(currentProfile);

        if (!currentProfile?.roomId) {
          setRoomElderlies([]);
          setReminders([]);
          setAlerts([]);
          setRoomRobot(null);
          setRobotLogs([]);
          setLoading(false);
          return;
        }

        const elderlies = await roomService.getElderliesByRoom(currentProfile.roomId);
        const elderlyIds = new Set(elderlies.map((item) => item.id));

        const [allReminders, allAlerts, robotByRoomSummary] = await Promise.all([
          reminderService.getAll().catch(() => [] as ReminderResponse[]),
          alertService.getAll().catch(() => [] as AlertNotificationResponse[]),
          roomService.getRobotByRoom(currentProfile.roomId).catch(() => null),
        ]);

        const robotByRoom = robotByRoomSummary
          ? await robotService.getById(robotByRoomSummary.id).catch(() => null)
          : null;

        setRoomElderlies(elderlies);
        setReminders(
          allReminders.filter(
            (item) => item.caregiverId === currentProfile.id && elderlyIds.has(item.elderlyId)
          )
        );
        setAlerts(allAlerts.filter((item) => elderlyIds.has(item.elderlyId) && !item.resolved));
        setRoomRobot(robotByRoom);

        if (robotByRoom) {
          const statusLogs = await robotService.getStatusLogsByRobot(robotByRoom.id).catch(async () => {
            const allLogs = await robotService.getAllStatusLogs().catch(() => [] as RobotStatusLogResponse[]);
            return allLogs.filter((item) => item.robotId === robotByRoom.id);
          });

          setRobotLogs(
            [...statusLogs].sort(
              (left, right) => new Date(right.reportedAt).getTime() - new Date(left.reportedAt).getTime()
            )
          );
        } else {
          setRobotLogs([]);
        }
      } catch (loadError: any) {
        setError(loadError?.message || 'Khong the tai caregiver overview tu API.');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, [user?.id]);

  const pendingReminders = useMemo(
    () => reminders.filter((item) => item.active),
    [reminders]
  );

  const latestRobotLog = robotLogs[0] ?? null;

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Dang tai caregiver overview...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="py-6 text-sm text-rose-700">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {profile?.name ? `${profile.name} - Room ${profile.roomId ?? 'N/A'}` : 'Overview for your assigned room'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Elderly In Room</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roomElderlies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Lay tu GET /api/rooms/{'{'}roomId{'}'}/elderlies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Pending Reminders</CardTitle>
            <Bell className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReminders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Reminder dang active trong room</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Alert chua resolve trong room</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Room Robot</CardTitle>
            <Bot className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{roomRobot?.robotName || 'Chua co robot'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {roomRobot ? `${roomRobot.model} • ${roomRobot.status} • ${roomRobot.firmwareVersion}` : latestRobotLog ? `Trang thai gan nhat: ${latestRobotLog.status}` : 'Chua co robot status log'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Elderly In My Room</CardTitle>
              <CardDescription>Danh sach nguoi cao tuoi thuoc room caregiver dang phu trach.</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/caregiver/elderly">Open Elderly</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {roomElderlies.length === 0 ? (
              <p className="text-sm text-muted-foreground">Khong co elderly nao trong room hien tai.</p>
            ) : (
              roomElderlies.map((item) => (
                <div key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Elderly ID: {item.id}</div>
                    </div>
                    <Badge variant="outline">Room {profile?.roomId}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts And Robot Status</CardTitle>
            <CardDescription>Tom tat su kien can chu y trong room.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">Active alerts</div>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Khong co alert dang mo.</p>
              ) : (
                alerts.slice(0, 4).map((item) => (
                  <div key={item.id} className="mb-2 rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{item.alertType}</span>
                      <Badge variant="secondary">{item.elderlyName}</Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">{item.message}</div>
                  </div>
                ))
              )}
            </div>

            <div>
              <div className="mb-2 text-sm font-medium">Recent robot logs</div>
              {robotLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chua co robot status log.</p>
              ) : (
                robotLogs.slice(0, 4).map((item) => (
                  <div key={item.id} className="mb-2 rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{item.status}</span>
                      <Badge variant="outline">{item.robotName}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(item.reportedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
