'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Loader2, Trash2, Edit2, Users, History } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';
import { ServicePackageModal } from './ServicePackageModal';
import { UserPackageAssignmentModal } from './UserPackageAssignmentModal';
import { userPackageService } from '@/services/api/userPackageService';
import { servicePackageService } from '@/services/api/servicePackageService';
import { elderlyService } from '@/services/api/elderlyService';
import { 
  UserPackageResponse, 
  UserPackageRequest, 
  ElderlyProfileResponse,
  ServicePackageResponse,
  ServicePackageRequest
} from '@/services/api/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast } from 'date-fns';

export default function SubscriptionsUnifiedPage() {
  const { t } = useI18nStore();
  const user = useAuthStore((state) => state.user);
  
  // Data State
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [userPackages, setUserPackages] = useState<UserPackageResponse[]>([]);
  const [elderlies, setElderlies] = useState<ElderlyProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgs, userPkgs, elderlyList] = await Promise.all([
        servicePackageService.getAll(),
        userPackageService.getAll(),
        elderlyService.getAll()
      ]);
      setPackages(pkgs || []);
      setUserPackages(userPkgs || []);
      setElderlies(elderlyList || []);
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
        await servicePackageService.create(data);
        toast.success(t('admin.packages.toasts.create_success'));
      } else if (selectedPackage) {
        await servicePackageService.update(selectedPackage.id, data);
        toast.success(t('admin.packages.toasts.update_success'));
      }
      fetchData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm(t('admin.packages.table.confirm_delete'))) return;
    try {
       await servicePackageService.delete(id);
       toast.success(t('admin.packages.toasts.delete_success'));
       fetchData();
    } catch (e) {
       console.error(e);
    }
  };

  const handleAssignSave = async (data: UserPackageRequest) => {
    try {
      await userPackageService.create(data);
      toast.success("Đã gán gói thành công");
      fetchData();
    } catch (e) {
      toast.error("Lỗi khi gán gói");
    }
  };

  const handleDeleteUserPackage = async (id: number) => {
    if (!confirm("Hủy gói đăng ký này?")) return;
    try {
      await userPackageService.delete(id);
      toast.success("Đã hủy đăng ký");
      fetchData();
    } catch (e) {
      toast.error("Lỗi khi hủy");
    }
  }

  const canManage = user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-indigo-600" /> 
            {t('sidebar.subscriptions') || "Gói đăng ký"}
          </h2>
          <p className="text-muted-foreground font-medium"> 
            {t('manager.subscriptions.subtitle') || "Quản lý mục các gói dịch vụ và thuê bao người dùng."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="definitions" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl h-14 border border-slate-200">
           <TabsTrigger value="definitions" className="rounded-xl px-8 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2">
              <Package className="h-4 w-4" /> Danh mục gói
           </TabsTrigger>
           <TabsTrigger value="subscribers" className="rounded-xl px-8 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2">
              <Users className="h-4 w-4" /> Danh sách thuê bao
           </TabsTrigger>
        </TabsList>

        <TabsContent value="definitions">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.packages.table_card_title')}</CardTitle>
                <CardDescription>{t('admin.packages.table_card_desc')}</CardDescription>
              </div>
              {canManage && (
                <Button onClick={handleAddPackage} className="rounded-xl px-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white">
                  <Plus className="h-4 w-4" /> {t('admin.packages.create_btn')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>{t('admin.packages.table.level')}</TableHead>
                      <TableHead>{t('admin.packages.table.name')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('admin.packages.table.desc')}</TableHead>
                      <TableHead>{t('admin.packages.table.price')}</TableHead>
                      <TableHead>{t('admin.packages.table.status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <Badge variant="outline" className="font-bold border-slate-200 text-slate-600 uppercase">
                            {pkg.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{pkg.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground hidden md:table-cell">
                          {pkg.description}
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600">{pkg.price.toLocaleString()} VNĐ</TableCell>
                        <TableCell>
                            <Badge variant={pkg.active ? 'default' : 'secondary'} className={pkg.active ? 'bg-emerald-500' : ''}>
                              {pkg.active ? t('common.active') : t('common.inactive')}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditPackage(pkg)} className="hover:bg-slate-100 rounded-lg">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeletePackage(pkg.id)} className="text-rose-600 hover:bg-rose-50 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Người cao tuổi đang đăng ký</CardTitle>
                <CardDescription>Danh sách các tài khoản đang sử dụng gói dịch vụ có thời hạn.</CardDescription>
              </div>
              {canManage && (
                <Button onClick={() => setIsAssignModalOpen(true)} className="rounded-xl px-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4" /> Gán gói mới
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>Người cao tuổi</TableHead>
                      <TableHead>Gói cước</TableHead>
                      <TableHead>Ngày kích hoạt</TableHead>
                      <TableHead>Ngày hết hạn</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPackages.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                          Chưa có tài khoản nào được gán gói.
                        </TableCell>
                      </TableRow>
                    ) : (
                      userPackages.map((up) => {
                        const elderly = elderlies.find(e => e.accountId === up.accountId);
                        const pkg = packages.find(p => p.id === up.servicePackageId);
                        const expired = isPast(new Date(up.expiredAt));

                        return (
                          <TableRow key={up.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-bold">{elderly?.name || `ID Account: ${up.accountId}`}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-bold">{pkg?.name || 'Gói đã xóa'}</span>
                                  <span className="text-[10px] text-muted-foreground uppercase">{pkg?.level}</span>
                                </div>
                            </TableCell>
                            <TableCell>{format(new Date(up.assignedAt), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className={expired ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {format(new Date(up.expiredAt), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                               <Badge variant={expired ? 'destructive' : 'default'} className={expired ? '' : 'bg-emerald-500'}>
                                  {expired ? 'Hết hạn' : 'Đang hoạt động'}
                               </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" onClick={() => handleDeleteUserPackage(up.id)} className="text-rose-600 hover:bg-rose-50 rounded-lg">
                                  <Trash2 className="h-4 w-4" />
                               </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServicePackageModal 
        isOpen={isPkgModalOpen}
        onClose={() => setIsPkgModalOpen(false)}
        onSave={handleSavePackage}
        initialData={selectedPackage}
        mode={modalMode}
      />

      <UserPackageAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSave={handleAssignSave}
        elderlies={elderlies}
        packages={packages}
      />
    </div>
  );
}
