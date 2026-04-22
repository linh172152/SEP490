'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { alertService } from '@/services/api/alertService';
import { reminderService } from '@/services/api/reminderService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  HeartPulse,
  Activity,
  AlertTriangle,
  ChevronRight,
  User,
  Loader2,
  Siren,
  ShieldAlert,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { formatDate, parseServerDate } from '@/lib/utils';
import type { AlertNotificationResponse, ReminderLogResponse, ReminderResponse, ElderlyProfileResponse } from '@/services/api/types';
import { getReminderDetailedStatus } from '@/utils/reminderStatus';


const normalizeReminderType = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'medicine' || normalized === 'media') {
    return 'medication';
  }

  return normalized;
};

const getReminderTypeLabel = (value: string) => {
  const normalized = normalizeReminderType(value);

  if (normalized === 'medication') {
    return 'Medication';
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

function dedupeById<T extends { id: number }>(items: T[]) {
  return items.reduce<T[]>((acc, item) => {
    if (!acc.some((existing) => existing.id === item.id)) {
      acc.push(item);
    }

    return acc;
  }, []);
}

export default function RemindersPage() {
  const { user } = useAuthStore();
  const { elderlyList, fetchDashboardData, isLoading } = useFamilyStore();
  const isRefreshingRef = useRef(false);

  const [loadingFeed, setLoadingFeed] = useState(false);
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLogResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterElderly, setFilterElderly] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeSortOrder, setTimeSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(Number(user.id));
    }
  }, [user?.id, fetchDashboardData]);

  useEffect(() => {
    const loadFamilyFeeds = async (silent = false) => {
      if (isRefreshingRef.current) {
        return;
      }

      isRefreshingRef.current = true;

      if (elderlyList.length === 0) {
        setReminders([]);
        setReminderLogs([]);
        setAlerts([]);
        if (!silent) {
          setLoadingFeed(false);
        }
        isRefreshingRef.current = false;
        return;
      }

      if (!silent) {
        setLoadingFeed(true);
      }

      try {
        const elderlyIds = elderlyList.map((item) => item.id);
        const [reminderGroups, reminderLogGroups, allAlerts] = await Promise.all([
          Promise.all(elderlyIds.map((elderlyId) => reminderService.getByElderlyId(elderlyId).catch(() => [] as ReminderResponse[]))),
          Promise.all(elderlyIds.map((elderlyId) => reminderService.getLogsByElderlyId(elderlyId).catch(() => [] as ReminderLogResponse[]))),
          alertService.getAll().catch(() => [] as AlertNotificationResponse[]),
        ]);

        const elderlyIdSet = new Set(elderlyIds);
        setReminders(dedupeById(reminderGroups.flat()));
        setReminderLogs(dedupeById(reminderLogGroups.flat()));
        setAlerts(dedupeById(allAlerts.filter((item) => elderlyIdSet.has(item.elderlyId))));
      } finally {
        if (!silent) {
          setLoadingFeed(false);
        }
        isRefreshingRef.current = false;
      }
    };

    void loadFamilyFeeds(false);
    const intervalId = setInterval(() => {
      void loadFamilyFeeds(true);
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [elderlyList]);

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const matchesType = filterType === 'all' || normalizeReminderType(reminder.reminderType) === filterType;
      const matchesElderly = filterElderly === 'ALL' || reminder.elderlyId.toString() === filterElderly;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        reminder.title.toLowerCase().includes(query) ||
        reminder.elderlyName?.toLowerCase().includes(query) ||
        reminder.caregiverName?.toLowerCase().includes(query);

      return matchesType && matchesElderly && matchesSearch;
    });
  }, [filterElderly, filterType, reminders, searchQuery]);

  const filteredReminderLogs = useMemo(() => {
    return reminderLogs.filter((item) => {
      const matchesElderly = filterElderly === 'ALL' || item.elderlyId.toString() === filterElderly;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        item.reminderTitle.toLowerCase().includes(query) ||
        item.elderlyName.toLowerCase().includes(query) ||
        item.robotName.toLowerCase().includes(query);

      return matchesElderly && matchesSearch;
    });
  }, [filterElderly, reminderLogs, searchQuery]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      const matchesElderly = filterElderly === 'ALL' || item.elderlyId.toString() === filterElderly;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        item.elderlyName.toLowerCase().includes(query) ||
        item.alertType.toLowerCase().includes(query) ||
        item.message.toLowerCase().includes(query);

      return matchesElderly && matchesSearch;
    });
  }, [alerts, filterElderly, searchQuery]);

  const now = Date.now();
  const reminderStats = useMemo(
    () => ({
      active: filteredReminders.filter((item) => {
        if (!item.active) return false;
        const elderly = elderlyList.find(e => e.id === item.elderlyId);
        const info = getReminderDetailedStatus(item, reminderLogs, elderly?.gender);
        return info.status === 'UPCOMING' || info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE';
      }).length,
      missed: filteredReminders.filter((item) => {
        if (!item.active) return false;
        const elderly = elderlyList.find(e => e.id === item.elderlyId);
        const info = getReminderDetailedStatus(item, reminderLogs, elderly?.gender);
        return info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE';
      }).length,
      completed: filteredReminders.filter((item) => {
        if (!item.active) return true;
        const elderly = elderlyList.find(e => e.id === item.elderlyId);
        const info = getReminderDetailedStatus(item, reminderLogs, elderly?.gender);
        return info.status === 'COMPLETED';
      }).length,
    }),
    [filteredReminders, reminderLogs, elderlyList]
  );



  const openAlerts = useMemo(() => filteredAlerts.filter((item) => !item.resolved), [filteredAlerts]);

  const sortedReminders = useMemo(
    () => filteredReminders.slice().sort((left, right) => {
      const diff = parseServerDate(right.scheduleTime).getTime() - parseServerDate(left.scheduleTime).getTime();
      return timeSortOrder === 'newest' ? diff : -diff;
    }),
    [filteredReminders, timeSortOrder]
  );

  const sortedLogs = useMemo(
    () => filteredReminderLogs.slice().sort((left, right) => {
      const diff = parseServerDate(right.triggeredTime).getTime() - parseServerDate(left.triggeredTime).getTime();
      return timeSortOrder === 'newest' ? diff : -diff;
    }),
    [filteredReminderLogs, timeSortOrder]
  );

  const sortedAlerts = useMemo(
    () => filteredAlerts.slice().sort((left, right) => {
      const diff = parseServerDate(right.createdAt).getTime() - parseServerDate(left.createdAt).getTime();
      return timeSortOrder === 'newest' ? diff : -diff;
    }),
    [filteredAlerts, timeSortOrder]
  );

  const isPageLoading = isLoading || loadingFeed;

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health &amp; Activity</h1>
          <p className="mt-1 text-muted-foreground">Read-only family feed for reminders, reminder logs, and alerts across all elderly profiles linked to this account.</p>
        </div>
        <Button asChild variant="outline" className="h-11 px-6 shadow-sm">
          <Link href="/dashboard/family/elderly">Go To My Elderly</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="Active" value={reminderStats.active} icon={<Bell className="h-5 w-5 text-sky-500" />} />
        <SummaryCard title="Missed" value={reminderStats.missed} icon={<Clock className="h-5 w-5 text-amber-500" />} />
        <SummaryCard title="Reminder Logs" value={filteredReminderLogs.length} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} />
        <SummaryCard title="Open Alerts" value={openAlerts.length} icon={<ShieldAlert className="h-5 w-5 text-rose-500" />} />
      </div>

      <div className="grid items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-5">
        <div className="relative md:col-span-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search reminders, logs, alerts..."
            className="h-11 border-none bg-muted/50 pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <Select value={filterElderly} onValueChange={setFilterElderly}>
          <SelectTrigger className="h-11 border-none bg-muted/50">
            <SelectValue placeholder="All Elderly" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Elderly</SelectItem>
            {elderlyList.map((elderly) => (
              <SelectItem key={elderly.id} value={elderly.id.toString()}>{elderly.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="h-11 border-none bg-muted/50">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reminder Types</SelectItem>
            <SelectItem value="medication">Medication Only</SelectItem>
            <SelectItem value="exercise">Exercise Only</SelectItem>
            <SelectItem value="meal">Meal Only</SelectItem>
          </SelectContent>
        </Select>

        <Select value={timeSortOrder} onValueChange={(value) => setTimeSortOrder(value as 'newest' | 'oldest')}>
          <SelectTrigger className="h-11 border-none bg-muted/50">
            <SelectValue placeholder="Newest first" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setFilterType('all'); setFilterElderly('ALL'); setSearchQuery(''); setTimeSortOrder('newest'); }} className="h-11 w-11 rounded-xl">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {isPageLoading ? (
        <div className="flex h-[280px] items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading family health feed...
        </div>
      ) : reminders.length === 0 && reminderLogs.length === 0 && alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center">
          <Bell className="mb-6 h-16 w-16 animate-bounce text-slate-300 duration-1000" />
          <h2 className="mb-2 text-2xl font-bold text-slate-700">No health activity yet</h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            There are no reminders, reminder logs, or alerts available for the elderly profiles linked to this family account yet.
          </p>
          <Button asChild className="h-12 rounded-xl bg-sky-600 px-8 font-bold shadow-xl shadow-sky-100 hover:bg-sky-700">
            <Link href="/dashboard/family/packages">Review Service Plans</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200">
                <CalendarIcon className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Reminders</h3>
              <Badge variant="secondary" className="bg-sky-50 font-bold text-sky-700">{sortedReminders.length}</Badge>
            </div>
            {sortedReminders.length === 0 ? (
              <EmptyState text="No reminders found for the current filter." />
            ) : (
              <div className="grid gap-4">
                {sortedReminders.map((reminder) => (
                  <ReminderItem key={reminder.id} reminder={reminder} logs={reminderLogs} elderlyList={elderlyList} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Reminder Logs</h3>
              <Badge variant="secondary" className="bg-emerald-50 font-bold text-emerald-700">{sortedLogs.length}</Badge>
            </div>
            {sortedLogs.length === 0 ? (
              <EmptyState text="No reminder logs found for the current filter." />
            ) : (
              <div className="grid gap-3">
                {sortedLogs.map((item) => (
                  <div key={item.id} className={`rounded-2xl border p-4 ${item.confirmed ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'}`}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{item.reminderTitle}</span>
                          <Badge variant="outline">{item.elderlyName}</Badge>
                          <Badge variant={item.confirmed ? 'secondary' : 'destructive'}>{item.confirmed ? 'Confirmed' : 'Pending'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Robot: {item.robotName}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Triggered: {formatDate(item.triggeredTime)}
                        <div>{item.confirmedTime ? `Confirmed: ${formatDate(item.confirmedTime)}` : 'Waiting confirmation'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200">
                <Siren className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-extrabold tracking-tight">Alerts</h3>
              <Badge variant="secondary" className="bg-rose-50 font-bold text-rose-700">{sortedAlerts.length}</Badge>
            </div>
            {sortedAlerts.length === 0 ? (
              <EmptyState text="No alerts found for the current filter." />
            ) : (
              <div className="grid gap-3">
                {sortedAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{alert.alertType.replace(/_/g, ' ')}</span>
                          <Badge variant="outline">{alert.elderlyName}</Badge>
                          <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>{alert.resolved ? 'Resolved' : 'Open'}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(alert.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function ReminderItem({ reminder, logs, elderlyList }: { reminder: ReminderResponse, logs: ReminderLogResponse[], elderlyList: ElderlyProfileResponse[] }) {
  const elderly = elderlyList.find(e => e.id === reminder.elderlyId);
  const info = getReminderDetailedStatus(reminder, logs, elderly?.gender);

  const isMissed = info.status === 'ROBOT_NOT_RESPONDING' || info.status === 'MISSED_USER_NO_RESPONSE';
  const isWaiting = info.status === 'WAITING_ROBOT' || info.status === 'WAITING_USER_RESPONSE';

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
        normalizeReminderType(reminder.reminderType) === 'medication'
          ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20'
          : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20'
      }`}>
        {normalizeReminderType(reminder.reminderType) === 'medication' ? <HeartPulse className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h4 className="truncate font-bold text-slate-800 transition-colors group-hover:text-primary dark:text-slate-100">{reminder.title}</h4>
          <Badge variant="outline" className={`h-4 py-0 text-[10px] font-bold uppercase ${
            normalizeReminderType(reminder.reminderType) === 'medication' ? 'border-rose-100 text-rose-500' : 'border-emerald-100 text-emerald-500'
          }`}>
            {getReminderTypeLabel(reminder.reminderType)}
          </Badge>
          {info.message && (
            <Badge variant="destructive" className="h-4 py-0 text-[10px] bg-rose-100 text-rose-600 border-none animate-pulse">
              {info.message}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {reminder.elderlyName}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(reminder.scheduleTime)}</span>
          <span className="flex items-center gap-1"><RotateCcw className="h-3 w-3" /> {reminder.repeatPattern}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="mr-2 hidden flex-col items-end sm:flex">
          <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Caregiver</span>
          <span className="text-xs font-semibold">{reminder.caregiverName || 'System'}</span>
        </div>
        {reminder.active && info.status !== 'COMPLETED' ? (
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border ${isMissed ? 'border-rose-100 bg-rose-50 text-rose-500' : isWaiting ? 'border-amber-100 bg-amber-50 text-amber-500 animate-pulse' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>
            {isMissed ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
        <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}


function SummaryCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium uppercase text-muted-foreground">{title}</div>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">{text}</div>;
}
