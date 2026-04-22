'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { alertService } from '@/services/api/alertService';
import type { AlertNotificationResponse } from '@/services/api/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  BellRing, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Loader2, 
  Search, 
  UserCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, parseServerDate } from '@/lib/utils';

export default function FamilyAlertsPage() {
  const { user } = useAuthStore();
  const { elderlyList, fetchDashboardData } = useFamilyStore();
  
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [elderlyFilter, setElderlyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    if (!user?.id) return;

    setLoading(true);
    
    setError(null);
    try {
      // 1. Ensure elderly list is fresh
      await fetchDashboardData(Number(user.id));

      // 2. Fetch all alerts and filter by FM's elderly list
      const allAlerts = await alertService.getAll().catch(() => [] as AlertNotificationResponse[]);
      const elderlyIds = new Set(elderlyList.map((item) => item.id));
      
      setAlerts(allAlerts.filter((item) => elderlyIds.has(item.elderlyId)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? !alert.resolved : alert.resolved);
      const matchesElderly = elderlyFilter === 'all' || alert.elderlyId === Number(elderlyFilter);
      const matchesSearch = !searchQuery.trim() || 
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.elderlyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.alertType.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesElderly && matchesSearch;
    });
  }, [alerts, statusFilter, elderlyFilter, searchQuery]);

  const stats = useMemo(() => {
    const activeCount = alerts.filter(a => !a.resolved).length;
    return {
        active: activeCount,
        resolved: alerts.length - activeCount,
        total: alerts.length
    };
  }, [alerts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-200" />
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Family Alerts...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <BellRing className="h-8 w-8 text-sky-500" />
            Family Alerts
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Monitoring safety and wellness across all your assigned elderly family members.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-gradient-to-br from-rose-50 to-white overflow-hidden relative group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-rose-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-rose-600">Active Incidents</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-4xl font-black text-slate-900">{stats.active}</div>
            <AlertTriangle className="h-6 w-6 text-rose-500 mb-1" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white overflow-hidden relative group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Resolved Alerts</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-4xl font-black text-slate-900">{stats.resolved}</div>
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-gradient-to-br from-sky-50 to-white overflow-hidden relative group">
          <div className="absolute right-0 top-0 h-16 w-16 bg-sky-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-widest text-sky-600">Managed Profiles</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-4xl font-black text-slate-900">{elderlyList.length}</div>
            <UserCircle className="h-6 w-6 text-sky-500 mb-1" />
          </CardContent>
        </Card>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
          <Input 
            placeholder="Search incident logs, alerts, or member names..." 
            className="pl-10 h-11 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
             <Button 
               variant={statusFilter === 'active' ? 'default' : 'ghost'} 
               size="sm" 
               className={cn("rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9", statusFilter === 'active' ? 'bg-rose-600' : 'text-slate-500')}
               onClick={() => setStatusFilter('active')}
             >
               Active
             </Button>
             <Button 
               variant={statusFilter === 'resolved' ? 'default' : 'ghost'} 
               size="sm" 
               className={cn("rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9", statusFilter === 'resolved' ? 'bg-emerald-600' : 'text-slate-500')}
               onClick={() => setStatusFilter('resolved')}
             >
               Resolved
             </Button>
             <Button 
               variant={statusFilter === 'all' ? 'default' : 'ghost'} 
               size="sm" 
               className={cn("rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9", statusFilter === 'all' ? 'bg-slate-900' : 'text-slate-500')}
               onClick={() => setStatusFilter('all')}
             >
               All
             </Button>
          </div>

          <Select value={elderlyFilter} onValueChange={setElderlyFilter}>
            <SelectTrigger className="w-[200px] h-11 rounded-2xl border-slate-200 bg-white shadow-sm font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="All Members" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              <SelectItem value="all" className="font-bold">All Family Members</SelectItem>
              {elderlyList.map(e => (
                <SelectItem key={e.id} value={String(e.id)} className="font-medium">
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert Feed Table */}
      <div className="rounded-[32px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 h-14 border-b-slate-100">
              <TableHead className="pl-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Profile</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Incident Details</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Timeline</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400 text-right pr-8">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode='popLayout'>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                      <BellRing className="h-12 w-12 text-slate-300" />
                      <div className="text-sm font-bold uppercase tracking-widest">No matching alerts found</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts
                  .slice()
                  .sort((left, right) => parseServerDate(right.createdAt).getTime() - parseServerDate(left.createdAt).getTime())
                  .map((alert) => (
                    <motion.tr
                        key={alert.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                        "group h-24 border-b-slate-50 hover:bg-slate-50/40 transition-colors",
                        alert.resolved && "opacity-60 grayscale-[0.5]"
                        )}
                    >
                        <TableCell className="pl-8">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "relative flex h-12 w-12 items-center justify-center rounded-2xl border transition-all",
                                    alert.resolved ? "bg-slate-50 border-slate-100 text-slate-400" : "bg-rose-50 border-rose-100 text-rose-600 shadow-sm"
                                )}>
                                    <AlertTriangle className={cn("h-6 w-6", !alert.resolved && "animate-pulse")} />
                                    {!alert.resolved && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{alert.elderlyName || `Member #${alert.elderlyId}`}</div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground opacity-60">EL ID #{alert.elderlyId}</div>
                                </div>
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className="max-w-md">
                                <Badge variant="outline" className={cn(
                                "mb-2 border-transparent font-black uppercase tracking-tighter text-[10px] px-1.5 py-0.5 rounded-md",
                                alert.resolved ? "bg-slate-100 text-slate-500" : "bg-rose-600 text-white"
                                )}>
                                    {alert.alertType.replace(/_/g, ' ')}
                                </Badge>
                                <div className="text-sm font-bold text-slate-700 line-clamp-2 leading-snug">
                                    {alert.message}
                                </div>
                            </div>
                        </TableCell>

                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {parseServerDate(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                                    {parseServerDate(alert.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </div>
                        </TableCell>

                        <TableCell className="text-right pr-8">
                            <Badge variant="outline" className={cn(
                                "rounded-full px-4 py-1 font-black uppercase tracking-widest text-[10px]",
                                alert.resolved 
                                ? "border-emerald-100 bg-emerald-50 text-emerald-600" 
                                : "border-rose-100 bg-rose-50 text-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.1)]"
                            )}>
                                {alert.resolved ? 'Resolved' : 'Active'}
                            </Badge>
                        </TableCell>
                    </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
