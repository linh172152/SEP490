import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Robot } from '@/types';
import { Battery, Wifi, Cpu, HardDrive, Activity } from 'lucide-react';

interface DeviceOverviewProps {
  robot: Robot;
}

export function DeviceOverview({ robot }: DeviceOverviewProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
           <Activity className="h-5 w-5 text-sky-500" />
           Device Overview
        </CardTitle>
        <CardDescription>Real-time telemetry and hardware status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Connection */}
           <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${robot.status === 'offline' ? 'bg-slate-200' : 'bg-emerald-100 text-emerald-600'}`}>
                 <Wifi className="h-5 w-5" />
              </div>
              <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Connection</p>
                  <p className="font-bold">{robot.status === 'offline' ? 'DISCONNECTED' : 'EXCELLENT'}</p>
              </div>
           </div>

           {/* Battery */}
           <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className={`p-2 rounded-lg ${robot.batteryLevel < 20 ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'}`}>
                 <Battery className="h-5 w-5" />
              </div>
              <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Battery</p>
                  <p className="font-bold">{robot.batteryLevel}%</p>
              </div>
           </div>

           {/* CPU */}
           <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                 <Cpu className="h-5 w-5" />
              </div>
              <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">CPU Load</p>
                  <p className="font-bold">{robot.cpuUsage}%</p>
              </div>
           </div>

           {/* Memory */}
           <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-fuchsia-100 text-fuchsia-600">
                 <HardDrive className="h-5 w-5" />
              </div>
              <div>
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Memory</p>
                  <p className="font-bold">{robot.memoryUsage}%</p>
              </div>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
