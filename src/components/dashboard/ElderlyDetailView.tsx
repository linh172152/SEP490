'use client';

import { useMemo } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  HeartPulse, 
  Activity, 
  AlertTriangle, 
  Bot, 
  Battery, 
  Wifi, 
  Clock, 
  ArrowLeft,
  ChevronRight,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Thermometer,
  Zap,
  TrendingUp,
  BrainCircuit,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { useElderlyStore } from '@/store/useElderlyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';

interface ElderlyDetailViewProps {
  elderlyId: string;
  role: 'FAMILY' | 'CAREGIVER' | 'DOCTOR';
}

export function ElderlyDetailView({ elderlyId, role }: ElderlyDetailViewProps) {
  const elderlyStore = useElderlyStore();
  const { user } = useAuthStore();
  const elderly = elderlyStore.elderlyList.find(e => e.id === elderlyId);
  const alerts = elderlyStore.getAlertHistoryByElderly(elderlyId);
  const activeAlerts = elderlyStore.getActiveAlertsByElderly(elderlyId);
  const clinicalNotes = elderlyStore.clinicalNotes.filter(n => n.elderlyId === elderlyId);
  
  const [newNote, setNewNote] = useState('');

  // Deterministic mock data based on ID for 7-day trend
  const healthData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const hash = elderly?.name.length || 0;
      return {
        name: day,
        mood: 60 + Math.sin((i + hash) * 0.5) * 20 + Math.random() * 5,
        heartRate: 72 + Math.cos((i + hash) * 0.5) * 10 + Math.random() * 5,
        cognitive: 70 + Math.sin((i + hash) * 0.8) * 15
      };
    });
  }, [elderly]);

  const cognitiveData = useMemo(() => [
    { subject: 'Memory', A: 85, fullMark: 100 },
    { subject: 'Focus', A: 70, fullMark: 100 },
    { subject: 'Coordination', A: 90, fullMark: 100 },
    { subject: 'Reaction', A: 65, fullMark: 100 },
    { subject: 'Language', A: 80, fullMark: 100 },
  ], []);

  if (!elderly) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Stethoscope className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          We couldn't locate the elderly profile you're looking for. It may have been removed or unassigned.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href={`/dashboard/${role.toLowerCase()}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const handleAddNote = () => {
    if (!newNote.trim() || !user) return;
    elderlyStore.addClinicalNote(elderlyId, user.id, newNote);
    setNewNote('');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      default: return 'bg-sky-500';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/dashboard/${role.toLowerCase()}`} className="hover:text-primary transition-colors">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{elderly.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile & Robot */}
        <div className="space-y-6 lg:col-span-1">
          {/* Enhanced Profile Card */}
          <Card className="border-none shadow-xl bg-gradient-to-b from-sky-600 to-sky-700 text-white overflow-hidden">
            <div className="relative p-6">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <HeartPulse className="h-32 w-32" />
              </div>
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <Avatar className="h-24 w-24 border-4 border-white/20 ring-4 ring-white/10 ring-offset-4 ring-offset-sky-600 shadow-2xl">
                  <AvatarImage src={elderly.avatar} />
                  <AvatarFallback className="bg-sky-400 text-3xl font-bold">{elderly.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{elderly.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1 text-sky-100/80">
                    <span>{elderly.age} Years</span>
                    <span>•</span>
                    <span>{elderly.gender}</span>
                  </div>
                </div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1">
                  {elderly.condition}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner text-center">
                  <p className="text-[10px] uppercase font-bold text-sky-100 tracking-wider">Health Index</p>
                  <p className="text-2xl font-bold mt-1">{elderly.healthStatus.moodScore}%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner text-center">
                  <p className="text-[10px] uppercase font-bold text-sky-100 tracking-wider">Stability</p>
                  <p className="text-2xl font-bold mt-1">{elderly.riskLevel}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-sky-800/50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <ShieldCheck className="h-5 w-5 text-sky-200" />
                </div>
                <div>
                  <p className="text-xs text-sky-200 font-medium">Monitoring Link</p>
                  <p className="text-sm font-bold truncate max-w-[150px]">Secure & Encrypted</p>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
          </Card>

          {/* Cognitive Performance Chart (New for F7) */}
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-500" />
                Cognitive Performance
              </CardTitle>
              <CardDescription>AI-assisted mental health analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cognitiveData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" fontSize={10} tick={{ fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                  <Radar
                    name="Performance"
                    dataKey="A"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Robot Monitor */}
          <Card className="border-none shadow-sm overflow-hidden bg-slate-900 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-sky-400" />
                Assigned Robot
              </CardTitle>
              <CardDescription className="text-slate-400">R1-Alpha Monitoring Node</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Activity</p>
                  <p className="text-sm font-bold text-sky-100">Patient Escort</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Signal</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Wifi className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">EXCELLENT</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Robot Battery</span>
                  <span className="font-bold">85%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Health Charts, Activity and Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Timeline (New for F7) */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-sky-500" />
                Daily Activity Log
              </CardTitle>
              <CardDescription>Real-time routine tracking from CareBot</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(elderly.activityLog || []).slice(0, 4).map((activity) => (
                  <div key={activity.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[8px] uppercase font-black px-1.5 py-0">
                        {activity.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-tight">{activity.message}</p>
                  </div>
                ))}
                {(!elderly.activityLog || elderly.activityLog.length === 0) && (
                  <div className="col-span-full py-4 text-center text-sm text-muted-foreground italic">
                    No activities recorded today.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Trends */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Mood Score</CardTitle>
                  <Activity className="h-4 w-4 text-sky-500" />
                </div>
                <CardDescription>7-day emotional stability</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Heart Rate</CardTitle>
                  <HeartPulse className="h-4 w-4 text-rose-500" />
                </div>
                <CardDescription>7-day average metrics</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Health Projection (New for F7 - Doctor Only) */}
          {role === 'DOCTOR' && (
            <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900 border-l-4 border-l-rose-500">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-rose-500" />
                    AI Health Projection
                  </CardTitle>
                  <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">High Confidence</Badge>
                </div>
                <CardDescription>7-day predictive risk escalation likelihood</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthData}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#f43f5e" 
                      strokeWidth={3} 
                      strokeDasharray="5 5" 
                      fillOpacity={1} 
                      fill="url(#colorRisk)" 
                      name="Projected Risk"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground italic">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  "Based on current mood volatility and heart rate trends, there is a 24% chance of stability decline by Sunday."
                </div>
              </CardFooter>
            </Card>
          )}

          {/* Clinical Assessment Panel (Doctor Only - F7) */}
          {role === 'DOCTOR' && (
            <Card className="border-none shadow-sm border-l-4 border-l-sky-500">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-sky-500" />
                  Clinical Assessment
                </CardTitle>
                <CardDescription>Professional health notes and AI risk projections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">Add Consultation Note</label>
                  <textarea 
                    className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none text-sm"
                    placeholder="Enter clinical observations or recommendations..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleAddNote} className="bg-sky-600 hover:bg-sky-700">
                      Save Note
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Previous Notes</h4>
                  {clinicalNotes.length > 0 ? (
                    clinicalNotes.slice().reverse().map((note) => (
                      <div key={note.id} className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-600">DR. SARAH JENKINS</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-700 italic">"{note.content}"</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No historical notes available.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alert Timeline */}
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Clinical Events</CardTitle>
                  <CardDescription>Complete alert and resolution history</CardDescription>
                </div>
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive" className="animate-pulse">
                    {activeAlerts.length} Active Alerts
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {alerts.length > 0 ? (
                  alerts.slice(0, 5).map((alert, i) => (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative pl-8"
                    >
                      <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <div className={`rounded-2xl p-4 border transition-all ${alert.status === 'resolved' ? 'bg-slate-50/50 dark:bg-slate-900/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className={`text-[9px] uppercase font-black tracking-widest ${alert.status === 'active' ? 'text-rose-600 border-rose-200' : 'text-slate-400 grayscale'}`}>
                                {alert.severity}
                              </Badge>
                              {alert.status === 'resolved' && (
                                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-bold">RESOLVED</Badge>
                              )}
                            </div>
                            <h4 className={`text-sm font-bold ${alert.status === 'resolved' ? 'text-slate-400' : 'text-slate-900 dark:text-slate-50'}`}>
                              {alert.message}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">No events recorded</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
