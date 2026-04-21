'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useAuthStore } from '@/store/useAuthStore';
import { paymentService } from '@/services/api/paymentService';
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
import { cn } from '@/lib/utils';
import { getActiveUserPackageForElderly, getCatalogPackageForUserPackage, getOrderedServicePackages, getServicePackageTheme, getUnpurchasedPackageTheme } from '@/lib/servicePackageThemes';
import { 
  Package, 
  Check, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Crown,
  Info,
  ChevronRight,
  AlertCircle,
  Loader2,
  UserRound,
  RefreshCw,
  Activity,
  Gem,
  Sparkles,
  Star,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { PackageExercisesModal } from '@/components/dashboard/family/PackageExercisesModal';


const SELECTED_ELDERLY_STORAGE_KEY = 'family-selected-elderly-package-context';
const FAMILY_PAYMENT_STORAGE_KEY = 'family-payment-preview';

export default function PackagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { elderlyList, userPackages, servicePackages, fetchDashboardData, isUsingMock } = useFamilyStore();
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [selectedElderlyId, setSelectedElderlyId] = useState<number | null>(null);
  const [selectedElderlyName, setSelectedElderlyName] = useState('');

  // Exercise Modal State
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [viewingPkgId, setViewingPkgId] = useState<number | null>(null);
  const [viewingPkgName, setViewingPkgName] = useState('');

  const openExerciseModal = (id: number, name: string) => {
    setViewingPkgId(id);
    setViewingPkgName(name);
    setIsExerciseModalOpen(true);
  };


  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(Number(user.id));
    }
  }, [user?.id, fetchDashboardData]);

  useEffect(() => {
    const queryElderlyId = Number(searchParams.get('elderlyId'));
    const queryElderlyName = searchParams.get('elderlyName');

    if (Number.isFinite(queryElderlyId) && queryElderlyId > 0) {
      setSelectedElderlyId(queryElderlyId);
      setSelectedElderlyName(queryElderlyName || '');

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          SELECTED_ELDERLY_STORAGE_KEY,
          JSON.stringify({ elderlyId: queryElderlyId, elderlyName: queryElderlyName || '' })
        );
      }
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const savedValue = window.sessionStorage.getItem(SELECTED_ELDERLY_STORAGE_KEY);
    if (!savedValue) {
      return;
    }

    try {
      const parsed = JSON.parse(savedValue) as { elderlyId?: number; elderlyName?: string };
      if (parsed.elderlyId) {
        setSelectedElderlyId(parsed.elderlyId);
        setSelectedElderlyName(parsed.elderlyName || '');
      }
    } catch {
      window.sessionStorage.removeItem(SELECTED_ELDERLY_STORAGE_KEY);
    }
  }, [searchParams]);

  const selectedElderly = useMemo(() => {
    if (!selectedElderlyId) {
      return null;
    }

    return elderlyList.find((item) => item.id === selectedElderlyId) || null;
  }, [elderlyList, selectedElderlyId]);

  const effectiveElderlyName = selectedElderly?.name || selectedElderlyName;

  const activePackage = useMemo(() => {
    if (!selectedElderlyId) {
      return null;
    }

    return getActiveUserPackageForElderly(userPackages, selectedElderlyId);
  }, [selectedElderlyId, userPackages]);

  const activePackageInfo = useMemo(
    () => getCatalogPackageForUserPackage(servicePackages, activePackage),
    [activePackage, servicePackages]
  );

  const activePackageTheme = getServicePackageTheme(activePackageInfo, servicePackages);
  const unpurchasedTheme = getUnpurchasedPackageTheme();

  const allPackagesForElderly = useMemo(() => {
    if (!selectedElderlyId) return [];
    return userPackages.filter((up) => up.elderlyProfileId === selectedElderlyId);
  }, [selectedElderlyId, userPackages]);

  const totalDays = useMemo(() => {
    return allPackagesForElderly.reduce((sum, up) => {
      const catalog = servicePackages.find((sp) => sp.id === up.servicePackageId);
      return sum + (catalog?.durationDays ?? 0);
    }, 0);
  }, [allPackagesForElderly, servicePackages]);

  const totalExercises = useMemo(() => {
    const ids = new Set<number>();
    allPackagesForElderly.forEach((up) => {
      const catalog = servicePackages.find((sp) => sp.id === up.servicePackageId);
      catalog?.robotActions?.forEach((a) => ids.add(a.id));
    });
    return ids.size;
  }, [allPackagesForElderly, servicePackages]);

  const handlePurchase = async (packageId: number) => {
    if (!selectedElderlyId) {
      toast.error('Vui lòng chọn một elderly profile trước khi thanh toán.');
      return;
    }
    
    setPurchasingId(packageId);
    try {
      const payment = await paymentService.create(packageId, selectedElderlyId);
      const selectedPackage = servicePackages.find((item) => item.id === packageId) || null;

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          FAMILY_PAYMENT_STORAGE_KEY,
          JSON.stringify({
            ...payment,
            elderlyId: selectedElderlyId,
            elderlyName: effectiveElderlyName,
            servicePackageId: packageId,
            servicePackageName: selectedPackage?.name || `Package #${packageId}`,
            servicePackageLevel: selectedPackage?.level || '',
          })
        );
      }

      toast.success(`Đã tạo thanh toán cho EL #${selectedElderlyId}. Chuyển sang trang payment...`);
      router.push('/dashboard/family/payment');
    } catch {
      toast.error('Lỗi khi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setPurchasingId(null);
    }
  };

  const availablePackages = useMemo(() => {
    const purchasedIds = new Set(
      userPackages
        .filter((up) => up.elderlyProfileId === selectedElderlyId)
        .map((up) => up.servicePackageId)
    );
    return getOrderedServicePackages(servicePackages)
      .filter((item) => item.active)
      .map((pkg) => ({
        ...pkg,
        isCurrent: activePackage?.servicePackageId === pkg.id,
        isAlreadyPurchased: purchasedIds.has(pkg.id),
      }));
  }, [activePackage?.servicePackageId, servicePackages, userPackages, selectedElderlyId]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Plans</h1>
          <p className="text-muted-foreground mt-1">Review, purchase, and manage the plans attached to your elderly care journey.</p>
        </div>
        <Button variant="outline" onClick={() => user?.id && fetchDashboardData(Number(user.id))}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh plan status
        </Button>
      </div>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className={cn(
          'border shadow-sm',
          selectedElderlyId ? 'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50' : 'border-dashed border-slate-200 bg-slate-50/60'
        )}>
          <CardHeader>
            <CardTitle>Selected Elderly For Payment</CardTitle>
            <CardDescription>
              Lưu ý: phải lưu Elderly ID và hiện ra bên ngoài tên của Elderly đó vì khi thanh toán sẽ dùng EL ID đó.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedElderlyId ? (
              <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-sky-600 text-white hover:bg-sky-700">EL ID #{selectedElderlyId}</Badge>
                  {effectiveElderlyName ? <Badge variant="outline">{effectiveElderlyName}</Badge> : null}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-sky-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Elderly Name</div>
                    <div className="mt-2 font-semibold text-slate-900">{effectiveElderlyName || 'Unknown elderly profile'}</div>
                  </div>
                  <div className="rounded-xl bg-sky-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">Current Plan Status</div>
                    <div className="mt-2 font-semibold text-slate-900">{activePackageInfo?.name || 'Chưa mua gói'}</div>
                  </div>
                </div>
                {allPackagesForElderly.length > 0 && (
                  <div className="mt-3 rounded-xl border border-sky-200 bg-gradient-to-r from-emerald-50 via-sky-50 to-violet-50 p-4 flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-sky-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Tổng ngày:</span>
                      <span className="font-black text-sky-900">{totalDays} ngày</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tổng bài tập:</span>
                      <span className="font-black text-emerald-900">{totalExercises} bài</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-violet-600" />
                      <span className="text-xs font-bold uppercase tracking-wider text-violet-700">Số gói:</span>
                      <span className="font-black text-violet-900">{allPackagesForElderly.length} gói</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                Chưa chọn elderly profile. Hãy chọn từ danh sách bên phải hoặc bấm “Mua gói ngay !” từ trang chi tiết của từng EL.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Choose An Elderly Profile</CardTitle>
            <CardDescription>Trang này có thể mở trực tiếp từ từng EL hoặc chọn nhanh một EL tại đây.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {elderlyList.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">No elderly profile found for this family account.</div>
            ) : elderlyList.map((elderly) => {
              const pkg = getCatalogPackageForUserPackage(servicePackages, getActiveUserPackageForElderly(userPackages, elderly.id));
              return (
                <button
                  key={elderly.id}
                  type="button"
                  onClick={() => {
                    setSelectedElderlyId(elderly.id);
                    setSelectedElderlyName(elderly.name);
                    if (typeof window !== 'undefined') {
                      window.sessionStorage.setItem(
                        SELECTED_ELDERLY_STORAGE_KEY,
                        JSON.stringify({ elderlyId: elderly.id, elderlyName: elderly.name })
                      );
                    }
                  }}
                  className={cn(
                    'w-full rounded-2xl border px-4 py-3 text-left transition-colors',
                    selectedElderlyId === elderly.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-foreground">{elderly.name}</div>
                      <div className="text-xs text-muted-foreground">EL #{elderly.id}</div>
                    </div>
                    <Badge variant={pkg ? 'outline' : 'secondary'} className={pkg ? getServicePackageTheme(pkg, servicePackages).badgeClassName : unpurchasedTheme.badgeClassName}>
                      {pkg?.name || 'Chưa mua gói'}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </section>

      {/* Current Active Package Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-500" /> Current Plan
        </h3>
        {selectedElderlyId && activePackage ? (
           <Card className={cn('border-none shadow-xl text-white overflow-hidden relative group', activePackageTheme.accentClassName)}>
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-all duration-700" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                 <div className="space-y-1">
                    <CardTitle className="text-2xl">
                        {activePackageInfo?.name || 'Active Subscription'}
                    </CardTitle>
                    <CardDescription className="text-emerald-50 font-medium">
                        {activePackageInfo?.level || `Membership Level ${activePackage.servicePackageId}`} • {effectiveElderlyName || `EL #${selectedElderlyId}`}
                    </CardDescription>
                 </div>
                 <Badge className={cn(
                    "border-none px-4 py-1 text-sm font-bold shadow-md",
                    activePackage.status === 'PAID' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white animate-pulse"
                  )}>
                                        {activePackage.status || (activePackage.expiredAt ? 'PAID' : 'PENDING')}
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
                       <p className="text-sm font-bold">
                         {activePackage.expiredAt ? new Date(activePackage.expiredAt).toLocaleDateString() : 'Waiting for manager confirm'}
                       </p>
                    </div>
                 </div>
                 <div className="sm:col-span-2 lg:col-span-1 flex items-center gap-4 bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
                    <Info className="h-8 w-8 text-white/80" />
                    <p className="text-xs font-medium leading-relaxed">
                      {activePackage.status === 'PENDING' || !activePackage.expiredAt 
                        ? "Gói của bạn đang chờ quản lý xác nhận thanh toán. Các tính năng cao cấp sẽ được kích hoạt ngay sau đó."
                        : "Gói dịch vụ đã được kích hoạt thành công. Người cao tuổi hiện có quyền truy cập vào các bài tập và tính năng của robot."}
                    </p>
                 </div>
              </CardContent>
               <CardFooter className="bg-white/5 border-t border-white/10 flex justify-end p-4">
                  <Button 
                    variant="ghost" 
                    className="text-white hover:bg-white/10 font-bold"
                    onClick={() => openExerciseModal(activePackage.servicePackageId, activePackageInfo?.name || 'Current Package')}
                  >
                    View Exercises <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
               </CardFooter>
           </Card>
            ) : !selectedElderlyId ? (
              <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center rounded-3xl">
                <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-6">
                  <UserRound className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Choose An Elderly Profile First</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Payment needs the exact elderly profile id. Select one elderly above before choosing a plan.
                </p>
              </Card>
        ) : (
           <Card className={cn('border-2 border-dashed p-8 text-center rounded-3xl', unpurchasedTheme.surfaceClassName)}>
                <div className="mx-auto h-20 w-20 rounded-3xl bg-slate-200/90 flex items-center justify-center mb-6">
                  <Package className="h-10 w-10 text-slate-500" />
              </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Service Plan</h3>
                <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                  {effectiveElderlyName || `EL #${selectedElderlyId}`} has not purchased a plan yet. Continue below to create a payment QR for this elderly profile.
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
              <Zap className="h-6 w-6 text-amber-500" /> Available Service Plans
           </h3>
           {isUsingMock && (
             <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                MOCK MODE ACTIVE
             </Badge>
           )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {availablePackages.map((pkg, idx) => {
            const isCurrent = pkg.isCurrent;
            const isAlreadyPurchased = pkg.isAlreadyPurchased;
            const isUltimate = idx === availablePackages.length - 1;
            const Icon = isUltimate ? Gem : pkg.id === 1 ? Zap : pkg.id === 2 ? Crown : ShieldCheck;
            const pkgTheme = getServicePackageTheme(pkg, servicePackages);

            return (
              <Card key={pkg.id} className={cn(
                'group relative flex flex-col overflow-hidden rounded-3xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl',
                pkgTheme.surfaceClassName,
                isCurrent ? 'scale-[1.02] shadow-xl' : 'hover:brightness-[1.02]',
                isUltimate && 'gold-glow-card hover:scale-[1.04] hover:-translate-y-3 md:scale-[1.03] md:shadow-2xl',
              )}>
                {/* Accent bar — thicker + shimmer for ultimate */}
                <div className={cn(
                  'w-full',
                  isUltimate ? 'h-3' : 'h-2',
                  pkgTheme.accentClassName,
                )} />

                {/* Ultimate decorative sparkles */}
                {isUltimate && (
                  <>
                    <span className="gold-sparkle pointer-events-none absolute left-4 top-8 text-orange-600/55 text-lg select-none" style={{ animationDelay: '0s' }}>✦</span>
                    <span className="gold-sparkle pointer-events-none absolute right-16 top-12 text-amber-400/60 text-base select-none" style={{ animationDelay: '1.1s' }}>✦</span>
                    <span className="gold-sparkle pointer-events-none absolute left-10 bottom-24 text-orange-500/40 text-sm select-none" style={{ animationDelay: '2.2s' }}>✦</span>
                    <span className="gold-sparkle pointer-events-none absolute right-8 bottom-16 text-yellow-500/35 text-xs select-none" style={{ animationDelay: '3.0s' }}>✦</span>
                    {/* Dual radial glow — deep-orange top-left + gold top-right */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_-5%,rgba(234,88,12,0.10),transparent_55%),radial-gradient(ellipse_at_85%_-5%,rgba(251,191,36,0.12),transparent_50%)]" />
                  </>
                )}

                {/* CURRENT PLAN badge */}
                {isCurrent && (
                  <div className={cn(
                    'absolute right-0 top-0 z-10 flex items-center gap-1 rounded-bl-2xl px-3 py-2 text-[10px] font-bold shadow-lg',
                    isUltimate
                      ? 'bg-gradient-to-r from-orange-800 via-orange-600 to-amber-500 text-yellow-50'
                      : 'bg-slate-900 text-white',
                  )}>
                    <Check className="h-3 w-3" /> CURRENT PLAN
                  </div>
                )}

                {/* EMBER GOLD badge — only for ultimate, only when not current */}
                {isUltimate && !isCurrent && (
                  <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-bl-2xl bg-gradient-to-r from-orange-800 via-orange-600 to-amber-500 px-3 py-2 text-[10px] font-black tracking-widest text-yellow-50 shadow-[0_2px_12px_rgba(194,65,12,0.40)] uppercase">
                    <Crown className="h-3 w-3" /> Ember Gold
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className={cn(
                    'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border transition-all',
                    pkgTheme.badgeClassName,
                    isUltimate
                      ? 'h-14 w-14 shadow-[0_0_14px_rgba(194,65,12,0.35),0_0_28px_rgba(251,191,36,0.25)] group-hover:shadow-[0_0_24px_rgba(194,65,12,0.55),0_0_44px_rgba(251,191,36,0.35)] group-hover:scale-110'
                      : isCurrent ? 'shadow-md' : 'group-hover:scale-105',
                  )}>
                    <Icon className={cn('h-6 w-6', isUltimate && 'h-7 w-7')} />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className={cn('font-black tracking-tight', isUltimate ? 'text-3xl' : 'text-2xl')}>
                      {pkg.name}
                    </CardTitle>
                    {isUltimate && <Sparkles className="h-5 w-5 text-orange-600 gold-sparkle" style={{ animationDelay: '0.6s' }} />}
                  </div>
                  <CardDescription className={cn('font-semibold text-foreground/85', isUltimate ? 'text-xl' : 'text-lg')}>
                    {pkg.price.toLocaleString()} <span className="text-xs font-normal text-foreground/65"> / {pkg.level}</span>
                    {isUltimate && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-orange-800 border border-orange-300/60">
                        <Star className="h-2.5 w-2.5 fill-orange-500 text-orange-500" /> Best Value
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 flex-grow">
                  <p className="text-sm leading-relaxed text-foreground/70">
                    {pkg.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {[
                      `Level: ${pkg.level}`,
                      pkg.active ? 'Dang mo ban' : 'Tam dong',
                      `Package ID: ${pkg.id}`,
                      `Duration: ${pkg.durationDays ?? 0} days`,
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium">
                        <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', pkgTheme.badgeClassName)}>
                           <Check className="h-3 w-3" strokeWidth={3} />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter className="pt-2 flex flex-col gap-2">
                  <Button 
                    variant="ghost" 
                    className={cn("w-full h-10 rounded-xl font-bold", pkgTheme.badgeClassName)}
                    onClick={() => openExerciseModal(pkg.id, pkg.name)}
                  >
                    <Activity className="mr-2 h-4 w-4" /> View Exercises
                  </Button>
                  <Button 
                    variant={isAlreadyPurchased ? 'outline' : 'default'}
                    className={cn(
                      'w-full h-12 rounded-2xl font-bold shadow-lg transition-all',
                      isAlreadyPurchased
                        ? `${pkgTheme.badgeClassName} scale-95 opacity-50 cursor-default`
                        : isUltimate
                          ? 'bg-gradient-to-r from-orange-700 via-orange-500 to-amber-500 text-white hover:from-orange-800 hover:via-orange-600 hover:to-amber-600 shadow-[0_4px_20px_rgba(194,65,12,0.38),0_2px_12px_rgba(245,158,11,0.28)] hover:shadow-[0_6px_32px_rgba(194,65,12,0.52),0_4px_16px_rgba(245,158,11,0.38)] border-0'
                          : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200',
                    )}
                    disabled={isAlreadyPurchased || purchasingId !== null || !selectedElderlyId}
                    onClick={() => handlePurchase(pkg.id)}
                  >
                    {purchasingId === pkg.id ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </div>
                    ) : isAlreadyPurchased ? (
                      'Đã đăng ký'
                    ) : !selectedElderlyId ? (
                      'Select Elderly First'
                    ) : isUltimate ? (
                      <span className="flex items-center gap-2 font-black tracking-wide">
                        <Crown className="h-4 w-4" /> Mua gói Ultimate
                      </span>
                    ) : (
                      'Mua gói ngay !'
                    )}
                    {!purchasingId && !isCurrent && selectedElderlyId && !isUltimate && (
                      <ChevronRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        {servicePackages.length === 0 && (
          <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center rounded-3xl">
            <p className="text-muted-foreground">Chua tai duoc danh sach goi tu GET /api/service-packages.</p>
          </Card>
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

      <PackageExercisesModal 
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        packageId={viewingPkgId}
        packageName={viewingPkgName}
      />
    </div>

  );
}
