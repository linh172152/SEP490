'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Battery, 
  Wifi, 
  Thermometer, 
  Activity, 
  Bot, 
  Clock,
  AlertCircle,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { mockRobots } from '@/services/mock';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function CaregiverRobotPage() {
  const [robots, setRobots] = useState(mockRobots);

  // Simulate real-time telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRobots(currentRobots => 
        currentRobots.map(robot => {
          // Slowly drain battery if not charging
          let newBattery = robot.battery;
          if (robot.status === 'CHARGING') {
            newBattery = Math.min(100, robot.battery + 0.1);
          } else {
            newBattery = Math.max(0, robot.battery - 0.05);
          }

          // Fluctuate temperature slightly
          const tempChange = (Math.random() - 0.5) * 0.2;
          const newTemp = Math.round((robot.temperature + tempChange) * 10) / 10;

          return {
            ...robot,
            battery: newBattery,
            temperature: newTemp
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Robot Control Panel</h1>
        <p className="text-muted-foreground">Real-time status, telemetry, and remote commands for CareBot units.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {robots.map((robot) => (
          <motion.div
            key={robot.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-none shadow-sm overflow-hidden group hover:ring-2 hover:ring-sky-500/20 transition-all">
              {/* Top Status Bar */}
              <div className={`h-1.5 w-full ${
                robot.status === 'CHARGING' ? 'bg-amber-400' : 
                robot.battery < 20 ? 'bg-rose-500' : 'bg-teal-500'
              }`} />
              
              <CardHeader className="pb-3 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                    <Bot className="h-5 w-5" />
                    <CardTitle className="text-lg">{robot.id}</CardTitle>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={
                      robot.status === 'ONLINE' ? 'bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:text-teal-400' :
                      robot.status === 'CHARGING' ? 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400' :
                      'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/50'
                    }
                  >
                    {robot.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                  Signal Strong • {robot.location}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-6 pb-6 space-y-5">
                {/* Battery Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Battery className={`h-4 w-4 ${robot.battery < 20 ? 'text-rose-500' : 'text-slate-500'}`} />
                      <span className="font-medium">Battery Power</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {robot.status === 'CHARGING' && <Zap className="h-3 w-3 text-amber-500 animate-pulse" />}
                      <span className={`font-bold ${robot.battery < 20 ? 'text-rose-600' : ''}`}>
                        {Math.floor(robot.battery)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${
                        robot.status === 'CHARGING' ? 'bg-amber-500' :
                        robot.battery < 20 ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${robot.battery}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  {robot.battery < 20 && robot.status !== 'CHARGING' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold uppercase tracking-wider animate-pulse">
                      <AlertCircle className="h-3 w-3" />
                      Critically Low Power
                    </div>
                  )}
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Thermometer className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold uppercase">Temp</span>
                    </div>
                    <span className={`text-lg font-bold ${robot.temperature > 39 ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'}`}>
                      {robot.temperature}°C
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Activity className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold uppercase">Activity</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {robot.currentTask || 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Task Queue */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      Task Queue
                    </h4>
                    <span className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 px-1.5 py-0.5 rounded-full font-bold">
                      {robot.taskQueue.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {robot.taskQueue.map((task, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group/task"
                      >
                        <CheckCircle2 className="h-4 w-4 text-slate-300 group-hover/task:text-teal-500 transition-colors" />
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{task}</span>
                      </div>
                    ))}
                    {robot.taskQueue.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">Queue is empty</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Commands Panel */}
            <Card className="mt-4 border-none shadow-sm group hover:shadow-md transition-shadow">
               <CardHeader className="pb-3 px-6">
                 <CardTitle className="text-lg flex items-center gap-2">
                   <Zap className="h-4 w-4 text-sky-500" />
                   Quick Commands
                 </CardTitle>
                 <CardDescription>Send remote mock instructions</CardDescription>
               </CardHeader>
               <CardContent className="px-6 pb-6 w-full space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/50 transition-colors h-11"
                    onClick={() => toast.success(`Instruction sent: Starting Check-in routine on ${robot.id}`)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Start Check-in
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/50 transition-colors h-11"
                    onClick={() => toast.success(`Instruction sent: Playing scheduled reminder on ${robot.id}`)}
                  >
                    <Activity className="mr-2 h-4 w-4" /> Play Reminder
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 transition-colors h-11"
                    onClick={() => toast.success(`Instruction sent: Moving ${robot.id} to Living Room`)}
                  >
                    <div className="mr-2 h-4 w-4 flex items-center justify-center border-2 border-current rounded-full">
                       <ArrowRight className="h-2 w-2" />
                    </div>
                    Move to Living Room
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start hover:bg-red-700 transition-colors h-11"
                    onClick={() => toast.error(`Emergency Override Sent: Initiated emergency call via ${robot.id}`)}
                  >
                    <AlertCircle className="mr-2 h-4 w-4" /> Emergency Call
                  </Button>
               </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
