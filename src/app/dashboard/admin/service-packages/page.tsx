'use client';

import { useEffect, useState } from 'react';
import { servicePackageService } from '@/services/api/servicePackageService';
import { ServicePackageResponse } from '@/services/api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Package, Trash2 } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';

export default function ServicePackagesManagePage() {
  const { t, language } = useI18nStore();
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await servicePackageService.getAll();
      setPackages(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.packages.table.confirm_delete') || 'Are you sure you want to delete this package?')) return;
    try {
       await servicePackageService.delete(id);
       fetchPackages();
    } catch (e) {
       console.error("Failed to delete", e);
       alert("Failed to delete package.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" /> {t('admin.packages.title')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('admin.packages.desc')}</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t('admin.packages.create_btn')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.packages.table_card_title')}</CardTitle>
          <CardDescription>{t('admin.packages.table_card_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.packages.table.level')}</TableHead>
                  <TableHead>{t('admin.packages.table.name')}</TableHead>
                  <TableHead>{t('admin.packages.table.desc')}</TableHead>
                  <TableHead>{t('admin.packages.table.price')}</TableHead>
                  <TableHead>{t('admin.packages.table.status')}</TableHead>
                  <TableHead className="text-right">{t('admin.packages.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-semibold"><Badge variant="outline">{pkg.level}</Badge></TableCell>
                    <TableCell className="font-semibold">{pkg.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-muted-foreground">{pkg.description}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">${pkg.price}</TableCell>
                    <TableCell>
                      <Badge variant={pkg.active ? 'default' : 'secondary'}>
                        {pkg.active ? t('admin.packages.table.active') : t('admin.packages.table.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-destructive hover:font-bold" onClick={() => handleDelete(pkg.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {packages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                       {t('admin.packages.table.no_data')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
