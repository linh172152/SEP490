'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { elderlyService } from '@/services/api/elderlyService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { userPackageService } from '@/services/api/userPackageService';
import type { ElderlyProfileResponse, ServicePackageResponse, UserPackageResponse, ExerciseScriptResponse } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronRight, Dumbbell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getServicePackageTheme } from '@/lib/servicePackageThemes';

export default function FamilyElderlyExercisesPage() {
  const params = useParams();
  const elderlyId = Number(params.id);

  const [profile, setProfile] = useState<ElderlyProfileResponse | null>(null);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [packageExercises, setPackageExercises] = useState<Record<number, ExerciseScriptResponse[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!Number.isFinite(elderlyId)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const detail = await elderlyService.getById(elderlyId);
        setProfile(detail);

        const [packages, owned] = await Promise.all([
          servicePackageService.getAll().catch(() => [] as ServicePackageResponse[]),
          userPackageService.getByElderlyId(elderlyId).catch(() => [] as UserPackageResponse[]),
        ]);

        const uniquePackageIds = Array.from(new Set(owned.map((item) => item.servicePackageId)));
        const exercisesData = await Promise.all(
          uniquePackageIds.map(async (packageId) => {
            const exercises = await servicePackageService.getExercises(packageId).catch(() => [] as ExerciseScriptResponse[]);
            return [packageId, exercises] as const;
          })
        );

        setServicePackages(packages);
        setUserPackages(owned);
        setPackageExercises(Object.fromEntries(exercisesData));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [elderlyId]);

  const activePackages = useMemo(() => {
    const now = Date.now();
    return userPackages.filter((item) => {
      const expiresAt = Date.parse(item.expiredAt);
      return Number.isNaN(expiresAt) || expiresAt >= now;
    });
  }, [userPackages]);

  const packageExerciseDetails = useMemo(() => {
    return activePackages.map((userPackage) => ({
      userPackage,
      servicePackage: servicePackages.find((item) => item.id === userPackage.servicePackageId) || null,
      exercises: packageExercises[userPackage.servicePackageId] || [],
    }));
  }, [activePackages, packageExercises, servicePackages]);

  const eligibleExercises = useMemo(() => {
    const mappedScripts = new Map<number, { script: ExerciseScriptResponse; packageNames: string[] }>();

    packageExerciseDetails.forEach(({ servicePackage: matchedPackage, exercises }) => {
      if (!matchedPackage) return;
      exercises.forEach((script) => {
        const existing = mappedScripts.get(script.id);
        if (existing) {
          if (!existing.packageNames.includes(matchedPackage.name)) {
            existing.packageNames.push(matchedPackage.name);
          }
          return;
        }
        mappedScripts.set(script.id, { script, packageNames: [matchedPackage.name] });
      });
    });

    return Array.from(mappedScripts.values());
  }, [packageExerciseDetails]);

  if (loading) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading exercises...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="space-y-4 py-8 text-center">
          <p className="text-sm text-rose-700">Elderly profile not found.</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/family/elderly">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Elderly
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/dashboard/family" className="transition-colors hover:text-foreground">Dashboard</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/dashboard/family/elderly" className="transition-colors hover:text-foreground">My Elderly</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/dashboard/family/elderly/${profile.id}`} className="transition-colors hover:text-foreground">{profile.name}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Exercises</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assigned Exercises</h1>
          <p className="text-muted-foreground mt-1">Exercises available for {profile.name} based on purchased packages.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/dashboard/family/elderly/${profile.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercises by Purchased Packages</CardTitle>
              <CardDescription>View all exercises unlocked by active packages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {packageExerciseDetails.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  This elderly profile does not have any active package with exercise entitlement yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {packageExerciseDetails.map(({ userPackage, servicePackage, exercises }) => {
                    const theme = servicePackage ? getServicePackageTheme(servicePackage, servicePackages) : null;
                    return (
                      <div key={userPackage.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className={cn('border-b px-5 py-4', theme ? theme.surfaceClassName : 'bg-slate-50')}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-semibold text-slate-900">{servicePackage?.name || `Package #${userPackage.servicePackageId}`}</h3>
                                <Badge variant="outline" className={cn("text-[10px] uppercase", theme?.badgeClassName)}>{servicePackage?.level || 'Unknown'}</Badge>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Purchased {new Date(userPackage.assignedAt).toLocaleDateString()} • Expires {new Date(userPackage.expiredAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="secondary" className="w-fit">{exercises.length} exercise{exercises.length === 1 ? '' : 's'}</Badge>
                          </div>
                        </div>

                        <div className="p-5">
                          {exercises.length === 0 ? (
                            <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                              No exercises included in this package.
                            </div>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {exercises.map((exercise) => (
                                <div key={`${userPackage.id}-${exercise.id}`} className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors hover:bg-slate-100/50">
                                  <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-sky-100 p-2 text-sky-600">
                                      <Dumbbell className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="truncate font-semibold text-slate-900">{exercise.name}</div>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span>{exercise.durationMinutes} min</span>
                                        <span>•</span>
                                        <span>{exercise.level || 'Unknown level'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entitlement Summary</CardTitle>
              <CardDescription>All unique exercises unlocked.</CardDescription>
            </CardHeader>
            <CardContent>
              {eligibleExercises.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {eligibleExercises.map(({ script, packageNames }) => (
                    <div key={script.id} className="rounded-xl border bg-slate-50 p-3">
                      <div className="font-semibold text-sm text-slate-900">{script.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">Via: {packageNames.join(', ')}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No exercises unlocked.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
