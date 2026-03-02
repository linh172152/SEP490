'use client';

import { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  HeartPulse, 
  Clock,
  Battery,
  Wifi,
  Bot,
  CheckCircle2,
  Users,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { mockMoodHistory, mockRobots } from '@/services/mock';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useElderlyStore } from '@/store/useElderlyStore';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function CaregiverDashboard() {
  const { user: caregiver } = useAuthStore();
  const elderlyStore = useElderlyStore();
  const getElderlyByCaregiver = elderlyStore.getElderlyByCaregiver;
  const getActiveAlertsByCaregiver = elderlyStore.getActiveAlertsByCaregiver;
  const resolveAlert = elderlyStore.resolveAlert;
  
  const elderlyList = useMemo(() => 
    caregiver ? getElderlyByCaregiver(caregiver.id) : [], 
  [caregiver, getElderlyByCaregiver]);

  const activeAlerts = useMemo(() => 
    caregiver ? getActiveAlertsByCaregiver(caregiver.id) : [],
  [caregiver, getActiveAlertsByCaregiver, elderlyStore.alerts]);

  const activeRobot = mockRobots[0]; // For demo, use first robot

  // KPI Calculations
  const avgMood = elderlyList.length > 0 
    ? Math.round(elderlyList.reduce((acc, e) => acc + e.healthStatus.moodScore, 0) / elderlyList.length)
    : 0;

  // Format data for chart (7-day mock trend)
  const chartData = [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 62 },
    { name: 'Wed', score: 70 },
    { name: 'Thu', score: 68 },
    { name: 'Fri', score: 75 },
    { name: 'Sat', score: 72 },
    { name: 'Sun', score: 78 },
  ];

  const getAlertCountForElderly = (id: string) => {
    return activeAlerts.filter(a => a.elderlyId === id).length;
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-sky-500';
    }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Caregiver Terminal</h2>
          <p className="text-muted-foreground">Monitor and assist your assigned care circle.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300 px-3 py-1 text-sm border-sky-200 dark:border-sky-800">
            {elderlyList.length} Active Members
          </Badge>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-sky-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Members</CardTitle>
              <Users className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{elderlyList.length}</div>
              <p className="text-xs text-muted-foreground pt-1">Directly in your care</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className={`border-none shadow-sm transition-all ${activeAlerts.length > 0 ? 'bg-gradient-to-br from-white to-rose-50/50 animate-pulse ring-1 ring-rose-200' : 'bg-gradient-to-br from-white to-slate-50'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${activeAlerts.length > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlerts.filter(a => a.severity === 'critical').length}</div>
              <p className="text-xs text-muted-foreground pt-1">Immediate action required</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Integrity</CardTitle>
              <Battery className={`h-4 w-4 ${activeRobot.battery < 20 ? 'text-rose-500' : 'text-teal-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRobot.battery}%</div>
              <p className="text-xs text-muted-foreground pt-1">Robot fleet status</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stability Index</CardTitle>
              <HeartPulse className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMood}/100</div>
              <p className="text-xs text-muted-foreground pt-1">Avg emotional score</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Emotion Trend Chart */}
        <motion.div variants={item} className="col-span-4">
          <Card className="border-none shadow-sm overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-lg">Health Trend Overview</CardTitle>
              <CardDescription>
                Emotional and physical stability tracking (simulated)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Robot Status & Alerts */}
        <div className="col-span-3 space-y-4">
          <motion.div variants={item}>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-sky-500" />
                  Robot Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Wifi className="h-4 w-4 text-emerald-500" />
                    Connectivity
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-none">Active</Badge>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Battery</span>
                    <span className="font-semibold">{activeRobot.battery}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-emerald-500`} 
                      style={{ width: `${activeRobot.battery}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Alerts</CardTitle>
                  <Badge variant="outline">{activeAlerts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 px-6 pb-6">
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {activeAlerts.slice(0, 3).map(alert => (
                      <motion.div 
                        key={alert.id} 
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-start gap-3 rounded-xl border p-3 bg-white dark:bg-slate-950 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`mt-1 h-2 w-2 rounded-full ${getSeverityStyles(alert.severity)} ${alert.severity === 'critical' ? 'animate-pulse ring-2 ring-rose-200' : ''}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => resolveAlert(alert.id)}>
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {activeAlerts.length === 0 && (
                    <div className="py-6 text-center text-sm text-muted-foreground italic">
                      No active alerts to show.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Assigned Elderly Members */}
      <motion.div variants={item} className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Assigned Care Circle</h3>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/caregiver/patients">
              View All Members
            </Link>
          </Button>
        </div>

        {elderlyList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {elderlyList.map(member => (
              <Card key={member.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className={`h-1.5 w-full ${
                  member.riskLevel === 'CRITICAL' ? 'bg-rose-500 text-white font-bold' : 
                  member.riskLevel === 'HIGH' ? 'bg-rose-400' : 
                  member.riskLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-teal-500'
                }`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2 group-hover:text-sky-600 transition-colors">
                        {member.name}
                        <Badge variant="ghost" className="px-1 text-muted-foreground">{member.age}</Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-1">{member.condition}</CardDescription>
                    </div>
                    {getAlertCountForElderly(member.id) > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {getAlertCountForElderly(member.id)} ALERTS
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Heart Rate</span>
                      <span className="text-sm font-bold">{member.healthStatus.heartRate} BPM</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Emotional Score</span>
                      <span className={`text-sm font-bold ${member.healthStatus.moodScore < 60 ? 'text-rose-500' : 'text-teal-600'}`}>
                        {member.healthStatus.moodScore}%
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 pb-4 px-6 gap-2">
                  <Button variant="outline" size="sm" className="flex-1 group-hover:bg-slate-900 group-hover:text-white transition-all border-slate-200" asChild>
                    <Link href={`/dashboard/caregiver/elderly/${member.id}`}>
                      Details
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-100 bg-slate-50/50">
            <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">No Assigned Members</h4>
            <p className="text-muted-foreground max-w-xs text-sm mt-1">
              Currently there are no elderly members assigned to your care terminal. New assignments will appear here.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
