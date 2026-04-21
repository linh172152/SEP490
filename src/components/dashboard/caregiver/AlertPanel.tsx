import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Bell, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, parseServerDate } from '@/lib/utils';
import type { AlertNotificationResponse, ReminderLogResponse } from '@/services/api/types';

interface AlertPanelProps {
  alerts: AlertNotificationResponse[];
  logs: ReminderLogResponse[];
  onResolveAlert: (alertId: number) => void;
  onViewAllLogs: () => void;
}

export function AlertPanel({ alerts, logs, onResolveAlert, onViewAllLogs }: AlertPanelProps) {
  const [showResolved, setShowResolved] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Update time for relative time calculation
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = (dateString: string) => {
    const diff = now - parseServerDate(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const openAlerts = alerts.filter(a => !a.resolved).sort((a, b) => parseServerDate(b.createdAt).getTime() - parseServerDate(a.createdAt).getTime());
  const resolvedAlerts = alerts.filter(a => a.resolved).sort((a, b) => parseServerDate(b.createdAt).getTime() - parseServerDate(a.createdAt).getTime());
  
  // Sort logs by newest first, take top 5
  const recentLogs = [...logs].sort((a, b) => parseServerDate(b.triggeredTime).getTime() - parseServerDate(a.triggeredTime).getTime()).slice(0, 5);

  return (
    <div className="flex flex-col gap-4">
      {/* 🔴 OPEN ALERTS */}
      <div className="rounded-2xl border bg-background shadow-lg overflow-hidden border-rose-100">
        <div className="bg-rose-50 px-4 py-3 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <span className="relative flex h-3 w-3">
              {openAlerts.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <AlertTriangle className="h-4 w-4" />
            OPEN ALERTS
          </div>
          <Badge variant="destructive" className="bg-rose-600 hover:bg-rose-600">{openAlerts.length}</Badge>
        </div>
        
        <div className="p-2 space-y-2 max-h-[40vh] overflow-y-auto">
          {openAlerts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2 opacity-50" />
              All clear! No active alerts.
            </div>
          ) : (
            openAlerts.map(alert => (
              <div key={alert.id} className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-2">
                  <div className="mt-0.5 text-rose-500 flex-shrink-0">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 text-sm leading-tight">
                      {alert.alertType}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                      {alert.message}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-white/60 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3" />
                        {parseServerDate(alert.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                        <span className="text-rose-600 font-bold ml-1">({getRelativeTime(alert.createdAt)})</span>
                      </div>
                      <Button size="sm" onClick={() => onResolveAlert(alert.id)} className="h-7 px-3 text-[10px] uppercase font-bold tracking-wider bg-slate-900 text-white hover:bg-emerald-600 transition-colors rounded-lg">
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🟡 RECENT LOGS (MINI) */}
      <div className="rounded-2xl border bg-background shadow-sm overflow-hidden">
        <div className="bg-amber-50/50 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-amber-700 text-sm">
            <Activity className="h-4 w-4" />
            RECENT ACTIVITY
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase font-bold text-amber-700 hover:bg-amber-100" onClick={onViewAllLogs}>
            View All
          </Button>
        </div>
        <div className="p-0">
          {recentLogs.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No recent logs found.
            </div>
          ) : (
             <div className="divide-y divide-slate-100">
               {recentLogs.map(log => (
                 <div key={log.id} className="px-4 py-3 flex gap-3 items-center hover:bg-slate-50 transition-colors">
                    {log.confirmed ? (
                       <div className="h-6 w-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                         <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                       </div>
                    ) : (
                       <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                         <Bell className="h-3.5 w-3.5 text-slate-500 opacity-50" />
                       </div>
                    )}
                    <div className="min-w-0 flex-1">
                       <div className="flex justify-between items-center">
                         <div className="text-xs font-bold text-slate-900 truncate pr-2">{log.reminderTitle}</div>
                         <div className="text-[10px] text-slate-400 flex-shrink-0">{getRelativeTime(log.triggeredTime)}</div>
                       </div>
                       <div className={cn("text-[10px] mt-0.5 font-medium", log.confirmed ? "text-emerald-600" : "text-amber-600")}>
                         {log.confirmed ? 'Confirmed' : 'Pending / Not Confirmed'}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      {/* 🟢 RESOLVED ALERTS (COLLAPSE) */}
      {resolvedAlerts.length > 0 && (
        <div className="rounded-2xl border bg-background shadow-sm overflow-hidden">
          <button 
            type="button"
            className="w-full bg-slate-50 hover:bg-slate-100 px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-600 transition-colors"
            onClick={() => setShowResolved(!showResolved)}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-400" />
              Resolved Alerts
              <Badge variant="secondary" className="ml-1 bg-slate-200 text-slate-600 px-1.5 py-0 min-w-0">{resolvedAlerts.length}</Badge>
            </div>
            {showResolved ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {showResolved && (
            <div className="p-2 space-y-1 max-h-[30vh] overflow-y-auto bg-slate-50/50">
              {resolvedAlerts.map(alert => (
                <div key={alert.id} className="rounded-lg p-2.5 hover:bg-white transition-colors flex gap-2">
                   <div className="mt-0.5 opacity-50">
                     <AlertTriangle className="h-3 w-3 text-slate-400" />
                   </div>
                   <div className="min-w-0 flex-1">
                     <div className="text-xs font-semibold text-slate-700 truncate">{alert.alertType}</div>
                     <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{alert.message}</div>
                   </div>
                   <div className="text-[10px] text-slate-400 flex-shrink-0">
                     {parseServerDate(alert.createdAt).toLocaleDateString()}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
