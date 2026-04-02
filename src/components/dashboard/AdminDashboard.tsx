'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Bot, Activity, Package, LibraryBig, Loader2, Server } from 'lucide-react';
import { robotService } from '@/services/api/robotService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { userPackageService } from '@/services/api/userPackageService';
import { RobotResponse, ServicePackageResponse, UserPackageResponse } from '@/services/api/types';
import { fakeUsers } from '@/services/fakeUsers';
import { useI18nStore } from '@/store/useI18nStore';

export function AdminDashboard() {
  const { t, language } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackageResponse[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [robotsData, spData, upData] = await Promise.all([
          robotService.getAll(),
          servicePackageService.getAll(),
          userPackageService.getAll()
        ]);
        
        setRobots(robotsData || []);
        setServicePackages(spData || []);
        setUserPackages(upData || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const activeRobots = robots.filter(r => r.status && r.status.toLowerCase().includes('active')).length;
  const activePackages = servicePackages.filter(p => p.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('admin.overview.title')}</h2>
          <p className="text-muted-foreground mt-1">{t('admin.overview.welcome')}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-card">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">{t('admin.overview.total_accounts')}</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold tracking-tight">{fakeUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('admin.overview.total_accounts_desc')}</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-card">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">{t('admin.overview.robots_status')}</CardTitle>
            <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg group-hover:scale-110 transition-transform">
               <Bot className="h-4 w-4 text-teal-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>
                <div className="text-3xl font-extrabold tracking-tight text-teal-600 dark:text-teal-400">
                  {activeRobots} <span className="text-lg font-normal text-muted-foreground">/ {robots.length}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('admin.overview.robots_status_desc')}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-card">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">{t('admin.overview.service_packages')}</CardTitle>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg group-hover:scale-110 transition-transform">
               <Package className="h-4 w-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
             {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
               <>
                 <div className="text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                   {activePackages} <span className="text-lg font-normal text-muted-foreground">{t('admin.robots.status.active').toLowerCase()}</span>
                 </div>
                 <p className="text-xs text-muted-foreground mt-1">{servicePackages.length} {t('admin.overview.service_packages_desc')}</p>
               </>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.overview.recent_packages')}</CardTitle>
            <CardDescription>{t('admin.overview.recent_packages_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
          {loading ? <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.overview.table.level')}</TableHead>
                  <TableHead>{t('admin.overview.table.name')}</TableHead>
                  <TableHead>{t('admin.overview.table.price')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicePackages.slice(0, 5).map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <Badge variant={pkg.active ? "default" : "secondary"}>{pkg.level}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell>{pkg.price}</TableCell>
                  </TableRow>
                ))}
                {servicePackages.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t('admin.overview.table.no_data_packages')}</TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('admin.overview.recent_robots')}</CardTitle>
            <CardDescription>{t('admin.overview.recent_robots_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> : error ? (
              <p className="text-red-500 text-sm">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.overview.table.name')}</TableHead>
                    <TableHead>{t('admin.overview.table.model')}</TableHead>
                    <TableHead>{t('admin.overview.table.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {robots.slice(0, 5).map((robot) => (
                    <TableRow key={robot.id}>
                      <TableCell className="font-medium">{robot.robotName}</TableCell>
                      <TableCell>{robot.model}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            robot.status?.toLowerCase() === 'active' ? 'default' : 
                            robot.status?.toLowerCase() === 'maintenance' ? 'destructive' : 
                            'outline'
                          }
                        >
                          {robot.status?.toLowerCase() === 'active' ? t('admin.robots.status.active') : 
                           robot.status?.toLowerCase() === 'maintenance' ? t('admin.robots.status.maintenance') : 
                           robot.status || "UNKNOWN"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {robots.length === 0 && (
                     <TableRow>
                       <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">{t('admin.overview.table.no_data_robots')}</TableCell>
                     </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
