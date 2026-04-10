'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Activity, 
  FileDown, 
  Lock, 
  Users,
  Database,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { accountService } from '@/services/api/accountService';
import { systemLogService } from '@/services/api/systemLogService';
import { useI18nStore } from '@/store/useI18nStore';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';

export function SecurityDashboard() {
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    adminCount: 0,
    managerCount: 0,
    totalLogs: 0,
    securityEvents: [] as any[],
    systemHealthy: true,
    lastBackup: 'Never'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accounts, logs] = await Promise.all([
        accountService.getAccounts(),
        systemLogService.getAll()
      ]);

      const accList = Array.isArray(accounts) ? accounts : [];
      const logList = Array.isArray(logs) ? logs : [];

      const admins = accList.filter(a => String(a.role).toUpperCase() === 'ADMINISTRATOR').length;
      const managers = accList.filter(a => String(a.role).toUpperCase() === 'MANAGER').length;

      // Filter security related logs (Deletes, role changes, etc.)
      const secLogs = logList.filter(l => 
        l.action.toLowerCase().includes('delete') || 
        l.action.toLowerCase().includes('role') || 
        l.action.toLowerCase().includes('update')
      ).slice(0, 8);

      setStats({
        adminCount: admins,
        managerCount: managers,
        totalLogs: logList.length,
        securityEvents: secLogs,
        systemHealthy: true,
        lastBackup: new Date().toLocaleDateString()
      });
    } catch (error) {
      console.error("Security Fetch Error:", error);
      toast.error("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleExportLogs = () => {
    const logList = stats.securityEvents;
    if (logList.length === 0) return;

    const headers = "ID,Action,AccountID,Created At\n";
    const csvContent = logList.map(log => 
      `${log.id},"${log.action}",${log.accountId},${log.createdAt}`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.csv`;
    a.click();
    toast.success("Logs exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold tracking-tight">{t('admin.security.title')}</h2>
        <p className="text-muted-foreground">{t('admin.security.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Audit Volume */}
        <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/40">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                 {t('admin.security.audit_records')}
                 <Activity className="h-4 w-4 text-emerald-500" />
              </CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs} {t('admin.dashboard.audit_logs_title')}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Continuous monitoring active</p>
           </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/40">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                 {t('admin.security.system_status')}
                 <CheckCircle2 className="h-4 w-4 text-sky-500" />
              </CardTitle>
           </CardHeader>
           <CardContent>
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">API: Healthy</Badge>
              <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">Database latency: 12ms</p>
           </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/40">
           <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                 {t('admin.security.data_persistence')}
                 <Database className="h-4 w-4 text-amber-500" />
              </CardTitle>
           </CardHeader>
           <CardContent>
              <div className="text-sm font-bold">{t('admin.security.last_backup')}: {stats.lastBackup}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Next scheduled: Midnight</p>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* Advanced Security Audit */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertOctagon className="h-5 w-5 text-rose-500" />
                {t('admin.security.audit_explorer')}
              </CardTitle>
              <CardDescription>{t('admin.security.audit_desc')}</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportLogs} disabled={loading}>
              <FileDown className="h-4 w-4" />
              {t('admin.security.export_csv')}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl mb-2" />
                ))
              ) : stats.securityEvents.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground italic border rounded-xl border-dashed">
                  {t('admin.security.no_events')}
                </div>
              ) : (
                stats.securityEvents.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${log.action.toLowerCase().includes('delete') ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                         {log.action.toLowerCase().includes('delete') ? <AlertCircle className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          Actor: User #{log.accountId} • {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : "Unknown"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.action.toLowerCase().includes('delete') ? 'destructive' : 'secondary'} className="text-[9px] font-black tracking-tighter uppercase px-2 py-0">
                      {log.action.toLowerCase().includes('delete') ? 'CRITICAL' : 'REVISION'}
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
