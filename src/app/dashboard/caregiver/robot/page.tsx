'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { caregiverService } from '@/services/api/caregiverService';
import { roomService } from '@/services/api/roomService';
import { interactionLogService } from '@/services/api/interactionLogService';
import { reminderService } from '@/services/api/reminderService';
import { robotService } from '@/services/api/robotService';
import type {
  InteractionLogResponse,
  ReminderLogResponse,
  RobotDTO,
  RoomElderlySummary,
} from '@/services/api/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  Bell,
  Bot,
  Clock,
  Dumbbell,
  Loader2,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';

type RobotActivityType = 'interaction' | 'reminder-log';

type RobotActivityFeedItem = {
  id: string;
  type: RobotActivityType;
  elderlyId?: number;
  elderlyName?: string;
  title: string;
  subtitle: string;
  description: string;
  timestamp: string;
  badge: string;
};

export default function CaregiverRobotPage() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomElderlies, setRoomElderlies] = useState<RoomElderlySummary[]>([]);
  const [roomRobot, setRoomRobot] = useState<RobotDTO | null>(null);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLogResponse[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLogResponse[]>([]);
  const [selectedElderlyId, setSelectedElderlyId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadRobotData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profiles = await caregiverService.getByAccountId(Number(user.id)).catch(() => []);
      const currentProfile = profiles[0] ?? null;

      if (!currentProfile?.roomId) {
        setRoomElderlies([]);
        setRoomRobot(null);
        setInteractionLogs([]);
        setReminderLogs([]);
        setLoading(false);
        return;
      }

      const roomData = await roomService.getRoomById(currentProfile.roomId).catch(() => null);
      const elderlies = await roomService.getElderliesByRoom(currentProfile.roomId).catch(() => [] as RoomElderlySummary[]);
      const elderlyIds = new Set(elderlies.map((item) => item.id));
      const robot = roomData?.robot ?? null;

      const [allInteractions, allReminderLogs] = await Promise.all([
        interactionLogService.getAll().catch(() => [] as InteractionLogResponse[]),
        reminderService.getAllLogs().catch(() => [] as ReminderLogResponse[]),
      ]);

      setRoomElderlies(elderlies);
      setRoomRobot(robot);
      setInteractionLogs(
        allInteractions.filter((item) => elderlyIds.has(item.elderlyId) && (!robot || item.robotId === robot.id))
      );
      setReminderLogs(
        allReminderLogs.filter((item) => elderlyIds.has(item.elderlyId) && (!robot || item.robotId === robot.id))
      );
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load robot activity data.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadRobotData();
  }, [loadRobotData]);

  const filteredInteractions = useMemo(() => {
    return interactionLogs.filter((item) => selectedElderlyId === 'ALL' || item.elderlyId.toString() === selectedElderlyId);
  }, [interactionLogs, selectedElderlyId]);

  const filteredReminderLogs = useMemo(() => {
    return reminderLogs.filter((item) => selectedElderlyId === 'ALL' || item.elderlyId.toString() === selectedElderlyId);
  }, [reminderLogs, selectedElderlyId]);

  const selectedElderly = useMemo(() => {
    if (selectedElderlyId === 'ALL') {
      return null;
    }

    return roomElderlies.find((item) => item.id.toString() === selectedElderlyId) || null;
  }, [roomElderlies, selectedElderlyId]);

  const activityFeed = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const items: RobotActivityFeedItem[] = [
      ...filteredInteractions.map((item) => ({
        id: `interaction-${item.id}`,
        type: 'interaction' as const,
        elderlyId: item.elderlyId,
        elderlyName: item.elderlyName,
        title: item.interactionType,
        subtitle: item.robotName,
        description: `${item.userInputText} -> ${item.robotResponseText}`,
        timestamp: item.createdAt,
        badge: item.emotionDetected || 'no emotion',
      })),
      ...filteredReminderLogs.map((item) => ({
        id: `reminder-log-${item.id}`,
        type: 'reminder-log' as const,
        elderlyId: item.elderlyId,
        elderlyName: item.elderlyName,
        title: item.reminderTitle,
        subtitle: item.robotName,
        description: item.confirmed ? 'Reminder delivered and confirmed.' : 'Reminder delivered but still pending confirmation.',
        timestamp: item.confirmedTime || item.triggeredTime,
        badge: item.confirmed ? 'confirmed' : 'pending',
      })),
    ];

    return items
      .filter((item) => {
        if (!query) {
          return true;
        }

        return [item.title, item.subtitle, item.description, item.elderlyName, item.badge]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      })
      .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
  }, [filteredInteractions, filteredReminderLogs, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading robot activity...
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Robot Interaction</h1>
          <p className="text-muted-foreground">API-backed robot activity center for your room. The page starts with all assigned elderly profiles and can then be filtered by EL.</p>
        </div>
        <Button variant="outline" onClick={loadRobotData}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Robot Activity
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Assigned Elderly" value={roomElderlies.length} icon={<Users className="h-5 w-5 text-sky-500" />} />
        <MetricCard title="Interactions" value={filteredInteractions.length} icon={<MessageSquare className="h-5 w-5 text-emerald-500" />} />
        <MetricCard title="Reminder Logs" value={filteredReminderLogs.length} icon={<Bell className="h-5 w-5 text-amber-500" />} />
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-[280px_minmax(0,1fr)_auto] md:items-end">
          <FilterCard label="Choose Elderly">
            <Select value={selectedElderlyId} onValueChange={setSelectedElderlyId}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by elderly" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All assigned elderly</SelectItem>
                {roomElderlies.map((elderly) => (
                  <SelectItem key={elderly.id} value={elderly.id.toString()}>{elderly.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterCard>

          <FilterCard label="Search Activity">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-9" placeholder="Search logs, robot, EL..." />
            </div>
          </FilterCard>

          <div className="rounded-2xl border bg-slate-50 px-4 py-3 text-sm">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Current Filter</div>
            <div className="mt-2 font-semibold text-foreground">
              {selectedElderly ? `${selectedElderly.name} • EL #${selectedElderly.id}` : 'All assigned elderly'}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <Card>
          <CardHeader>
            <CardTitle>Room Robot</CardTitle>
            <CardDescription>Robot information comes directly from the room API, then activity logs are resolved around that robot.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-4 w-4 text-sky-500" />
                {roomRobot?.robotName || 'No robot assigned'}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{roomRobot ? `${roomRobot.model} • Robot ID ${roomRobot.id}` : 'This room does not have a robot assigned yet.'}</p>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Wellness Scripts On This Page</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">Interaction Logs</Badge>
                <Badge variant="outline">Reminder Delivery</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unified Robot Activity Feed</CardTitle>
            <CardDescription>All robot-related actions are visible here first, then narrowed down by elderly profile when needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.length === 0 ? (
              <EmptyState text="No robot activity found for the current filter." />
            ) : (
              activityFeed.map((item) => (
                <div key={item.id} className="rounded-2xl border p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={getActivityBadgeClassName(item.type)}>{getActivityTypeLabel(item.type)}</Badge>
                        <span className="font-semibold text-foreground">{item.title}</span>
                        <Badge variant="secondary">{item.badge}</Badge>
                        {item.elderlyName ? <Badge variant="outline">{item.elderlyName}</Badge> : null}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">{item.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4" /> {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/85">{item.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ActivityPanel
          title="Interaction Logs"
          description="Conversations between robot and elderly in this room."
          icon={<MessageSquare className="h-5 w-5 text-emerald-500" />}
          items={filteredInteractions.map((item) => ({
            id: item.id,
            title: item.elderlyName,
            badge: item.emotionDetected || item.interactionType,
            detail: `${item.userInputText} -> ${item.robotResponseText}`,
            time: item.createdAt,
          }))}
        />
        <ActivityPanel
          title="Reminder Delivery"
          description="Reminder actions executed by the room robot."
          icon={<ShieldCheck className="h-5 w-5 text-amber-500" />}
          items={filteredReminderLogs.map((item) => ({
            id: item.id,
            title: item.reminderTitle,
            badge: item.confirmed ? 'Confirmed' : 'Pending',
            detail: `${item.elderlyName} • ${item.robotName}`,
            time: item.confirmedTime || item.triggeredTime,
          }))}
        />
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

function FilterCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function ActivityPanel({
  title,
  description,
  icon,
  items,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: Array<{ id: number; title: string; badge: string; detail: string; time: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{icon}{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <EmptyState text="No records for this section." />
        ) : (
          items.slice().sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime()).slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-xl border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{item.title}</span>
                <Badge variant="outline">{item.badge}</Badge>
              </div>
              <div className="mt-1 text-muted-foreground">{item.detail}</div>
              <div className="mt-2 text-xs text-muted-foreground">{new Date(item.time).toLocaleString()}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</div>;
}

function getActivityTypeLabel(type: RobotActivityType) {
  switch (type) {
    case 'interaction':
      return 'Interaction';
    case 'reminder-log':
      return 'Reminder';
  }
}

function getActivityBadgeClassName(type: RobotActivityType) {
  switch (type) {
    case 'interaction':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'reminder-log':
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}
