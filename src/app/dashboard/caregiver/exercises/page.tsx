'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Activity } from 'lucide-react';
import { exerciseService } from '@/services/api/exerciseService';
import { ExerciseScript } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';

export default function CaregiverExerciseScriptsPage() {
  const [scripts, setScripts] = useState<ExerciseScript[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchScripts = async () => {
    setIsLoading(true);
    try {
      const data = await exerciseService.getAllScripts();
      setScripts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load exercise scripts', error);
      toast.error('Unable to load exercise library.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const filteredScripts = useMemo(() => {
    return scripts.filter((script) =>
      script.name.toLowerCase().includes(search.toLowerCase()) ||
      script.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, scripts]);

  const getDifficultyBadge = (level: string) => {
    const value = level?.toUpperCase();
    if (value === 'EASY') return <Badge className="bg-emerald-100 text-emerald-700">Easy</Badge>;
    if (value === 'MEDIUM') return <Badge className="bg-sky-100 text-sky-700">Medium</Badge>;
    if (value === 'HARD') return <Badge className="bg-rose-100 text-rose-700">Hard</Badge>;
    return <Badge>{level}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Activity className="h-4 w-4" /> Exercise Library
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Exercise Scripts</h1>
          <p className="text-muted-foreground">Browse exercise scripts loaded from the backend.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search exercise scripts..."
            className="pl-10 h-11"
          />
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-white/90 dark:bg-slate-900/90 rounded-3xl">
        <CardHeader className="border-b border-slate-200/80 dark:border-slate-800/80 pb-5 px-6 pt-6">
          <CardTitle className="text-xl font-semibold">Available Exercise Scripts</CardTitle>
          <CardDescription>View the full list of exercises and open each script detail.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-950/50">
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="text-right pr-6">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="animate-pulse border-t border-slate-100 dark:border-slate-800">
                      <TableCell className="pl-6 py-6 bg-slate-100 dark:bg-slate-800" colSpan={5} />
                    </TableRow>
                  ))
                ) : filteredScripts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                      No exercise scripts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScripts.map((script) => (
                    <TableRow key={script.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{script.name}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 max-w-[320px]">{script.description}</div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-300">{script.description}</TableCell>
                      <TableCell className="py-4 text-sm text-slate-600 dark:text-slate-300">{script.durationMinutes} min</TableCell>
                      <TableCell className="py-4">{getDifficultyBadge(script.difficultyLevel)}</TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/dashboard/caregiver/exercises/${script.id}`}>View Details</Link>
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
