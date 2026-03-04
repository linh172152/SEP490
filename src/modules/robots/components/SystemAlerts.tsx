import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Robot } from '@/types';
import { AlertTriangle, Info } from 'lucide-react';
import { useRobotStore } from '@/store/useRobotStore';

interface SystemAlertsProps {
  robot: Robot;
}

export function SystemAlerts({ robot }: SystemAlertsProps) {
  const { activeReminders, activeRobotLogs } = useRobotStore();
  
  // Calculate mock alerts based on state
  const alerts = [];
  
  if (robot.status === 'offline') {
      alerts.push({
          id: 'alert-1',
          severity: 'critical',
          message: 'Device has disconnected from the central network gateway. Cannot receive reminders.'
      });
  } else if (robot.status === 'needs_attention' || robot.batteryLevel < 20) {
      alerts.push({
          id: 'alert-2',
          severity: 'high',
          message: `Hardware battery critically low (${robot.batteryLevel}%). Please charge immediately to prevent shutdown.`
      });
  }

  // Scan logs for high amount of missed/ignored interactions
  const missedLogs = activeRobotLogs.filter(l => l.robotId === robot.id && l.status !== 'completed');
  if (missedLogs.length > 2) {
      alerts.push({
          id: 'alert-3',
          severity: 'medium',
          message: 'Patient has ignored more than 2 consecutive device interaction prompts recently.'
      });
  }

  return (
    <Card className="border-none shadow-sm border-l-4 border-l-amber-500">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
           <AlertTriangle className="h-5 w-5 text-amber-500" />
           System Alerts
        </CardTitle>
        <CardDescription>Escalated hardware and behavioral anomalies</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="space-y-3">
             {alerts.length > 0 ? alerts.map(alert => (
                 <div key={alert.id} className={`p-4 rounded-xl flex items-start gap-3 border ${
                     alert.severity === 'critical' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                     alert.severity === 'high' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                     'bg-amber-50 border-amber-200 text-amber-800'
                 }`}>
                     <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                     <p className="font-medium text-sm leading-relaxed">{alert.message}</p>
                 </div>
             )) : (
                 <div className="flex items-center gap-2 p-6 rounded-xl bg-emerald-50 text-emerald-700 justify-center">
                     <Info className="h-5 w-5" />
                     <p className="font-bold text-sm">System Normal. No alerts active.</p>
                 </div>
             )}
         </div>
      </CardContent>
    </Card>
  );
}
