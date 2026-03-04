import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RobotInteractionLog } from '@/types';
import { Activity, Clock } from 'lucide-react';
import { useRobotStore } from '@/store/useRobotStore';

interface InteractionLogProps {
  robotId: string;
}

export function InteractionLog({ robotId }: InteractionLogProps) {
  const { activeRobotLogs } = useRobotStore();
  const logs = activeRobotLogs.filter(l => l.robotId === robotId);

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
           <Activity className="h-5 w-5 text-sky-500" />
           Audience Interaction Logs
        </CardTitle>
        <CardDescription>A comprehensive history of robot-to-patient communication</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
           {logs.length > 0 ? logs.map(log => (
               <div key={log.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 relative">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                       <div className="flex items-center gap-2">
                           <Badge variant="outline" className="bg-white">{log.reminderType}</Badge>
                           <span className="text-xs text-slate-500 flex items-center gap-1">
                               <Clock className="h-3 w-3" /> {new Date(log.timestamp).toLocaleString()}
                           </span>
                       </div>
                       <Badge variant="secondary" className={`${
                           log.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                           log.status === 'ignored' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                       }`}>
                           {log.status.toUpperCase()}
                       </Badge>
                   </div>
                   
                   <div className="space-y-2">
                       <p className="text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                           <span className="text-sky-600 font-bold mr-2 text-xs uppercase">Robot:</span> 
                           {log.robotMessage}
                       </p>
                       
                       {log.elderlyResponse ? (
                           <div className="flex items-start gap-2 ml-4">
                               <div className="w-4 h-4 rounded-bl-xl border-b-2 border-l-2 border-slate-300 mt-2" />
                               <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg flex-1">
                                  <span className="font-bold mr-2 text-xs uppercase opacity-50">Patient ({log.delayMinutes}m delay):</span> 
                                  {log.elderlyResponse}
                               </p>
                           </div>
                       ) : (
                           <div className="flex items-start gap-2 ml-4">
                               <div className="w-4 h-4 rounded-bl-xl border-b-2 border-l-2 border-slate-300 mt-2" />
                               <p className="text-xs text-rose-500 font-medium italic mt-2">
                                  No response detected.
                               </p>
                           </div>
                       )}
                   </div>
               </div>
           )) : (
               <div className="text-center p-8 text-slate-500">
                   No interaction logs discovered for this device period.
               </div>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
