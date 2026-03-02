'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  Users
} from 'lucide-react';
import { mockPatients, mockAlerts, mockMoodHistory, mockRobots } from '@/services/mock';
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
  const [alerts, setAlerts] = useState(mockAlerts);
  const unreadAlerts = alerts.filter(a => !a.isRead);
  const activeRobot = mockRobots[0]; // For demo, use first robot

  // KPI Calculations
  const avgMood = Math.round(
    mockPatients.reduce((acc, p) => acc + p.moodScore, 0) / mockPatients.length
  );

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

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Caregiver Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, Mark. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-300 px-3 py-1 text-sm border-sky-200 dark:border-sky-800">
            {mockPatients.length} Active Patients
          </Badge>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-sky-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockPatients.length}</div>
              <p className="text-xs text-muted-foreground">Assigned to your care</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-rose-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-teal-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Robot Battery</CardTitle>
              <Battery className={`h-4 w-4 ${activeRobot.battery < 20 ? 'text-rose-500' : 'text-teal-500'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRobot.battery}%</div>
              <p className="text-xs text-muted-foreground">{activeRobot.status.toLowerCase()}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none shadow-sm bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-950 dark:to-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emotional Stability</CardTitle>
              <HeartPulse className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgMood}/100</div>
              <p className="text-xs text-muted-foreground">Average mood score</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Emotion Trend Chart */}
        <motion.div variants={item} className="col-span-4">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Emotion & Mood Trends</CardTitle>
              <CardDescription>
                Collective patient mood tracking over 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
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
                  Robot Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm font-medium">Connectivity</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 border-none">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-sky-500" />
                    <span className="text-sm font-medium">Current Task</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{activeRobot.assignedPatientId ? 'Assisting p1' : 'Idle'}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Battery Life</span>
                    <span className="font-semibold">{activeRobot.battery}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${activeRobot.battery < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
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
                  <Badge variant="outline">{unreadAlerts.length} New</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 px-6 pb-6">
                <div className="space-y-3">
                  <AnimatePresence initial={false}>
                    {alerts.slice(0, 3).map(alert => (
                      <motion.div 
                        key={alert.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-start space-x-3 rounded-xl border p-3 bg-white dark:bg-slate-900 overflow-hidden relative"
                      >
                        <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${alert.isRead ? 'bg-slate-300' : 'bg-rose-500'}`} />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold leading-none">{alert.type.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{alert.message}</p>
                          <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-400 hover:text-emerald-500"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {alerts.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No pending alerts. Nice work!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Patient Grid */}
      <motion.div variants={item} className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Assigned Patients</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {mockPatients.map(patient => (
            <Card key={patient.id} className="overflow-hidden border-none shadow-sm group hover:ring-2 hover:ring-sky-500/20 transition-all">
              <div className={`h-1.5 w-full ${patient.riskLevel === 'HIGH' ? 'bg-rose-500' : patient.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-teal-500'}`} />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{patient.name}, {patient.age}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={
                      patient.riskLevel === 'HIGH' 
                        ? 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-900/10' 
                        : 'border-teal-200 text-teal-700 bg-teal-50 dark:bg-teal-900/10'
                    }
                  >
                    {patient.riskLevel} RISK
                  </Badge>
                </div>
                <CardDescription>{patient.condition}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm py-1 border-b border-slate-50 dark:border-slate-800">
                  <span className="text-muted-foreground font-medium">Current Mood</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{patient.moodScore}%</span>
                </div>
                <div className="flex justify-between text-sm py-1 pt-2">
                  <span className="text-muted-foreground font-medium">Last Medication</span>
                  <span className="text-slate-600 dark:text-slate-300">{new Date(patient.lastMedication).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
