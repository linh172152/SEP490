'use client';

import { useState, useEffect } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon,
  HeartPulse, 
  Activity,
  ChevronRight,
  User,
  Plus
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';

export default function RemindersPage() {
  const { user } = useAuthStore();
  const { elderlyList, reminders, fetchDashboardData, isLoading, isUsingMock, generateDemoData } = useFamilyStore();
  
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterElderly, setFilterElderly] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(Number(user.id));
    }
  }, [user?.id, fetchDashboardData]);

  const filteredReminders = reminders.filter(r => {
    const matchesType = filterType === 'ALL' || r.reminderType === filterType;
    const matchesElderly = filterElderly === 'ALL' || r.elderlyId.toString() === filterElderly;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.elderlyName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesElderly && matchesSearch;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const groups = {
    today: filteredReminders.filter(r => {
      const date = new Date(r.scheduleTime);
      return date >= today && date < tomorrow && r.active;
    }),
    upcoming: filteredReminders.filter(r => {
      const date = new Date(r.scheduleTime);
      return date >= tomorrow && r.active;
    }),
    inactive: filteredReminders.filter(r => !r.active),
    past: filteredReminders.filter(r => {
      const date = new Date(r.scheduleTime);
      return date < today && r.active;
    })
  };

  const ReminderItem = ({ reminder }: { reminder: any }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
        reminder.reminderType === 'MEDICINE' 
          ? 'bg-rose-50 text-rose-500 dark:bg-rose-900/20' 
          : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20'
      }`}>
        {reminder.reminderType === 'MEDICINE' ? <HeartPulse className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors">
            {reminder.title}
          </h4>
          <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 h-4 ${
            reminder.reminderType === 'MEDICINE' ? 'text-rose-500 border-rose-100' : 'text-emerald-500 border-emerald-100'
          }`}>
            {reminder.reminderType}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
           <span className="flex items-center gap-1">
              <User className="h-3 w-3" /> {reminder.elderlyName}
           </span>
           <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {formatDate(reminder.scheduleTime)}
           </span>
           <span className="flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> {reminder.repeatPattern}
           </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Caregiver</span>
            <span className="text-xs font-semibold">{reminder.caregiverName || 'System'}</span>
         </div>
         {reminder.active ? (
            <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100">
               <Clock className="h-4 w-4" />
            </div>
         ) : (
            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
               <CheckCircle2 className="h-4 w-4" />
            </div>
         )}
         <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Care Reminders</h1>
          <p className="text-muted-foreground mt-1">Track medication and physical therapy schedules.</p>
        </div>
        <Button variant="outline" className="h-11 px-6 shadow-sm">
           <Plus className="mr-2 h-5 w-5" /> Schedule New
        </Button>
      </div>

      {/* Filters bar */}
      <div className="grid gap-4 md:grid-cols-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative md:col-span-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
             placeholder="Search reminders..." 
             className="pl-9 bg-muted/50 border-none px-4 h-11"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
        
        <Select value={filterElderly} onValueChange={setFilterElderly}>
           <SelectTrigger className="bg-muted/50 border-none h-11">
              <SelectValue placeholder="All Members" />
           </SelectTrigger>
           <SelectContent>
              <SelectItem value="ALL">All Members</SelectItem>
              {elderlyList.map(e => (
                 <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
              ))}
           </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
           <SelectTrigger className="bg-muted/50 border-none h-11">
              <SelectValue placeholder="All Types" />
           </SelectTrigger>
           <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="MEDICINE">Medicine Only</SelectItem>
              <SelectItem value="EXERCISE">Exercise Only</SelectItem>
           </SelectContent>
        </Select>

        <div className="flex justify-end gap-2">
           <Button variant="ghost" size="icon" onClick={() => { setFilterType('ALL'); setFilterElderly('ALL'); setSearchQuery(''); }} className="h-11 w-11 rounded-xl">
              <RotateCcw className="h-5 w-5 text-muted-foreground" />
           </Button>
           {!isUsingMock && (
             <Button variant="ghost" className="h-11 text-sky-600 hover:text-sky-700 hover:bg-sky-50 font-bold" onClick={() => user?.id && generateDemoData(Number(user.id))}>
                Load Demo
             </Button>
           )}
        </div>
      </div>

      {isLoading ? (
         <div className="flex h-[300px] items-center justify-center">
            <Clock className="h-10 w-10 animate-spin text-primary opacity-20" />
         </div>
      ) : filteredReminders.length > 0 ? (
        <div className="space-y-10">
          {groups.today.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                 <div className="h-8 w-8 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-200">
                    <CalendarIcon className="h-4 w-4" />
                 </div>
                 <h3 className="text-xl font-extrabold tracking-tight">Today</h3>
                 <Badge variant="secondary" className="bg-sky-50 text-sky-700 font-bold">{groups.today.length}</Badge>
              </div>
              <div className="grid gap-3">
                {groups.today.map(r => <ReminderItem key={r.id} reminder={r} />)}
              </div>
            </section>
          )}

          {groups.upcoming.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center gap-3 px-2 text-muted-foreground">
                 <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                 </div>
                 <h3 className="text-lg font-bold">Upcoming</h3>
              </div>
              <div className="grid gap-3">
                {groups.upcoming.map(r => <ReminderItem key={r.id} reminder={r} />)}
              </div>
            </section>
          )}

          {groups.inactive.length > 0 && (
            <section className="space-y-4">
               <div className="flex items-center gap-3 px-2 text-muted-foreground">
                 <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                 </div>
                 <h3 className="text-lg font-bold opacity-50">Completed / Inactive</h3>
              </div>
              <div className="grid gap-3 opacity-60 grayscale-[0.5]">
                {groups.inactive.map(r => <ReminderItem key={r.id} reminder={r} />)}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl">
          <Bell className="h-16 w-16 text-slate-300 mb-6 animate-bounce duration-1000" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">No reminders available</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            You haven&apos;t scheduled any medication or exercise reminders for your family members yet.
          </p>
          <Button className="bg-sky-600 hover:bg-sky-700 h-12 px-8 rounded-xl font-bold shadow-xl shadow-sky-100">
             Create First Reminder
          </Button>
        </div>
      )}
    </div>
  );
}
