'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Bot, Trash2 } from 'lucide-react';
import { robotService } from '@/services/api/robotService';
import { RobotResponse } from '@/services/api/types';
import { useI18nStore } from '@/store/useI18nStore';

export default function RobotsManagePage() {
  const { t, language } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRobots = async () => {
    setLoading(true);
    try {
      const data = await robotService.getAll();
      setRobots(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobots();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.robots.confirm_delete') || 'Are you sure you want to delete this robot?')) return;
    try {
       await robotService.delete(id);
       fetchRobots();
    } catch (e) {
       console.error("Failed to delete", e);
       alert("Failed to delete robot. It might be assigned to a user.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Bot className="h-8 w-8 text-indigo-600" /> {t('admin.robots.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">
             Giám sát hoạt động của Robot. <span className="text-indigo-600">(Quản trị kỹ thuật bởi Admin)</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : robots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-slate-300" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">{t('admin.overview.table.no_data_robots')}</h4>
          <p className="text-muted-foreground max-w-sm text-sm mt-1">
             {t('admin.robots.no_data_desc') || 'There are no robots registered in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {robots.map((robot) => {
            const isActive = robot.status?.toLowerCase() === 'active';
            const isMaintenance = robot.status?.toLowerCase() === 'maintenance';
            const isUnassigned = !robot.assignedElderlyName;

            return (
              <Card 
                key={robot.id} 
                className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative bg-card"
              >
                {/* Header Strip Line */}
                <div className={`h-1.5 w-full ${
                  isActive ? 'bg-teal-500' : 
                  isMaintenance ? 'bg-rose-500' : 
                  'bg-slate-300'
                }`} />
                
                <CardHeader className="pb-3 pt-5 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2 group-hover:text-primary transition-colors">
                        <Bot className={`h-5 w-5 ${isActive ? 'text-teal-500' : 'text-muted-foreground'}`} />
                        {robot.robotName}
                      </CardTitle>
                      <CardDescription className="mt-1 font-mono text-xs">
                        {robot.serialNumber}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={isActive ? "default" : isMaintenance ? "destructive" : "secondary"}
                      className="capitalize"
                    >
                      {isActive ? t('admin.robots.status.active') : 
                       isMaintenance ? t('admin.robots.status.maintenance') : 
                       robot.status || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-grow text-sm">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground select-none">{t('admin.robots.card.model')}:</span>
                      <span className="font-medium text-foreground">{robot.model}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground select-none">{t('admin.robots.card.firmware') || 'Firmware'}:</span>
                      <span className="font-medium font-mono text-xs text-foreground bg-muted px-1.5 rounded">
                        v{robot.firmwareVersion}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t('admin.robots.card.assignment') || 'Assignment'}</h5>
                    {isUnassigned ? (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-medium text-xs">{t('admin.robots.card.unassigned')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-3 py-2 rounded-md">
                        <span className="h-2 w-2 rounded-full bg-teal-500" />
                        <span className="font-medium text-xs truncate max-w-[150px]">
                           {t('admin.robots.card.assigned_to')} {robot.assignedElderlyName}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {/* Read-only view for Manager */}
                <div className="pb-5 px-6" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
