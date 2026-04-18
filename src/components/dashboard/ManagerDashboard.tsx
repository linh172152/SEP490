'use client';

import { useEffect, useState, useMemo } from 'react';
import { parseISO, format, subMonths, startOfMonth, isSameMonth } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Package, 
  Loader2, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  Heart,
  Stethoscope,
  PieChart as PieChartIcon,
  DollarSign,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { robotService } from '@/services/api/robotService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { userPackageService } from '@/services/api/userPackageService';
import { accountService } from '@/services/api/accountService';
import { interactionLogService } from '@/services/api/interactionLogService';
import { elderlyService } from '@/services/api/elderlyService';
import { paymentService } from '@/services/api/paymentService';
import { RobotResponse, ServicePackageResponse, UserPackageResponse, AccountResponse, InteractionLogResponse, ElderlyProfileResponse } from '@/services/api/types';
import { useI18nStore } from '@/store/useI18nStore';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

export function ManagerDashboard() {
  const { t } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [pendingPackages, setPendingPackages] = useState<UserPackageResponse[]>([]);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLogResponse[]>([]);
  const [elderlyProfiles, setElderlyProfiles] = useState<ElderlyProfileResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPartialErrors, setHasPartialErrors] = useState(false);
  const [timeRange, setTimeRange] = useState<number>(6);
  const currentLang = useI18nStore((state) => state.language);
  const dateLocale = currentLang === 'en' ? enUS : vi;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use allSettled so one failing API (like logs) doesn't kill the whole dashboard
        const results = await Promise.allSettled([
          robotService.getAll(),
          servicePackageService.getAll(),
          userPackageService.getAll(),
          accountService.getAccounts(),
          interactionLogService.getAll(),
          elderlyService.getAll(),
          paymentService.getManagerPending()
        ]);
        
        // Check if any major API failed
        const anyFailed = results.some(r => r.status === 'rejected');
        if (anyFailed) {
          console.warn("Some Dashboard APIs failed to load. Displaying partial data.");
          setHasPartialErrors(true);
        }

        if (results[0].status === 'fulfilled') setRobots(results[0].value || []);
        if (results[1].status === 'fulfilled') setServicePackages(results[1].value || []);
        if (results[2].status === 'fulfilled') setUserPackages(results[2].value || []);
        if (results[3].status === 'fulfilled') setAccounts(results[3].value || []);
        if (results[4].status === 'fulfilled') setInteractionLogs(results[4].value || []);
        if (results[5].status === 'fulfilled') setElderlyProfiles(results[5].value || []);
        if (results[6].status === 'fulfilled') setPendingPackages(results[6].value || []);

      } catch (err: any) {
        console.error("Dashboard critical logic error:", err);
        setError("Critical Dashboard error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Helper to unify online status logic - more inclusive for inconsistent BE data
  const isOnline = (status?: string) => {
    if (!status) return false;
    const lowerStatus = status.toLowerCase();
    // Keywords that indicate the robot is functioning/reachable
    const positiveKeywords = ['active', 'online', 'available', 'idle', 'charging', 'ready', 'working', 'busy'];
    return positiveKeywords.some(kw => lowerStatus.includes(kw));
  };

  // Calculated Stats
  const activeRobots = robots.filter(r => isOnline(r.status)).length;
  const maintenanceRobots = robots.filter(r => r.status?.toLowerCase().includes('maintenance') || r.status?.toLowerCase().includes('error')).length;
  
  const elderlyCount = elderlyProfiles.length;
  const caregiverCount = accounts.filter(a => a.role === 'CAREGIVER').length;

  const personnelDist = [
    { name: t('manager.dashboard.elderly_label'), value: elderlyCount },
    { name: t('manager.dashboard.caregiver_label'), value: caregiverCount },
  ].filter(d => d.value > 0);

  const pkgStats = servicePackages.map(pkg => ({
    name: pkg.name,
    value: userPackages.filter(up => up.servicePackageId === pkg.id).length
  })).filter(p => p.value > 0);

  // Filter only confirmed packages for revenue calculations
  const confirmedPackages = useMemo(() => {
    return userPackages.filter(up => !pendingPackages.some(pending => pending.id === up.id));
  }, [userPackages, pendingPackages]);

  // Group and calculate real revenue trend for the last N months
  const monthlyRevenue = useMemo(() => {
    // Generate last N months starting from current month
    const months = Array.from({ length: timeRange }).map((_, i) => subMonths(startOfMonth(new Date()), (timeRange - 1) - i));
    
    return months.map(monthDate => {
      const monthLabel = format(monthDate, 'MMMM', { locale: dateLocale });
      const monthDisplay = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      
      const revenueInMonth = confirmedPackages.reduce((sum, up) => {
        // Use standard assignedAt field
        const dateStr = up.assignedAt;
        if (!dateStr) return sum;
        
        try {
          const assignedDate = parseISO(dateStr);
          if (isSameMonth(assignedDate, monthDate)) {
            const pkg = servicePackages.find(p => p.id === up.servicePackageId);
            return sum + (pkg?.price || 0);
          }
        } catch (e) {
          console.error("Date parsing error for user package:", dateStr);
        }
        return sum;
      }, 0);

      return { name: monthDisplay, actual: revenueInMonth };
    });
  }, [confirmedPackages, servicePackages, timeRange, dateLocale]);

  const totalRevenue = useMemo(() => {
    return monthlyRevenue.reduce((sum, item) => sum + item.actual, 0);
  }, [monthlyRevenue]);

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-slate-200" />
            <Skeleton className="h-4 w-96 bg-slate-100" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24 bg-slate-100" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-32 bg-slate-200 mb-2" />
                <Skeleton className="h-4 w-20 bg-slate-100" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-6">
             <div className="space-y-2">
               <Skeleton className="h-6 w-48 bg-slate-200" />
               <Skeleton className="h-4 w-72 bg-slate-100" />
             </div>
             <Skeleton className="h-10 w-32 bg-slate-100 rounded-xl" />
          </CardHeader>
          <CardContent className="h-[400px]">
            <Skeleton className="h-full w-full bg-slate-50 rounded-2xl" />
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-4 border-none shadow-lg">
             <CardHeader className="bg-slate-50/50">
               <Skeleton className="h-6 w-56 bg-slate-200" />
             </CardHeader>
             <CardContent className="p-6 space-y-4">
               {[1, 2, 3, 4, 5].map(i => (
                 <Skeleton key={i} className="h-12 w-full bg-slate-100" />
               ))}
             </CardContent>
          </Card>
          <Card className="lg:col-span-3 border-none shadow-lg">
             <CardHeader>
               <Skeleton className="h-6 w-40 bg-slate-200 mb-2" />
               <Skeleton className="h-4 w-48 bg-slate-100" />
             </CardHeader>
             <CardContent className="flex flex-col items-center pt-8">
                <Skeleton className="h-48 w-48 rounded-full bg-slate-200" />
                <div className="grid grid-cols-2 gap-8 w-full mt-12">
                   <Skeleton className="h-16 w-full bg-slate-100" />
                   <Skeleton className="h-16 w-full bg-slate-100" />
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="m-8 border-destructive/50 bg-destructive/5">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-bold text-destructive">{t('common.error')}</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-900 to-emerald-600 bg-clip-text text-transparent dark:from-emerald-100 dark:to-emerald-400">
             {t('manager.dashboard.title')}
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">
             {t('manager.dashboard.subtitle')}
          </p>
        </div>

        {hasPartialErrors && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 py-1.5 px-3 rounded-full flex items-center gap-2 animate-pulse">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Partial Data Mode</span>
          </Badge>
        )}
      </div>

      {/* Financial & Operational KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-xl shadow-emerald-100/50 dark:shadow-none bg-emerald-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">{t('manager.dashboard.revenue_overview')}</CardTitle>
            <DollarSign className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm font-normal opacity-70">{t('common.units.currency')}</span></div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-indigo-100/50 dark:shadow-none bg-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">{t('manager.dashboard.robot_group')}</CardTitle>
            <Bot className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{robots.length}</div>
            <div className="flex items-center gap-2 mt-2">
               <Badge variant="secondary" className="bg-white/20 text-white border-none">
                 {activeRobots} {t('common.status.online')}
               </Badge>
               {maintenanceRobots > 0 && (
                 <Badge variant="secondary" className="bg-amber-400/20 text-amber-100 border-none">
                   {maintenanceRobots} {t('common.status.error')}
                 </Badge>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-blue-100/50 dark:shadow-none bg-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">{t('manager.dashboard.total_residents')}</CardTitle>
            <Heart className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{elderlyCount}</div>
            <p className="text-xs mt-2 opacity-80 font-medium italic">{t('manager.dashboard.total_residents')}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-rose-100/50 dark:shadow-none bg-rose-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">{t('manager.dashboard.ops_team')}</CardTitle>
            <Stethoscope className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{caregiverCount}</div>
            <p className="text-xs mt-2 opacity-80 font-medium italic">{t('manager.dashboard.ops_team')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analytics - Row 1: Full Width Chart */}
      <div className="grid gap-6">
        <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                 <TrendingUp className="h-5 w-5 text-emerald-500" />
                 {t('manager.dashboard.revenue_overview')}
              </CardTitle>
              <CardDescription>
                 {t('manager.dashboard.revenue_desc')}
              </CardDescription>
            </div>
            <Select value={timeRange.toString()} onValueChange={(val) => setTimeRange(parseInt(val))}>
              <SelectTrigger className="w-[180px] rounded-xl bg-slate-50 border-slate-200 font-bold">
                <SelectValue placeholder={t('manager.dashboard.select_range')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold">
                <SelectItem value="6">{t('manager.dashboard.months_6')}</SelectItem>
                <SelectItem value="12">{t('manager.dashboard.months_12')}</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ left: 10, right: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 11}} 
                  dy={10}
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10}} 
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}${t('common.units.million')}`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}${t('common.units.thousand')}`;
                    return value.toString();
                  }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} ${t('common.units.currency')}`]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Monthly Details & User Distribution */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden font-medium">
          <CardHeader className="bg-emerald-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
               <Calendar className="h-5 w-5 text-emerald-600" />
               {t('manager.dashboard.revenue_monthly_details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-slate-800 uppercase text-[11px] tracking-widest pl-6">{t('manager.dashboard.month')}</TableHead>
                    <TableHead className="font-bold text-slate-800 uppercase text-[11px] tracking-widest text-right pr-6">{t('manager.dashboard.revenue_unit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...monthlyRevenue].reverse().map((data) => (
                    <TableRow key={data.name} className="border-slate-50 hover:bg-emerald-50/40 transition-colors">
                      <TableCell className="py-4 pl-6 font-bold">{data.name}</TableCell>
                      <TableCell className="py-4 text-right pr-6 font-mono font-bold text-emerald-700">
                        {data.actual.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-slate-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
               <PieChartIcon className="h-5 w-5 text-indigo-500" />
               {t('manager.dashboard.user_distribution')}
            </CardTitle>
            <CardDescription>
               {t('manager.dashboard.user_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center">
            {loading ? <Loader2 className="animate-spin mt-12" /> : (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={personnelDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {personnelDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-8 w-full mt-4">
                  {personnelDist.map((entry, index) => (
                    <div key={entry.name} className="flex flex-col items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{entry.name}</span>
                      </div>
                      <span className="text-2xl font-black">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Package Popularity Section */}
      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
        <CardHeader className="border-b border-slate-100 mb-2">
          <CardTitle className="text-lg font-bold">{t('manager.dashboard.package_popularity')}</CardTitle>
          <CardDescription>{t('manager.dashboard.package_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
              {pkgStats.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground font-medium italic">
                  {t('manager.dashboard.package_popularity.no_data')}
                </div>
              ) : pkgStats.slice(0, 4).sort((a,b) => b.value - a.value).map((stat, index) => {
                const percentage = userPackages.length > 0 ? Math.round((stat.value / userPackages.length) * 100) : 0;
                return (
                  <div key={stat.name} className="space-y-3 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-sm">
                      <span className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        {stat.name}
                      </span>
                      <span className="text-emerald-600 font-black">{stat.value}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ 
                          backgroundColor: COLORS[index % COLORS.length],
                          width: `${percentage}%`
                        }} 
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic uppercase tracking-wider font-bold">
                      {t('manager.dashboard.package_popularity.summary', { percentage })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
