"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Users, 
  Loader2, 
  MoreHorizontal, 
  Trash2, 
  Search, 
  Calendar,
  Mail,
  Smartphone,
  HeartPulse,
  History,
  Info,
  ChevronLeft,
  ChevronRight,
  UserSquare2
} from "lucide-react";
import { useI18nStore } from "@/store/useI18nStore";
import { accountService } from "@/services/api/accountService";
import { elderlyService } from "@/services/api/elderlyService";
import { AccountResponse, RegisterDTO, ElderlyProfileResponse } from "@/services/api/types";
import { UserFormModal } from "@/components/admin/users/UserFormModal";
import { ElderlyFormModal } from "./ElderlyFormModal"; 
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

export default function UserManagementPage() {
  const { t } = useI18nStore();
  
  // Data States
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [elderlyList, setElderlyList] = useState<ElderlyProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // View States
  const [activeTab, setActiveTab] = useState("caregivers");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("ALL"); // ALL, TODAY, WEEK
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [isElderlyFormOpen, setIsElderlyFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccountResponse | null>(null);
  const [selectedElderly, setSelectedElderly] = useState<ElderlyProfileResponse | null>(null);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [backupList, setBackupList] = useState<BackupRecord[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, eldRes] = await Promise.all([
        accountService.getAccounts(),
        elderlyService.getAll()
      ]);
      setAccounts(accRes || []);
      setElderlyList(eldRes || []);
    } catch (error) {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    loadBackup();
  }, []);

  // -- Backup Logic --
  const loadBackup = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed: BackupRecord[] = JSON.parse(raw);
      // Filter out records > 24h old
      const fresh = parsed.filter(r => Date.now() - r.deletedAt < 24 * 60 * 60 * 1000);
      setBackupList(fresh);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const saveToBackup = (account: AccountResponse) => {
    const record: BackupRecord = { account, deletedAt: Date.now() };
    const updated = [record, ...backupList].slice(0, 50); // Keep last 50
    setBackupList(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleRestore = async (record: BackupRecord) => {
    try {
      // TODO: Implement server-side reactivation if supported
      // Attempting to reset deleted flag
      await accountService.updateAccount(record.account.id, { deleted: false } as any);
      
      toast.success(t("common.update_success"));
      // Remove from backup
      const updated = backupList.filter(r => r.account.id !== record.account.id);
      setBackupList(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      fetchData();
    } catch (error: any) {
      if (error.status === 403 || error.status === 501 || error.status === 400) {
        toast.info("Tính năng khôi phục đang được phát triển (Backend chưa hỗ trợ)");
        // User asked to clean from localStorage to avoid confusion even if fails
        const updated = backupList.filter(r => r.account.id !== record.account.id);
        setBackupList(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } else {
        toast.error("Lỗi khi khôi phục tài khoản");
      }
    }
  };

  const handleDelete = async (account: AccountResponse) => {
     if (!confirm(t('confirm_delete') || "Are you sure?")) return;
     try {
        await accountService.updateAccount(account.id, { deleted: true });
        saveToBackup(account);
        toast.success(t("common.delete_success"));
        fetchData();
     } catch (err) {
        toast.error(t("common.error"));
     }
  };

  // -- Filtering & Sorting --
  const caregivers = useMemo(() => accounts.filter(u => {
    const r = (typeof u.role === 'string' ? u.role : (u as any).Role?.name || u.role?.name || "").toUpperCase();
    return r.includes("CAREGIVER");
  }), [accounts]);

  const families = useMemo(() => accounts.filter(u => {
    const r = (typeof u.role === 'string' ? u.role : (u as any).Role?.name || u.role?.name || "").toUpperCase();
    return r.includes("FAMILYMEMBER");
  }), [accounts]);

  const getFilteredData = (data: any[]) => {
    // TODO: Move filtering to server-side when dataset becomes large
    let result = data.filter(item => {
      const q = searchQuery.toLowerCase();
      const name = (item.fullName || item.FullName || item.name || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      const phone = (item.phone || "").toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });

    if (dateRange !== "ALL") {
      const now = new Date();
      result = result.filter(item => {
        if (!item.createdAt) return false;
        const created = new Date(item.createdAt);
        if (dateRange === "TODAY") {
          return created.toDateString() === now.toDateString();
        }
        if (dateRange === "WEEK") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return created >= sevenDaysAgo;
        }
        return true;
      });
    }

    // Default sort by CreatedAt Newest
    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  };

  const currentTabItems = useMemo(() => {
    if (activeTab === "caregivers") return getFilteredData(caregivers);
    if (activeTab === "elderly") return getFilteredData(elderlyList);
    if (activeTab === "family") return getFilteredData(families);
    return [];
  }, [activeTab, caregivers, elderlyList, families, searchQuery, dateRange]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentTabItems.slice(start, start + itemsPerPage);
  }, [currentTabItems, currentPage]);

  const totalPages = Math.ceil(currentTabItems.length / itemsPerPage);

  // -- Helpers --
  const getRoleBadge = (role: any) => {
    const roleStr = (typeof role === 'string' ? role : role?.name || "").toUpperCase();
    if (roleStr.includes("CAREGIVER")) return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">{t('common.roles.CAREGIVER')}</Badge>;
    if (roleStr.includes("FAMILY")) return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/20">{t('common.roles.FAMILYMEMBER')}</Badge>;
    return <Badge variant="outline">{t('common.roles.ELDERLYUSER')}</Badge>;
  };

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
             <div className="bg-primary/10 p-2 rounded-xl">
               <Users className="h-8 w-8 text-primary" />
             </div>
             {t('manager.staff.title')} {/* "User Management" from earlier fix */}
          </h2>
          <p className="text-muted-foreground mt-1 ml-1">{t('manager.staff.subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-11 border-dashed gap-2 font-bold" 
            onClick={() => setIsBackupOpen(true)}
          >
            <History className="h-4 w-4" />
            {t('common.restore_btn') || "Restore Recently Deleted"}
            {backupList.length > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-[10px]">
                {backupList.length}
              </Badge>
            )}
          </Button>

          {activeTab === "caregivers" && (
            <Button className="h-11 px-6 shadow-lg shadow-primary/20 gap-2 font-bold" onClick={() => setIsStaffFormOpen(true)}>
              <Plus className="h-5 w-5" /> {t('manager.staff.add_btn')}
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-2xl border border-border/40 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t("admin.users.search_placeholder") || "Search users..."} 
            className="pl-10 h-11 bg-slate-50 border-none focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <Select value={dateRange} onValueChange={(val) => { setDateRange(val); setCurrentPage(1); }}>
          <SelectTrigger className="w-[180px] h-11 bg-slate-50 border-none font-bold">
            <Calendar className="h-4 w-4 mr-2 opacity-50" />
            <SelectValue placeholder="All Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Time</SelectItem>
            <SelectItem value="TODAY">Today</SelectItem>
            <SelectItem value="WEEK">Last 7 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }} className="w-full">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl h-14 w-fit mb-4">
          <TabsTrigger value="caregivers" className="h-12 px-8 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('common.roles.CAREGIVER')}
          </TabsTrigger>
          <TabsTrigger value="elderly" className="h-12 px-8 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('common.roles.ELDERLYUSER') || "Residents"}
          </TabsTrigger>
          <TabsTrigger value="family" className="h-12 px-8 rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
            {t('common.roles.FAMILYMEMBER')}
          </TabsTrigger>
        </TabsList>

        <Card className="border-none shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/80 dark:bg-slate-900/50">
                <TableRow className="border-b border-border/40">
                  <TableHead className="pl-6 py-5 uppercase text-[10px] font-black tracking-widest opacity-50">{t('common.name') || "Name"}</TableHead>
                  <TableHead className="py-5 uppercase text-[10px] font-black tracking-widest opacity-50">
                    {activeTab === "elderly" ? t('manager.residents.table.dob') : t('manager.staff.table.email_phone')}
                  </TableHead>
                  <TableHead className="py-5 uppercase text-[10px] font-black tracking-widest opacity-50">
                    {activeTab === "elderly" ? t('manager.residents.table.health') : t('manager.staff.table.status')}
                  </TableHead>
                  <TableHead className="py-5 uppercase text-[10px] font-black tracking-widest opacity-50 text-right pr-6">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                     <TableCell colSpan={4} className="py-32 text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary/20" />
                        <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">{t('common.loading')}</p>
                     </TableCell>
                  </TableRow>
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-32 text-center text-muted-foreground opacity-50">
                       <UserSquare2 className="h-16 w-16 mx-auto mb-4 opacity-10" />
                       <p className="text-xl font-bold">{t('common.no_data')}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedItems.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200">
                             {(item.fullName || item.FullName || item.name || "?")[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{(item.fullName || item.FullName || item.name)}</span>
                            {activeTab !== "elderly" && <div>{getRoleBadge(item.role)}</div>}
                            {activeTab === "elderly" && <span className="text-[10px] text-muted-foreground font-mono">RID-{item.id}</span>}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                         {activeTab === "elderly" ? (
                           <div className="flex items-center gap-2 text-sm font-medium">
                              <Calendar className="h-3.5 w-3.5 opacity-50" />
                              {new Date(item.dateOfBirth).toLocaleDateString()}
                           </div>
                         ) : (
                           <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                 <Mail className="h-3 w-3" /> {item.email}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                 <Smartphone className="h-3 w-3" /> {item.phone || "N/A"}
                              </div>
                           </div>
                         )}
                      </TableCell>

                      <TableCell className="py-4">
                        {activeTab === "elderly" ? (
                           <div className="flex items-center gap-2 max-w-[250px]">
                              <HeartPulse className="h-4 w-4 text-rose-500 shrink-0" />
                              <p className="text-xs italic text-muted-foreground line-clamp-1">{item.healthNotes || "N/A"}</p>
                           </div>
                        ) : (
                           <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-tighter">
                              <div className={`h-1.5 w-1.5 rounded-full ${item.deleted ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`} />
                              {item.deleted ? t('common.deleted') : t('common.active')}
                           </div>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 rounded-full hover:bg-slate-200">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-2xl border-none">
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase opacity-30 tracking-widest">{t('common.actions')}</DropdownMenuLabel>
                               {/* Caregivers/Family can only be removed. Elderly is now read-only View + Remove. */}
                            {activeTab === "elderly" ? (
                              <DropdownMenuItem 
                                className="rounded-lg gap-2 font-bold py-2.5" 
                                onClick={() => { setSelectedElderly(item); setIsElderlyFormOpen(true); }}
                              >
                                <Users className="h-4 w-4 text-indigo-500" /> {t('common.view_profile')}
                              </DropdownMenuItem>
                            ) : null}

                            {!item.deleted && (
                              <DropdownMenuItem 
                                className="text-rose-600 rounded-lg gap-2 font-bold py-2.5" 
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="h-4 w-4" /> {t('common.remove')}
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
      </Tabs>

      {/* Backup/Restore List Dialog */}
      <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
         <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border-none shadow-2xl [&>button]:text-white">
            <div className="bg-slate-900 p-8 text-white">
               <DialogTitle className="text-2xl font-black flex items-center gap-3">
                  <History className="h-7 w-7 text-primary" />
                  {t('common.recent_deletions') || "Recent Deletions"}
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
                          onClick={() => handleRestore(record)}
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

      {/* Modals */}
      <UserFormModal 
        open={isStaffFormOpen} 
        onOpenChange={setIsStaffFormOpen} 
        user={null} 
        onSubmit={async (data) => {
          try {
            await accountService.createAccount(data as RegisterDTO);
            toast.success(t("common.create_success"));
            setIsStaffFormOpen(false);
            fetchData();
          } catch (err: any) {
            toast.error(err.message || t("common.error"));
          }
        }}
        isSubmitting={false}
        allowedRoles={["CAREGIVER"]}
      />

      <ElderlyFormModal 
        isOpen={isElderlyFormOpen}
        onClose={() => setIsElderlyFormOpen(false)}
        patient={selectedElderly}
        onRefresh={fetchData}
        isReadOnly={true}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4 bg-slate-50/50 rounded-xl border border-border/20">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
            {t("common.showing") || "Showing"} <span className="text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, currentTabItems.length)}</span> {t("common.of") || "of"} <span className="text-foreground font-black">{currentTabItems.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/50" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg hover:bg-white border border-transparent hover:border-border/50" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
