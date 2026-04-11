'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Cpu, 
  History, 
  Settings, 
  Lock, 
  Server,
  Zap,
  Globe,
  Database,
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Clock,
  Package,
  Dumbbell
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useI18nStore } from '@/store/useI18nStore';
import { accountService } from '@/services/api/accountService';
import { robotService } from '@/services/api/robotService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { exerciseService } from '@/services/api/exerciseService';
import { systemLogService } from '@/services/api/systemLogService';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

// Fallback empty data structures
const emptyFleetData = [
  { name: 'Active', value: 0, color: '#10b981' },
  { name: 'Maint', value: 0, color: '#f59e0b' },
  { name: 'Offline', value: 0, color: '#ef4444' },
];

export function AdminDashboard() {
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalRobots: 0,
    activeRobots: 0,
    totalPackages: 0,
    totalExercises: 0,
    roleDistribution: [] as any[],
    robotStatusDistribution: emptyFleetData as any[],
    recentLogs: [] as any[]
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [accounts, robots, packages, exercises, logs] = await Promise.all([
        accountService.getAccounts(),
        robotService.getAll(),
        servicePackageService.getAll(),
        exerciseService.getAllScripts(),
        systemLogService.getAll()
      ]);

      // Aggregate User Roles
      const accList = Array.isArray(accounts) ? accounts : [];
      const roles: Record<string, number> = { ADMINISTRATOR: 0, MANAGER: 0, CAREGIVER: 0, FAMILYMEMBER: 0 };
      accList.forEach(acc => {
          const r = String(acc.role).toUpperCase();
          if (roles[r] !== undefined) roles[r]++;
      });

      // Aggregate Robot Status
      const robotList = Array.isArray(robots) ? robots : [];
      let active = 0, maint = 0, offline = 0;
      robotList.forEach(r => {
          const s = String(r.status || '').toUpperCase();
          // Normalize various 'online' or 'active' strings from DB
          if (s === 'ACTIVE' || s === 'ONLINE' || s === 'ONNLINE') active++;
          else if (s === 'MAINTENANCE') maint++;
          else offline++;
      });

      setStats({
        totalAccounts: accList.length,
        totalRobots: robotList.length,
        activeRobots: active,
        totalPackages: Array.isArray(packages) ? packages.length : 0,
        totalExercises: Array.isArray(exercises) ? exercises.length : 0,
        roleDistribution: Object.entries(roles).map(([name, value]) => ({ 
            name: t(`common.roles.${name}`) || name, 
            value,
            roleKey: name
        })).filter(item => item.value > 0),
        robotStatusDistribution: [
          { name: t('admin.robots.status.active') || 'Active', value: active, color: '#10b981' },
          { name: t('admin.robots.status.maintenance') || 'Maintenance', value: maint, color: '#f59e0b' },
          { name: t('admin.robots.status.offline') || 'Offline', value: offline, color: '#ef4444' },
        ],
        recentLogs: Array.isArray(logs) ? logs.slice(0, 5) : []
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [t]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
             {t('admin.dashboard.title')}
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
             {t('admin.dashboard.subtitle')}
          </p>
        </div>
      </div>

      {/* Admin Central Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-none shadow-lg animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
            ))
        ) : (
          <>
            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 transition-all hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">{t('admin.dashboard.total_accounts') || "Infrastructure Users"}</CardTitle>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300">{stats.totalAccounts}</div>
                <div className="flex items-center gap-2 mt-2">
                   <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                   <p className="text-xs font-medium text-emerald-700 dark:text-emerald-500">{t('admin.dashboard.security_desc')}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 transition-all hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-400">{t('admin.dashboard.robots_status') || "Robot Assets"}</CardTitle>
                <Cpu className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-blue-900 dark:text-blue-300">{stats.totalRobots}</div>
                <div className="flex items-center gap-2 mt-2">
                   <TrendingUp className="h-3 w-3 text-blue-600" />
                   <p className="text-xs font-medium text-blue-700 dark:text-blue-500">
                      {t('admin.robots.status.active')}: {stats.activeRobots}
                   </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/10 transition-all hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-violet-800 dark:text-violet-400">{t('admin.dashboard.service_packages') || "Tiers"}</CardTitle>
                <Package className="h-5 w-5 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-violet-900 dark:text-violet-300">{stats.totalPackages}</div>
                <p className="text-xs font-medium text-violet-700 dark:text-violet-500 mt-2">
                    {t('admin.dashboard.service_packages_desc') || "Available configs"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 transition-all hover:scale-[1.02]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">{t('wellness.title') || "Wellness Scripts"}</CardTitle>
                <Dumbbell className="h-5 w-5 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-amber-900 dark:text-amber-300">{stats.totalExercises}</div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mt-2">
                    {t('wellness.desc') || "Library size"}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* User Distribution Chart */}
        <Card className="lg:col-span-4 border-none shadow-sm h-full relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
               <Users className="h-5 w-5 text-indigo-500" />
               {t('admin.dashboard.user_distribution_title') || "User Role Distribution"}
            </CardTitle>
            <CardDescription>{t('admin.dashboard.user_distribution_desc') || "Breakdown of all active accounts in the platform."}</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pb-20">
            {loading ? (
                <div className="flex items-center justify-center h-full">
                   <Skeleton className="h-64 w-64 rounded-full" />
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats.roleDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {stats.roleDistribution.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={
                                        entry.roleKey === 'ADMINISTRATOR' ? '#4f46e5' : 
                                        entry.roleKey === 'MANAGER' ? '#0ea5e9' : 
                                        entry.roleKey === 'CAREGIVER' ? '#10b981' : 
                                        '#8b5cf6'
                                    } 
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            )}
            {!loading && stats.roleDistribution.length > 0 && (
                <div className="absolute bottom-4 inset-x-0 flex flex-wrap justify-center gap-x-4 gap-y-2 px-6">
                    {stats.roleDistribution.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">
                           <span className="h-2 w-2 rounded-sqaure shrink-0" style={{ backgroundColor: 
                                item.roleKey === 'ADMINISTRATOR' ? '#4f46e5' : 
                                item.roleKey === 'MANAGER' ? '#0ea5e9' : 
                                item.roleKey === 'CAREGIVER' ? '#10b981' : 
                                '#8b5cf6'
                           }} />
                           {item.name}
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Fleet Distribution */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">
                {t('admin.dashboard.fleet_distribution') || "Robot Fleet Status"}
            </CardTitle>
            <CardDescription>{t('admin.dashboard.fleet_desc') || "Technical health across theCareBot fleet."}</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {loading ? (
                <div className="space-y-4 pt-10 px-4">
                   <Skeleton className="h-20 w-full" />
                   <Skeleton className="h-20 w-full" />
                   <Skeleton className="h-20 w-full" />
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={stats.robotStatusDistribution} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} width={80} />
                            <Tooltip cursor={{fill: 'transparent'}} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                {stats.robotStatusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                        {stats.robotStatusDistribution.map((item) => (
                            <div key={item.name}>
                                <div className="text-xl font-black" style={{ color: item.color }}>{item.value}</div>
                                <div className="text-[9px] font-bold text-muted-foreground uppercase">{item.name}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {/* Audit Logs Table */}
         <Card className="lg:col-span-3 border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="flex items-center gap-2">
                     <History className="h-5 w-5 text-indigo-500" />
                     {t('admin.dashboard.audit_logs_title')}
                  </CardTitle>
               </div>
               <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2.5 py-1">
                  {t('admin.dashboard.realtime_feed') || "Realtime Feed"}
               </Badge>
            </CardHeader>
            <CardContent>
               <div className="space-y-1">
                  {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3">
                              <div className="flex items-center gap-4 flex-1">
                                  <Skeleton className="h-8 w-8 rounded-lg" />
                                  <div className="flex-1 space-y-2">
                                      <Skeleton className="h-4 w-3/4" />
                                      <Skeleton className="h-3 w-1/2" />
                                  </div>
                              </div>
                              <Skeleton className="h-5 w-16" />
                          </div>
                      ))
                  ) : stats.recentLogs.length === 0 ? (
                      <div className="py-20 text-center text-muted-foreground italic text-sm">
                          {t('admin.dashboard.no_recent_activity') || "No recent system activity."}
                      </div>
                  ) : (
                    stats.recentLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                 <Settings className="h-4 w-4" />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-foreground leading-none">{log.action}</p>
                                 <p className="text-xs text-muted-foreground mt-1">
                                    By <span className="font-semibold text-slate-700 dark:text-slate-300">Account #{log.accountId}</span> • {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : "Unknown time"}
                                 </p>
                              </div>
                           </div>
                           <Badge 
                              variant="outline" 
                              className="text-[10px] font-black uppercase border-emerald-200 text-emerald-600 bg-emerald-50/50"
                            >
                              {t('common.status.success') || "Success"}
                           </Badge>
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

