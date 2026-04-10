"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Users, 
  Loader2, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  ShieldCheck,
  Mail,
  History,
  Info
} from "lucide-react";
import { useI18nStore } from "@/store/useI18nStore";
import { accountService } from "@/services/api/accountService";
import { AccountResponse, RegisterDTO } from "@/services/api/types";
import { UserFormModal } from "@/components/admin/users/UserFormModal";
import { ConfirmActionDialog } from "@/components/admin/users/ConfirmActionDialog";
import { toast } from "react-toastify";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "deleted_accounts_backup";

interface BackupRecord {
  account: AccountResponse;
  deletedAt: number;
}

export default function UsersManagePage() {
  const { t } = useI18nStore();
  const [users, setUsers] = useState<AccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter States
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("NEWEST");

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccountResponse | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupList, setBackupList] = useState<BackupRecord[]>([]);

  // Confirm Dialog States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"SOFT_DELETE" | "RESTORE" | "BLOCK" | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response: any = await accountService.getAccounts();
      const accounts = Array.isArray(response) ? response : (response?.data || []);
      setUsers(accounts);
    } catch (error: any) {
      toast.error(error.message || t("admin.users.toasts.fetch_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    loadBackup();
  }, []);

  // -- Backup Logic --
  const loadBackup = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed: BackupRecord[] = JSON.parse(raw);
      const fresh = parsed.filter(r => Date.now() - r.deletedAt < 24 * 60 * 60 * 1000);
      setBackupList(fresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const saveToBackup = (account: AccountResponse) => {
    const record: BackupRecord = { account, deletedAt: Date.now() };
    const updated = [record, ...backupList].slice(0, 50);
    setBackupList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleRestoreBackup = async (record: BackupRecord) => {
    try {
      await accountService.updateAccount(record.account.id, { deleted: false } as any);
      toast.success(t("admin.users.toasts.update_success"));
      const updated = backupList.filter(r => r.account.id !== record.account.id);
      setBackupList(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      fetchUsers();
    } catch (error: any) {
      if (error.status === 403 || error.status === 501 || error.status === 400) {
        toast.info("Tính năng khôi phục đang được phát triển (Backend chưa hỗ trợ)");
        const updated = backupList.filter(r => r.account.id !== record.account.id);
        setBackupList(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } else {
        toast.error("Lỗi khi khôi phục tài khoản");
      }
    }
  };

  // Filtered and Paginated Logic
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Search filter
    if (searchQuery) {
        result = result.filter(user => 
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.fullName || user.FullName || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Role filter
    if (roleFilter !== "ALL") {
        result = result.filter(user => {
            const r = (user.role?.toUpperCase() || "");
            return r === roleFilter || r === `ROLE_${roleFilter}`;
        });
    }

    // Sort by createdAt
    result.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === "NEWEST" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [users, searchQuery, roleFilter, sortOrder]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleCreateNew = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: RegisterDTO | Partial<RegisterDTO>) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await accountService.updateAccount(selectedUser.id, data);
        toast.success(t("admin.users.toasts.update_success"));
      } else {
        await accountService.createAccount(data as RegisterDTO);
        toast.success(t("admin.users.toasts.create_success"));
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || t("admin.users.toasts.error_generic"));
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
        saveToBackup(selectedUser);
        toast.success(t("admin.users.toasts.delete_success"));
      }
      setIsConfirmOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || t("admin.users.toasts.error_generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role.toUpperCase();
    const translatedRole = t(`common.roles.${r}`) || role;
    if (r.includes("ADMIN")) return <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">{translatedRole}</Badge>;
    if (r === "MANAGER") return <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/20 hover:bg-sky-500/20">{translatedRole}</Badge>;
    if (r === "CAREGIVER") return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">{translatedRole}</Badge>;
    return <Badge variant="secondary">{translatedRole}</Badge>;
  };

  const getStatusDisplay = (deleted: boolean | undefined) => {
    if (deleted) return (
      <div className="flex items-center gap-2 text-muted-foreground italic">
        <div className="h-2 w-2 rounded-full bg-slate-400" />
        {t("common.deleted")}
      </div>
    );
    return (
      <div className="flex items-center gap-2 text-emerald-600 font-medium">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        {t("common.active")}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Users className="h-8 w-8 text-primary" />
            </div>
            {t("admin.users.title")}
          </h2>
          <p className="text-muted-foreground mt-1 ml-1">{t("admin.users.subtitle") || "Manage all user accounts in the system"}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-11 border-dashed gap-2 font-bold" 
            onClick={() => setIsBackupOpen(true)}
          >
            <History className="h-4 w-4" />
            {t('common.restore_btn')}
            {backupList.length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px]">
                {backupList.length}
              </Badge>
            )}
          </Button>
          <Button className="h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 font-semibold" onClick={handleCreateNew}>
            <Plus className="h-5 w-5" /> {t("admin.users.create_btn")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t("admin.users.search_placeholder") || "Search by email or name..."} 
            className="pl-10 h-11 bg-card border-border/50 focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-11 w-full sm:w-[180px] bg-card border-border/50">
              <SelectValue placeholder={t("admin.users.filters.role_all")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t("admin.users.filters.role_all")}</SelectItem>
              <SelectItem value="ADMINISTRATOR">{t("common.roles.ADMINISTRATOR")}</SelectItem>
              <SelectItem value="MANAGER">{t("common.roles.MANAGER")}</SelectItem>
              <SelectItem value="CAREGIVER">{t("common.roles.CAREGIVER")}</SelectItem>
              <SelectItem value="FAMILYMEMBER">{t("common.roles.FAMILYMEMBER")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v) => { setSortOrder(v); setCurrentPage(1); }}>
            <SelectTrigger className="h-11 w-full sm:w-[180px] bg-card border-border/50">
              <SelectValue placeholder={t("admin.users.filters.sort_label")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">{t("admin.users.filters.sort_newest")}</SelectItem>
              <SelectItem value="OLDEST">{t("admin.users.filters.sort_oldest")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-b border-border/50">
                  <TableHead className="py-4 pl-6 uppercase tracking-wider text-xs font-semibold">{t("admin.users.table.name")}</TableHead>
                  <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold">{t("admin.users.table.email")}</TableHead>
                  <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold">{t("admin.users.table.role")}</TableHead>
                  <TableHead className="py-4 uppercase tracking-wider text-xs font-semibold">{t("common.status")}</TableHead>
                  <TableHead className="py-4 pr-6 text-right uppercase tracking-wider text-xs font-semibold">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary/50" />
                      <p className="mt-4 text-muted-foreground font-medium animate-pulse">{t("common.loading")}</p>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <UserCheck className="h-10 w-10 opacity-20" />
                        <p className="font-medium text-lg">{t("common.no_data")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-b border-border/40">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                            {(user.fullName || user.FullName || user.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 italic">
                                {(user.fullName || user.FullName) || user.email.split("@")[0]}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Mail className="h-3.5 w-3.5 opacity-50" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
                          {getRoleBadge(String(user.role))}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusDisplay(user.deleted !== undefined ? user.deleted : (user as any).deleted)}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-1">
                            <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase opacity-50">{t("common.actions")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {!(user.deleted !== undefined ? user.deleted : (user as any).deleted) && (
                              <DropdownMenuItem 
                                className="rounded-md px-3 py-2 gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20" 
                                onClick={() => confirmSoftDelete(user)}
                              >
                                <Trash2 className="h-4 w-4" /> {t("dialogs.delete_confirm")}
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
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-muted-foreground">
            {t("common.showing") || "Showing"} <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> {t("common.of") || "of"} <span className="font-medium text-foreground">{filteredUsers.length}</span> {t("common.results") || "results"}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-1"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> {t("common.prev") || "Prev"}
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  className="h-9 w-9 p-0"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 gap-1"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              {t("common.next") || "Next"} <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <UserFormModal 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        user={selectedUser} 
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        allowedRoles={["ADMINISTRATOR", "MANAGER"]}
      />

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={executeConfirmAction}
        isLoading={isSubmitting}
        title={confirmAction === "SOFT_DELETE" ? t("dialogs.soft_delete_title") : t("dialogs.confirm_title")}
        description={
          confirmAction === "SOFT_DELETE"
            ? t("dialogs.soft_delete_desc", { name: (selectedUser?.fullName || selectedUser?.FullName) || selectedUser?.email || "" }) 
            : undefined
        }
      />

      {/* Backup/Restore List Dialog */}
      <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
         <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl [&>button]:text-white">
            <div className="bg-slate-900 p-8 text-white">
               <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <History className="h-7 w-7 text-primary" />
                  {t('common.recent_deletions')}
               </DialogTitle>
               <DialogDescription className="text-slate-400 mt-2 font-medium">
                  Records deleted in the last 24 hours can be recovered here.
               </DialogDescription>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto bg-card">
               {backupList.length === 0 ? (
                 <div className="py-12 text-center text-muted-foreground italic">
                    <Info className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No recently deleted accounts found.</p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   {backupList.map((record) => (
                     <div key={record.account.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group transition-all hover:border-primary/20">
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-900">{record.account.fullName || record.account.FullName}</span>
                           <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                              Deleted at: {new Date(record.deletedAt).toLocaleTimeString()}
                           </span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="font-bold rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white"
                          onClick={() => handleRestoreBackup(record)}
                        >
                          Restore
                        </Button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
