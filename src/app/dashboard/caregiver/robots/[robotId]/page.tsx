'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRobotStore } from '@/store/useRobotStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bot } from 'lucide-react';
import Link from 'next/link';
import { DeviceOverview } from '@/modules/robots/components/DeviceOverview';
import { ReminderSchedule } from '@/modules/robots/components/ReminderSchedule';
import { InteractionLog } from '@/modules/robots/components/InteractionLog';
import { DeviceConfiguration } from '@/modules/robots/components/DeviceConfiguration';
import { SystemAlerts } from '@/modules/robots/components/SystemAlerts';
import { Skeleton } from '@/components/ui/skeleton';

export default function RobotDetailPage({ params }: { params: Promise<{ robotId: string }> }) {
  const resolvedParams = use(params);
  const robotId = resolvedParams.robotId;
  const router = useRouter();
  
  const { robots, fetchRobots, fetchRobotLogs, isLoading } = useRobotStore();

  useEffect(() => {
    // Initial fetch if deep-linked
    if (robots.length === 0) {
      fetchRobots('mock-caregiver');
    }
    fetchRobotLogs(robotId);
  }, [robotId, fetchRobots, fetchRobotLogs, robots.length]);

  const robot = robots.find(r => r.id === robotId);

  if (isLoading || !robot) {
      return (
          <div className="p-8 space-y-6 animate-pulse w-full max-w-7xl mx-auto">
             <div className="flex gap-4 mb-8">
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-48" />
             </div>
             <div className="grid lg:grid-cols-12 gap-8 relative">
                 <div className="lg:col-span-3 space-y-4">
                     <Skeleton className="h-[200px] w-full rounded-xl" />
                 </div>
                 <div className="lg:col-span-9 space-y-8">
                     <Skeleton className="h-[200px] w-full rounded-xl" />
                     <Skeleton className="h-[400px] w-full rounded-xl" />
                 </div>
             </div>
          </div>
      );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header Array */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.back()} className="h-10 w-10 shrink-0">
                  <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                  <div className="flex items-center gap-3">
                     <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Bot className="h-6 w-6 md:h-8 md:w-8 text-sky-500" />
                        {robot.name}
                     </h1>
                     <Badge variant="outline" className={`hidden sm:inline-flex uppercase tracking-wider ${
                           robot.status === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                           robot.status === 'needs_attention' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'
                     }`}>
                         {robot.status.replace('_', ' ')}
                     </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">
                      Assigned to: <Link href={`/dashboard/caregiver/patients/${robot.assignedPatientId}`} className="text-sky-600 hover:underline font-medium">{robot.assignedPatientId}</Link>
                  </p>
              </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 relative">
          
          {/* Sticky Side Navigation */}
          <div className="lg:col-span-3">
             <div className="sticky top-6 flex flex-col gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                 <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 ml-2">Console Subsystems</h3>
                 <a href="#overview" className="px-4 py-2.5 rounded-lg hover:bg-white hover:shadow-sm text-sm font-medium transition-all text-slate-700">Device Overview</a>
                 <a href="#reminders" className="px-4 py-2.5 rounded-lg hover:bg-white hover:shadow-sm text-sm font-medium transition-all text-slate-700">Reminder Schedule</a>
                 <a href="#logs" className="px-4 py-2.5 rounded-lg hover:bg-white hover:shadow-sm text-sm font-medium transition-all text-slate-700">Interaction Log</a>
                 <a href="#config" className="px-4 py-2.5 rounded-lg hover:bg-white hover:shadow-sm text-sm font-medium transition-all text-slate-700">Device Configuration</a>
                 <a href="#alerts" className="px-4 py-2.5 rounded-lg hover:bg-white hover:shadow-sm text-sm font-medium transition-all text-slate-700">System Alerts</a>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-12">
             
             <section id="overview" className="scroll-mt-10">
                <DeviceOverview robot={robot} />
             </section>

             <section id="reminders" className="scroll-mt-10">
                <ReminderSchedule robotId={robot.id} />
             </section>

             <section id="logs" className="scroll-mt-10">
                <InteractionLog robotId={robot.id} />
             </section>

             <section id="config" className="scroll-mt-10">
                <DeviceConfiguration robot={robot} />
             </section>

             <section id="alerts" className="scroll-mt-10">
                <SystemAlerts robot={robot} />
             </section>

          </div>
      </div>
    </div>
  );
}
