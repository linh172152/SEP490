"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Users, Loader2, MoreHorizontal, Pencil, Ban, Trash2 } from "lucide-react";
import { useI18nStore } from "@/store/useI18nStore";
import { accountService } from "@/services/api/accountService";
import { AccountResponse, RegisterDTO } from "@/services/api/types";
import { UserFormModal } from "@/components/admin/users/UserFormModal";
import { ConfirmActionDialog } from "@/components/admin/users/ConfirmActionDialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UsersManagePage() {
  const { t } = useI18nStore();
  const [users, setUsers] = useState<AccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccountResponse | null>(null);

  // Confirm Dialog States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"SOFT_DELETE" | "RESTORE" | "BLOCK" | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await accountService.getAccounts();
      // Only keep MANAGER and ADMIN roles for this dashboard
      const filtered = (data || []).filter(u => {
        const r = typeof u.role === "string" ? u.role : String(u.role);
        return r === "MANAGER" || r === "ADMINISTRATOR" || r === "ADMIN";
      });
      setUsers(filtered);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch accounts from Backend");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateNew = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: AccountResponse) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: RegisterDTO | Partial<RegisterDTO>) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await accountService.updateAccount(selectedUser.id, data);
        toast.success("Account updated successfully");
      } else {
        await accountService.createAccount(data as RegisterDTO);
        toast.success("Account created successfully");
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Backend might not support this fully yet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmSoftDelete = (user: AccountResponse) => {
    setSelectedUser(user);
    setConfirmAction("SOFT_DELETE");
    setIsConfirmOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!selectedUser || !confirmAction) return;

    try {
      setIsSubmitting(true);
      if (confirmAction === "SOFT_DELETE") {
        await accountService.updateAccount(selectedUser.id, { deleted: true });
        toast.success("Account soft deleted");
      }
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Operation failed. Endpoint to update status might be missing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (deleted: boolean | undefined) => {
    if (deleted) return <Badge variant="destructive">Deleted</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" /> {t("admin.users.title") || "Account Management"}
          </h2>

        </div>
        <Button className="flex items-center gap-2" onClick={handleCreateNew}>
          <Plus className="h-4 w-4" /> {t("admin.users.create_btn") || "Create Account"}
        </Button>
      </div>



      <Card>
        <CardHeader>
          <CardTitle>{t("sidebar.user_mgt") || "User Accounts"}</CardTitle>

        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.users.table.name") || "Full Name"}</TableHead>
                <TableHead>{t("admin.users.table.email") || "Email"}</TableHead>
                <TableHead>{t("admin.users.table.role") || "Role"}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">{t("admin.users.table.actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {t("admin.users.table.no_data") || "No accounts found"}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.FullName || user.email.split("@")[0]}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={(user.role as any) === "ADMINISTRATOR" || (user.role as any) === "ADMIN" ? "destructive" : "default"}>
                        {String(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge((user as any).deleted)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {!(user as any).deleted && (
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600" 
                              onClick={() => confirmSoftDelete(user)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Soft Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserFormModal 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        user={selectedUser} 
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting} 
      />

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={executeConfirmAction}
        isLoading={isSubmitting}
        title={confirmAction === "SOFT_DELETE" ? "Soft Delete User" : "Confirm Action"}
        description={
          confirmAction === "SOFT_DELETE"
            ? `Are you sure you want to delete ${selectedUser?.FullName || selectedUser?.email}? Their account will be soft-deleted.` 
            : undefined
        }
      />
    </div>
  );
}
