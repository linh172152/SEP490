'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { caregiverService } from '@/services/api/caregiverService';
import { roomService } from '@/services/api/roomService';
import { alertService } from '@/services/api/alertService';
import { reminderService } from '@/services/api/reminderService';
import { userPackageService } from '@/services/api/userPackageService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { useI18nStore } from '@/store/useI18nStore';
import { cn } from '@/lib/utils';
import { getActiveUserPackageForElderly, getCatalogPackageForUserPackage, getServicePackageTheme, getUnpurchasedPackageTheme } from '@/lib/servicePackageThemes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, Bot, Loader2, Package, Users } from 'lucide-react';
import type {
  AlertNotificationResponse,
  CaregiverProfileResponse,
  ReminderResponse,
  RobotDTO,
  RoomElderlySummary,
  ServicePackageResponse,
  UserPackageResponse,
} from '@/services/api/types';
import { useIsMounted } from '@/hooks/useIsMounted';

const getCaregiverIdentifiers = (profile: { id?: number | null; accountId?: number | null } | null, userId?: string) => {
  return Array.from(
    new Set(
      [profile?.id, profile?.accountId, userId ? Number(userId) : undefined].filter(
        (value): value is number => typeof value === 'number' && !Number.isNaN(value)
      )
    )
  );
};

export default function CaregiverOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CaregiverProfileResponse | null>(null);
  const [roomElderlies, setRoomElderlies] = useState<RoomElderlySummary[]>([]);
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [roomRobot, setRoomRobot] = useState<RobotDTO | null>(null);
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const isMounted = useIsMounted();

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
          setLoading(false);
          return;
        }

        const elderlies = await roomService.getElderliesByRoom(currentProfile.roomId);
        const elderlyIds = new Set(elderlies.map((item) => item.id));
        const caregiverIdentifiers = getCaregiverIdentifiers(currentProfile, user?.id);

        const [allAlerts, roomData, packageCatalog, userPackageGroups] = await Promise.all([
          alertService.getAll().catch(() => [] as AlertNotificationResponse[]),
          roomService.getRoomById(currentProfile.roomId).catch(() => null),
          servicePackageService.getAll().catch(() => [] as ServicePackageResponse[]),
          Promise.all(elderlies.map((item) => userPackageService.getByElderlyId(item.id).catch(() => [] as UserPackageResponse[]))),
        ]);

        // Specific reminders for this caregiver
        const relevantReminders = await reminderService.getByCaregiverId(currentProfile.id).catch(() => [] as ReminderResponse[]);

        const robotByRoom = roomData?.robot ?? null;

        setRoomElderlies(elderlies.filter(e => !(e as any).deleted));
        setReminders(
          relevantReminders.filter((item) => elderlyIds.has(item.elderlyId))
        );
        setAlerts(allAlerts.filter((item) => elderlyIds.has(item.elderlyId) && !item.resolved));
        setRoomRobot(robotByRoom);
        setServicePackages(packageCatalog);
        setUserPackages(userPackageGroups.flat());
      } catch (loadError: unknown) {
        setError(loadError instanceof Error ? loadError.message : 'Khong the tai caregiver overview tu API.');
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

  const unpurchasedTheme = getUnpurchasedPackageTheme();

  if (!isMounted) return null;

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
        <h1 className="text-3xl font-bold tracking-tight">{t('sidebar.overview') || 'Dashboard'}</h1>
        <p className="text-muted-foreground">
          {profile?.name ? `${profile.name} - ${profile.roomId ? `Space ${profile.roomId}` : 'Unassigned'}` : t('caregiver.dashboard.subtitle')}
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
            <p className="text-xs text-muted-foreground mt-1">Cagiver's room</p>
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
              {roomRobot ? `${roomRobot.model} • Robot ID ${roomRobot.id}` : 'Chua co robot trong phong'}
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
                <p className="text-sm text-muted-foreground italic opacity-50 text-center py-6">
                  {t('common.no_data') || 'No elderly found in your assigned room.'}
                </p>
              ) : (
                roomElderlies.map((item) => (
                  (() => {
                    const activeUserPackage = getActiveUserPackageForElderly(userPackages, item.id);
                    const activePackage = getCatalogPackageForUserPackage(servicePackages, activeUserPackage);
                    const packageTheme = getServicePackageTheme(activePackage, servicePackages);
                    const hasPackage = Boolean(activePackage);
                    const elderlyAlertCount = alerts.filter((alert) => alert.elderlyId === item.id).length;

                    return (
                      <div key={item.id} className={cn('overflow-hidden rounded-2xl border shadow-sm transition-all hover:shadow-md', hasPackage ? packageTheme.surfaceClassName : unpurchasedTheme.surfaceClassName)}>
                        <div className={cn('h-1.5 w-full', hasPackage ? packageTheme.accentClassName : unpurchasedTheme.accentClassName)} />
                        <div className="space-y-4 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                               <div className="text-lg font-black tracking-tight text-slate-900">{activePackage?.name || t('manager.dashboard.package_popularity.no_data')}</div>
                               <div className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('common.roles.ELDERLYUSER')}: {item.name}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <Badge variant={hasPackage ? 'outline' : 'secondary'} className={hasPackage ? packageTheme.badgeClassName : unpurchasedTheme.badgeClassName}>
                                 {activePackage?.level || 'N/A'}
                               </Badge>
                               {elderlyAlertCount > 0 && (
                                 <Badge variant="destructive" className="animate-bounce">
                                   {elderlyAlertCount} ALERTS
                                 </Badge>
                               )}
                            </div>
                          </div>

                          <div className={cn('rounded-xl px-4 py-3 text-sm border', hasPackage ? 'border-white/60 bg-white/70 backdrop-blur-sm' : 'border-slate-100 bg-slate-50/90')}>
                             <div className="grid gap-3 sm:grid-cols-2">
                               <div className="flex items-center justify-between gap-3">
                                  <span className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest"><Package className="h-3.5 w-3.5 text-emerald-500" /> Status</span>
                                  <span className="font-black text-slate-700">{hasPackage ? (activeUserPackage?.status === 'PENDING' ? (t('common.status_labels.pending') || 'WAITING') : (t('common.status_labels.success') || 'PAID')) : '---'}</span>
                               </div>
                               <div className="flex items-center justify-between gap-3">
                                  <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Space</span>
                                  <span className="font-black text-slate-700">{profile?.roomId ? `#${profile.roomId}` : '---'}</span>
                               </div>
                             </div>
                             {hasPackage && (
                               <div className={cn('mt-3 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2', packageTheme.subtleClassName)}>
                                  <div className="h-1 w-1 rounded-full bg-current opacity-30" />
                                  {activePackage?.level} • {activePackage?.durationDays || 30} DAYS
                               </div>
                             )}
                          </div>

                          <div className="flex gap-2 pt-2">
                             <Button asChild variant="outline" size="sm" className="flex-1 rounded-xl font-bold border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-colors">
                               <Link href={`/dashboard/caregiver/elderly/${item.id}`}>
                                 {t('common.view') || 'Details'}
                               </Link>
                             </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })()
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
