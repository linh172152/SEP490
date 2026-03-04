'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Battery, Wifi, AlertTriangle, ArrowRight, Activity, Settings2, Search } from 'lucide-react';
import { useRobotStore } from '@/store/useRobotStore';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RobotManagementPage() {
  const { robots, fetchRobots, isLoading } = useRobotStore();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Caregiver ID should be pulled from auth, mocking string for now based on service
    fetchRobots('mock-caregiver');
  }, [fetchRobots]);

  const filteredRobots = robots.filter(robot => {
      const matchesSearch = robot.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            robot.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                            (filter === 'online' && robot.status === 'online') ||
                            (filter === 'offline' && robot.status === 'offline') ||
                            (filter === 'attention' && robot.status === 'needs_attention');
                            
      return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Device Management</h1>
        <p className="text-muted-foreground">Monitor and configure the IoT Carebot fleet assigned to your rooms.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search robot name or ID..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="attention">Needs Attention</SelectItem>
                </SelectContent>
             </Select>
          </div>
      </div>

      {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-slate-100 rounded-xl"></div>
              ))}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRobots.length > 0 ? filteredRobots.map(robot => (
              <Card key={robot.id} className="overflow-hidden hover:shadow-md transition-all border-slate-200 dark:border-slate-800 flex flex-col">
                <div className={`h-1.5 w-full ${
                    robot.status === 'online' ? 'bg-emerald-500' : 
                    robot.status === 'needs_attention' ? 'bg-amber-500' : 'bg-slate-300'
                }`} />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                           <Bot className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                           <CardTitle className="text-lg">{robot.name}</CardTitle>
                           <CardDescription className="text-xs font-mono">{robot.id}</CardDescription>
                        </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                   <div className="flex items-center justify-between">
                       <Badge variant="outline" className={`capitalize ${
                           robot.status === 'online' ? 'bg-emerald-50 text-emerald-700' :
                           robot.status === 'needs_attention' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'
                       }`}>
                           {robot.status.replace('_', ' ')}
                       </Badge>
                       <div className="flex items-center gap-1.5 text-xs text-slate-500">
                           <Wifi className={`h-3 w-3 ${robot.status !== 'offline' ? 'text-emerald-500' : ''}`} />
                           {new Date(robot.lastHeartbeat).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 pt-2">
                       <div className="space-y-1">
                           <div className="flex items-center gap-1 text-slate-500 text-xs">
                               <Battery className="h-3.5 w-3.5" /> Battery
                           </div>
                           <p className={`font-medium ${robot.batteryLevel < 20 ? 'text-rose-600' : ''}`}>{robot.batteryLevel}%</p>
                       </div>
                       <div className="space-y-1">
                           <div className="flex items-center gap-1 text-slate-500 text-xs">
                               <Settings2 className="h-3.5 w-3.5" /> Firmware
                           </div>
                           <p className="font-medium text-sm">{robot.firmwareVersion}</p>
                       </div>
                   </div>

                   {robot.status === 'needs_attention' && (
                       <div className="bg-amber-50 border border-amber-100 rounded-md p-2 flex items-start gap-2 text-xs text-amber-800 mt-2">
                           <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                           <p>Device reported low battery or missed interactions.</p>
                       </div>
                   )}
                </CardContent>
                <div className="p-4 pt-0 mt-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <Button asChild className="w-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 shadow-sm" variant="secondary">
                       <Link href={`/dashboard/caregiver/robots/${robot.id}`}>
                           Manage Device <ArrowRight className="ml-2 h-4 w-4" />
                       </Link>
                    </Button>
                </div>
              </Card>
            )) : (
              <div className="col-span-full py-20 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Bot className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">No Devices Found</h3>
                  <p className="text-slate-500 mt-1 max-w-sm text-sm">We couldn't find any robots matching your current filter criteria.</p>
                  <Button variant="outline" className="mt-4" onClick={() => { setFilter('all'); setSearchQuery(''); }}>
                      Clear Filters
                  </Button>
              </div>
            )}
          </div>
      )}
    </div>
  );
}
