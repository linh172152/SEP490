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
import { 
  Bot, 
  Package, 
  Loader2, 
  Activity, 
  TrendingUp, 
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { robotService } from '@/services/api/robotService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { userPackageService } from '@/services/api/userPackageService';
import { RobotResponse, ServicePackageResponse, UserPackageResponse } from '@/services/api/types';
import { useI18nStore } from '@/store/useI18nStore';

// Mock data for analytics
const analyticsData = [
  { name: 'Mon', usage: 400, interactions: 240 },
  { name: 'Tue', usage: 300, interactions: 139 },
  { name: 'Wed', usage: 200, interactions: 980 },
  { name: 'Thu', usage: 278, interactions: 390 },
  { name: 'Fri', usage: 189, interactions: 480 },
  { name: 'Sat', usage: 239, interactions: 380 },
  { name: 'Sun', usage: 349, interactions: 430 },
];

export function ManagerDashboard() {
  const { t } = useI18nStore();
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
  const totalAssignments = userPackages.length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
             Quản Lý Vận Hành
          </h2>
          <p className="text-muted-foreground mt-1">
             Theo dõi hiệu suất Robot, dịch vụ và phân tích hành vi người dùng.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-indigo-50/50 dark:bg-indigo-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Nhóm Robot</CardTitle>
            <Bot className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{robots.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Đã đăng ký hệ thống</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-50/50 dark:bg-emerald-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Robot Hoạt Động</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{activeRobots}</div>
            <p className="text-xs text-muted-foreground mt-1">Đang trực tuyến (Online)</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gói Đang Sử Dụng</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">Tổng cộng các bàn giao</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cần Bảo Trì</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
               {robots.filter(r => r.status?.toLowerCase().includes('maintenance')).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Yêu cầu can thiệp kỹ thuật</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-indigo-500" />
               Xu Hướng Sử Dụng Robot
            </CardTitle>
            <CardDescription>
               Thống kê số lượt tương tác và thời gian hoạt động của Robot theo tuần.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="usage" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
                <Area type="monotone" dataKey="interactions" stroke="#ec4899" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Activity className="h-5 w-5 text-pink-500" />
               Hiệu Quả Tương Tác
            </CardTitle>
            <CardDescription>
               Phân tích mức độ gắn kết của người dùng với CareBot.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-around h-[300px]">
             <div className="space-y-4">
               <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-muted-foreground">Tỷ lệ hoàn thành nhiệm vụ</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full w-[92%]" />
                  </div>
               </div>
               <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-muted-foreground">Phản hồi giọng nói chuẩn</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-pink-500 h-2 rounded-full w-[85%]" />
                  </div>
               </div>
               <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-muted-foreground">Tự động sạc thành công</span>
                    <span className="font-bold">98%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[98%]" />
                  </div>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables (Moved from Admin) */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Đội Robot Phân Bổ</CardTitle>
            <CardDescription>Danh sách Robot đang được Manager quản lý.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Robot</TableHead>
                    <TableHead>Dòng máy</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {robots.slice(0, 5).map((robot) => (
                    <TableRow key={robot.id}>
                      <TableCell className="font-medium">{robot.robotName}</TableCell>
                      <TableCell>{robot.model}</TableCell>
                      <TableCell>
                        <Badge variant={robot.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                          {robot.status || "UNKNOWN"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gói Dịch Vụ Khả Dụng</CardTitle>
            <CardDescription>Các cấu hình dịch vụ Manager đang điều phối.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên gói</TableHead>
                    <TableHead>Cấp độ</TableHead>
                    <TableHead>Giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicePackages.slice(0, 5).map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>
                         <Badge variant="outline">{pkg.level}</Badge>
                      </TableCell>
                      <TableCell>{pkg.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
