'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  HeartPulse, 
  Clock 
} from 'lucide-react';
import { mockPatients, mockAlerts, mockMoodHistory } from '@/services/mock';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function CaregiverDashboard() {
  const unreadAlerts = mockAlerts.filter(a => !a.isRead);

  // Format data for chart
  const chartData = mockMoodHistory.map(log => ({
    name: new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    score: log.score
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Caregiver Dashboard</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {mockPatients.length} Active Patients
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Mood Score</CardTitle>
            <HeartPulse className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72/100</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Robots</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">1 charging</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mood & Medication Trends</CardTitle>
            <CardDescription>
              Patient mood score tracking over the last 5 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              Latest notifications from CareBots
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAlerts.map(alert => (
                <div key={alert.id} className="flex items-start space-x-4 rounded-md border p-3">
                  <AlertTriangle className={`mt-0.5 h-5 w-5 ${alert.isRead ? 'text-muted-foreground' : 'text-destructive'}`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.type.replace('_', ' ')}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  {!alert.isRead && (
                    <Badge variant="destructive">New</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Patient List Summary */}
      <h3 className="mt-8 text-xl font-semibold">Assigned Patients</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {mockPatients.map(patient => (
          <Card key={patient.id} className="overflow-hidden">
            <div className={`h-2 w-full ${patient.riskLevel === 'HIGH' ? 'bg-destructive' : patient.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{patient.name}, {patient.age}</CardTitle>
                <Badge variant={patient.riskLevel === 'HIGH' ? 'destructive' : 'outline'}>
                  {patient.riskLevel} RISK
                </Badge>
              </div>
              <CardDescription>{patient.condition}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Mood:</span>
                <span className="font-semibold">{patient.moodScore}/100</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Last Meds:</span>
                <span>{new Date(patient.lastMedication).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
