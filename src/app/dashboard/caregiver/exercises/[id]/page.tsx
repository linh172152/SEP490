'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { exerciseService } from '@/services/api/exerciseService';
import { ExerciseScript } from '@/services/api/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ExerciseScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [script, setScript] = useState<ExerciseScript | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const id = Number(params?.id);

  const fetchScript = async () => {
    if (!id || Number.isNaN(id)) {
      setError('Invalid exercise script ID.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const data = await exerciseService.getScriptById(id);
      setScript(data);
    } catch (err) {
      console.error('Failed to load script details', err);
      setError('Unable to load exercise script details.');
      toast.error('Unable to load exercise script details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScript();
  }, [id]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Exercise Script Details</h1>
          <p className="text-muted-foreground">Review the details for this exercise script.</p>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/90 dark:bg-slate-900/90 rounded-3xl">
        <CardHeader className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5 px-6 pt-6">
          <CardTitle className="text-xl font-semibold">Script Overview</CardTitle>
          <CardDescription>Loaded from GET /api/exercise-scripts/{id}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-500">Loading script details...</div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
          ) : script ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-sm uppercase tracking-wider text-slate-500">Name</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{script.name}</div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs uppercase tracking-wider text-slate-500">Duration</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {script.durationMinutes} min
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="text-xs uppercase tracking-wider text-slate-500">Difficulty</div>
                  <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{script.difficultyLevel}</div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 text-slate-500 text-xs uppercase tracking-wider mb-3">
                  <Clock className="h-4 w-4" /> Script Content
                </div>
                <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">{script.uploadScript}</pre>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                <div className="text-sm uppercase tracking-wider text-slate-500">Description</div>
                <p className="mt-2 text-slate-700 dark:text-slate-300">{script.description}</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => router.push('/dashboard/caregiver/exercises')}>
                  View All Exercise Scripts
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-muted-foreground">No script information available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
