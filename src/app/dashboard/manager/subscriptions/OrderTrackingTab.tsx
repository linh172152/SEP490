'use client';

import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Package,
  History as HistoryIcon,
  TrendingUp,
  CreditCard,
  CalendarDays,
  Stethoscope
} from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { userPackageService } from '@/services/api/userPackageService';
import { accountService } from '@/services/api/accountService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { elderlyService } from '@/services/api/elderlyService';
import { 
  UserPackageResponse, 
  AccountResponse, 
  ServicePackageResponse, 
  ElderlyProfileResponse 
} from '@/services/api/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function OrderTrackingTab() {
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<UserPackageResponse[]>([]);
  const [accounts, setAccounts] = useState<Record<number, AccountResponse>>({});
  const [packages, setPackages] = useState<Record<number, ServicePackageResponse>>({});
  const [elderly, setElderly] = useState<Record<number, ElderlyProfileResponse>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<UserPackageResponse | null>(null);

  // Timezone correction for Vietnam (UTC+7)
  const adjustDateTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return null;
    // If the date string doesn't have a timezone indicator, assume it's UTC
    if (typeof dateStr === 'string' && !dateStr.includes('Z') && !dateStr.includes('+')) {
      const isoStr = dateStr.includes('T') ? dateStr + 'Z' : dateStr.replace(' ', 'T') + 'Z';
      const date = new Date(isoStr);
      if (!isNaN(date.getTime())) return date;
    }
    return new Date(dateStr);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [orderData, accountData, packageData, elderlyData] = await Promise.all([
          userPackageService.getAll(),
          accountService.getAccounts(),
          servicePackageService.getAll(),
          elderlyService.getAll()
        ]);

        setOrders(orderData || []);
        
        const accMap: Record<string, AccountResponse> = {};
        (accountData || []).forEach((a: any) => {
          const id = a.id ?? a.Id ?? a.ID;
          if (id !== undefined) accMap[String(id)] = a;
        });
        setAccounts(accMap as any);

        const pkgMap: Record<string, ServicePackageResponse> = {};
        (packageData || []).forEach((p: any) => {
          const id = p.id ?? p.Id ?? p.ID;
          if (id !== undefined) pkgMap[String(id)] = p;
        });
        setPackages(pkgMap as any);

        const eldMap: Record<string, ElderlyProfileResponse> = {};
        (elderlyData || []).forEach((e: any) => {
          const id = e.id ?? e.Id ?? e.ID;
          if (id !== undefined) eldMap[String(id)] = e;
        });
        setElderly(eldMap as any);

      } catch (error) {
        console.error("Failed to fetch order data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 gap-1 rounded-lg px-3 py-1 font-bold">
            <CheckCircle2 className="h-3 w-3" /> {t('common.status_labels.success') || 'PAID'}
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 gap-1 rounded-lg px-3 py-1 font-bold">
            <Clock className="h-3 w-3" /> {t('common.status_labels.pending') || 'PENDING'}
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 gap-1 rounded-lg px-3 py-1 font-bold">
            <XCircle className="h-3 w-3" /> {t('common.status_labels.error') || 'FAILED'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRemainingDays = (expiredAt: string | null) => {
    if (!expiredAt) return null;
    const now = new Date();
    const exp = new Date(expiredAt);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

    const filteredOrders = orders.filter(order => {
      const acc = accounts[order.accountId as number];
      const pkg = packages[order.servicePackageId as number];
      const eld = elderly[order.elderlyProfileId as number];
  
      const matchesSearch = 
        (acc?.fullName || acc?.FullName || acc?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (eld?.fullName || eld?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
  
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
       const dateA = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
       const dateB = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
       return dateB - dateA;
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Cards / Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-200/50 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold opacity-80 uppercase tracking-wider">{t('manager.dashboard.revenue_overview') || 'Total Revenue'}</CardTitle>
            <div className="text-3xl font-black flex items-baseline gap-2">
              {orders.filter(o => o.status === 'PAID').reduce((acc, curr) => acc + (packages[curr.servicePackageId as number]?.price || 0), 0).toLocaleString()} ₫
              <div className="bg-white/20 p-1 rounded-lg">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs opacity-70 font-medium">{t('manager.dashboard.revenue_desc') || 'Accumulated from all successful subscriptions'}</p>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('manager.dashboard.active_subscriptions') || 'Active Subscriptions'}</CardTitle>
            <div className="text-3xl font-black text-slate-900 flex items-baseline gap-2">
              {orders.filter(o => {
                if (o.status !== 'PAID') return false;
                const pkg = packages[o.servicePackageId as number];
                let exp = o.expiredAt;
                if (!exp && pkg && o.assignedAt) {
                  exp = addDays(new Date(o.assignedAt), pkg.durationDays).toISOString();
                }
                const days = getRemainingDays(exp || null);
                return days === null || days > 0;
              }).length}
               <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium font-bold">{t('manager.dashboard.subscription_desc') || 'Premium & Standard Tiers'}</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-xl shadow-slate-200/50 rounded-3xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('manager.subscriptions.pending_list_title') || 'Pending Orders'}</CardTitle>
            <div className="text-3xl font-black text-amber-500 flex items-baseline gap-2">
              {orders.filter(o => o.status === 'PENDING').length}
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400 font-medium font-bold italic">{t('manager.orders.subtitle') || 'Awaiting manager confirmation'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-2xl shadow-indigo-100/30 rounded-[2.5rem] overflow-hidden bg-white/70 backdrop-blur-xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100/50 bg-slate-50/30 px-8 py-8">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              <HistoryIcon className="h-7 w-7 text-indigo-600" />
              {t('manager.orders.title') || 'Order Management'}
            </CardTitle>
            <CardDescription className="text-slate-500 font-bold">
              {t('manager.orders.subtitle') || 'Monitor real-time payment states and subscription lifecycles.'}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <Input 
                placeholder={t('common.search') ||"Search orders..."} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-6 w-[280px] rounded-2xl border-slate-200 bg-white/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-[52px] rounded-2xl border-slate-200 bg-white shadow-sm font-bold">
                <Filter className="h-4 w-4 mr-2 text-indigo-600" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                <SelectItem value="all" className="font-bold">All Orders</SelectItem>
                <SelectItem value="PAID" className="font-bold text-emerald-600">PAID</SelectItem>
                <SelectItem value="PENDING" className="font-bold text-amber-600">PENDING</SelectItem>
                <SelectItem value="FAILED" className="font-bold text-rose-600">FAILED</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="py-6 px-8 font-black text-slate-400 text-xs uppercase tracking-widest leading-none align-middle">{t('manager.orders.title') || 'Order Details'}</TableHead>
                <TableHead className="py-6 px-4 font-black text-slate-400 text-xs uppercase tracking-widest leading-none align-middle">{t('manager.orders.table.elderly') || 'Elderly Profile'}</TableHead>
                <TableHead className="py-6 px-4 font-black text-slate-400 text-xs uppercase tracking-widest leading-none align-middle">{t('manager.orders.table.package') || 'Subscription Plan'}</TableHead>
                <TableHead className="py-6 px-4 font-black text-slate-400 text-xs uppercase tracking-widest leading-none align-middle text-center">{t('manager.orders.table.status') || 'Status'}</TableHead>
                <TableHead className="py-6 px-4 font-black text-slate-400 text-xs uppercase tracking-widest leading-none align-middle text-center">{t('manager.orders.table.remaining_days') || 'Expires In'}</TableHead>
                <TableHead className="py-6 px-8 font-black text-slate-400 text-xs uppercase tracking-widest leading-none align-middle text-right">{t('common.actions') || 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-5 bg-slate-50 rounded-full">
                        <HistoryIcon className="h-10 w-10 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold italic">{t('common.no_data')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                  filteredOrders.map((order) => {
                    const o = order as any;
                    const accId = o.accountId ?? o.AccountId ?? o.account_id ?? o.AccountID;
                    const pkgId = o.servicePackageId ?? o.ServicePackageId ?? o.service_package_id ?? o.ServicePackageID;
                    const eldId = o.elderlyProfileId ?? o.ElderlyProfileId ?? o.elderly_profile_id ?? o.ElderlyProfileID;

                    const acc = accId ? (accounts as any)[String(accId)] : null;
                    const pkg = pkgId ? (packages as any)[String(pkgId)] : null;
                    const eld = eldId ? (elderly as any)[String(eldId)] : null;
                    
                    const orderDate = adjustDateTime(o.assignedAt ?? o.AssignedAt ?? o.assigned_at);
                    
                    // Logic to calculate remaining days if expiredAt is missing
                    let effectiveExpiredAt = order.expiredAt;
                    if (!effectiveExpiredAt && pkg && order.assignedAt) {
                      effectiveExpiredAt = addDays(new Date(order.assignedAt), pkg.durationDays).toISOString();
                    }
                    
                    const daysLeft = getRemainingDays(effectiveExpiredAt || null);
                  
                    // Simple check for upgrade if user has multiple packages for same elderly
                    const previousOrders = orders.filter(o => 
                      o.elderlyProfileId === order.elderlyProfileId && 
                      o.status === 'PAID' && 
                      new Date(o.assignedAt).getTime() < new Date(order.assignedAt).getTime()
                    ).sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

                    const isUpgradeCandidate = previousOrders.length > 0;
                    const prevPkg = isUpgradeCandidate ? packages[previousOrders[0].servicePackageId as number] : null;

                    return (
                    <TableRow key={order.id} className="group hover:bg-indigo-50/30 transition-all duration-300 border-b border-slate-50">
                      <TableCell className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <CreditCard className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-base leading-tight">Order #{(order as any).id || (order as any).Id}</div>
                            <div className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3" />
                              {orderDate ? format(orderDate, 'dd/MM/yyyy HH:mm') : '---'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                            <User className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-700 leading-none">{eld?.fullName || eld?.name || (eld as any)?.Name || '---'}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-6 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                             <div className="font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg text-sm border border-slate-200">
                               {pkg?.name || '---'}
                             </div>
                             {isUpgradeCandidate && (
                                <Badge className="bg-indigo-600 text-[9px] h-4 font-black uppercase rounded-sm px-1.5 animate-pulse">UPGRADE</Badge>
                             )}
                          </div>
                          <div className="text-xs font-black text-indigo-600 pl-1 italic">
                             {pkg?.price.toLocaleString()} ₫
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-6 px-4 text-center">
                        {getStatusBadge(order.status)}
                      </TableCell>

                      <TableCell className="py-6 px-4 text-center">
                        {order.status === 'PAID' ? (
                          <div className={cn(
                            "inline-flex flex-col items-center justify-center px-4 py-2 rounded-2xl border min-w-[80px]",
                            (daysLeft !== null && daysLeft <= 0) ? "bg-rose-50 border-rose-100 text-rose-600" :
                            (daysLeft !== null && daysLeft <= 7) ? "bg-amber-50 border-amber-100 text-amber-600" :
                            "bg-indigo-50 border-indigo-100 text-indigo-600"
                          )}>
                            <span className="text-xl font-black leading-none">
                              {daysLeft !== null ? (daysLeft <= 0 ? 0 : daysLeft) : '---'}
                            </span>
                            <span className="text-[9px] font-black uppercase mt-1 tracking-widest">
                              {daysLeft !== null && daysLeft <= 0 ? (t('manager.orders.table.expired') || 'EXPIRED') : (t('common.units.days') || 'DAYS')}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                             <CalendarDays className="h-4 w-4 opacity-50" />
                             <span className="text-[10px] font-bold">{t('common.status_labels.pending') || 'Pending'}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-6 px-8 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl font-bold gap-2 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all h-10 px-5"
                          onClick={() => setSelectedOrder(order)}
                        >
                          {t('common.view') || 'Details'}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
        
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400 font-bold italic uppercase tracking-wider leading-none">{t('common.showing') || 'Showing'} {filteredOrders.length} {t('common.results') || 'records'}</p>
            <div className="flex items-center gap-4">
              <HistoryIcon className="h-4 w-4 text-slate-300" />
              <TrendingUp className="h-4 w-4 text-slate-300" />
            </div>
        </div>
      </Card>
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
             <div className="flex items-center gap-4 mb-4">
               <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                 <CreditCard className="h-8 w-8" />
               </div>
               <div>
                 <DialogTitle className="text-2xl font-black text-white">Order Details</DialogTitle>
                 <DialogDescription className="text-white/70 font-bold">Transaction Information</DialogDescription>
               </div>
             </div>
             <div className="absolute top-8 right-8">
                {selectedOrder && getStatusBadge(selectedOrder.status)}
             </div>
          </div>
          
          {selectedOrder && (
            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order ID</p>
                  <p className="font-bold text-slate-900 leading-none mt-1">#{selectedOrder.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Price</p>
                  <p className="font-black text-indigo-600 leading-none mt-1">
                    {packages[selectedOrder.servicePackageId as number]?.price.toLocaleString()} ₫
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                 {/* Family Info Section Removed */}
                 <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                       <Package className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Service Package</p>
                       <div className="flex items-center justify-between mt-1">
                          <p className="font-bold text-slate-900">{packages[selectedOrder.servicePackageId as number]?.name || '---'}</p>
                          {orders.filter(o => 
                            o.elderlyProfileId === selectedOrder.elderlyProfileId && 
                            o.status === 'PAID' && 
                            new Date(o.assignedAt).getTime() < new Date(selectedOrder.assignedAt).getTime()
                          ).length > 0 && (
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-600 text-[10px] font-black border-none px-2 rounded-lg">
                              {t('manager.orders.table.upgrade_badge') || 'UPGRADE'}
                            </Badge>
                          )}
                       </div>
                    </div>
                 </div>

                {(() => {
                  const so = selectedOrder as any;
                  const eldId = so.elderlyProfileId ?? so.ElderlyProfileId ?? so.elderly_profile_id ?? so.ElderlyProfileID;
                  const eld = eldId ? (elderly as any)[String(eldId)] : null;
                  if (!eld) return null;

                  return (
                    <div className="p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100/50 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                           <Stethoscope className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t('manager.orders.table.elderly') || 'Elderly Profile'}</p>
                           <p className="font-bold text-slate-900 mt-1">{eld.fullName || eld.name || (eld as any).Name || '---'}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Date of Birth</p>
                           <p className="text-xs font-bold text-slate-700">
                             {eld.dateOfBirth ? format(new Date(eld.dateOfBirth), 'dd/MM/yyyy') : '---'}
                           </p>
                        </div>
                      </div>

                      <div className="space-y-1 bg-white/50 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Health Notes</p>
                        <p className="text-[11px] text-slate-600 font-medium italic leading-relaxed">
                          {eld.healthNotes || 'No health notes recorded.'}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-50">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold">{t('manager.orders.table.assigned_at') || 'Registration Date'}</span>
                  <span className="text-slate-900 font-black">
                    {(() => {
                      const d = adjustDateTime(selectedOrder.assignedAt || (selectedOrder as any).assignedAt || (selectedOrder as any).AssignedAt);
                      return d ? format(d, 'dd/MM/yyyy HH:mm') : '---';
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold">{t('manager.orders.table.expired_at') || 'Expiry Date'}</span>
                  <span className="text-slate-900 font-black">
                    {(() => {
                      const expStr = selectedOrder.expiredAt || (selectedOrder as any).expiredAt || (selectedOrder as any).ExpiredAt;
                      const assignedStr = selectedOrder.assignedAt || (selectedOrder as any).assignedAt || (selectedOrder as any).AssignedAt;
                      const pkgId = selectedOrder.servicePackageId || (selectedOrder as any).ServicePackageId;
                      const pkg = packages[pkgId as number];

                      if (expStr) {
                         const d = adjustDateTime(expStr);
                         return d ? format(d, 'dd/MM/yyyy') : '---';
                      }

                      if (pkg && assignedStr) {
                         const d = adjustDateTime(assignedStr);
                         if (d) return format(addDays(d, pkg.durationDays), 'dd/MM/yyyy');
                      }
                      
                      return 'Permanent / Ongoing';
                    })()}
                  </span>
                </div>
              </div>

              <Button className="w-full py-6 rounded-2xl font-black bg-slate-900 hover:bg-black text-white transition-all shadow-xl shadow-slate-200" onClick={() => setSelectedOrder(null)}>
                OK, Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
