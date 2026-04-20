'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { robotActionService } from '@/services/api/robotActionService';
import { RobotActionLibrary } from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot, Zap, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { useI18nStore } from '@/store/useI18nStore';

export default function RobotActionDetailPage() {
  const { t } = useI18nStore();
  const params = useParams();
  const router = useRouter();
  const [action, setAction] = useState<RobotActionLibrary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const id = Number(params?.id);

  const fetchAction = async () => {
    if (!id || Number.isNaN(id)) {
      setError(t('common.error'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await robotActionService.getAllActions();
      const found = data.find(a => a.id === id);
      if (found) {
        setAction(found);
      } else {
        setError(t('common.no_results'));
      }
    } catch (err) {
      console.error('Failed to load action details', err);
      setError(t('caregiver.exercises.toasts.load_detail_error'));
      toast.error(t('caregiver.exercises.toasts.load_detail_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAction();
  }, [id]);

  const handleTrigger = async () => {
    if (!action) return;
    try {
      setIsTriggering(true);
      await robotActionService.triggerAction(action.code);
      toast.success(t('wellness.toasts.trigger_success', { code: action.code }));
    } catch (err) {
      toast.error(t('caregiver.exercises.toasts.trigger_error'));
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 text-slate-500" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
          </Button>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{t('wellness.actions.title')}</h1>
          <p className="text-muted-foreground">{t('wellness.actions.desc')}</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/90 dark:bg-slate-900/90 rounded-3xl">
        <CardHeader className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5 px-6 pt-6">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
             <Bot className="h-5 w-5 text-indigo-500" />
             {t('wellness.actions.package_group')}
          </CardTitle>
          <CardDescription>ID: {id}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center gap-4">
               <div className="h-12 w-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
               {t('common.processing')}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
          ) : action ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                 <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('wellness.actions.table.name')}</div>
                    <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{action.name}</div>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="font-mono text-indigo-600 bg-indigo-50 border-indigo-100">{action.code}</Badge>
                       <Badge variant="secondary" className="font-bold">{t(`wellness.types.${action.type}`)}</Badge>
                    </div>
                 </div>

                 <Button 
                   size="lg" 
                   className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 px-8"
                   onClick={handleTrigger}
                   disabled={isTriggering}
                 >
                   {isTriggering ? <Clock className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                   {isTriggering ? t('common.processing') : t('wellness.actions.table.actions')}
                 </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('wellness.actions.table.status')}</div>
                  <div className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">
                    {action.duration ? `${action.duration}s` : "---"}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('manager.packages.table.status')}</div>
                  <div className="mt-2 text-3xl font-black text-emerald-600">{t('manager.packages.status.active')}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('wellness.actions.package_desc')}</div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                   {action.description || t('common.no_description')}
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button variant="ghost" onClick={() => router.push('/dashboard/caregiver/exercises')}>
                  {t('common.view_all')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">{t('common.no_results')}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
