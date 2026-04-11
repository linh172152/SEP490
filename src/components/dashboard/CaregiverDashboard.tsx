'use client';

import { useState, useEffect } from 'react';
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
  AlertTriangle, 
  Wifi,
  Bot,
  CheckCircle2,
  Users,
  Search,
  ArrowUpRight,
  ClipboardList
} from 'lucide-react';
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
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { elderlyService } from '@/services/api/elderlyService';
import { alertService } from '@/services/api/alertService';
import { robotService } from '@/services/api/robotService';
import { reminderService } from '@/services/api/reminderService';
import { 
  ElderlyProfileResponse, 
  AlertNotificationResponse, 
  RobotResponse, 
  ReminderResponse 
} from '@/services/api/types';
import { toast } from 'react-toastify';

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
  const [elderlyList, setElderlyList] = useState<ElderlyProfileResponse[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertNotificationResponse[]>([]);
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [elderlyData, alertsData, robotsData, remindersData] = await Promise.all([
        elderlyService.getAll(),
        alertService.getAll(),
        robotService.getAll(),
        reminderService.getAll()
      ]);

      setElderlyList(Array.isArray(elderlyData) ? elderlyData : []);
      setActiveAlerts(Array.isArray(alertsData) ? alertsData.filter(a => !a.resolved) : []);
      setRobots(Array.isArray(robotsData) ? robotsData : []);
      setReminders(Array.isArray(remindersData) ? remindersData : []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setFetchError(true);
      toast.error("Failed to load dashboard data. Use demo data to continue.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemoData = () => {
    setFetchError(false);
    setElderlyList([
      {
        id: 101,
        accountId: Number(caregiver?.id ?? 0),
        name: 'Maria Trần',
        dateOfBirth: '1948-08-12',
        healthNotes: 'Cần hỗ trợ đi lại và giám sát nhịp tim.',
        preferredLanguage: 'Vietnamese',
        speakingSpeed: 'normal',
        deleted: false,
      },
      {
        id: 102,
        accountId: Number(caregiver?.id ?? 0),
        name: 'Lê Văn D',
        dateOfBirth: '1953-03-29',
        healthNotes: 'Chỉ định theo dõi huyết áp và chế độ dinh dưỡng.',
        preferredLanguage: 'Vietnamese',
        speakingSpeed: 'slow',
        deleted: false,
      }
    ]);
    setActiveAlerts([
      {
        id: 201,
        elderlyId: 101,
        alertType: 'fall_risk',
        message: 'Nguy cơ ngã cao cho Maria Trần.',
        resolved: false,
        elderlyName: 'Maria Trần',
        createdAt: new Date(Date.now() - 5400000).toISOString(),
      },
      {
        id: 202,
        elderlyId: 102,
        alertType: 'medication',
        message: 'Nhắc uống thuốc hạ huyết áp cho Lê Văn D.',
        resolved: false,
        elderlyName: 'Lê Văn D',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      }
    ]);
    setRobots([
      {
        id: 31,
        robotName: 'CareBot Gamma',
        model: 'CB-2025',
        serialNumber: 'RB-201-G',
        firmwareVersion: '1.4.0',
        status: 'ONLINE',
      },
      {
        id: 32,
        robotName: 'CareBot Delta',
        model: 'CB-2025',
        serialNumber: 'RB-202-D',
        firmwareVersion: '1.4.0',
        status: 'ONLINE',
      }
    ]);
    setReminders([
      {
        id: 301,
        elderlyId: 101,
        caregiverId: Number(caregiver?.id ?? 0),
        title: 'Kiểm tra huyết áp buổi sáng',
        reminderType: 'MEDICINE',
        scheduleTime: new Date(new Date().setHours(7, 30, 0, 0)).toISOString(),
        repeatPattern: 'daily',
        active: true,
        elderlyName: 'Maria Trần',
        caregiverName: 'Caregiver',
      },
      {
        id: 302,
        elderlyId: 102,
        caregiverId: Number(caregiver?.id ?? 0),
        title: 'Theo dõi đường huyết',
        reminderType: 'MEDICINE',
        scheduleTime: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(),
        repeatPattern: 'daily',
        active: true,
        elderlyName: 'Lê Văn D',
        caregiverName: 'Caregiver',
      }
    ]);
    toast.success('Demo data loaded for caregiver dashboard');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResolveAlert = async (id: number) => {
    try {
      await alertService.markAsResolved(id);
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
      toast.success("Alert resolved");
    } catch {
      toast.error("Failed to resolve alert");
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Mock trend for chart (Still using mock as API doesn't provide history yet)
  const chartData = [
    { name: 'Mon', score: 65 },
    { name: 'Tue', score: 62 },
    { name: 'Wed', score: 70 },
    { name: 'Thu', score: 68 },
    { name: 'Fri', score: 75 },
    { name: 'Sat', score: 72 },
    { name: 'Sun', score: 78 },
  ];

  const getSeverityStyles = (message: string) => {
    const msg = message.toLowerCase();
    if (msg.includes('critical') || msg.includes('emergency') || msg.includes('fall')) return 'bg-rose-500';
    if (msg.includes('high') || msg.includes('spike')) return 'bg-orange-500';
    if (msg.includes('medium') || msg.includes('abnormal')) return 'bg-amber-500';
    return 'bg-sky-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <div className="flex flex-wrap gap-3 items-center">
          {(fetchError || (elderlyList.length === 0 && activeAlerts.length === 0 && robots.length === 0 && reminders.length === 0)) && (
            <Button variant="outline" onClick={loadDemoData} className="h-11">
              Load Demo Data
            </Button>
          )}
          <Button asChild variant="outline" className="h-11 px-5">
            <Link href="/dashboard/caregiver/alerts">View Alerts</Link>
          </Button>
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
          <Card className={`border-none shadow-sm transition-all ${activeAlerts.length > 0 ? 'bg-gradient-to-br from-white to-rose-50/50 ring-1 ring-rose-200' : 'bg-gradient-to-br from-white to-slate-50'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${activeAlerts.length > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlerts.length}</div>
              <p className="text-xs text-muted-foreground pt-1">Action required</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Robots</CardTitle>
              <Bot className={`h-4 w-4 text-teal-500`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{robots.filter(r => r.status.toUpperCase() !== 'OFFLINE').length}</div>
              <p className="text-xs text-muted-foreground pt-1">Fleet online</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Emotion Trend Chart */}
        <motion.div variants={item} className="col-span-4">
          <Card className="border-none shadow-sm overflow-hidden h-full">
            <CardHeader>
              <CardTitle className="text-lg">Health Trend Overview</CardTitle>
              <CardDescription>
                System stability tracking (simulated)
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
                  Fleet Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {robots.length > 0 ? (
                  robots.slice(0, 2).map(robot => (
                    <div key={robot.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Wifi className={`h-4 w-4 ${robot.status.toUpperCase() === 'OFFLINE' ? 'text-slate-400' : 'text-emerald-500'}`} />
                          {robot.robotName}
                        </div>
                        <Badge className={`${robot.status.toUpperCase() === 'OFFLINE' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700'} border-none`}>
                          {robot.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">Version: {robot.firmwareVersion}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">No robots found.</div>
                )}
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
                        <div className={`mt-1 h-2 w-2 rounded-full ${getSeverityStyles(alert.message)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.elderlyName} • {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" onClick={() => handleResolveAlert(alert.id)}>
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
            <Link href="/dashboard/caregiver/elderly">
              View All Members
            </Link>
          </Button>
        </div>

        {elderlyList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {elderlyList.map(member => (
              <Card key={member.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className={`h-1.5 w-full bg-teal-500`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2 group-hover:text-sky-600 transition-colors">
                        {member.name}
                        <Badge variant="ghost" className="px-1 text-muted-foreground">Age: {calculateAge(member.dateOfBirth)}</Badge>
                      </CardTitle>
                      <CardDescription className="line-clamp-1">{member.healthNotes || 'No health notes available'}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Language</span>
                      <span className="text-sm font-semibold">{member.preferredLanguage}</span>
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
              Currently there are no elderly members assigned to your care terminal.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
