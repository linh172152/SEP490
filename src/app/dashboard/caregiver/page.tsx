'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useElderlyStore } from '@/store/useElderlyStore';
import { Users, AlertTriangle, AlertCircle, Bot, Activity, Heart, Brain, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertSeverity } from '@/types';
import { useRouter } from 'next/navigation';

export default function CaregiverOverviewPage() {
  const router = useRouter();
  const { elderlyList, alerts, resolveAlert } = useElderlyStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalPatients = elderlyList.length;
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const recentAlerts = alerts.slice(0, 5); // Latest 5 alerts

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 hover:bg-red-600';
      case 'high': return 'bg-orange-500 hover:bg-orange-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'low': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  const getStatusBadge = (riskLevel: string) => {
    switch(riskLevel) {
      case 'LOW': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Stable</Badge>
      case 'MEDIUM': return <Badge className="bg-amber-500 hover:bg-amber-600">Warning</Badge>
      case 'HIGH': return <Badge className="bg-red-500 hover:bg-red-600">Critical</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your assigned patients and overall alerts.</p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {/* Summary Cards */}
        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assigned Patients</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPatients}</div>
              <p className="text-xs text-muted-foreground">Currently under your care</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Immediate action required</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Robots Online</CardTitle>
              <Bot className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2/2</div>
              <p className="text-xs text-muted-foreground">All systems operational</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Patient Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="col-span-1 h-full shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assigned Patients</CardTitle>
                <CardDescription>Quick overview of patient vitals</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/caregiver/patients')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {elderlyList.slice(0, 3).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between group">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt={patient.name} />
                        <AvatarFallback>{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">{patient.name}</p>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1 text-rose-500" />
                            {patient.healthStatus.heartRate} bpm
                          </span>
                          <span className="flex items-center">
                            <Brain className="h-3 w-3 mr-1 text-purple-500" />
                            Mood: {patient.healthStatus.moodScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(patient.riskLevel || 'LOW')}
                    </div>
                  </div>
                ))}
                {elderlyList.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-sm">
                    No patients assigned yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Alerts */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="col-span-1 h-full shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest notifications from your patients</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/caregiver/alerts')}>
                All Alerts
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAlerts.map((alert) => {
                  const patient = elderlyList.find(e => e.id === alert.elderlyId);
                  return (
                    <motion.div 
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start space-x-4 p-3 rounded-lg border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <div className={`mt-0.5 p-1.5 rounded-full ${alert.status === 'active' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                         <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            {patient?.name || 'Unknown Patient'}
                          </p>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <Badge className={`${getSeverityColor(alert.severity as AlertSeverity)} text-[10px] px-1.5 py-0`}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.status === 'active' ? (
                            <button 
                              onClick={() => resolveAlert(alert.id)}
                              className="text-[10px] font-medium text-blue-500 hover:text-blue-700 hover:underline"
                            >
                              Mark Resolved
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-500 flex items-center"><Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600">Resolved</Badge></span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {recentAlerts.length === 0 && (
                  <div className="text-center py-10 flex flex-col items-center justify-center text-muted-foreground">
                    <Bot className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">No recent alerts.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
