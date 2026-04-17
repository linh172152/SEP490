'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Package,
  MapPin,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { getActiveUserPackageForElderly, getCatalogPackageForUserPackage, getServicePackageTheme, getUnpurchasedPackageTheme } from '@/lib/servicePackageThemes';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function ElderlyListPage() {
  const { user } = useAuthStore();
  const { elderlyList, userPackages, servicePackages, roomNames, fetchDashboardData, generateDemoData, isUsingMock } = useFamilyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const unpurchasedTheme = getUnpurchasedPackageTheme();

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(Number(user.id));
    }
  }, [user?.id, fetchDashboardData]);

  const filteredElderlies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return elderlyList;
    return elderlyList.filter((item) => item.name.toLowerCase().includes(query));
  }, [elderlyList, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Elderly</h1>
          <p className="text-muted-foreground mt-1">View profile, room, service plan, and care status for each elderly family member.</p>
        </div>
        <Button asChild className="bg-sky-600 hover:bg-sky-700">
          <Link href="/dashboard/family/elderly/create">
            <Plus className="mr-2 h-4 w-4" /> Add Elderly Profile
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            className="pl-9 bg-muted/50 border-none focus-visible:ring-sky-500"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="flex-1 md:flex-none">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <div className="text-sm text-muted-foreground">
             Total: <span className="font-bold text-foreground">{filteredElderlies.length}</span> elderly
          </div>
        </div>
      </div>

      {filteredElderlies.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredElderlies.map((elderly) => {
            const activeUserPackage = getActiveUserPackageForElderly(userPackages, elderly.id);
            const activePackage = getCatalogPackageForUserPackage(servicePackages, activeUserPackage);
            const packageTheme = getServicePackageTheme(activePackage, servicePackages);
            const hasPackage = Boolean(activePackage);

            return (
            <Card key={elderly.id} className={cn(
              'group overflow-hidden border shadow-sm transition-all duration-300 hover:shadow-xl',
              hasPackage ? packageTheme.surfaceClassName : unpurchasedTheme.surfaceClassName
            )}>
              <div className={cn('h-1.5 w-full', hasPackage ? packageTheme.accentClassName : unpurchasedTheme.accentClassName)} />
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className={cn(
                    'h-14 w-14 border-2 ring-2 ring-white transition-transform group-hover:scale-105',
                    hasPackage ? packageTheme.ringClassName : unpurchasedTheme.ringClassName
                  )}>
                    <AvatarFallback className={cn('font-bold text-lg', hasPackage ? packageTheme.subtleClassName : unpurchasedTheme.subtleClassName)}>
                      {elderly.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-bold">{elderly.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                       <Calendar className="h-3 w-3" /> Born: {new Date(elderly.dateOfBirth).toLocaleDateString()}
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
                <div className={cn(
                  'rounded-xl border p-4',
                  hasPackage ? 'border-white/60 bg-white/70 backdrop-blur-sm dark:bg-slate-900/40' : 'border-slate-200 bg-slate-50/90'
                )}>
                  <div className="grid gap-3 text-sm">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        <Activity className="h-3 w-3" /> Health Condition
                      </div>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {elderly.healthNotes || 'No specific health notes recorded.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Package className="h-4 w-4 text-emerald-500" />
                        Service Plan
                      </span>
                      {hasPackage ? (
                        <Badge variant="outline" className={packageTheme.badgeClassName}>
                          {activePackage?.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className={unpurchasedTheme.badgeClassName}>
                          Chưa mua gói
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 text-sky-500" />
                        Elderly ID
                      </span>
                      <span className="font-semibold text-foreground">#{elderly.id}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        Phong
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {elderly.roomId ? roomNames[elderly.roomId] || `Room ${elderly.roomId}` : 'Chua co phong'}
                      </span>
                    </div>
                    {!hasPackage ? (
                      <Button asChild className="mt-2 w-full bg-slate-700 hover:bg-slate-800 text-white">
                        <Link href={`/dashboard/family/packages?elderlyId=${elderly.id}&elderlyName=${encodeURIComponent(elderly.name)}`}>
                          Mua gói ngay !
                        </Link>
                      </Button>
                    ) : (
                      <div className={cn('rounded-xl px-3 py-2 text-xs font-semibold', packageTheme.subtleClassName)}>
                        {activePackage?.level} • {activePackage?.durationDays || 30} ngày • Gắn cho {elderly.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HeartPulse className="h-4 w-4 text-rose-500" />
                    DOB: <span className="font-bold text-foreground">{new Date(elderly.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Language: <span className="font-bold uppercase text-foreground">{elderly.preferredLanguage}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1 text-sky-600 border-sky-100 hover:bg-sky-50 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300" asChild>
                    <Link href={`/dashboard/family/elderly/${elderly.id}`}>
                      Xem detail
                    </Link>
                  </Button>
                  {!hasPackage ? (
                    <Button asChild className="bg-slate-700 hover:bg-slate-800 text-white">
                      <Link href={`/dashboard/family/packages?elderlyId=${elderly.id}&elderlyName=${encodeURIComponent(elderly.name)}`}>
                        Mua gói
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </CardFooter>
            </Card>
          );})}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30 backdrop-blur-sm shadow-inner">
          <div className="h-24 w-24 rounded-full bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center mb-6 shadow-sm border border-sky-100">
            <Users className="h-12 w-12 text-sky-500" />
          </div>
           <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Add Your First Elderly Profile</h2>
          <p className="text-muted-foreground max-w-sm mb-8 text-lg">
            Create an elderly profile to start following alerts, health activity, room assignment, and service plan information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
             <Button asChild className="bg-sky-600 hover:bg-sky-700 min-w-[200px] h-12 text-lg">
                <Link href="/dashboard/family/elderly/create">
                 Add First Elderly
                </Link>
             </Button>
             {!isUsingMock && (
                <Button 
                   onClick={() => user?.id && generateDemoData(Number(user.id))}
                   variant="outline" 
                   className="min-w-[150px] h-12"
                >
                   Try Demo Data
                </Button>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
