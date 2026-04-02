'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Users, UserCog } from 'lucide-react';
import { fakeUsers, FakeUser } from '@/services/fakeUsers';

import { useI18nStore } from '@/store/useI18nStore';

export default function UsersManagePage() {
  const { t, language } = useI18nStore();
  // Use mock users since backend Account API does not yet provide a full GET list
  const [users] = useState<FakeUser[]>(fakeUsers);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> {t('admin.users.title')}
          </h2>
          <p className="text-muted-foreground mt-1">{t('admin.users.desc')}</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> {t('admin.users.create_btn')}
        </Button>
      </div>

      <div className="mb-4 p-4 text-sm text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-500 dark:border-yellow-900/50">
        <strong>Note:</strong> {t('admin.overview.total_accounts_desc')}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('sidebar.user_mgt')}</CardTitle>
          <CardDescription>{t('admin.users.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.users.table.name')}</TableHead>
                <TableHead>{t('admin.users.table.email')}</TableHead>
                <TableHead>{t('admin.users.table.role')}</TableHead>
                <TableHead className="text-right">{t('admin.users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'DOCTOR' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    {t('admin.users.table.no_data')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
