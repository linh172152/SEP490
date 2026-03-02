'use client';

import { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Filter,
  MoreVertical,
  Check,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useElderlyStore } from '@/store/useElderlyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { AlertSeverity } from '@/types';

export default function CaregiverAlertsPage() {
  const { user: caregiver } = useAuthStore();
  const elderlyStore = useElderlyStore();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('active'); // Default to active alerts
  const [search, setSearch] = useState('');

  const assignedElderly = useMemo(() => 
    caregiver ? elderlyStore.getElderlyByCaregiver(caregiver.id) : [],
  [caregiver, elderlyStore.elderlyList]);

  const allAlerts = useMemo(() => {
    if (!caregiver) return [];
    // For the list page, show all historical alerts for her assigned elderly
    const myElderlyIds = assignedElderly.map(e => e.id);
    return elderlyStore.alerts.filter(a => myElderlyIds.includes(a.elderlyId));
  }, [caregiver, assignedElderly, elderlyStore.alerts]);

  const filteredAlerts = allAlerts.filter(alert => {
    const elderly = assignedElderly.find(e => e.id === alert.elderlyId);
    const elderlyName = elderly?.name || '';
    const matchesSearch = elderlyName.toLowerCase().includes(search.toLowerCase()) || 
                          alert.message.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter.toLowerCase();
    const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-orange-400';
      default: return 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Alert Center</h1>
        <p className="text-muted-foreground">Monitor and resolve patient-related alerts for your care circle.</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search alerts or members..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Severity</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => {
              const elderly = assignedElderly.find(e => e.id === alert.elderlyId);
              const isResolved = alert.status === 'resolved';
              
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`overflow-hidden border-none shadow-sm group hover:ring-2 hover:ring-sky-500/10 transition-all ${isResolved ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
                    <div className="flex">
                      {/* Left Indicator bar */}
                      <div className={`w-1.5 ${isResolved ? 'bg-slate-300' : 
                        alert.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 
                        alert.severity === 'high' ? 'bg-orange-500' : 
                        alert.severity === 'medium' ? 'bg-amber-500' : 'bg-sky-500'}`} 
                      />
                      
                      <div className="flex-1 p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] ${getSeverityStyles(alert.severity)}`}>
                                {alert.severity}
                              </Badge>
                              {isResolved && (
                                <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 text-[10px] uppercase font-bold">
                                  Resolved
                                </Badge>
                              )}
                            </div>
                            <h3 className={`text-lg font-bold leading-tight ${isResolved ? 'text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                              {alert.message}
                            </h3>
                            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4" />
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{elderly?.name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(alert.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:self-center">
                            {!isResolved ? (
                              <Button 
                                size="sm" 
                                className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                                onClick={() => elderlyStore.resolveAlert(alert.id)}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Resolve
                              </Button>
                            ) : (
                              <Button variant="ghost" size="sm" disabled className="text-teal-600 font-bold dark:text-teal-400">
                                <Check className="mr-2 h-4 w-4" />
                                Handled
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-slate-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">No Alerts Found</h3>
                <p className="text-muted-foreground max-w-[250px]">Try adjusting your filters or search query.</p>
              </div>
              <Button variant="outline" onClick={() => { setSeverityFilter('ALL'); setStatusFilter('ALL'); setSearch(''); }}>
                Clear All Filters
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
