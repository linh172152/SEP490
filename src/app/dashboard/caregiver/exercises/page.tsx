'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Bot, Zap, Clock, Tag } from 'lucide-react';
import { robotActionService } from '@/services/api/robotActionService';
import { RobotActionLibrary } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { useI18nStore } from '@/store/useI18nStore';

export default function CaregiverRobotActionsPage() {
  const { t } = useI18nStore();
  const [actions, setActions] = useState<RobotActionLibrary[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState<number | null>(null);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const data = await robotActionService.getAllActions();
      setActions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load robot actions', error);
      toast.error(t('caregiver.exercises.toasts.load_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleTrigger = async (code: string, id: number) => {
    try {
      setIsTriggering(id);
      await robotActionService.triggerAction(code);
      toast.success(t('wellness.toasts.trigger_success', { code }));
    } catch (err) {
      toast.error(t('caregiver.exercises.toasts.trigger_error'));
    } finally {
      setIsTriggering(null);
    }
  };

  const filteredActions = useMemo(() => {
    return actions.filter((action) =>
      action.name.toLowerCase().includes(search.toLowerCase()) ||
      action.code.toLowerCase().includes(search.toLowerCase()) ||
      (action.description?.toLowerCase().includes(search.toLowerCase()) || "")
    );
  }, [search, actions]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 dark:bg-slate-900 dark:text-slate-200">
            <Bot className="h-4 w-4" /> {t('wellness.actions.breadcrumb')}
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{t('wellness.actions.title')}</h1>
          <p className="text-muted-foreground">{t('wellness.actions.desc')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('common.search_placeholder')}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-white/90 dark:bg-slate-900/90 rounded-3xl">
        <CardHeader className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5 px-6 pt-6">
          <CardTitle className="text-xl font-bold">{t('wellness.actions.package_group')}</CardTitle>
          <CardDescription>{t('wellness.actions.package_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-950/50">
                  <TableHead className="pl-6">{t('wellness.actions.table.name')}</TableHead>
                  <TableHead>{t('wellness.actions.table.code')}</TableHead>
                  <TableHead>{t('wellness.actions.table.type')}</TableHead>
                  <TableHead>{t('wellness.actions.table.status')}</TableHead>
                  <TableHead className="text-right pr-6">{t('wellness.actions.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="animate-pulse border-t border-slate-100 dark:border-slate-800">
                      <TableCell className="pl-6 py-6" colSpan={5}>
                         <div className="h-10 bg-slate-100 rounded-lg w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredActions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                      {t('common.no_results')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActions.map((action) => (
                    <TableRow key={action.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-indigo-50 rounded-lg">
                              <Tag className="h-4 w-4 text-indigo-500" />
                           </div>
                           <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{action.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{action.description || t('common.no_description')}</div>
                           </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border">{action.code}</code>
                      </TableCell>
                      <TableCell>
                         <Badge variant="secondary" className="font-bold">{action.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {action.duration ? `${action.duration}s` : "---"}
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-10 w-10 p-0 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                          onClick={() => handleTrigger(action.code, action.id)}
                          disabled={isTriggering === action.id}
                        >
                          {isTriggering === action.id ? <Zap className="h-4 w-4 animate-pulse" /> : <Zap className="h-4 w-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
