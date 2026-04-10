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
import { RobotResponse, ServicePackageResponse, UserPackageResponse, AccountResponse, InteractionLogResponse, ElderlyProfileResponse } from '@/services/api/types';
import { useI18nStore } from '@/store/useI18nStore';

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

// Mock revenue data
const revenueData = [
  { name: 'Jan', actual: 45000000 },
  { name: 'Feb', actual: 52000000 },
  { name: 'Mar', actual: 48000000 },
  { name: 'Apr', actual: 61000000 },
  { name: 'May', actual: 55000000 },
  { name: 'Jun', actual: 67000000 },
];

export function ManagerDashboard() {
  const { t } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLogResponse[]>([]);
  const [elderlyProfiles, setElderlyProfiles] = useState<ElderlyProfileResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [robotsData, spData, upData, accData, logsData, elderlyData] = await Promise.all([
          robotService.getAll(),
          servicePackageService.getAll(),
          userPackageService.getAll(),
          accountService.getAccounts(),
          interactionLogService.getAll(),
          elderlyService.getAll()
        ]);
        
        setRobots(robotsData || []);
        setServicePackages(spData || []);
        setUserPackages(upData || []);
        setAccounts(accData || []);
        setInteractionLogs(logsData || []);
        setElderlyProfiles(elderlyData || []);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
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
    { name: t('manager.dashboard.elderly_label') || 'Người cao tuổi', value: elderlyCount },
    { name: t('manager.dashboard.caregiver_label') || 'Người chăm sóc', value: caregiverCount },
  ].filter(d => d.value > 0);

  const pkgStats = servicePackages.map(pkg => ({
    name: pkg.name,
    value: userPackages.filter(up => up.servicePackageId === pkg.id).length
  })).filter(p => p.value > 0);

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.actual, 0);

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
      </div>

      {/* Financial & Operational KPIs */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-xl shadow-emerald-100/50 dark:shadow-none bg-emerald-700 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">{t('manager.dashboard.revenue_overview')}</CardTitle>
            <DollarSign className="h-5 w-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm font-normal opacity-70">VNĐ</span></div>
            <div className="flex items-center gap-1 mt-2 text-emerald-100 font-bold text-xs">
              <ArrowUpRight className="h-3 w-3" />
              <span>+12.5% so với kỳ trước</span>
            </div>
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
                 {activeRobots} Online
               </Badge>
               {maintenanceRobots > 0 && (
                 <Badge variant="secondary" className="bg-amber-400/20 text-amber-100 border-none">
                   {maintenanceRobots} Error
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
            <p className="text-xs mt-2 opacity-80 font-medium font-medium italic">{t('manager.dashboard.total_residents')}</p>
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

      {/* Financial Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
               <TrendingUp className="h-5 w-5 text-emerald-500" />
               {t('manager.dashboard.revenue_overview')} (Biểu đồ xu hướng)
            </CardTitle>
            <CardDescription>
               {t('manager.dashboard.revenue_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 10}} 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString()} VNĐ`]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Table */}
        <Card className="lg:col-span-3 border-none shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden font-medium">
          <CardHeader className="bg-emerald-50/50">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
               <Calendar className="h-5 w-5 text-emerald-600" />
               Chi tiết thu nhập hàng tháng
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold text-slate-800 uppercase text-[11px] tracking-widest pl-6">Tháng</TableHead>
                  <TableHead className="font-bold text-slate-800 uppercase text-[11px] tracking-widest text-right pr-6">Doanh thu (VNĐ)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...revenueData].sort((a, b) => b.actual - a.actual).map((data) => (
                  <TableRow key={data.name} className="border-slate-50 hover:bg-emerald-50/40 transition-colors">
                    <TableCell className="py-4 pl-6 font-bold">{data.name}</TableCell>
                    <TableCell className="py-4 text-right pr-6 font-mono font-bold text-emerald-700">
                      {data.actual.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Second Row of Analytics */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-none shadow-xl shadow-slate-200/50 dark:shadow-none">
          <CardHeader className="border-b border-slate-100 mb-2">
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
               <Bot className="h-5 w-5 text-indigo-500" />
               Trạng thái Đội Robot
            </CardTitle>
            <CardDescription>Theo dõi tình trạng vận hành thực tế của các thiết bị Robot.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground transition-all" /></div> : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Tên Robot</TableHead>
                    <TableHead className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Model</TableHead>
                    <TableHead className="font-bold text-slate-800 uppercase text-[10px] tracking-widest">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {robots.slice(0, 5).map((robot) => (
                    <TableRow key={robot.id} className="border-none hover:bg-slate-50/80 transition-all">
                      <TableCell className="font-bold py-4">{robot.robotName}</TableCell>
                      <TableCell className="text-slate-500">{robot.model}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={isOnline(robot.status) ? 'default' : 'secondary'}
                          className={isOnline(robot.status) ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}
                        >
                          {robot.status || "IDLE"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
                <div className="col-span-full text-center py-12 text-muted-foreground font-medium italic">Chưa có gói dịch vụ nào kích hoạt</div>
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
                    <p className="text-[10px] text-muted-foreground italic uppercase tracking-wider font-bold">Chiếm {percentage}% tổng số gói</p>
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
