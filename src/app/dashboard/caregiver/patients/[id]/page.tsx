'use client';

import { use } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  HeartPulse, 
  AlertTriangle, 
  Bot, 
  Calendar, 
  Mail, 
  User,
  ArrowLeft,
  Clock,
  Activity
} from 'lucide-react';
import { mockPatients, mockMoodHistory, mockAlerts, mockRobots } from '@/services/mock';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';

export default function CaregiverPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const patient = mockPatients.find(p => p.id === resolvedParams.id);

  if (!patient) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Patient not found.</p>
        <Link href="/dashboard/caregiver/patients">
          <Button variant="outline">Back to Patients</Button>
        </Link>
      </div>
    );
  }

  const patientMoodHistory = mockMoodHistory
    .filter(log => log.patientId === patient.id)
    .map(log => ({
      name: new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
      score: log.score
    }));

  const patientAlerts = mockAlerts.filter(alert => alert.patientId === patient.id);
  const assignedRobot = mockRobots.find(robot => robot.assignedPatientId === patient.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/caregiver/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Patient Details</h1>
          <p className="text-muted-foreground">Comprehensive health and monitoring overview for {patient.name}.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-none shadow-sm overflow-hidden">
          <div className={`h-2 w-full ${patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL' ? 'bg-rose-500' : 'bg-teal-500'}`} />
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-slate-800 shadow-sm">
                <AvatarImage src={patient.avatar} alt={patient.name} />
                <AvatarFallback className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300 text-2xl font-bold">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">{patient.name}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="px-2 py-0 border-slate-200 dark:border-slate-700">ID: {patient.id}</Badge>
              <Badge 
                className={
                  patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300' 
                    : 'bg-teal-100 text-teal-700 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-300'
                }
              >
                {patient.riskLevel} RISK
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 pt-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Age</p>
                  <p className="font-medium">{patient.age} years</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Condition</p>
                  <p className="font-medium">{patient.condition}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Visit</p>
                  <p className="font-medium">Oct 10, 2025</p>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Button className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                Contact Patient
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts and History */}
        <div className="md:col-span-2 space-y-6">
          {/* Mood History Chart */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-sky-500" />
                Emotion History
              </CardTitle>
              <CardDescription>Patient mood score trends over the last 5 logs.</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] pl-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientMoodHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#0284c7" 
                    strokeWidth={3} 
                    dot={{ fill: '#0284c7', r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Alert History */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                  Alert History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientAlerts.map(alert => (
                    <div key={alert.id} className="flex gap-3 text-sm border-l-2 border-rose-500 pl-3">
                      <div className="flex-1 space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{alert.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{alert.message}</p>
                        <div className="flex items-center text-[10px] text-muted-foreground pt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(alert.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {patientAlerts.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent alerts found.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Assigned Robot */}
            <Card className="border-none shadow-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="h-5 w-5 text-sky-500" />
                  Assigned Robot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedRobot ? (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Robot ID</span>
                        <span className="font-bold">{assignedRobot.id}</span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-none px-2">{assignedRobot.status}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Battery Life</span>
                        <span className="font-semibold">{assignedRobot.battery}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${assignedRobot.battery < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${assignedRobot.battery}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs p-3 rounded-lg bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-300">
                      <p className="font-medium">Current Location: {assignedRobot.location}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                    <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-muted-foreground">No robot assigned to this patient.</p>
                    <Button variant="outline" size="sm">Assign Now</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
