'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Bot, LayoutDashboard, Settings2, Info, Search, Filter, X } from 'lucide-react';
import { robotService } from '@/services/api/robotService';
import { RobotResponse } from '@/services/api/types';
import { useI18nStore } from '@/store/useI18nStore';
import Link from 'next/link';
import { normalizeRobotStatus } from '@/lib/utils';


export default function RobotsManagePage() {
  const { t } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchRobots = async () => {
    setLoading(true);
    try {
      const data = await robotService.getAll();
      setRobots(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRobots();
  }, []);

  // Filter logic
  const filteredRobots = useMemo(() => {
    return robots.filter((robot) => {
      const normalizedStatus = normalizeRobotStatus(robot.status);
      const matchesSearch = 
        robot.robotName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        robot.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [robots, searchQuery, statusFilter]);

  // Extract unique statuses for the filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(robots.map(r => normalizeRobotStatus(r.status)));
    return Array.from(statuses);
  }, [robots]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            <Bot className="h-8 w-8 text-indigo-600" /> {t('manager.robots.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
             {t('manager.robots.subtitle')}
          </p>
        </div>
        <Link href="/dashboard/manager/rooms">
          <Button variant="outline" className="flex items-center gap-2 border-indigo-200 hover:bg-indigo-50 transition-colors">
            <LayoutDashboard className="h-4 w-4 text-indigo-600" /> {t('manager.nav.rooms') || 'Manage via Rooms'}
          </Button>
        </Link>
      </div>

      {/* Toolbar: Search and Filter */}
      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('manager.robots.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground whitespace-nowrap">
              <Filter className="h-4 w-4" /> {t('manager.robots.filter_status')}:
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-slate-200 rounded-xl font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="ALL" className="font-medium">{t('manager.robots.all_statuses')}</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status} className="font-medium">
                    {t(`common.robot_status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || statusFilter !== 'ALL') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold gap-1"
            >
              <X className="h-3 w-3" /> {t('common.clear_all')}
            </Button>
          )}

          <div className="ml-auto text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-widest hidden lg:block">
            {filteredRobots.length} / {robots.length} {t('common.results') || 'Devices'}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center p-20 text-muted-foreground">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <span className="text-xs uppercase font-bold tracking-widest animate-pulse">Synchronizing Fleet...</span>
          </div>
        </div>
      ) : filteredRobots.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h4 className="text-xl font-bold text-slate-800">{t('common.no_data') || 'No Device Found'}</h4>
          <p className="text-muted-foreground max-w-sm text-sm mt-2 font-medium">
             {t('manager.robots.no_match_desc')}
          </p>
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="mt-6 rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold"
          >
            {t('common.view_all')}
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredRobots.map((robot) => {
            const normalizedStatus = normalizeRobotStatus(robot.status);
            const isUnassigned = !robot.assignedElderlyName;

            return (
              <Card 
                key={robot.id} 
                className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative bg-card"
              >
                {/* Header Status Bar */}
                <div className={`h-1.5 w-full ${
                  normalizedStatus === 'ACTIVE' ? 'bg-emerald-500' : 
                  normalizedStatus === 'MAINTENANCE' ? 'bg-amber-500' : 
                  'bg-slate-300'
                }`} />
                
                <CardHeader className="pb-3 pt-5 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                        {robot.robotName}
                      </CardTitle>
                      <CardDescription className="mt-1 font-mono text-[10px] uppercase opacity-60">
                         S/N: {robot.serialNumber}
                      </CardDescription>
                    </div>
                    <Badge className={`font-black text-[10px] uppercase px-2 py-0.5 rounded-md ${
                        normalizedStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                        normalizedStatus === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}>
                        {t(`common.robot_status.${normalizedStatus}`)}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4 flex-grow text-sm">
                  <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/50 p-3 space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium uppercase tracking-tighter">{t('admin.robots.card.model') || 'Model'}:</span>
                      <span className="font-bold text-foreground">{robot.model}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium uppercase tracking-tighter">{t('admin.robots.card.firmware') || 'Firmware'}:</span>
                      <span className="font-bold font-mono text-[11px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 rounded">
                        v{robot.firmwareVersion}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Info className="h-3 w-3" /> {t('admin.robots.card.assignment') || 'Deployment Status'}
                    </h5>
                    {isUnassigned ? (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 bg-amber-500/5 px-3 py-2.5 rounded-xl border border-amber-500/10">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="font-bold text-xs uppercase">{t('admin.robots.card.unassigned') || 'Ready for Assignment'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 bg-indigo-500/5 px-3 py-2.5 rounded-xl border border-indigo-500/10">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-sm" />
                        <span className="font-bold text-xs truncate">
                           {robot.assignedElderlyName}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

