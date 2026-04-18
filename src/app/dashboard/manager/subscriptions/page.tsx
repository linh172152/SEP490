'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Loader2, Trash2, Edit2, Activity, ChevronRight, Play, CreditCard, CheckCircle2, AlertCircle, Copy, Clock, Filter, AlertTriangle } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';
import { ServicePackageModal } from './ServicePackageModal';
import { servicePackageService } from '@/services/api/servicePackageService';
import { exerciseService } from '@/services/api/exerciseService';
import { paymentService } from '@/services/api/paymentService';
import {
  ServicePackageResponse,
  ServicePackageRequest,
  ExerciseScriptResponse,
  UserPackageResponse
} from '@/services/api/types';
import { PackageExerciseSelector } from './PackageExerciseSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

export default function SubscriptionsUnifiedPage() {
  const { t } = useI18nStore();
  const user = useAuthStore((state) => state.user);

  // Data State
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [packageExercises, setPackageExercises] = useState<ExerciseScriptResponse[]>([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<UserPackageResponse[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('definitions');
  const [selectedPkgId, setSelectedPkgId] = useState<number | null>(null);

  // Modal State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);

  // Payment Confirmation State
  const [confirmDescription, setConfirmDescription] = useState('');
  const [confirmAmount, setConfirmAmount] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [searchPaymentQuery, setSearchPaymentQuery] = useState('');
  const [filterPackageLevel, setFilterPackageLevel] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Confirm Dialog State
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const fetchData = async () => {
    setLoading(true);
    setPaymentLoading(true);
    try {
      const [pkgs, pendings] = await Promise.all([
        servicePackageService.getAll(),
        paymentService.getManagerPending()
      ]);
      
      setPackages(pkgs || []);
      setPendingPayments(pendings || []);

      if (pkgs && pkgs.length > 0 && !selectedPkgId) {
        setSelectedPkgId(pkgs[0].id);
      }
    } catch (e) {
      console.error(e);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPackageExercises = async (id: number) => {
    setExerciseLoading(true);
    try {
      const data = await servicePackageService.getExercises(id);
      setPackageExercises(data || []);
    } catch (e) {
      console.error(e);
      toast.error(t('common.error'));
    } finally {
      setExerciseLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPkgId) {
      fetchPackageExercises(selectedPkgId);
    }
  }, [selectedPkgId]);

  const handleAddPackage = () => {
    setModalMode('create');
    setSelectedPackage(null);
    setIsPkgModalOpen(true);
  };

  const handleEditPackage = (pkg: ServicePackageResponse) => {
    setModalMode('edit');
    setSelectedPackage(pkg);
    setIsPkgModalOpen(true);
  };

  const handleSavePackage = async (data: ServicePackageRequest) => {
    try {
      if (modalMode === 'create') {
        const newPkg = await servicePackageService.create(data);
        if (newPkg && newPkg.id) {
          try {
            await servicePackageService.updateExercises(newPkg.id, []);
          } catch (clearErr) {
            console.warn('Failed to clear initial auto-mapped exercises', clearErr);
          }
        }
        toast.success(t('common.create_success'));
      } else if (selectedPackage) {
        await servicePackageService.update(selectedPackage.id, data);
        toast.success(t('common.update_success'));
      }
      fetchData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeletePackage = async (id: number) => {
    setConfirmDelete({
      isOpen: true,
      title: t('common.confirm_delete') || "Are you sure?",
      description: "This action will permanently remove the service package. This cannot be undone.",
      onConfirm: async () => {
        try {
          setConfirmDelete(prev => ({ ...prev, isLoading: true }));
          await servicePackageService.delete(id);
          toast.success(t('common.delete_success') || 'Deleted successfully');
          fetchData();
        } catch (error) {
          toast.error(t('common.error') || 'An error occurred');
        } finally {
          setConfirmDelete(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleUpdateExercises = async (exerciseIds: number[]) => {
    if (!selectedPkgId) return;
    try {
      await servicePackageService.updateExercises(selectedPkgId, exerciseIds);
      toast.success(t('common.update_success'));
      fetchPackageExercises(selectedPkgId);
    } catch (e) {
      console.error(e);
      toast.error(t('common.error'));
    }
  };

  const handleRemoveExerciseFromPkg = async (exerciseId: number) => {
    if (!selectedPkgId) return;

    setConfirmDelete({
      isOpen: true,
      title: t('common.confirm_delete') || "Are you sure?",
      description: "Do you want to remove this exercise from the current service package?",
      onConfirm: async () => {
        try {
          setConfirmDelete(prev => ({ ...prev, isLoading: true }));
          const updatedExerciseIds = packageExercises
            .map(ex => ex.id)
            .filter(id => id !== exerciseId);

          await servicePackageService.updateExercises(selectedPkgId, updatedExerciseIds);
          toast.success(t('common.update_success') || 'Updated successfully');
          fetchPackageExercises(selectedPkgId);
        } catch (error) {
          toast.error(t('common.error') || 'An error occurred');
        } finally {
          setConfirmDelete(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleManualConfirm = async () => {
    if (!confirmDescription || !confirmAmount) {
      toast.error(t('common.error_generic'));
      return;
    }
    setIsConfirming(true);
    try {
      await paymentService.confirmPayment(confirmDescription, parseFloat(confirmAmount));
      toast.success(t('manager.subscriptions.confirm_success'));
      setConfirmDescription('');
      setConfirmAmount('');
      fetchData(); 
    } catch (err) {
      console.error(err);
      toast.error(t('manager.subscriptions.confirm_error'));
    } finally {
      setIsConfirming(false);
    }
  };

  const canManage = user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR';
  const currentConfigPkg = packages.find(p => p.id === selectedPkgId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-indigo-600" />
            {t('manager.subscriptions.title')}
          </h2>
          <p className="text-muted-foreground font-medium">
            {t('manager.subscriptions.subtitle')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl h-14 border border-slate-200">
          <TabsTrigger value="definitions" className="rounded-xl px-8 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2 font-bold">
            <Package className="h-4 w-4" /> {t('manager.subscriptions.tab_packages')}
          </TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-xl px-8 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2 font-bold">
            <Activity className="h-4 w-4" /> {t('manager.subscriptions.tab_sessions')}
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl px-8 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2 font-bold text-indigo-600">
            <CreditCard className="h-4 w-4" /> {t('manager.subscriptions.tab_payments')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="definitions">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-indigo-600" />
                  {t('admin.packages.table_card_title')}
                </CardTitle>
                <CardDescription>
                  {t('admin.packages.table_card_desc')}
                </CardDescription>
              </div>
              {canManage && (
                <Button onClick={handleAddPackage} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 font-bold gap-2">
                  <Plus className="h-4 w-4" /> {t('admin.packages.create_btn')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-bold">{t('admin.packages.table.level')}</TableHead>
                    <TableHead className="font-bold">{t('admin.packages.table.name')}</TableHead>
                    <TableHead className="font-bold">{t('admin.packages.table.price')}</TableHead>
                    <TableHead className="font-bold">{t('admin.packages.table.duration')}</TableHead>
                    <TableHead className="font-bold">{t('admin.packages.table.status')}</TableHead>
                    <TableHead className="text-right font-bold">{t('admin.packages.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                        <span className="text-sm text-muted-foreground mt-2 block">{t('common.loading')}</span>
                      </TableCell>
                    </TableRow>
                  ) : packages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 italic text-muted-foreground">
                        {t('admin.packages.table.no_data')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    packages.map((pkg) => (
                      <TableRow key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold px-2 py-0.5 rounded-lg text-[10px] uppercase">
                            {pkg.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{pkg.name}</TableCell>
                        <TableCell className="font-black text-slate-700">{pkg.price.toLocaleString()} ₫</TableCell>
                        <TableCell>{pkg.durationDays} days</TableCell>
                        <TableCell>
                          <Badge className={cn("rounded-full font-bold", pkg.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100")}>
                            {pkg.active ? t('admin.packages.table.active') : t('admin.packages.table.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditPackage(pkg)} className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeletePackage(pkg.id)} className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50 rounded-2xl p-4 space-y-4">
              <h3 className="font-black text-lg px-2">{t('manager.subscriptions.package_select')}</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl text-left transition-all border",
                        selectedPkgId === pkg.id
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 translate-x-1"
                          : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:border-slate-200 hover:translate-x-1"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-black truncate">{pkg.name}</span>
                        <span className={cn("text-[10px] uppercase font-bold", selectedPkgId === pkg.id ? "text-indigo-100" : "text-slate-400")}>
                          {pkg.level}
                        </span>
                      </div>
                      <ChevronRight className={cn("h-4 w-4", selectedPkgId === pkg.id ? "text-white" : "text-slate-300")} />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-indigo-600" />
                      {t('manager.subscriptions.exercises_title')}
                    </CardTitle>
                    <CardDescription>
                      {currentConfigPkg?.name} ({currentConfigPkg?.level})
                    </CardDescription>
                  </div>
                    {canManage && (
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => setIsExerciseSelectorOpen(true)} 
                          variant="outline" 
                          size="sm" 
                          className="rounded-lg gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus className="h-3 w-3" /> {t('manager.subscriptions.add_exercise')}
                        </Button>
                      </div>
                    )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] lg:h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50 z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="pl-6 pt-4">{t('wellness.scripts.table.name')}</TableHead>
                        <TableHead className="pt-4">{t('wellness.scripts.table.duration')}</TableHead>
                        <TableHead className="pt-4">{t('wellness.scripts.table.level') || 'Level'}</TableHead>
                        <TableHead className="pt-4 text-center">Preview</TableHead>
                        <TableHead className="text-right pr-6 pt-4">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exerciseLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 opacity-20" />
                            {t('common.loading')}
                          </TableCell>
                        </TableRow>
                      ) : packageExercises.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                            {t('manager.subscriptions.no_exercises')}
                          </TableCell>
                        </TableRow>) : (
                        packageExercises.map((ex) => (
                          <TableRow key={ex.id} className="group hover:bg-slate-50 transition-colors border-slate-50">
                            <TableCell className="pl-6 font-bold text-slate-700">{ex.name}</TableCell>
                            <TableCell>{ex.durationMinutes}m</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                                {ex.level}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <Play className="h-5 w-5 fill-current" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveExerciseFromPkg(ex.id)}
                                className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 py-4">
            <div className="xl:col-span-2">
              <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 sticky top-4">
                <CardHeader className="pb-2 text-center pt-8">
                  <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <CreditCard className="h-8 w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                    {t('manager.subscriptions.payment_confirm_title')}
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                    {t('manager.subscriptions.payment_confirm_desc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-8 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-black text-slate-500 ml-1 flex items-center gap-2">
                      {t('manager.subscriptions.field_description')}
                    </Label>
                    <div className="relative group">
                      <Input
                        id="description"
                        placeholder={t('manager.subscriptions.description_placeholder')}
                        value={confirmDescription}
                        onChange={(e) => setConfirmDescription(e.target.value)}
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono font-medium pr-12 text-slate-700"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.readText().then(text => setConfirmDescription(text));
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-300 hover:text-indigo-600 rounded-xl"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-xs font-black text-slate-500 ml-1 flex items-center gap-2">
                      {t('manager.subscriptions.field_amount')}
                    </Label>
                    <div className="relative group">
                      <Input
                        id="amount"
                        type="number"
                        placeholder={t('manager.subscriptions.amount_placeholder')}
                        value={confirmAmount}
                        onChange={(e) => setConfirmAmount(e.target.value)}
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-black text-emerald-600 text-xl pr-16"
                      />
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                        VNĐ
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleManualConfirm}
                    disabled={isConfirming || !confirmDescription || !confirmAmount}
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-indigo-100 disabled:opacity-50"
                  >
                    {isConfirming ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                    )}
                    {t('manager.subscriptions.confirm_btn')}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-3 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 shrink-0">
                    <Clock className="h-6 w-6 text-indigo-600" /> {t('manager.subscriptions.pending_list_title')}
                 </h3>
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Input
                        placeholder={t('common.search', 'Search ID or UP:ID...')}
                        value={searchPaymentQuery}
                        onChange={(e) => setSearchPaymentQuery(e.target.value)}
                        className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-xs font-bold"
                      />
                      <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                    
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-xl text-slate-600 font-bold gap-2 h-10 border-slate-200">
                             <Filter className="h-4 w-4" /> Filter
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                          <DropdownMenuLabel className="font-black text-xs text-slate-400 uppercase tracking-widest px-3 pt-3">
                             {t('common.sort_label', 'Sort By')}
                          </DropdownMenuLabel>
                          <DropdownMenuRadioGroup value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                             <DropdownMenuRadioItem value="newest" className="rounded-xl font-bold">{t('admin.users.filters.sort_newest', 'Newest')}</DropdownMenuRadioItem>
                             <DropdownMenuRadioItem value="oldest" className="rounded-xl font-bold">{t('admin.users.filters.sort_oldest', 'Oldest')}</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                          
                          <DropdownMenuSeparator className="my-2" />
                          
                          <DropdownMenuLabel className="font-black text-xs text-slate-400 uppercase tracking-widest px-3">
                             {t('admin.packages.table.level', 'Package Level')}
                          </DropdownMenuLabel>
                          <DropdownMenuRadioGroup value={filterPackageLevel} onValueChange={setFilterPackageLevel}>
                             <DropdownMenuRadioItem value="ALL" className="rounded-xl font-bold">{t('common.all', 'All Levels')}</DropdownMenuRadioItem>
                             {Array.from(new Set(packages.map(p => p.level))).map(level => (
                                <DropdownMenuRadioItem key={level} value={level} className="rounded-xl font-bold">
                                   {level}
                                </DropdownMenuRadioItem>
                             ))}
                          </DropdownMenuRadioGroup>
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>
              <div className="grid gap-4">
                {paymentLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 opacity-20" />
                    <p className="text-sm text-slate-400 mt-2">{t('common.loading')}</p>
                  </div>
                ) : pendingPayments.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
                    <CheckCircle2 className="h-12 w-12 text-emerald-200 mx-auto mb-4" />
                    <h4 className="font-black text-slate-800">{t('manager.subscriptions.no_pending_title', 'All Caught Up!')}</h4>
                    <p className="text-sm text-slate-400 mt-1">{t('manager.subscriptions.no_pending_desc', 'There are no pending payments to confirm at the moment.')}</p>
                  </div>
                ) : (
                  pendingPayments
                    .filter(item => {
                      const description = `UP:${item.id}`.toLowerCase();
                      const query = searchPaymentQuery.toLowerCase();
                      const pkg = packages.find(p => p.id === item.servicePackageId);
                      
                      const matchesSearch = description.includes(query) || 
                                          item.elderlyProfileId?.toString().includes(query);
                      
                      const matchesLevel = filterPackageLevel === 'ALL' || (pkg && pkg.level === filterPackageLevel);
                      
                      return matchesSearch && matchesLevel;
                    })
                    .sort((a, b) => {
                      const dateA = new Date(a.assignedAt || 0).getTime();
                      const dateB = new Date(b.assignedAt || 0).getTime();
                      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                    })
                    .map((item) => {
                    const pkg = packages.find(p => p.id === item.servicePackageId);
                    const description = `UP:${item.id}`;
                    
                    return (
                      <Card key={item.id} className="border-none shadow-md shadow-slate-200/40 rounded-3xl group hover:shadow-xl hover:shadow-indigo-100/50 transition-all border-l-4 border-amber-400">
                        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-5 w-full md:w-auto">
                            <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                               <Activity className="h-7 w-7 text-amber-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-black text-slate-800">
                                  {t('common.elderly', 'Elderly')} ID: {item.elderlyProfileId || 'N/A'}
                                </span>
                                <Badge variant="outline" className="bg-slate-50 text-slate-500 font-bold text-[10px] rounded-lg">
                                   {pkg?.name || t('common.package', 'Package')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                 <code className="text-[12px] bg-slate-100 px-2 py-0.5 rounded-lg font-mono text-slate-600 border border-slate-200">
                                   {description}
                                 </code>
                                 <span className="text-[11px] font-bold text-slate-400">
                                   {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : ''}
                                 </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                             <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('manager.subscriptions.amount', 'Amount')}</p>
                                <p className="text-xl font-black text-emerald-600">{(pkg?.price || 0).toLocaleString()} ₫</p>
                             </div>
                             <Button
                               onClick={() => {
                                 setConfirmDescription(description);
                                 setConfirmAmount((pkg?.price || 0).toString());
                                 toast.info(t('manager.subscriptions.data_filled', 'Data filled!'));
                               }}
                               className="h-12 w-12 md:w-auto md:px-6 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white font-black transition-all shadow-inner"
                             >
                               <ChevronRight className="h-5 w-5 md:mr-1" />
                               <span className="hidden md:inline">{t('manager.subscriptions.choose_btn')}</span>
                             </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="bg-slate-50 rounded-3xl p-8 border border-dashed border-slate-200 text-center">
                 <p className="text-sm text-slate-400 font-medium italic">
                    {t('manager.subscriptions.payment_instruction', 'Use the unique UP:ID from the bank transfer description to confirm payments here.')}
                 </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ServicePackageModal
        isOpen={isPkgModalOpen}
        onClose={() => setIsPkgModalOpen(false)}
        onSave={handleSavePackage}
        initialData={selectedPackage || undefined}
        mode={modalMode}
      />

      <PackageExerciseSelector
        isOpen={isExerciseSelectorOpen}
        onClose={() => setIsExerciseSelectorOpen(false)}
        currentIds={packageExercises.map(ex => ex.id)}
        onSave={handleUpdateExercises}
        packageLevel={currentConfigPkg?.level || ''}
      />

      <AlertDialog 
        open={confirmDelete.isOpen} 
        onOpenChange={(open) => setConfirmDelete(prev => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold">{confirmDelete.title}</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 font-medium">
              {confirmDelete.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold">
              {t('common.cancel') || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmDelete.onConfirm();
              }}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2"
              disabled={confirmDelete.isLoading}
            >
              {confirmDelete.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('common.confirm') || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
