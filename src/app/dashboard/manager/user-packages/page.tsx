'use client';

import { useEffect, useState } from 'react';
import { userPackageService } from '@/services/api/userPackageService';
import { UserPackageResponse } from '@/services/api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, UserCog, Trash2 } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';

export default function UserPackagesManagePage() {
  const { t, language } = useI18nStore();
  const [packages, setPackages] = useState<UserPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await userPackageService.getAll();
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
    if (!confirm(t('admin.user_packages.table.confirm_revoke') || 'Are you sure you want to revoke this package?')) return;
    try {
       await userPackageService.delete(id);
       fetchPackages();
    } catch (e) {
       console.error("Failed to delete", e);
       alert("Failed to revoke user package.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-8 w-8 text-primary" /> {t('admin.user_packages.title')}
          </h2>

        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t('admin.user_packages.assign_btn')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.user_packages.table_card_title')}</CardTitle>

        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.user_packages.table.assignment_id')}</TableHead>
                  <TableHead>{t('admin.user_packages.table.account_id')}</TableHead>
                  <TableHead>{t('admin.user_packages.table.package_id')}</TableHead>
                  <TableHead>{t('admin.user_packages.table.assigned_date')}</TableHead>
                  <TableHead>{t('admin.user_packages.table.expiry_date')}</TableHead>
                  <TableHead className="text-right">{t('admin.packages.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-semibold">#{pkg.id}</TableCell>
                    <TableCell>User #{pkg.accountId}</TableCell>
                    <TableCell>PKG #{pkg.servicePackageId}</TableCell>
                    <TableCell>{new Date(pkg.assignedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium text-destructive">{new Date(pkg.expiredAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive-foreground" onClick={() => handleDelete(pkg.id)}>
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {packages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                       {t('admin.user_packages.table.no_data')}
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
