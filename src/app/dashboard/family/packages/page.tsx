'use client';

import { useState, useEffect } from 'react';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { servicePackageService } from '@/services/api/servicePackageService';
import { ServicePackageResponse } from '@/services/api/types';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Check, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Crown,
  Info,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function PackagesPage() {
  const { user } = useAuthStore();
  const { userPackages, purchasePackage, fetchDashboardData } = useFamilyStore();
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      setPackagesLoading(true);
      try {
        const data = await servicePackageService.getAll();
        setPackages(data);
      } catch {
        toast.error('Lỗi khi tải danh sách gói dịch vụ');
      } finally {
        setPackagesLoading(false);
      }
    };

    loadPackages();
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchDashboardData(Number(user.id));
  }, [user?.id, fetchDashboardData]);

  const activePackage = userPackages.length > 0 ? userPackages[0] : null;

  const handlePurchase = async (packageId: number) => {
    if (!user?.id) return;
    
    setPurchasingId(packageId);
    try {
      await purchasePackage(Number(user.id), packageId);
      toast.success('Gói dịch vụ đã được kích hoạt thành công!');
    } catch {
      toast.error('Lỗi khi mua gói dịch vụ. Vui lòng thử lại.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Packages</h1>
          <p className="text-muted-foreground mt-1">Manage your subscriptions and health monitoring plans.</p>
        </div>
      </div>

      {/* Current Active Package Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
           <ShieldCheck className="h-6 w-6 text-emerald-500" /> Current Status
        </h3>
        {activePackage ? (
           <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative group">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl">
                       {packages.find(p => p.id === activePackage.servicePackageId)?.name || 'Active Subscription'}
                    </CardTitle>
                    <CardDescription className="text-emerald-50 font-medium">
                       Membership Level {activePackage.servicePackageId}
                    </CardDescription>
                 </div>
                 <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1 text-sm font-bold">
                    ACTIVE
                 </Badge>
              </CardHeader>
              <CardContent className="pt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="flex items-center gap-4 bg-black/10 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                       <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] uppercase font-bold text-emerald-100">Assigned At</p>
                       <p className="text-sm font-bold">{new Date(activePackage.assignedAt).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-black/10 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
                    <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                       <Clock className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-[10px] uppercase font-bold text-emerald-100">Expires At</p>
                       <p className="text-sm font-bold">{new Date(activePackage.expiredAt).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <div className="sm:col-span-2 lg:col-span-1 flex items-center gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                    <Info className="h-8 w-8 text-white/80" />
                    <p className="text-xs font-medium leading-relaxed">
                       You have full access to all features in this tier. 
                       Expiry status is monitored automatically.
                    </p>
                 </div>
              </CardContent>
           </Card>
        ) : (
           <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center rounded-3xl">
              <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
                 <Package className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Package</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                 You are currently on the free trial limited plan. Upgrade to a premium package to unlock full care features.
              </p>
              <Button onClick={() => document.getElementById('purchase-grid')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary hover:bg-primary/90 px-8 rounded-xl font-bold">
                 View Upgrade Options
              </Button>
           </Card>
        )}
      </section>

      {/* Purchase Options Section */}
      <section id="purchase-grid" className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-amber-500" /> Upgrade Your Plan
           </h3>
        </div>

        {packagesLoading ? (
          <div className="flex h-[300px] w-full items-center justify-center">
            <Clock className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {packages.map((pkg) => {
              const isCurrent = activePackage?.servicePackageId === pkg.id;
              const levelColor = {
                TRIAL: 'bg-slate-50 text-slate-500 group-hover:bg-slate-500 group-hover:text-white',
                basic: 'bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white',
                standard: 'bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white',
                advanced: 'bg-purple-50 text-purple-500 group-hover:bg-purple-500 group-hover:text-white',
                premium: 'bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white'
              }[pkg.level.toLowerCase()] || 'bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white';

              const icon = pkg.level.toLowerCase() === 'trial' ? Package : 
                          pkg.level.toLowerCase() === 'basic' ? Zap :
                          pkg.level.toLowerCase() === 'premium' ? Crown : ShieldCheck;
              const Icon = icon;

              return (
                <Card key={pkg.id} className={`group relative border-2 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col ${
                  isCurrent 
                    ? 'border-emerald-500 shadow-xl scale-[1.02] col-span-1 md:col-span-1' 
                    : 'border-slate-100 hover:border-sky-500 hover:shadow-2xl hover:-translate-y-2'
                }`}>
                  {isCurrent && (
                    <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-white rounded-bl-2xl font-bold flex items-center gap-1 text-[10px] z-10">
                      <Check className="h-3 w-3" /> CURRENT
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                      isCurrent ? 'bg-emerald-50 text-emerald-500' : levelColor
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight line-clamp-2">{pkg.name}</CardTitle>
                    <CardDescription className="font-semibold text-sky-600 text-lg">
                      {pkg.price === 0 ? (
                        <span className="text-base">Free Trial</span>
                      ) : (
                        <span>{(pkg.price / 1000).toLocaleString('vi-VN')}K VND</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 flex-grow">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {pkg.description}
                    </p>
                    
                    <div className="space-y-2">
                      <Badge variant={pkg.active ? 'default' : 'secondary'} className="text-[10px]">
                        {pkg.active ? 'Available' : 'Inactive'}
                      </Badge>
                      <p className="text-xs text-muted-foreground font-medium capitalize">
                        Level: {pkg.level}
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2">
                    <Button 
                      variant={isCurrent ? 'outline' : 'default'}
                      className={`w-full h-10 rounded-2xl font-bold shadow-lg transition-all text-sm ${
                        isCurrent 
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50 scale-95 opacity-50 cursor-default' 
                          : 'bg-primary hover:bg-primary/90 shadow-sky-100 hover:shadow-sky-200'
                      }`}
                      disabled={isCurrent || (purchasingId !== null) || !pkg.active}
                      onClick={() => handlePurchase(pkg.id)}
                    >
                      {purchasingId === pkg.id ? (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 animate-spin" /> Processing...
                        </div>
                      ) : isCurrent ? 'Current' : pkg.price === 0 ? 'Select Trial' : 'Upgrade'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="bg-sky-50 dark:bg-sky-900/10 p-8 rounded-3xl border border-sky-100 dark:border-sky-900/30 flex flex-col md:flex-row items-center gap-6">
         <div className="h-16 w-16 bg-sky-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-sky-200 dark:shadow-none shrink-0">
            <AlertCircle className="h-8 w-8" />
         </div>
         <div className="space-y-1 text-center md:text-left">
            <h4 className="text-xl font-bold italic tracking-tight">Secure Payment Gateway</h4>
            <p className="text-sm text-sky-700/80 dark:text-sky-300/80 font-medium max-w-2xl leading-relaxed">
               All transactions are encrypted and processed securely. Our 30-day money-back guarantee ensures peace of mind for every family choice.
            </p>
         </div>
         <div className="md:ml-auto">
            <Button variant="ghost" className="text-sky-700 dark:text-sky-300 font-bold hover:bg-white/50">
               Read Terms →
            </Button>
         </div>
      </section>
    </div>
  );
}
