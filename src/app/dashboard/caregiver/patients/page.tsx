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
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, ArrowRight, UserPlus, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { useElderlyStore } from '@/store/useElderlyStore';
import { useAuthStore } from '@/store/useAuthStore';

export default function CaregiverPatientsPage() {
  const { user: caregiver } = useAuthStore();
  const getElderlyByCaregiver = useElderlyStore((state) => state.getElderlyByCaregiver);
  
  const elderlyList = useMemo(() => 
    caregiver ? getElderlyByCaregiver(caregiver.id) : [], 
  [caregiver, getElderlyByCaregiver]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filteredPatients = elderlyList.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                          e.condition.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || e.riskLevel === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Member Directory</h1>
          <p className="text-muted-foreground">Detailed health metrics for your assigned care circle.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name or medical condition..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[200px] h-11">
              <SelectValue placeholder="All Risk Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Risk Levels</SelectItem>
              <SelectItem value="LOW">Low Risk</SelectItem>
              <SelectItem value="MEDIUM">Medium Risk</SelectItem>
              <SelectItem value="HIGH">High Risk</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 h-12">
              <TableHead className="pl-6">Member</TableHead>
              <TableHead>Primary Condition</TableHead>
              <TableHead>Health Status</TableHead>
              <TableHead>Vitals</TableHead>
              <TableHead className="text-right pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((member) => (
              <TableRow key={member.id} className="h-20 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-11 w-11 border-2 border-slate-100 ring-2 ring-white">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="font-bold text-sky-600 bg-sky-50">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">{member.name}</span>
                      <span className="text-xs text-muted-foreground font-medium">{member.age} years</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{member.condition}</span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`h-7 px-3 rounded-full border-2 ${
                      member.riskLevel === 'CRITICAL' ? 'border-rose-200 bg-rose-50 text-rose-700' :
                      member.riskLevel === 'HIGH' ? 'border-rose-100 bg-rose-50/50 text-rose-600' :
                      member.riskLevel === 'MEDIUM' ? 'border-amber-100 bg-amber-50 text-amber-700' :
                      'border-teal-100 bg-teal-50 text-teal-700'
                    }`}
                  >
                    {member.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       <HeartPulse className="h-3 w-3 text-rose-500" />
                       <span className="text-xs font-bold">{member.healthStatus.heartRate} BPM</span>
                    </div>
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-sky-500" style={{ width: `${member.healthStatus.moodScore}%` }} />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button variant="ghost" size="sm" asChild className="hover:bg-sky-50 hover:text-sky-600 rounded-lg h-10 px-4">
                    <Link href={`/dashboard/caregiver/patients/${member.id}`}>
                      Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserPlus className="h-10 w-10 text-slate-200" />
                    <p className="text-lg font-bold text-slate-400">No members found</p>
                    <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
