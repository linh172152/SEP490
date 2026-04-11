'use client';

import { useMemo, useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HeartPulse, 
  Activity,
  ChevronRight,
  ArrowLeft,
  Stethoscope,
  ShieldCheck,
  Calendar,
  TrendingUp,
  Bot,
  Clock,
  Volume2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
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
import { useElderlyProfileStore } from '@/store/useElderlyProfileStore';
import { reminderService } from '@/services/api/reminderService';
import { ReminderResponse } from '@/services/api/types';
import Link from 'next/link';
import { differenceInYears } from 'date-fns';

interface ElderlyDetailViewProps {
  elderlyId: string;
  role: 'FAMILY' | 'CAREGIVER' | 'DOCTOR';
}

export function ElderlyDetailView({ elderlyId, role }: ElderlyDetailViewProps) {
  const { currentProfile: elderly, fetchProfileById, isLoading } = useElderlyProfileStore();
  
  const [reminders, setReminders] = useState<ReminderResponse[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);

  useEffect(() => {
    if (elderlyId) {
      fetchProfileById(Number(elderlyId));
    }
  }, [elderlyId, fetchProfileById]);

  useEffect(() => {
    if (!elderly) return;

    const loadReminders = async () => {
      setRemindersLoading(true);
      try {
        const data = await reminderService.getByElderlyId(elderly.id);
        setReminders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setRemindersLoading(false);
      }
    };

    loadReminders();
  }, [elderly]);

  // Deterministic mock data for health trends (F7 Mock Requirements)
  const healthData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const hash = elderly?.name.length || i;
      const jitter = ((hash + i) * 3) % 5;
      return {
        name: day,
        mood: 60 + Math.sin((i + hash) * 0.5) * 20 + jitter,
        heartRate: 72 + Math.cos((i + hash) * 0.5) * 10 + jitter,
        cognitive: 70 + Math.sin((i + hash) * 0.8) * 15,
        score: 50 + Math.cos(i) * 30
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

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Activity className="h-10 w-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!elderly) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Stethoscope className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold">Profile Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          We couldn&apos;t locate the elderly profile you&apos;re looking for.
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

  const age = differenceInYears(new Date(), new Date(elderly.dateOfBirth));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/dashboard/${role.toLowerCase()}`} className="hover:text-primary transition-colors">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{elderly.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-none shadow-xl bg-gradient-to-b from-sky-600 to-sky-700 text-white overflow-hidden">
            <div className="relative p-6">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <HeartPulse className="h-32 w-32" />
              </div>
              <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <Avatar className="h-24 w-24 border-4 border-white/20 ring-4 ring-white/10 ring-offset-4 ring-offset-sky-600 shadow-2xl">
                  <AvatarFallback className="bg-sky-400 text-3xl font-bold">{elderly.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{elderly.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-1 text-sky-100/80">
                    <span>{age} Years</span>
                    <span>•</span>
                    <span className="capitalize">{elderly.preferredLanguage}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-3 py-1">
                    <Volume2 className="h-3 w-3 mr-1.5" />
                    {elderly.speakingSpeed} speed
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner text-center">
                  <p className="text-[10px] uppercase font-bold text-sky-100 tracking-wider">Language</p>
                  <p className="text-lg font-bold mt-1 truncate">{elderly.preferredLanguage}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner text-center">
                  <p className="text-[10px] uppercase font-bold text-sky-100 tracking-wider">Voice Speed</p>
                  <p className="text-lg font-bold mt-1 capitalize">{elderly.speakingSpeed}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-sky-800/50 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <ShieldCheck className="h-5 w-5 text-sky-200" />
                </div>
                <div>
                  <p className="text-xs text-sky-200 font-medium">Profile Secure</p>
                  <p className="text-sm font-bold">Verified Member</p>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-sky-500" />
                Cognitive Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={cognitiveData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" fontSize={10} tick={{ fill: '#64748b' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={8} />
                  <Radar name="Performance" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.5} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="reminders">Reminders</TabsTrigger>
              <TabsTrigger value="room">Room</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-sky-500" />
                    Health Summary
                  </CardTitle>
                  <CardDescription>Documented medical conditions and notes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-widest">
                      <Stethoscope className="h-4 w-4" /> Medical History & Notes
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {elderly.healthNotes || "No specific health notes recorded yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">Mood Trends</CardTitle>
                      <Activity className="h-4 w-4 text-sky-500" />
                    </div>
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
                        <Tooltip />
                        <Area type="monotone" dataKey="mood" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorMood)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold">Cardiac Metrics</CardTitle>
                      <HeartPulse className="h-4 w-4 text-rose-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-[200px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold">Communication Stats</CardTitle>
                      <CardDescription>Daily interaction metrics with CareBot</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 flex flex-col gap-1">
                       <div className="text-[10px] font-bold text-sky-600 uppercase tracking-tighter">Avg Res Time</div>
                       <div className="text-xl font-black text-slate-800 dark:text-slate-100">1.2s</div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 flex flex-col gap-1">
                       <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Bot Accuracy</div>
                       <div className="text-xl font-black text-slate-800 dark:text-slate-100">98%</div>
                    </div>
                    <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 flex flex-col gap-1">
                       <div className="text-[10px] font-bold text-violet-600 uppercase tracking-tighter">Daily Words</div>
                       <div className="text-xl font-black text-slate-800 dark:text-slate-100">1,402</div>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 flex flex-col gap-1">
                       <div className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter">Interaction</div>
                       <div className="text-xl font-black text-slate-800 dark:text-slate-100">High</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reminders" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-sky-500" />
                    Reminders
                  </CardTitle>
                  <CardDescription>Scheduled reminders and notifications for {elderly.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {remindersLoading ? (
                    <div className="flex h-[200px] w-full items-center justify-center">
                      <Activity className="h-8 w-8 animate-spin text-sky-500" />
                    </div>
                  ) : reminders.length > 0 ? (
                    <div className="space-y-4">
                      {reminders.map((reminder) => (
                        <div key={reminder.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
                              <Clock className="h-5 w-5 text-sky-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{reminder.title}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{reminder.reminderType}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(reminder.scheduleTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={reminder.active ? "default" : "secondary"}>
                            {reminder.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <Clock className="h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">No Reminders</h3>
                      <p className="text-slate-500 dark:text-slate-500 mt-2">
                        No reminders have been scheduled for {elderly.name} yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="room" className="space-y-6 mt-6">
              <Card className="border-none shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Bot className="h-5 w-5 text-sky-500" />
                    Room Information
                  </CardTitle>
                  <CardDescription>Room details and CareBot status for {elderly.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Bot className="h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400">Room Information</h3>
                    <p className="text-slate-500 dark:text-slate-500 mt-2">
                      Room assignment information will be displayed here when available.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
