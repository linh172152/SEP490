'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';
import { systemLogService } from '@/services/api/systemLogService';
import { SystemLogResponse } from '@/services/api/types';

import { useI18nStore } from '@/store/useI18nStore';

export default function SystemLogsPage() {
  const { t, language } = useI18nStore();
  const [logs, setLogs] = useState<SystemLogResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await systemLogService.getAll();
      console.log("System Logs fetched:", data);
      setLogs(data || []);
    } catch (e) {
      console.error("Error fetching system logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" /> {t('admin.logs.title')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('admin.logs.desc')}</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" /> {t('settings.data_export') || 'Export CSV'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.audit_logs') || 'Global Activity Logs'}</CardTitle>
          <CardDescription>{t('admin.logs.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#ID</TableHead>
                  <TableHead>{t('admin.logs.table.timestamp')}</TableHead>
                  <TableHead>{t('admin.logs.table.account') || 'Account'}</TableHead>
                  <TableHead>{t('admin.logs.table.message')}</TableHead>
                  <TableHead>{t('admin.logs.table.details')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{log.id}</TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">Account #{log.accountId}</TableCell>
                    <TableCell className="font-medium text-emerald-600">{log.action}</TableCell>
                    <TableCell>{log.targetEntity}</TableCell>
                  </TableRow>
                ))}
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                       {t('admin.logs.table.no_data')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
