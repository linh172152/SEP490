'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter,
  Search,
  BellRing,
  Loader2,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/useAuthStore';
import { alertService } from '@/services/api/alertService';
import { caregiverService } from '@/services/api/caregiverService';
import { roomService } from '@/services/api/roomService';
import type { AlertNotificationResponse, CaregiverProfileResponse, RoomElderlySummary } from '@/services/api/types';
import { cn, parseServerDate } from '@/lib/utils';

export default function CaregiverAlertsPage() {
  const { user } = useAuthStore();
  const isRefreshingRef = useRef(false);
  const [profile, setProfile] = useState<CaregiverProfileResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [elderlies, setElderlies] = useState<RoomElderlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [elderlyFilter, setElderlyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeSortOrder, setTimeSortOrder] = useState<'newest' | 'oldest'>('newest');

  const loadData = useCallback(async (silent = false) => {
    if (!user?.id) return;

    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;

    if (!silent) {
      setLoading(true);
    }
    
    setError(null);
    try {
      // 1. Get Caregiver Profile
      const profiles = await caregiverService.getByAccountId(Number(user.id)).catch(() => [] as CaregiverProfileResponse[]);
      const currentProfile = profiles[0] ?? null;
      setProfile(currentProfile);

      if (!currentProfile?.roomId) {
        setAlerts([]);
        setElderlies([]);
        return;
      }

      // 2. Refresh Room Data (Elderlies and Alerts)
      const [roomElderlies, allAlerts] = await Promise.all([
        roomService.getElderliesByRoom(currentProfile.roomId).catch(() => [] as RoomElderlySummary[]),
        alertService.getAll().catch(() => [] as AlertNotificationResponse[]),
      ]);

      const elderlyIds = new Set(roomElderlies.map(e => e.id));
      
      setElderlies(roomElderlies);
      // Filter alerts to only show those belonging to elderlies in the caregiver's assigned room
      setAlerts(allAlerts.filter(a => elderlyIds.has(a.elderlyId)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load alerts.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
      isRefreshingRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    void loadData(false);
    const intervalId = setInterval(() => {
      void loadData(true);
    }, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loadData]);

  const handleResolveAlert = async (alert: AlertNotificationResponse) => {
    setResolvingId(alert.id);
    try {
      await alertService.update(alert.id, {
        elderlyId: alert.elderlyId,
        alertType: alert.alertType,
        message: alert.message,
        resolved: true,
        reminderId: alert.reminderId ?? null,
      });
      // Refresh local list
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, resolved: true } : a));
    } catch (err: unknown) {
      console.error('Failed to resolve alert:', err);
    } finally {
      setResolvingId(null);
    }
  };

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

  const sortedAlerts = useMemo(() => {
    return filteredAlerts.slice().sort((left, right) => {
      const diff = parseServerDate(right.createdAt).getTime() - parseServerDate(left.createdAt).getTime();
      return timeSortOrder === 'newest' ? diff : -diff;
    });
  }, [filteredAlerts, timeSortOrder]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-200" />
        <div className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Alerts...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <BellRing className="h-8 w-8 text-rose-500" />
            Room Alerts
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {profile ? `Managing alerts for Room ${profile.roomId}` : 'Real-time incident management for your assigned elderly.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold uppercase">
          {error}
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
          <Input 
            placeholder="Search alerts, clinical notes, or member names..." 
            className="pl-10 h-11 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-rose-500 focus:border-rose-500 transition-all font-medium"
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
                <UserCircle className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="All Elderly" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              <SelectItem value="all" className="font-bold">All Elderly Member</SelectItem>
              {elderlies.map(e => (
                <SelectItem key={e.id} value={String(e.id)} className="font-medium">
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeSortOrder} onValueChange={(value) => setTimeSortOrder(value as 'newest' | 'oldest')}>
            <SelectTrigger className="w-[180px] h-11 rounded-2xl border-slate-200 bg-white shadow-sm font-bold text-slate-700">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100">
              <SelectItem value="newest" className="font-medium">Newest first</SelectItem>
              <SelectItem value="oldest" className="font-medium">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 h-14 border-b-slate-100">
              <TableHead className="pl-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Context & Member</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Incident Details</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Timeline</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
              <TableHead className="text-right pr-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Resolution</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode='popLayout'>
              {sortedAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 opacity-30">
                      <BellRing className="h-12 w-12 text-slate-300" />
                      <div className="text-sm font-bold uppercase tracking-widest">No matching incidents found</div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedAlerts.map((alert) => (
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
                            <div className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">{alert.elderlyName || `Member #${alert.elderlyId}`}</div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">Room {profile?.roomId}</div>
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

                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "rounded-full px-3 font-black uppercase tracking-widest text-[10px]",
                        alert.resolved 
                          ? "border-emerald-100 bg-emerald-50 text-emerald-600" 
                          : "border-rose-100 bg-rose-50 text-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.1)]"
                      )}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right pr-8">
                       {!alert.resolved && (
                         <Button 
                           size="sm" 
                           onClick={() => handleResolveAlert(alert)}
                           disabled={resolvingId === alert.id}
                           className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[11px] bg-slate-900 shadow-lg shadow-slate-200 hover:bg-rose-600 transition-all active:scale-95"
                         >
                           {resolvingId === alert.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                           Mark Resolved
                         </Button>
                       )}
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
