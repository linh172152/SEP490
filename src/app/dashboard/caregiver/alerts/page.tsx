'use client';

import { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  Check,
  Search,
  BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useElderlyStore } from '@/store/useElderlyStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CaregiverAlertsPage() {
  const { user: caregiver } = useAuthStore();
  const { getElderlyByCaregiver, alerts, resolveAlert, addAlert } = useElderlyStore();
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('active'); // Default to active alerts
  const [search, setSearch] = useState('');

  const assignedElderly = useMemo(() => 
    caregiver ? getElderlyByCaregiver(caregiver.id) : [],
  [caregiver, getElderlyByCaregiver]);

  const allAlerts = useMemo(() => {
    if (!caregiver) return [];
    const myElderlyIds = assignedElderly.map(e => e.id);
    return alerts.filter(a => myElderlyIds.includes(a.elderlyId));
  }, [caregiver, assignedElderly, alerts]);

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

  const handleGenerateMockAlerts = () => {
    if (assignedElderly.length === 0) return;
    const randomElderly1 = assignedElderly[Math.floor(Math.random() * assignedElderly.length)];
    const randomElderly2 = assignedElderly[Math.floor(Math.random() * assignedElderly.length)];
    
    addAlert(randomElderly1.id, {
        type: 'heart_rate_abnormal',
        severity: 'critical',
        message: `Critical heart rate spike detected for ${randomElderly1.name}`,
    });
    addAlert(randomElderly2.id, {
        type: 'mood_drop',
        severity: 'medium',
        message: `Sudden mood drop recorded for ${randomElderly2.name}`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-6xl mx-auto pb-10"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Alert Center</h1>
          <p className="text-muted-foreground">Monitor and resolve patient-related alerts for your care circle.</p>
        </div>
        {allAlerts.length === 0 && assignedElderly.length > 0 && (
            <Button onClick={handleGenerateMockAlerts} className="shrink-0 bg-rose-600 hover:bg-rose-700">
                <BellRing className="mr-2 h-4 w-4" /> Generate Mock Alerts
            </Button>
        )}
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

      <div className="rounded-2xl border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 h-12">
              <TableHead className="pl-6 w-1/4">Elderly Name</TableHead>
              <TableHead className="w-1/4 bg-transparent hidden sm:table-cell">Type & Message</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredAlerts.map((alert) => {
                const elderly = assignedElderly.find(e => e.id === alert.elderlyId);
                const isResolved = alert.status === 'resolved';

                return (
                  <motion.tr
                    key={alert.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`h-20 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors border-b last:border-0 ${
                        isResolved ? 'opacity-70 bg-slate-50/30' : ''
                    }`}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                         <div className={`mt-0.5 p-2 rounded-full ${isResolved ? 'bg-slate-100 text-slate-500' : alert.severity === 'critical' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 animate-pulse' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                           {alert.severity === 'critical' && !isResolved ? <AlertTriangle className="h-4 w-4" /> : <BellRing className="h-4 w-4" />}
                         </div>
                         <div className="font-semibold text-slate-900 dark:text-slate-100">
                             {elderly?.name || 'Unknown Patient'}
                         </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">{alert.type.replace(/_/g, ' ')}</span>
                        <span className={`text-sm ${isResolved ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300 font-medium'} line-clamp-2`}>
                            {alert.message}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 ${getSeverityStyles(alert.severity)}`}>
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {isResolved ? (
                        <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-900/20 dark:border-teal-800 text-[10px] uppercase font-bold">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:border-sky-800 text-[10px] uppercase font-bold">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {!isResolved ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Resolve
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled className="text-slate-400">
                          <Check className="mr-2 h-4 w-4" />
                          Handled
                        </Button>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {filteredAlerts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-2">
                      <AlertTriangle className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-slate-400">No Alerts Found</p>
                    <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => { setSeverityFilter('ALL'); setStatusFilter('ALL'); setSearch(''); }}>
                      Clear All Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
