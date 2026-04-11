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
  Home, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Smartphone
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

const MOCK_ROOMS = [
  { id: 1, name: "Room 101 - A" },
  { id: 2, name: "Room 102 - B" },
  { id: 3, name: "Room 201 - VIP" },
  { id: 4, name: "Room 205 - C" },
];

export default function StaffManagePage() {
  const { t } = useI18nStore();
  const [users, setUsers] = useState<AccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccountResponse | null>(null);

  // Confirm Dialog States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"SOFT_DELETE" | null>(null);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const response: any = await accountService.getAccounts();
      const data = Array.isArray(response) ? response : (response?.data || []);
      
      // Filter CAREGIVER and FAMILYMEMBER roles defensively
      const filtered = (data || []).filter((u: any) => {
        const rawRole = u.role || u.Role || "";
        const roleStr = typeof rawRole === 'string' ? rawRole : (rawRole?.name || String(rawRole));
        const r = roleStr.toUpperCase().trim();
        return r === "CAREGIVER" || r === "FAMILYMEMBER" || r === "ROLE_CAREGIVER" || r === "ROLE_FAMILYMEMBER";
      });
      setUsers(filtered);
    } catch (error: any) {
      toast.error(error.message || t("manager.staff.toasts.fetch_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filtered and Paginated Logic
  const filteredStaff = useMemo(() => {
    return users.filter(user => 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.fullName || user.FullName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStaff.slice(start, start + itemsPerPage);
  }, [filteredStaff, currentPage]);

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
        toast.success(t("manager.staff.toasts.update_success"));
      } else {
        await accountService.createAccount(data as RegisterDTO);
        toast.success(t("manager.staff.toasts.create_success"));
      }
      setIsFormOpen(false);
      fetchStaff();
    } catch (error: any) {
      if (error.status === 403) {
        toast.error(t("manager.staff.toasts.permission_denied"));
      } else {
        toast.error(error.message || t("manager.staff.toasts.error_generic"));
      }
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
        toast.success(t("manager.staff.toasts.delete_success"));
      }
      setIsConfirmOpen(false);
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || t("manager.staff.toasts.error_generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoomName = (roomId?: number | null) => {
    if (!roomId) return <span className="text-muted-foreground italic text-[10px]">{t('manager.staff.unassigned_room')}</span>;
    const room = MOCK_ROOMS.find(r => r.id === roomId);
    return (
      <div className="flex items-center gap-1.5 text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full text-xs">
        <Home className="h-3 w-3" />
        {room ? room.name : `${t('manager.staff.room_prefix')} ${roomId}`}
      </div>
    );
  };

  const getRoleBadge = (role: any) => {
    const rawRole = role || "";
    const roleStr = (typeof rawRole === 'string' ? rawRole : (rawRole?.name || String(rawRole))).toUpperCase();
    const cleanRole = roleStr.replace("ROLE_", "");
    const translatedRole = t(`common.roles.${cleanRole}`) || roleStr;
    
    if (roleStr.includes("CAREGIVER")) return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">{translatedRole}</Badge>;
    if (roleStr.includes("FAMILYMEMBER")) return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/20 hover:bg-purple-500/20">{translatedRole}</Badge>;
    return <Badge variant="outline">{translatedRole}</Badge>;
  };

  const getStatusDisplay = (deleted: boolean | undefined) => {
    if (deleted) return (
      <div className="flex items-center gap-1.5 text-muted-foreground italic text-xs">
        <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {t("common.deleted")}
      </div>
    );
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {t("common.active")}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Users className="h-8 w-8 text-primary" />
            </div>
            {t('manager.staff.title')}
          </h2>
          <p className="text-muted-foreground mt-1 ml-1">{t('manager.staff.subtitle')}</p>
        </div>
        <Button className="h-11 px-6 shadow-lg shadow-primary/20 flex items-center gap-2 font-semibold bg-primary hover:opacity-90 transition-all" onClick={handleCreateNew}>
          <Plus className="h-5 w-5" /> {t('manager.staff.add_btn')}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t("admin.users.search_placeholder") || "Search by email or name..."} 
            className="pl-10 h-11 bg-card border-border/50 shadow-sm focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/40">
          <CardTitle className="text-lg flex items-center gap-2 font-bold opacity-80">
            {t('manager.staff.list_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('manager.staff.table.name')}</TableHead>
                  <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('manager.staff.table.email_phone')}</TableHead>
                  <TableHead className="py-4 text-center uppercase tracking-wider text-[11px] font-bold opacity-70">{t('manager.staff.table.room')}</TableHead>
                  <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('manager.staff.table.status')}</TableHead>
                  <TableHead className="text-right pr-6 py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('manager.staff.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary/50" />
                      <p className="text-sm mt-4 text-muted-foreground font-medium animate-pulse">{t('common.loading')}</p>
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-10 w-10 opacity-10" />
                        <p className="font-medium text-lg">{t('common.no_data')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStaff.map((user) => (
                    <TableRow key={user.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all border-b border-border/40">
                      <TableCell className="pl-6 py-4 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 border border-border/50">
                            {(user.fullName || user.FullName || user.email)[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-slate-100 italic">{(user.fullName || user.FullName) || t('common.no_data')}</span>
                            <div className="mt-0.5">{getRoleBadge(user.role)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col text-sm gap-1">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                            <Mail className="h-3 w-3 opacity-60" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Smartphone className="h-3 w-3 opacity-60" />
                            {user.phone || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex justify-center">
                          {getRoomName(user.roomId)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusDisplay(user.deleted !== undefined ? user.deleted : (user as any).deleted)}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-1">
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase opacity-50 tracking-tighter">{t('common.actions')}</DropdownMenuLabel>
                            <DropdownMenuItem className="rounded-md px-3 py-2 gap-2" onClick={() => handleEdit(user)}>
                              <Pencil className="h-4 w-4" /> {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!(user.deleted !== undefined ? user.deleted : (user as any).deleted) && (
                              <DropdownMenuItem 
                                className="rounded-md px-3 py-2 gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20" 
                                onClick={() => confirmSoftDelete(user)}
                              >
                                <Trash2 className="h-4 w-4" /> {t('dialogs.delete_confirm')}
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
        <div className="flex items-center justify-between px-2 py-4 bg-slate-50/30 dark:bg-slate-900/10 rounded-xl border border-border/20">
          <p className="text-xs text-muted-foreground font-medium">
            {t("common.showing") || "Showing"} <span className="text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredStaff.length)}</span> {t("common.of") || "of"} <span className="text-foreground">{filteredStaff.length}</span> {t("common.results") || "results"}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 mx-2">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 w-8 p-0 text-xs ${currentPage === i + 1 ? "shadow-md shadow-primary/20" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
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
        allowedRoles={["CAREGIVER", "FAMILYMEMBER"]}
      />

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={executeConfirmAction}
        isLoading={isSubmitting}
        title={t('dialogs.soft_delete_title')}
        description={t('dialogs.soft_delete_desc').replace('{{name}}', (selectedUser?.fullName || selectedUser?.FullName) || selectedUser?.email || '')}
      />
    </div>
  );
}
