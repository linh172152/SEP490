'use client';

import { useState } from 'react';
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
import { Search, Filter, ArrowRight } from 'lucide-react';
import { mockPatients } from '@/services/mock';
import Link from 'next/link';

export default function CaregiverPatientsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(search.toLowerCase()) || 
                          patient.condition.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'ALL' || patient.riskLevel === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Patient Management</h1>
          <p className="text-muted-foreground">Monitor and manage your assigned patients.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search patients or conditions..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by risk" />
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

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="w-[250px]">Patient</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Mood Score</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{patient.name}</span>
                      <span className="text-xs text-muted-foreground">{patient.age} years old</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-600 dark:text-slate-400">{patient.condition}</span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      patient.riskLevel === 'HIGH' || patient.riskLevel === 'CRITICAL'
                        ? 'border-rose-200 text-rose-700 bg-rose-50 dark:bg-rose-900/10' 
                        : patient.riskLevel === 'MEDIUM'
                        ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-900/10'
                        : 'border-teal-200 text-teal-700 bg-teal-50 dark:bg-teal-900/10'
                    }
                  >
                    {patient.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${patient.moodScore < 50 ? 'bg-rose-500' : 'bg-teal-500'}`} 
                        style={{ width: `${patient.moodScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">{patient.moodScore}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/caregiver/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm" className="hover:text-sky-600">
                      Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No patients found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
