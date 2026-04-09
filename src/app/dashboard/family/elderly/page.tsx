'use client';

import { useEffect } from 'react';
import { useElderlyProfileStore } from '@/store/useElderlyProfileStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  HeartPulse,
  Activity,
  Calendar,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function ElderlyListPage() {
  const { user } = useAuthStore();
  const { profiles, fetchProfiles } = useElderlyProfileStore();

  useEffect(() => {
    if (user?.id) {
      fetchProfiles(Number(user.id));
    }
  }, [user?.id, fetchProfiles]);
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Elderly Management</h1>
          <p className="text-muted-foreground mt-1">Manage profiles and care circles for your loved ones.</p>
        </div>
        <Button asChild className="bg-sky-600 hover:bg-sky-700">
          <Link href="/dashboard/family/elderly/create">
            <Plus className="mr-2 h-4 w-4" /> Add New Member
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name..." className="pl-9 bg-muted/50 border-none focus-visible:ring-sky-500" />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <div className="text-sm text-muted-foreground">
             Total: <span className="font-bold text-foreground">{profiles.length}</span> members
          </div>
        </div>
      </div>

      {profiles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((elderly) => (
            <Card key={elderly.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900">
              <div className="h-1.5 w-full bg-sky-500" />
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-sky-100 ring-2 ring-white group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-sky-50 text-sky-600 font-bold text-lg">
                      {(elderly.name || 'User').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-bold">{elderly.name || 'Unknown'}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                       <Calendar className="h-3 w-3" /> Born: {elderly.dateOfBirth ? new Date(elderly.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/family/elderly/${elderly.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/family/elderly/${elderly.id}/edit`} className="flex items-center gap-2">
                        <Edit2 className="h-4 w-4" /> Edit Profile
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="space-y-4 pt-2">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      <Activity className="h-3 w-3" /> Health Condition
                   </div>
                   <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {elderly.healthNotes || 'No specific health notes recorded.'}
                   </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <HeartPulse className="h-4 w-4 text-rose-500" />
                      Risk Level: <span className="font-bold text-emerald-600 uppercase">Low</span>
                   </div>
                   <div className="text-muted-foreground">
                      Language: <span className="font-bold uppercase text-foreground">{elderly.preferredLanguage || 'Not specified'}</span>
                   </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-50 dark:border-slate-800/50">
                <Button variant="outline" className="w-full text-sky-600 border-sky-100 hover:bg-sky-50 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300" asChild>
                  <Link href={`/dashboard/family/elderly/${elderly.id}`}>
                    Manage Care Circle
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30 backdrop-blur-sm shadow-inner">
          <div className="h-24 w-24 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-6 shadow-sm border border-sky-100">
            <Users className="h-12 w-12 text-sky-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Build Your Care Circle</h2>
          <p className="text-muted-foreground max-w-sm mb-8 text-lg">
            Add your elderly family members to start monitoring their health and coordinating care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
             <Button asChild className="bg-sky-600 hover:bg-sky-700 min-w-[200px] h-12 text-lg">
                <Link href="/dashboard/family/elderly/create">
                   Add First Member
                </Link>
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
