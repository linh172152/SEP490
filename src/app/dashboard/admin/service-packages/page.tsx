'use client';

import { useEffect, useState } from 'react';
import { servicePackageService } from '@/services/api/servicePackageService';
import { ServicePackageRequest, ServicePackageResponse } from '@/services/api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Package, Trash2, Edit2 } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
// Dùng chung Modal từ thư mục manager
import { ServicePackageModal } from '../../manager/service-packages/ServicePackageModal';

export default function ServicePackagesAdminPage() {
  const { t } = useI18nStore();
  const user = useAuthStore((state) => state.user);
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await servicePackageService.getAll();
      setPackages(data || []);
    } catch (e) {
      console.error(e);
      toast.error(t('admin.packages.toasts.error_generic'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleAdd = () => {
    setModalMode('create');
    setSelectedPackage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: ServicePackageResponse) => {
    setModalMode('edit');
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleSave = async (data: ServicePackageRequest) => {
    try {
      if (modalMode === 'create') {
        await servicePackageService.create(data);
        toast.success(t('admin.packages.toasts.create_success'));
      } else if (selectedPackage) {
        await servicePackageService.update(selectedPackage.id, data);
        toast.success(t('admin.packages.toasts.update_success'));
      }
      fetchPackages();
    } catch (e) {
      console.error(e);
      toast.error(t('admin.packages.toasts.error_generic'));
      throw e;
    }
  };
  
  const isAdmin = user?.role === 'ADMIN';

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.packages.table.confirm_delete'))) return;
    try {
       await servicePackageService.delete(id);
       toast.success(t('admin.packages.toasts.delete_success'));
       fetchPackages();
    } catch (e) {
       console.error("Failed to delete", e);
       toast.error(t('admin.packages.toasts.error_generic'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" /> {t('admin.packages.title')}
          </h2>
          <p className="text-muted-foreground">{t('admin.packages.desc')}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t('admin.packages.create_btn')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.packages.table_card_title')}</CardTitle>
          <CardDescription>{t('admin.packages.table_card_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">{t('admin.packages.table.level')}</TableHead>
                  <TableHead>{t('admin.packages.table.name')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('admin.packages.table.desc')}</TableHead>
                  <TableHead>{t('admin.packages.table.price')}</TableHead>
                  <TableHead>{t('admin.packages.table.status')}</TableHead>
                  <TableHead className="text-right">{t('admin.packages.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold uppercase tracking-tight">
                        {pkg.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{pkg.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground hidden md:table-cell">
                      {pkg.description}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-medium">${pkg.price}</TableCell>
                    <TableCell>
                      <Badge variant={pkg.active ? 'default' : 'secondary'}>
                        {pkg.active ? t('admin.packages.table.active') : t('admin.packages.table.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex items-center justify-end gap-1">
                         {isAdmin && (
                           <>
                             <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)} className="h-8 w-8">
                                <Edit2 className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)} className="h-8 w-8 text-destructive">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                           </>
                         )}
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
                {packages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                       {t('admin.packages.table.no_data')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ServicePackageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedPackage}
        mode={modalMode}
      />
    </div>
  );
}
