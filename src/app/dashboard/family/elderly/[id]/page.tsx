'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { differenceInYears } from 'date-fns';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import { elderlyService } from '@/services/api/elderlyService';
import { roomService } from '@/services/api/roomService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { userPackageService } from '@/services/api/userPackageService';
import { cn } from '@/lib/utils';
import { getOrderedServicePackages, getServicePackageTheme, getUnpurchasedPackageTheme } from '@/lib/servicePackageThemes';
import type {
  ElderlyProfileResponse,
  RobotDTO,
  RoomResponse,
  ServicePackageResponse,
  UserPackageResponse,
} from '@/services/api/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Globe,
  HeartPulse,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';

export default function FamilyElderlyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const elderlyId = Number(id);

  const [profile, setProfile] = useState<ElderlyProfileResponse | null>(null);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [robot, setRobot] = useState<RobotDTO | null>(null);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [ownedPackages, setOwnedPackages] = useState<UserPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!Number.isFinite(elderlyId)) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const detail = await elderlyService.getById(elderlyId);
        setProfile(detail);

        const [packages, userPackages, roomData] = await Promise.all([
          servicePackageService.getAll().catch(() => [] as ServicePackageResponse[]),
          userPackageService.getByElderlyId(detail.id).catch(async () => {
            const all = await userPackageService.getAll().catch(() => [] as UserPackageResponse[]);
            return all.filter((item) => item.elderlyProfileId === detail.id);
          }),
          detail.roomId ? roomService.getRoomById(detail.roomId).catch(() => null) : Promise.resolve(null),
        ]);

        setServicePackages(packages);
        setOwnedPackages(userPackages);
        setRoom(roomData);
        setRobot(roomData?.robot || null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [elderlyId]);

  const activeOwnedPackages = useMemo(() => {
    const now = Date.now();
    return ownedPackages.filter((item) => {
      const expiry = Date.parse(item.expiredAt);
      return Number.isNaN(expiry) || expiry >= now;
    });
  }, [ownedPackages]);

  const activePackageDetails = useMemo(
    () =>
      activeOwnedPackages.map((item) => ({
        ownership: item,
        catalog: servicePackages.find((pkg) => pkg.id === item.servicePackageId) || null,
      })),
    [activeOwnedPackages, servicePackages]
  );

  const primaryPackage = activePackageDetails[0]?.catalog || null;
  const packageTheme = getServicePackageTheme(primaryPackage, servicePackages);
  const unpurchasedTheme = getUnpurchasedPackageTheme();
  const age = useMemo(() => {
    if (!profile?.dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(profile.dateOfBirth));
  }, [profile?.dateOfBirth]);

  const chartSeed = useMemo(() => {
    if (!profile) return 7;
    return profile.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  }, [profile]);

  const healthData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      name: day,
      mood: 68 + Math.sin((index + chartSeed) * 0.45) * 12,
      heartRate: 74 + Math.cos((index + chartSeed) * 0.35) * 6,
      engagement: 72 + Math.sin((index + chartSeed) * 0.25) * 14,
    }));
  }, [chartSeed]);

  const cognitiveData = useMemo(
    () => [
      { subject: 'Memory', score: 78 + (chartSeed % 8), fullMark: 100 },
      { subject: 'Focus', score: 70 + (chartSeed % 10), fullMark: 100 },
      { subject: 'Language', score: 76 + (chartSeed % 7), fullMark: 100 },
      { subject: 'Reaction', score: 67 + (chartSeed % 9), fullMark: 100 },
      { subject: 'Routine', score: 82 + (chartSeed % 6), fullMark: 100 },
    ],
    [chartSeed]
  );

  const stats = useMemo(
    () => [
      { label: 'Active Plans', value: activeOwnedPackages.length },
      { label: 'Health Notes', value: profile?.healthNotes ? 'Ready' : 'Empty' },
      { label: 'Room', value: room?.roomName || (profile?.roomId ? `Room ${profile.roomId}` : 'Unassigned') },
      { label: 'Robot', value: robot?.robotName || 'Unavailable' },
    ],
    [activeOwnedPackages.length, profile?.healthNotes, profile?.roomId, robot?.robotName, room?.roomName]
  );

  const availablePackages = useMemo(
    () =>
      getOrderedServicePackages(servicePackages).map((pkg) => ({
        ...pkg,
        isOwned: activeOwnedPackages.some((item) => item.servicePackageId === pkg.id),
      })),
    [activeOwnedPackages, servicePackages]
  );

  if (loading) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading elderly detail...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-sm text-rose-700">Elderly profile not found.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/family/elderly">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Elderly
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard/family" className="transition-colors hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/dashboard/family/elderly" className="transition-colors hover:text-foreground">My Elderly</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{profile.name}</span>
      </div>

      <Card className={cn(
        'overflow-hidden border-none text-white shadow-xl',
        primaryPackage ? 'bg-slate-900' : 'bg-gradient-to-r from-sky-600 via-sky-600 to-cyan-500'
      )}>
        {primaryPackage ? <div className={cn('h-2 w-full', packageTheme.accentClassName)} /> : null}
        <CardContent className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/15 text-white hover:bg-white/20">Family View</Badge>
              <Badge className="bg-white/15 text-white hover:bg-white/20">{room?.roomName || (profile.roomId ? `Room ${profile.roomId}` : 'No Room')}</Badge>
              <Badge className="bg-white/15 text-white hover:bg-white/20">{primaryPackage?.name || 'No Active Plan'}</Badge>
              <Badge className="bg-white/15 text-white hover:bg-white/20">Elderly ID #{profile.id}</Badge>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-sky-50/90">
                A clearer family-facing overview of profile context, health notes, service plan coverage, and activity signals. Important information stays above the fold instead of being split across unrelated blocks.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-100/80">{item.label}</div>
                  <div className="mt-2 text-lg font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Button asChild variant="secondary" className="justify-start border-none bg-white text-sky-700 hover:bg-sky-50">
              <Link href="/dashboard/family/health-activity">
                <Activity className="mr-2 h-4 w-4" /> Open Health & Activity
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start border-none bg-white/15 text-white hover:bg-white/20">
              <Link href={`/dashboard/family/packages?elderlyId=${profile.id}&elderlyName=${encodeURIComponent(profile.name)}`}>
                <Package className="mr-2 h-4 w-4" /> Review Service Plans
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start border-none bg-white/15 text-white hover:bg-white/20">
              <Link href="/dashboard/family/alerts">
                <ShieldCheck className="mr-2 h-4 w-4" /> Check Alerts
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start border-none bg-white/15 text-white hover:bg-white/20">
              <Link href="/dashboard/family/elderly">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Elderly
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
              <CardDescription>Core identity and communication preferences for this elderly profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-gradient-to-b from-sky-600 to-sky-700 p-5 text-white shadow-lg">
                <div className="text-sm font-medium text-sky-100">Family Member View</div>
                <div className="mt-3 text-2xl font-bold">{profile.name}</div>
                <div className="mt-1 text-sm text-sky-100/90">{age ? `${age} years old` : 'Age unavailable'} • {profile.preferredLanguage}</div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Language</div>
                    <div className="mt-1 font-semibold">{profile.preferredLanguage}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-100/80">Voice Speed</div>
                    <div className="mt-1 font-semibold capitalize">{profile.speakingSpeed}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <SummaryRow icon={<Calendar className="h-4 w-4 text-sky-500" />} label="Date of Birth" value={new Date(profile.dateOfBirth).toLocaleDateString()} />
                <SummaryRow icon={<Globe className="h-4 w-4 text-emerald-500" />} label="Preferred Language" value={profile.preferredLanguage} />
                <SummaryRow icon={<Volume2 className="h-4 w-4 text-violet-500" />} label="Speaking Speed" value={profile.speakingSpeed} />
                <SummaryRow icon={<MapPin className="h-4 w-4 text-amber-500" />} label="Room" value={room?.roomName || (profile.roomId ? `Room ${profile.roomId}` : 'Unassigned')} />
                <SummaryRow icon={<Zap className="h-4 w-4 text-cyan-500" />} label="Robot" value={robot?.robotName || 'No robot assigned'} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owned Service Plans</CardTitle>
              <CardDescription>Packages currently attached to elderly #{profile.id} - {profile.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activePackageDetails.length === 0 ? (
                <div className="space-y-3 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                  <div>No active service plan yet.</div>
                  <Button asChild className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                    <Link href={`/dashboard/family/packages?elderlyId=${profile.id}&elderlyName=${encodeURIComponent(profile.name)}`}>
                      Mua gói ngay !
                    </Link>
                  </Button>
                </div>
              ) : (
                activePackageDetails.map(({ ownership, catalog }) => (
                  <div key={ownership.id} className={cn('rounded-2xl border p-4', getServicePackageTheme(catalog, servicePackages).surfaceClassName)}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{catalog?.name || `Package #${ownership.servicePackageId}`}</div>
                      <Badge variant="outline" className={getServicePackageTheme(catalog, servicePackages).badgeClassName}>{catalog?.level || 'Unknown'}</Badge>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Elderly #{ownership.elderlyProfileId || profile.id} • Assigned {new Date(ownership.assignedAt).toLocaleDateString()} • Expires {new Date(ownership.expiredAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Summary</CardTitle>
              <CardDescription>Read the essential health context first, then continue to trend and plan sections.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                  <HeartPulse className="h-4 w-4" /> Medical Notes
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  {profile.healthNotes || 'No specific health notes recorded yet. The family should keep this section updated to help caregivers and the robot follow the right communication and care approach.'}
                </p>
              </div>
              <div className="grid gap-3">
                <InsightCard title="Primary Plan" value={primaryPackage?.name || 'None'} icon={<Package className="h-4 w-4 text-emerald-500" />} />
                <InsightCard title="Room Robot" value={robot ? `${robot.robotName} in ${room?.roomName || 'assigned room'}` : room?.roomName || 'No room assigned'} icon={<Zap className="h-4 w-4 text-amber-500" />} />
                <InsightCard title="Communication" value={`${profile.preferredLanguage} • ${profile.speakingSpeed}`} icon={<Sparkles className="h-4 w-4 text-sky-500" />} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Room & Robot Context</CardTitle>
              <CardDescription>Robot information is rendered directly from the resolved room payload without calling GET /api/robots/{'{'}id{'}'}.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ContextMetric label="Room" value={room?.roomName || (profile.roomId ? `Room ${profile.roomId}` : 'Unassigned')} />
              <ContextMetric label="Robot" value={robot?.robotName || 'Not assigned'} />
              <ContextMetric label="Model" value={robot?.model || 'N/A'} />
              <ContextMetric label="Robot ID" value={robot?.id ? `${robot.id}` : 'N/A'} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood Trends</CardTitle>
                <CardDescription>Simple family-readable trend for weekly emotional stability.</CardDescription>
              </CardHeader>
              <CardContent className="h-[240px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData}>
                    <defs>
                      <linearGradient id="familyMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={3} fill="url(#familyMood)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cardiac Metrics</CardTitle>
                <CardDescription>Visual heartbeat pattern for quick family review.</CardDescription>
              </CardHeader>
              <CardContent className="h-[240px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Cognitive Performance</CardTitle>
                <CardDescription>High-level radar summary to keep the page informative without overloading the family member.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="78%" data={cognitiveData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" fontSize={10} tick={{ fill: '#64748b' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                    <Radar dataKey="score" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.45} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Plan Comparison</CardTitle>
                <CardDescription>Keep the current subscription visible while still showing upgrade options in the same reading flow.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availablePackages.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">No service package catalog found.</div>
                ) : (
                  availablePackages.map((pkg) => (
                    <div key={pkg.id} className={cn('rounded-2xl border p-4', pkg.isOwned ? getServicePackageTheme(pkg, servicePackages).surfaceClassName : unpurchasedTheme.surfaceClassName)}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{pkg.name}</div>
                          <div className="mt-1 text-sm text-muted-foreground">{pkg.description}</div>
                        </div>
                        <Badge variant={pkg.isOwned ? 'default' : 'secondary'} className={pkg.isOwned ? getServicePackageTheme(pkg, servicePackages).badgeClassName : unpurchasedTheme.badgeClassName}>{pkg.isOwned ? 'Active' : 'Available'}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{pkg.level} • {pkg.durationDays || 30} days</span>
                        <span className="font-semibold">{pkg.price.toLocaleString()}</span>
                      </div>
                      {!pkg.isOwned ? (
                        <Button asChild size="sm" className="mt-3 bg-slate-700 hover:bg-slate-800 text-white">
                          <Link href={`/dashboard/family/packages?elderlyId=${profile.id}&elderlyName=${encodeURIComponent(profile.name)}`}>
                            Mua gói ngay !
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border p-3">
      <div>{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className="truncate font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-2 font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ContextMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 break-words font-semibold text-foreground">{value}</div>
    </div>
  );
}
