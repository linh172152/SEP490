'use client';

import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  HeartPulse, 
  ArrowUpRight, 
  Activity,
  UserPlus,
  Clock,
  Pill,
  Users,
  AlertTriangle,
  Bot,
  ClipboardList,
  CheckCircle2,
  Wifi
} from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { elderlyService } from '@/services/api/elderlyService';
import { reminderService } from '@/services/api/reminderService';
import { alertService } from '@/services/api/alertService';
import { robotService } from '@/services/api/robotService';
import { 
  ElderlyProfileResponse, 
  ReminderResponse,
  AlertNotificationResponse,
  RobotResponse
} from '@/services/api/types';
import { toast } from 'react-toastify';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

function calculateAge(dob: string): number | string {
  if (!dob) return 'N/A';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export function FamilyDashboard() {
  const { user: familyMember } = useAuthStore();
  const [elderlyList, setElderlyList] = useState<ElderlyProfileResponse[]>([]);
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertNotificationResponse[]>([]);
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [elderlyData, remindersData, alertsData, robotsData] = await Promise.all([
        elderlyService.getAll(),
        reminderService.getAll(),
        alertService.getAll(),
        robotService.getAll(),
      ]);

      setElderlyList(Array.isArray(elderlyData) ? elderlyData : []);
      setReminders(Array.isArray(remindersData) ? remindersData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData.filter(a => !a.resolved) : []);
      setRobots(Array.isArray(robotsData) ? robotsData : []);
    } catch (error) {
      console.error('Failed to fetch family dashboard data:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveAlert = async (id: number) => {
    try {
      await alertService.markAsResolved(id);
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert resolved');
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const getSeverityDot = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes('critical') || msg.includes('emergency') || msg.includes('fall')) return 'bg-rose-500';
    if (msg.includes('high') || msg.includes('spike')) return 'bg-orange-500';
    if (msg.includes('medium') || msg.includes('abnormal')) return 'bg-amber-500';
    return 'bg-sky-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Family Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor your elderly family members and overall alerts.</p>
        </div>
        <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-200 dark:shadow-none transition-all hover:scale-105 h-11 px-6">
          <Link href="/dashboard/family/elderly/create">
            <Plus className="mr-2 h-5 w-5" />
            Add New Member
          </Link>
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-sky-50/50 dark:from-slate-950 dark:to-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{elderlyList.length}</div>
            <p className="text-xs text-muted-foreground pt-1">Registered profiles</p>
          </CardContent>
        </Card>

        <Card className={`border-none shadow-sm transition-all ${alerts.length > 0 ? 'bg-gradient-to-br from-white to-rose-50/50 ring-1 ring-rose-200' : 'bg-gradient-to-br from-white to-slate-50'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${alerts.length > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground pt-1">Unresolved notifications</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-950 dark:to-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Robots</CardTitle>
            <Bot className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{robots.filter(r => r.status.toUpperCase() !== 'OFFLINE').length}</div>
            <p className="text-xs text-muted-foreground pt-1">Fleet online</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-950 dark:to-slate-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reminders</CardTitle>
            <ClipboardList className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.filter(r => r.active).length}</div>
            <p className="text-xs text-muted-foreground pt-1">Scheduled tasks</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Elderly Members + Alerts side-by-side */}
      <div className="grid gap-6 lg:grid-cols-7">

        {/* Elderly Members Grid — left 4 cols */}
        <motion.div variants={item} className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Care Circles</h2>
            <Badge variant="secondary" className="bg-sky-100 text-sky-700 border-sky-200">{elderlyList.length} members</Badge>
          </div>

          {elderlyList.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {elderlyList.map((elderly) => (
                <Card key={elderly.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                  <div className="h-1.5 w-full bg-sky-500" />
                  <CardHeader className="flex flex-row items-center gap-3 pb-3">
                    <Avatar className="h-12 w-12 border-2 border-sky-100 ring-2 ring-white ring-offset-1 ring-offset-sky-50 group-hover:scale-110 transition-transform">
                      <AvatarFallback className="bg-sky-50 text-sky-600 font-bold text-base">
                        {elderly.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-600 transition-colors truncate">
                        {elderly.name}
                      </CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground gap-1">
                        <span className="font-medium">{calculateAge(elderly.dateOfBirth)} yrs</span>
                        <span>•</span>
                        <span className="truncate">{elderly.preferredLanguage}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 flex-grow">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <HeartPulse className="h-3 w-3 text-rose-400" />
                          Language
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {elderly.preferredLanguage}
                        </div>
                      </div>
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Activity className="h-3 w-3 text-teal-500" />
                          Speed
                        </div>
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {elderly.speakingSpeed}
                        </div>
                      </div>
                    </div>
                    {elderly.healthNotes && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{elderly.healthNotes}</p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 pb-4">
                    <Button variant="outline" className="w-full group-hover:bg-sky-600 group-hover:text-white group-hover:border-sky-600 transition-all duration-300 border-slate-200 text-sm" asChild>
                      <Link href={`/dashboard/family/elderly/${elderly.id}`}>
                        View Full Profile
                        <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30">
              <div className="h-20 w-20 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-5 shadow-inner">
                <UserPlus className="h-10 w-10 text-sky-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Build Your Care Circle</h2>
              <p className="text-muted-foreground max-w-sm mb-6">Connect your elderly family members and monitor their health effortlessly.</p>
              <Button asChild className="bg-sky-600 hover:bg-sky-700 text-white min-w-[200px] h-11 rounded-xl shadow-lg shadow-sky-100 dark:shadow-none transition-transform hover:scale-105">
                <Link href="/dashboard/family/elderly/create">Create First Profile</Link>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Right column — 3 cols: Alerts + Robots */}
        <div className="lg:col-span-3 space-y-4">

          {/* Recent Alerts */}
          <motion.div variants={item}>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                    Recent Alerts
                  </CardTitle>
                  <Badge variant="outline">{alerts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 px-6 pb-5">
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {alerts.slice(0, 4).map(alert => (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-start gap-3 rounded-xl border p-3 bg-white dark:bg-slate-950 hover:bg-slate-50 transition-colors"
                      >
                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${getSeverityDot(alert.message)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.elderlyName} • {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 flex-shrink-0" onClick={() => handleResolveAlert(alert.id)}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {alerts.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted-foreground italic">
                      No active alerts. All clear! ✅
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Robot Fleet */}
          <motion.div variants={item}>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-sky-500" />
                  Assigned Robots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {robots.length > 0 ? (
                  robots.slice(0, 3).map(robot => (
                    <div key={robot.id} className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Wifi className={`h-4 w-4 flex-shrink-0 ${robot.status.toUpperCase() === 'OFFLINE' ? 'text-slate-400' : 'text-emerald-500'}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{robot.robotName}</p>
                          <p className="text-xs text-muted-foreground">v{robot.firmwareVersion}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] flex-shrink-0 border-none ${robot.status.toUpperCase() === 'OFFLINE' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        {robot.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground italic">No robots assigned yet.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Care Reminders Section */}
      <motion.div variants={item} className="space-y-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Care Reminders</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">Track medication and therapy schedules.</p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 h-10 px-5">
            <Link href="/dashboard/family/reminders/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Link>
          </Button>
        </div>

        {reminders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id} className="border-none shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex-shrink-0">
                      {reminder.reminderType === 'MEDICATION' ? (
                        <Pill className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Activity className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {reminder.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {reminder.reminderType} • {reminder.repeatPattern}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={reminder.active ? 'default' : 'secondary'}
                      className={`text-[10px] flex-shrink-0 ${reminder.active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : ''}`}
                    >
                      {reminder.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{reminder.scheduleTime}</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      For: <span className="font-medium">{reminder.elderlyName}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Caregiver: {reminder.caregiverName}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/family/reminders/${reminder.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30">
            <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4 shadow-inner">
              <Clock className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">No Reminders Yet</h3>
            <p className="text-muted-foreground max-w-sm mb-4 text-sm">
              Set up medication and therapy reminders to stay on track with care schedules.
            </p>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/dashboard/family/reminders/create">Create First Reminder</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
