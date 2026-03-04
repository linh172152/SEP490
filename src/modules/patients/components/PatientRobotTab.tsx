'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Battery, Wifi, Activity, AlertTriangle, Cpu, ExternalLink } from 'lucide-react';
import { useRobotStore } from '@/store/useRobotStore';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface PatientRobotTabProps {
  patientId: string;
}

export function PatientRobotTab({ patientId }: PatientRobotTabProps) {
  // Simulating picking up the Robot assigned to this patient based on Room linkage.
  // We mock this by just fetching all robots and picking the first one configured 'online'.
  const { robots, activeRobotLogs, fetchRobots, fetchRobotLogs, isLoading } = useRobotStore();
  
  useEffect(() => {
    // Simulated caregiver ID
    fetchRobots('mock-caregiver');
  }, [fetchRobots]);

  const assignedRobot = robots.find(r => r.assignedPatientId === patientId) || robots[0];

  useEffect(() => {
    if (assignedRobot) {
      fetchRobotLogs(assignedRobot.id);
    }
  }, [assignedRobot, fetchRobotLogs]);

  if (isLoading || !assignedRobot) {
      return (
          <div className="grid md:grid-cols-2 gap-6 animate-pulse">
              <Skeleton className="h-[300px] w-full rounded-xl" />
              <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
      );
  }

  const recentLogs = activeRobotLogs.slice(0, 5); // Take top 5 for preview

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h3 className="text-xl font-bold">Assigned Device</h3>
            <p className="text-sm text-slate-500">Overview of the Carebot monitoring this patient.</p>
         </div>
         <Button asChild className="bg-sky-600 hover:bg-sky-700">
             <Link href={`/dashboard/caregiver/robots/${assignedRobot.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Full Robot Dashboard
             </Link>
         </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Module A: Robot Status Card */}
        <Card className="border-none shadow-sm overflow-hidden bg-slate-900 text-white lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl flex items-center gap-2">
                <Bot className="h-6 w-6 text-sky-400" />
                {assignedRobot.name}
              </CardTitle>
              <Badge variant={assignedRobot.status === 'online' ? 'default' : 'destructive'} 
                     className={assignedRobot.status === 'online' ? "bg-emerald-500/20 text-emerald-400" : ""}>
                {assignedRobot.status.toUpperCase()}
              </Badge>
            </div>
            <CardDescription className="text-slate-400">ID: {assignedRobot.id} • Firmware: {assignedRobot.firmwareVersion}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
               {/* Quick stats block */}
               <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                      <Battery className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-bold">Battery</span>
                  </div>
                  <p className="text-xl font-bold">{assignedRobot.batteryLevel}%</p>
               </div>
               <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                      <Cpu className="h-4 w-4" />
                      <span className="text-[10px] uppercase font-bold">CPU Usage</span>
                  </div>
                  <p className="text-xl font-bold">{assignedRobot.cpuUsage}%</p>
               </div>
             </div>
             
             <div className="flex items-center gap-2 text-xs text-slate-400 bg-black/20 p-3 rounded-lg">
                <Wifi className="h-4 w-4 text-emerald-400" />
                Last Heartbeat Check: {new Date(assignedRobot.lastHeartbeat).toLocaleTimeString()}
             </div>
          </CardContent>
        </Card>

        {/* Module B: Recent Interaction Logs */}
        <Card className="border-none shadow-sm lg:col-span-2">
          <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-500" />
              Latest Device Interactions
            </CardTitle>
            <CardDescription>The 5 most recent activities coordinated by the Carebot.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {recentLogs.length > 0 ? recentLogs.map(log => (
                     <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                               <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-slate-100">
                                   {log.reminderType}
                               </Badge>
                               <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <Badge variant="secondary" className={`text-[10px] ${log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {log.status}
                            </Badge>
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                <span className="text-sky-600 font-bold mr-2">Robot:</span> 
                                "{log.robotMessage}"
                            </p>
                            {log.elderlyResponse && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-slate-200 mt-2 italic">
                                   <span className="font-bold mr-2 opacity-70">Reply:</span>
                                   "{log.elderlyResponse}"
                                </p>
                            )}
                         </div>
                     </div>
                 )) : (
                     <div className="p-8 text-center text-slate-500">
                        <AlertTriangle className="h-8 w-8 mx-auto text-slate-400 mb-3" />
                        No interactions recorded recently.
                     </div>
                 )}
             </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-slate-900/50 justify-center p-3 border-t border-slate-100">
             <Button variant="ghost" size="sm" asChild className="text-slate-500 hover:text-sky-600">
                <Link href={`/dashboard/caregiver/robots/${assignedRobot.id}`}>
                   View Full History
                </Link>
             </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
