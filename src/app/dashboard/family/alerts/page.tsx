'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { alertService } from '@/services/api/alertService';
import type { AlertNotificationResponse } from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function FamilyAlertsPage() {
  const { user } = useAuthStore();
  const { elderlyList, fetchDashboardData } = useFamilyStore();
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(Number(user.id));
    }
  }, [fetchDashboardData, user?.id]);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const allAlerts = await alertService.getAll().catch(() => [] as AlertNotificationResponse[]);
        const elderlyIds = new Set(elderlyList.map((item) => item.id));
        setAlerts(allAlerts.filter((item) => elderlyIds.has(item.elderlyId)));
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [elderlyList]);

  const activeAlerts = useMemo(() => alerts.filter((item) => !item.resolved), [alerts]);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
        <p className="mt-1 text-muted-foreground">Important notifications for your elderly family members, especially falls and missed medication responses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Active Alerts</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{activeAlerts.length}</div><AlertTriangle className="h-5 w-5 text-rose-500" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Resolved</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{alerts.length - activeAlerts.length}</div><CheckCircle2 className="h-5 w-5 text-emerald-500" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">My Elderly</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between"><div className="text-3xl font-bold">{elderlyList.length}</div><Bell className="h-5 w-5 text-sky-500" /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alert Feed</CardTitle>
          <CardDescription>Read-only alert history for the elderly profiles you are following.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading alerts...</div>
          ) : alerts.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">No alerts for your elderly profiles yet.</div>
          ) : (
            <div className="space-y-3">
              {alerts
                .slice()
                .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
                .map((alert) => (
                  <div key={alert.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{alert.elderlyName}</span>
                        <Badge variant={alert.resolved ? 'secondary' : 'destructive'}>{alert.resolved ? 'Resolved' : 'Active'}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-700">{alert.alertType.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /> {new Date(alert.createdAt).toLocaleString()}</div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}