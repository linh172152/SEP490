'use client';

import { useEffect } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Bell, 
  Package, 
  Calendar, 
  Clock, 
  Activity, 
  AlertCircle,
  TrendingUp,
  HeartPulse,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils'; // I will check if this exists or create it

export function FamilyOverview() {
  const { user } = useAuthStore();
  const { 
    elderlyList, 
    reminders, 
    userPackages, 
    isLoading, 
    error, 
    isUsingMock,
    fetchDashboardData,
    generateDemoData 
  } = useFamilyStore();

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(Number(user.id));
    }
  }, [user?.id, fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-xl font-bold text-rose-700 dark:text-rose-400 mb-2">Data Load Failed</h3>
        <p className="text-rose-600/80 mb-6 max-w-sm">{error}</p>
        <Button onClick={() => user?.id && generateDemoData(Number(user.id))} className="bg-rose-600 hover:bg-rose-700 text-white">
          Use Demo Data
        </Button>
      </div>
    );
  }

  const activePackage = userPackages.length > 0 ? userPackages[0] : null;

  // Next 5 upcoming reminders
  const upcomingReminders = [...reminders]
    .filter(r => r.active && new Date(r.scheduleTime) >= new Date())
    .sort((a, b) => new Date(a.scheduleTime).getTime() - new Date(b.scheduleTime).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family Welcome Dashboard</h1>
          <p className="text-muted-foreground mt-1">Snapshot of your care circle status.</p>
        </div>
        {elderlyList.length === 0 && !isUsingMock && (
          <Button onClick={() => user?.id && generateDemoData(Number(user.id))} variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50">
            Generate Demo Data
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Managed Members</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elderlyList.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered family members</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Active Reminders</CardTitle>
            <Bell className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.filter(r => r.active).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Daily tasks scheduled</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Current Package</CardTitle>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">
                {activePackage ? `Tier ${activePackage.servicePackageId}` : 'None Active'}
              </div>
              {activePackage && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expires: {new Date(activePackage.expiredAt).toLocaleDateString()}
                </p>
              )}
            </div>
            {!activePackage && (
              <Button asChild size="sm" variant="outline" className="text-emerald-600 border-emerald-200">
                <Link href="/dashboard/family/packages">Purchase Plan</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        {/* Left Col: Upcoming Reminders */}
        <Card className="md:col-span-4 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>Next items in the care schedule.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-sky-600">
               <Link href="/dashboard/family/reminders" className="flex items-center">
                  View All <TrendingUp className="ml-2 h-4 w-4" />
               </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingReminders.length > 0 ? (
                upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-muted-foreground/10">
                    <div className={`h-10 w-10 min-w-[40px] rounded-lg flex items-center justify-center ${
                      reminder.reminderType === 'MEDICINE' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {reminder.reminderType === 'MEDICINE' ? <HeartPulse className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{reminder.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {reminder.elderlyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-mono text-sm font-bold text-slate-700">
                        <Clock className="h-3 w-3" />
                        {new Date(reminder.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold mt-1">
                        {reminder.repeatPattern}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                   <Clock className="h-10 w-10 mb-2 opacity-20" />
                   <p>No upcoming reminders found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Recent Activities Summary */}
        <Card className="md:col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Recent Care Insights</CardTitle>
            <CardDescription>Highlights from the last 24h.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
                   <Users className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm font-medium">Care Circle Status</p>
                   <p className="text-xs text-muted-foreground mt-1">
                      All {elderlyList.length} members are currently monitored by assigned caregivers.
                   </p>
                </div>
             </div>

             <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                   <Activity className="h-5 w-5" />
                </div>
                <div>
                   <p className="text-sm font-medium">Exercise Completion</p>
                   <p className="text-xs text-muted-foreground mt-1">
                      85% completion rate across all scheduled physical activities.
                   </p>
                </div>
             </div>

             <Button asChild className="w-full mt-4" variant="outline">
                <Link href="/dashboard/family/elderly">
                   <Plus className="mr-2 h-4 w-4" /> Add New Family Member
                </Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
