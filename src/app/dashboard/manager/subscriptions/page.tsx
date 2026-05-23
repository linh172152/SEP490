'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Loader2, Trash2, Edit2, Activity, Filter, AlertTriangle } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';
import { ServicePackageModal } from './ServicePackageModal';
import { servicePackageService } from '@/services/api/servicePackageService';
import { exerciseService } from '@/services/api/exerciseService';
import { userPackageService } from '@/services/api/userPackageService';
import {
  ServicePackageResponse,
  ServicePackageRequest,
  RobotAction,
  UserPackageResponse
} from '@/services/api/types';
import { parseServerDate } from '@/lib/utils';
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

  // UI State
  const [activeTab, setActiveTab] = useState('definitions');

  // Modal State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);

  const [isConfirming, setIsConfirming] = useState(false);
  const [searchPaymentQuery, setSearchPaymentQuery] = useState('');

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
    try {
      const pkgs = await servicePackageService.getAll();
      setPackages(pkgs || []);
    } catch (e) {
      console.error(e);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


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
    const pkg = packages.find(p => p.id === id);
    setConfirmDelete({
      isOpen: true,
      title: t('common.confirm_delete') || "Xác nhận xóa?",
      description: `[FORCE DELETE] Bạn có chắc chắn muốn xóa gói "${pkg?.name}"? Hệ thống sẽ tự động gỡ gói này khỏi tất cả người dùng đang sử dụng trước khi xóa. Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          setConfirmDelete(prev => ({ ...prev, isLoading: true }));
          
          // 1. Tìm tất cả các gán gói (user-packages) liên quan đến gói này
          const allUserPkgs = await userPackageService.getAll();
          const relatedAssignments = allUserPkgs.filter(up => up.servicePackageId === id);
          
          // 2. Gỡ bỏ các gán gói này
          if (relatedAssignments.length > 0) {
            console.log(`[FORCE DELETE] Unassigning ${relatedAssignments.length} users from package ${id}...`);
            await Promise.all(relatedAssignments.map(up => userPackageService.delete(up.id)));
          }

          // 3. Xóa các mapping Robot Action (Gia cố bằng cách update về rỗng)
          if (pkg) {
            console.log(`[FORCE DELETE] Clearing robot actions for package ${id}...`);
            await servicePackageService.update(id, {
              ...pkg,
              robotActionIds: []
            });
          }

          // 4. Thực hiện xóa gói dịch vụ
          console.log(`[FORCE DELETE] Final deletion of package ${id}...`);
          await servicePackageService.delete(id);
          
          toast.success(t('common.delete_success') || 'Deleted successfully');
          fetchData();
        } catch (error: any) {
          console.error("Force delete package error:", error);
          const msg = error.message || error.data || 'An error occurred during force delete';
          toast.error(msg);
        } finally {
          setConfirmDelete(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };



  const canManage = user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR';

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
          <TabsTrigger value="definitions" className="rounded-xl px-12 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2 font-bold">
            <Package className="h-4 w-4" /> {t('manager.subscriptions.tab_packages')}
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
                    <TableHead className="font-bold">{t('admin.packages.table.desc')}</TableHead>
                    <TableHead className="font-bold">{t('admin.packages.table.price')}</TableHead>
                    <TableHead className="font-bold">{t('admin.packages.table.duration')}</TableHead>
                    <TableHead className="font-bold">{t('admin.packages.table.status')}</TableHead>
                    <TableHead className="text-right font-bold">{t('admin.packages.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                        <span className="text-sm text-muted-foreground mt-2 block">{t('common.loading')}</span>
                      </TableCell>
                    </TableRow>
                  ) : packages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 italic text-muted-foreground">
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
                        <TableCell className="max-w-[250px]">
                           <p className="text-xs text-slate-700 line-clamp-2 font-bold italic">{pkg.description || '---'}</p>
                        </TableCell>
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


      </Tabs>

      <ServicePackageModal
        isOpen={isPkgModalOpen}
        onClose={() => setIsPkgModalOpen(false)}
        onSave={handleSavePackage}
        initialData={selectedPackage || undefined}
        mode={modalMode}
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
