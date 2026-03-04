'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReminderConfig } from '@/types';
import { Clock, Plus, Trash2, CalendarHeart } from 'lucide-react';
import { useRobotStore } from '@/store/useRobotStore';

interface ReminderScheduleProps {
  robotId: string;
}

export function ReminderSchedule({ robotId }: ReminderScheduleProps) {
  const { activeReminders, addReminder, removeReminder } = useRobotStore();
  const reminders = activeReminders.filter(r => r.robotId === robotId);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<ReminderConfig['type']>('medication');
  const [time, setTime] = useState('08:00');
  const [recurrence, setRecurrence] = useState<ReminderConfig['recurrence']>('daily');
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<ReminderConfig['urgencyLevel']>('medium');

  const handleSave = async () => {
      await addReminder({
          robotId,
          type,
          time,
          recurrence,
          message,
          urgencyLevel: urgency,
          active: true
      });
      setIsAdding(false);
      setMessage('');
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
           <div>
              <CardTitle className="text-xl flex items-center gap-2">
                 <CalendarHeart className="h-5 w-5 text-indigo-500" />
                 Reminder Schedule
              </CardTitle>
              <CardDescription>Configure audible robot prompts</CardDescription>
           </div>
           {!isAdding && (
               <Button onClick={() => setIsAdding(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" /> Add Reminder
               </Button>
           )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
         {isAdding && (
             <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-4">
                 <h4 className="font-bold text-sm">New Reminder Configuration</h4>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                        <Select value={type} onValueChange={(val: any) => setType(val)}>
                           <SelectTrigger><SelectValue/></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="medication">Medication</SelectItem>
                              <SelectItem value="exercise">Exercise</SelectItem>
                              <SelectItem value="mood_check">Mood Check</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-9" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Recurrence</label>
                        <Select value={recurrence} onValueChange={(val: any) => setRecurrence(val)}>
                           <SelectTrigger><SelectValue/></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="once">Once</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Urgency</label>
                        <Select value={urgency} onValueChange={(val: any) => setUrgency(val)}>
                           <SelectTrigger><SelectValue/></SelectTrigger>
                           <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Voice Message</label>
                    <Input 
                        placeholder="e.g. It's time to take your blood pressure pill." 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)}
                    />
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" disabled={!message}>Save Schedule</Button>
                 </div>
             </div>
         )}

         <div className="space-y-3">
            {reminders.map(rem => (
                <div key={rem.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                           <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg">{rem.time}</span>
                                <span className="text-xs uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-bold">{rem.recurrence}</span>
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                                     rem.urgencyLevel === 'critical' ? 'bg-rose-100 text-rose-700' :
                                     rem.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                   {rem.urgencyLevel}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600">"{rem.message}"</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeReminder(rem.id)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            {reminders.length === 0 && !isAdding && (
                <div className="text-center p-8 text-slate-500">
                    No active reminders scheduled.
                </div>
            )}
         </div>
      </CardContent>
    </Card>
  );
}
