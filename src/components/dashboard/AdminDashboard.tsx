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
  AlertTriangle
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

// Analytics Data
const uptimeData = [
  { time: '00:00', value: 99.9 },
  { time: '04:00', value: 99.8 },
  { time: '08:00', value: 100 },
  { time: '12:00', value: 99.7 },
  { time: '16:00', value: 99.9 },
  { time: '20:00', value: 99.9 },
  { time: '23:59', value: 100 },
];

const fleetData = [
  { name: 'Active', value: 42, color: '#10b981' },
  { name: 'Maint', value: 5, color: '#f59e0b' },
  { name: 'Fault', value: 2, color: '#ef4444' },
];

const activityData = [
  { name: 'Auth', count: 1240 },
  { name: 'Robots', count: 850 },
  { name: 'Store', count: 420 },
  { name: 'Logs', count: 2100 },
];

// Mock audit logs for demo
const mockAuditLogs = [
  { id: 1, action: 'Update Firewall Policy', user: 'Admin_Vinh', time: '2 mins ago', status: 'Success', severity: 'High' },
  { id: 2, action: 'Global Camera Disable', user: 'Admin_Hoang', time: '15 mins ago', status: 'Success', severity: 'Critical' },
  { id: 3, action: 'Firmware Push v2.4.9', user: 'System', time: '3 hours ago', status: 'In Progress', severity: 'Medium' },
  { id: 4, action: 'DB Snapshot Created', user: 'System', time: '6 hours ago', status: 'Success', severity: 'Low' },
  { id: 5, action: 'Internal API Access Revoked', user: 'Admin_Vinh', time: 'Yesterday', status: 'Blocked', severity: 'High' },
];

export function AdminDashboard() {
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

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
        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">{t('admin.dashboard.security_title')}</CardTitle>
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300">{t('admin.dashboard.security_status')}</div>
            <div className="flex items-center gap-2 mt-2">
               <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
               <p className="text-xs font-medium text-emerald-700 dark:text-emerald-500">{t('admin.dashboard.security_desc')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-400">{t('admin.dashboard.ota_title')}</CardTitle>
            <Cpu className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-900 dark:text-blue-300">v2.4.8</div>
            <div className="flex items-center gap-2 mt-2">
               <TrendingUp className="h-3 w-3 text-blue-600" />
               <p className="text-xs font-medium text-blue-700 dark:text-blue-500">Compliance: 98.4%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-violet-800 dark:text-violet-400">{t('admin.dashboard.server_load')}</CardTitle>
            <Server className="h-5 w-5 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-violet-900 dark:text-violet-300">{t('admin.dashboard.server_load_low')}</div>
            <p className="text-xs font-medium text-violet-700 dark:text-violet-500 mt-2">Latency: 42ms avg</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">{t('admin.dashboard.storage_title')}</CardTitle>
            <Database className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-900 dark:text-amber-300">84 GB</div>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-500 mt-2">Backup: 2h ago</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Health Chart */}
        <Card className="lg:col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
               <Activity className="h-5 w-5 text-indigo-500" />
               {t('admin.dashboard.uptime_title')}
            </CardTitle>
            <CardDescription>{t('admin.dashboard.uptime_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={uptimeData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                <YAxis domain={[99, 100]} axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(val) => [`${val}%`, 'Uptime']}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fleet Distribution */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t('admin.dashboard.fleet_distribution')}</CardTitle>
            <CardDescription>{t('admin.dashboard.fleet_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {fleetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center pointer-events-none">
               <span className="text-3xl font-black">{fleetData.reduce((a, b) => a + b.value, 0)}</span>
               <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Robots</span>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
               {fleetData.map((item) => (
                 <div key={item.name} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.name}</span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {/* System Configuration Card */}
         <Card className="lg:col-span-1 border-none shadow-sm bg-slate-900 text-white">
            <CardHeader>
               <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-indigo-400" />
                  {t('admin.dashboard.infrastructure_title')}
               </CardTitle>
               <CardDescription className="text-slate-400">{t('admin.dashboard.infrastructure_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                  <div className="flex items-center gap-3">
                     <Zap className="h-4 w-4 text-amber-400" />
                     <span className="text-sm font-medium">{t('admin.dashboard.performance_mode')}</span>
                  </div>
                  <Badge className="bg-indigo-500 hover:bg-indigo-600 border-none">Turbo</Badge>
               </div>
               <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                  <div className="flex items-center gap-3">
                     <Globe className="h-4 w-4 text-blue-400" />
                     <span className="text-sm font-medium">{t('admin.dashboard.gateway_node')}</span>
                  </div>
                  <Badge variant="outline" className="text-blue-300 border-blue-500/30">Singapore-01</Badge>
               </div>
               <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                  <div className="flex items-center gap-3">
                     <Lock className="h-4 w-4 text-emerald-400" />
                     <span className="text-sm font-medium">{t('admin.dashboard.ssl_encryption')}</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">TLS 1.3</Badge>
               </div>
            </CardContent>
         </Card>

         {/* Audit Logs Table */}
         <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
               <div>
                  <CardTitle className="flex items-center gap-2">
                     <History className="h-5 w-5 text-indigo-500" />
                     {t('admin.dashboard.audit_logs_title')}
                  </CardTitle>
               </div>
               <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider px-2.5 py-1">Realtime Feed</Badge>
            </CardHeader>
            <CardContent>
               <div className="space-y-1">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors group">
                       <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            log.severity === 'Critical' ? 'bg-red-100 text-red-600' :
                            log.severity === 'High' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {log.severity === 'Critical' ? <AlertTriangle className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-foreground leading-none">{log.action}</p>
                             <p className="text-xs text-muted-foreground mt-1">
                                By <span className="font-semibold text-slate-700 dark:text-slate-300">{log.user}</span> • {log.time}
                             </p>
                          </div>
                       </div>
                       <Badge 
                          variant="outline" 
                          className={`text-[10px] font-black uppercase ${
                            log.status === 'Success' ? 'border-emerald-200 text-emerald-600 bg-emerald-50/50' : 
                            log.status === 'Blocked' ? 'border-red-200 text-red-600 bg-red-50/50' :
                            'border-slate-200 text-slate-500'
                          }`}
                        >
                          {log.status}
                       </Badge>
                    </div>
                  ))}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}

