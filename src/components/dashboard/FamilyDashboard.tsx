'use client';

import { useElderlyStore } from '@/store/useElderlyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  HeartPulse, 
  ArrowUpRight, 
  User,
  Activity,
  UserPlus,
  Moon,
  Thermometer
} from 'lucide-react';
import Link from 'next/link';
import { mockUsers } from '@/services/mock';

export function FamilyDashboard() {
  const { user: familyMember } = useAuthStore();
  const getElderlyByFamily = useElderlyStore((state) => state.getElderlyByFamily);
  
  const elderlyList = familyMember ? getElderlyByFamily(familyMember.id) : [];

  const getMoodColor = (score: number) => {
    if (score >= 80) return 'text-teal-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Care Circles</h1>
          <p className="text-muted-foreground mt-1 text-lg">Monitor and manage your elderly family members.</p>
        </div>
        <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-200 dark:shadow-none transition-all hover:scale-105 h-11 px-6">
          <Link href="/dashboard/family/elderly/create">
            <Plus className="mr-2 h-5 w-5" />
            Add New Member
          </Link>
        </Button>
      </div>

      {elderlyList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {elderlyList.map((elderly) => {
            const caregiver = mockUsers.find(u => u.id === elderly.caregiverId);
            const status = elderly.healthStatus;
            
            return (
              <Card key={elderly.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                <div className="h-1.5 w-full bg-sky-500" />
                <CardHeader className="flex flex-row items-center gap-4 pb-4">
                  <Avatar className="h-14 w-14 border-2 border-sky-100 ring-2 ring-white ring-offset-2 ring-offset-sky-50 group-hover:scale-110 transition-transform">
                    <AvatarImage src={elderly.avatar} />
                    <AvatarFallback className="bg-sky-50 text-sky-600 font-bold text-lg">
                      {elderly.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 transition-colors">{elderly.name}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium">{elderly.age} yrs</span>
                      <span className="mx-2">•</span>
                      <span className="truncate">{elderly.condition}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pt-2 flex-grow">
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-tight">
                          <HeartPulse className="h-3 w-3 text-rose-500" />
                          Heart Rate
                        </div>
                        <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                          {status.heartRate} <span className="text-xs font-medium text-slate-400">BPM</span>
                        </div>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-tight">
                          <Activity className="h-3 w-3 text-teal-500" />
                          Mood
                        </div>
                        <div className={`text-lg font-bold ${getMoodColor(status.moodScore)}`}>
                          {status.moodScore}%
                        </div>
                      </div>
                    </div>

                    {/* Alert History Snapshot */}
                    {useElderlyStore.getState().getActiveAlertsByElderly(elderly.id).length > 0 && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 animate-pulse">
                        <div className="h-2 w-2 rounded-full bg-rose-500" />
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                          {useElderlyStore.getState().getActiveAlertsByElderly(elderly.id).length} Active Alerts
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Caregiver:</span>
                    <Badge variant="secondary" className="bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-100 dark:bg-sky-900/20 dark:text-sky-400">
                      {caregiver?.name || 'Unassigned'}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button variant="outline" className="w-full group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 transition-all duration-300 border-slate-200" asChild>
                    <Link href={`/dashboard/family/elderly/${elderly.id}`}>
                      View Full Profile
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30 backdrop-blur-sm">
          <div className="h-24 w-24 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-6 shadow-inner">
            <UserPlus className="h-12 w-12 text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Build Your Care Circle</h2>
          <p className="text-muted-foreground max-w-sm mb-8 text-lg">
            Connect your elderly family members with professional caregivers and monitor their health effortlessly.
          </p>
          <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white min-w-[220px] h-12 rounded-xl text-lg shadow-xl shadow-sky-100 dark:shadow-none transition-transform hover:scale-105 active:scale-95">
            <Link href="/dashboard/family/elderly/create">
              Create First Profile
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
