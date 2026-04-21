"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight,
  UserSquare2,
  AlertTriangle,
  Users,
  History,
  Plus,
  Search,
  Calendar,
  Loader2,
  Mail,
  Smartphone,
  HeartPulse,
  MoreHorizontal,
  Trash2,
  Info
} from "lucide-react";
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
import { useI18nStore } from "@/store/useI18nStore";
import { accountService } from "@/services/api/accountService";
import { elderlyService } from "@/services/api/elderlyService";
import { roomService } from "@/services/api/roomService";
import { caregiverService } from "@/services/api/caregiverService";
import { 
  AccountResponse, 
  RegisterDTO, 
  ElderlyProfileResponse, 
  RoomResponse, 
  CaregiverProfileResponse 
} from "@/services/api/types";
import { parseServerDate } from "@/lib/utils";
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
  account: AccountResponse & { profileId?: number; accountId?: number };
  deletedAt: number;
}

export default function UserManagementPage() {
  const { t } = useI18nStore();
  
  // Data States
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [elderlyList, setElderlyList] = useState<ElderlyProfileResponse[]>([]);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [caregiverProfiles, setCaregiverProfiles] = useState<CaregiverProfileResponse[]>([]);
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
    try {
      setLoading(true);
      const [accRes, eldRes, roomRes, profileRes] = await Promise.all([
        accountService.getAccounts(),
        elderlyService.getAll(),
        roomService.getAllRooms(),
        caregiverService.getAll()
      ]);
      setAccounts(accRes || []);
      setElderlyList(eldRes || []);
      setRooms(roomRes || []);
      setCaregiverProfiles(profileRes || []);
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

  // -- Backup Logic (Non-destructive) --
  const loadBackup = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const allRecords: BackupRecord[] = JSON.parse(raw);
      const allowedRoles = ["CAREGIVER", "FAMILYMEMBER", "ROLE_CAREGIVER", "ROLE_FAMILYMEMBER"];
      
      // Filter for display state only. DO NOT overwrite the storage here.
      const displayList = allRecords.filter(r => {
        const isFresh = Date.now() - r.deletedAt < 24 * 60 * 60 * 1000;
        const role = String(r.account.role || "").toUpperCase();
        return isFresh && allowedRoles.includes(role);
      });

      setBackupList(displayList);
    } catch (e) {
      console.warn("Failed to load backup:", e);
    }
  };

  const saveToBackup = (account: AccountResponse) => {
    const record: BackupRecord = { account, deletedAt: Date.now() };
    
    // Read raw ALL records first
    const raw = localStorage.getItem(STORAGE_KEY);
    let allRecords: BackupRecord[] = [];
    try {
      if (raw) allRecords = JSON.parse(raw);
    } catch { allRecords = []; }

    // Merge: prevent duplicates
    const otherRecords = allRecords.filter(r => r.account.id !== account.id);
    const updatedAll = [record, ...otherRecords].slice(0, 100);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAll));
    
    // Refresh display
    loadBackup();
  };

  const handleRestore = async (record: BackupRecord) => {
    try {
      await accountService.updateAccount(record.account.id, { deleted: false } as any);
      toast.success(t("common.update_success"));
      
      // Remove from global storage
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const all: BackupRecord[] = JSON.parse(raw);
        const filtered = all.filter(r => r.account.id !== record.account.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      }
      
      loadBackup();
      fetchData();
    } catch (error: any) {
      if (error.status === 403 || error.status === 501 || error.status === 400) {
        toast.info(t("admin.robots.backup.info"));
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const all: BackupRecord[] = JSON.parse(raw);
          const filtered = all.filter(r => r.account.id !== record.account.id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        }
        loadBackup();
      } else {
        toast.error(t("admin.robots.backup.error"));
      }
    }
  };

  const handlePermanentDelete = (record: BackupRecord) => {
    const { account } = record;
    const profileId = account.profileId;
    const accountId = account.accountId || account.id;

    setConfirmDelete({
      isOpen: true,
      title: t('common.confirm_permanent_delete') || "Permanently Delete Account?",
      description: `Target: ${account.fullName || account.email}. This action is irreversible.`,
      onConfirm: async () => {
        try {
          setConfirmDelete(prev => ({ ...prev, isLoading: true }));
          
          // 1. Remove from Room instead of deleting profile (Manager permission friendly)
          if (profileId && account.roomId) {
            const role = (account.role || "").toUpperCase();
            if (role.includes("CAREGIVER")) {
              await roomService.removeCaregiverFromRoom(account.roomId, profileId).catch(err => console.warn("Room unassign failed:", err));
            } else if (role.includes("ELDERLY") || activeTab === "elderly") {
              await roomService.removeElderlyFromRoom(account.roomId, profileId).catch(err => console.warn("Room unassign failed:", err));
            }
          }

          // 2. Then delete account
          if (accountId) {
            await accountService.deleteAccount(accountId);
          }

          toast.success(t("common.delete_success"));
          
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const all: BackupRecord[] = JSON.parse(raw);
            const filtered = all.filter(r => (r.account.accountId || r.account.id) !== accountId);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
          }
          
          loadBackup();
          fetchData();
        } catch (error: any) {
          toast.error(t("common.error"));
        } finally {
          setConfirmDelete(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handlePermanentDeleteAll = () => {
    if (backupList.length === 0) return;

    setConfirmDelete({
      isOpen: true,
      title: t('common.confirm_delete_all') || "Xác nhận xóa TẤT CẢ?",
      description: t('common.confirm_delete_all_desc', { count: backupList.length }) || `Bạn sắp xóa vĩnh viễn ${backupList.length} tài khoản khỏi hệ thống. Hành động này KHÔNG THỂ khôi phục.`,
      onConfirm: async () => {
        try {
          setConfirmDelete(prev => ({ ...prev, isLoading: true }));
          
          // 1. Double Delete loops
          await Promise.allSettled(backupList.map(async (record) => {
            const { account } = record;
            const profileId = account.profileId;
            const accountId = account.accountId || account.id;
            const roomId = account.roomId;

            if (profileId && roomId) {
              const role = (account.role || "").toUpperCase();
              if (role.includes("CAREGIVER")) await roomService.removeCaregiverFromRoom(roomId, profileId).catch(() => {});
              else await roomService.removeElderlyFromRoom(roomId, profileId).catch(() => {});
            }
            if (accountId) await accountService.deleteAccount(accountId).catch(() => {});
          }));

          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          toast.success("Đã dọn dẹp sạch lịch sử xóa.");
          loadBackup();
          fetchData();
        } catch (error: any) {
          toast.error(t("common.error"));
        } finally {
          setConfirmDelete(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleDelete = (item: any) => {
    const profileId = item.profileId;
    const accountId = item.accountId || item.id;

    setConfirmDelete({
      isOpen: true,
      title: t('common.confirm_delete') || "Delete Account?",
      description: "Are you sure you want to deactivate this account and remove profile assignment?",
      onConfirm: async () => {
        try {
          setConfirmDelete(prev => ({ ...prev, isLoading: true }));
          
          // 1. Unassign from Room instead of deleting profile (Manager safe approach)
          if (profileId && item.roomId) {
            if (activeTab === "caregivers") {
              await roomService.removeCaregiverFromRoom(item.roomId, profileId).catch(err => console.warn("Unassign failed:", err));
            } else if (activeTab === "elderly") {
              await roomService.removeElderlyFromRoom(item.roomId, profileId).catch(err => console.warn("Unassign failed:", err));
            }
          }

          // 2. Soft delete Account to block login
          if (accountId) {
             await accountService.updateAccount(accountId, { deleted: true });
             saveToBackup(item);
          }

          toast.success(t("common.delete_success"));
          fetchData();
          loadBackup();
        } catch (error: any) {
          toast.error(t("common.error"));
        } finally {
          setConfirmDelete(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  // -- Filtering & Sorting --
  const unifiedCaregivers = useMemo(() => {
    const accountMap = new Map();
    accounts.forEach(acc => {
      if (acc.email) accountMap.set(acc.email.toLowerCase(), acc);
    });

    const processedProfileIds = new Set<number>();
    const processedAccountEmails = new Set<string>();

    const roomCaregivers = new Map();
    rooms.forEach(room => {
      room.caregivers?.forEach(cg => {
        roomCaregivers.set(cg.id, { ...cg, roomId: room.id, roomName: room.roomName });
      });
    });

    const result = new Map();
    caregiverProfiles.forEach(p => {
      const email = p.accountEmail?.toLowerCase();
      const acc = email ? accountMap.get(email) : null;
      const roomCg = roomCaregivers.get(p.id);
      
      const key = email || `p-${p.id}`;
      result.set(key, {
        ...acc,
        ...p,
        id: p.accountId || acc?.id || p.id,
        accountId: p.accountId || acc?.id,
        profileId: p.id,
        // Priority: Profile Name > Account Name
        fullName: p.name || acc?.fullName || acc?.FullName || ('accountEmail' in p ? p.accountEmail : ''),
        email: ('accountEmail' in p ? p.accountEmail : '') || acc?.email || '',
        role: acc?.role || "CAREGIVER",
        roomId: roomCg?.roomId || p.roomId || acc?.roomId, 
        roomName: roomCg?.roomName,
        deleted: acc?.deleted,
        createdAt: acc?.createdAt || new Date().toISOString(), 
        isProfileOnly: !acc
      });
      processedProfileIds.add(p.id);
      if (email) processedAccountEmails.add(email);
    });

    // Add remaining from Rooms (Caregivers in room but profile missing from main list - rare)
    roomCaregivers.forEach((cg, profileId) => {
      if (!processedProfileIds.has(profileId)) {
        const email = cg.email?.toLowerCase();
        const acc = email ? accountMap.get(email) : null;
        const key = email || `p-room-${profileId}`;
        
        result.set(key, {
          ...acc,
          id: acc?.id || profileId,
          accountId: acc?.id,
          profileId: profileId,
          fullName: cg.name || acc?.fullName,
          email: cg.email || acc?.email,
          role: acc?.role || "CAREGIVER",
          roomId: cg.roomId,
          roomName: cg.roomName,
          deleted: acc?.deleted,
          createdAt: acc?.createdAt || new Date().toISOString(),
          isRoomOnly: !acc 
        });
        processedProfileIds.add(profileId);
        if (email) processedAccountEmails.add(email);
      }
    });

    // Add remaining from Accounts (Accounts with role Caregiver but no profile yet)
    accounts.forEach(acc => {
      const email = acc.email?.toLowerCase();
      if (email && !processedAccountEmails.has(email)) {
        const r = (acc.role || "").toUpperCase();
        if (r.includes("CAREGIVER")) {
          result.set(email, {
            ...acc,
            fullName: acc.fullName || acc.FullName,
            email: acc.email,
            createdAt: acc.createdAt,
            accountId: acc.id
          });
          processedAccountEmails.add(email);
        }
      }
    });

    return Array.from(result.values()).filter(item => {
      // 1. Hide soft-deleted accounts
      if (item.deleted) return false;

      // 2. Hide Ghost Records (Profile exists but Account is permanently gone)
      // If the profile has an accountId but we didn't find an account, it's a ghost.
      if (item.profileId && item.accountId && item.isProfileOnly) return false;

      return true;
    });
  }, [accounts, caregiverProfiles, rooms]);

  const unifiedElderly = useMemo(() => {
    const accountIdMap = new Map();
    accounts.forEach(acc => {
      accountIdMap.set(acc.id, acc);
    });

    const roomElderlyMap = new Map();
    rooms.forEach(room => {
      room.elderlies?.forEach(e => {
        roomElderlyMap.set(e.id, { roomId: room.id, roomName: room.roomName });
      });
    });

    const processedProfileIds = new Set<number>();
    const elderlyMap = new Map();
    
    // 1. Start with Profiles
    elderlyList.forEach(e => {
      const acc = e.accountId ? accountIdMap.get(e.accountId) : null;
      const roomInfo = roomElderlyMap.get(e.id);
      elderlyMap.set(e.id, { 
        ...acc,
        ...e, 
        id: e.id,
        profileId: e.id, 
        accountId: e.accountId,
        // Priority: Profile Name > Account Name
        fullName: e.name || acc?.fullName || acc?.FullName,
        roomId: roomInfo?.roomId || e.roomId,
        roomName: roomInfo?.roomName,
        deleted: acc?.deleted,
        isProfileOnly: !acc,
        email: acc?.email || 'N/A'
      });
      processedProfileIds.add(e.id);
    });

    // 2. Catch remaining Elderly from rooms (rare)
    roomElderlyMap.forEach((info, profileId) => {
      if (!processedProfileIds.has(profileId)) {
        elderlyMap.set(profileId, {
          id: profileId,
          profileId: profileId,
          name: "Resident in Room",
          roomId: info.roomId,
          roomName: info.roomName,
          isRoomOnly: true
        });
      }
    });

    return Array.from(elderlyMap.values()).filter(item => {
      if (item.deleted) return false;
      // Hide Ghost: Profile had an account but account is gone
      if (item.profileId && item.accountId && item.isProfileOnly) return false;
      return true;
    }).sort((a, b) => b.id - a.id);
  }, [elderlyList, rooms, accounts]);

  const families = useMemo(() => accounts.filter(u => {
    const r = (u.role || "").toUpperCase();
    return r.includes("FAMILYMEMBER") && !u.deleted;
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
        const created = parseServerDate(item.createdAt);
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
      const dateA = parseServerDate(a.createdAt || '1970-01-01T00:00:00Z').getTime();
      const dateB = parseServerDate(b.createdAt || '1970-01-01T00:00:00Z').getTime();
      return dateB - dateA;
    });
  };

  const currentTabItems = useMemo(() => {
    if (activeTab === "caregivers") return getFilteredData(unifiedCaregivers);
    if (activeTab === "elderly") return getFilteredData(unifiedElderly);
    if (activeTab === "family") return getFilteredData(families);
    return [];
  }, [activeTab, unifiedCaregivers, unifiedElderly, families, searchQuery, dateRange]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentTabItems.slice(start, start + itemsPerPage);
  }, [currentTabItems, currentPage]);

  const totalPages = Math.ceil(currentTabItems.length / itemsPerPage);
  
  const roomMap = useMemo(() => {
    const map: Record<number, string> = {};
    rooms.forEach(r => {
      map[r.id] = r.roomName;
    });
    return map;
  }, [rooms]);

  // -- Helpers --
  const getRoleBadge = (role: any) => {
    const roleStr = (typeof role === 'string' ? role : "").toUpperCase();
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
            <Button className="h-11 px-6 shadow-lg shadow-primary/20 gap-2 font-bold" onClick={() => { setSelectedUser(null); setIsStaffFormOpen(true); }}>
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
                  <TableHead className="py-5 uppercase text-[10px] font-black tracking-widest opacity-50">
                    {t('manager.staff.table.room') || "Room"}
                  </TableHead>
                  <TableHead className="py-5 uppercase text-[10px] font-black tracking-widest opacity-50 text-right pr-6">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                     <TableCell colSpan={5} className="py-32 text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary/20" />
                        <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">{t('common.loading')}</p>
                     </TableCell>
                  </TableRow>
                ) : paginatedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-32 text-center text-muted-foreground opacity-50">
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
                            <div className="flex items-center gap-2">
                               <span className="font-bold text-slate-900">{item.fullName}</span>
                               {item.isProfileOnly && (
                                 <Badge variant="outline" className="text-[9px] h-4 bg-amber-50 text-amber-600 border-amber-100 font-bold px-1.5 uppercase">Profile Only</Badge>
                               )}
                               {item.isRoomOnly && (
                                 <Badge variant="outline" className="text-[9px] h-4 bg-indigo-50 text-indigo-600 border-indigo-100 font-bold px-1.5 uppercase">Room Only</Badge>
                               )}
                            </div>
                            {activeTab !== "elderly" && (
                              <div className="flex items-center gap-1">
                                {getRoleBadge(item.role)}
                                {item.isProfileOnly && <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-600 border-amber-200">Profile Only</Badge>}
                                {item.isRoomOnly && <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-600 border-blue-200">Room Only</Badge>}
                              </div>
                            )}
                            {activeTab === "elderly" && (
                              <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground font-mono">RID-{item.id}</span>
                                {item.isRoomOnly && <Badge variant="outline" className="text-[8px] h-4 bg-blue-50 text-blue-600 border-blue-200 w-fit">Room Only</Badge>}
                              </div>
                            )}
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

                       <TableCell className="py-4">
                        {item.roomId ? (
                          <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100 font-bold px-3 py-1 rounded-lg">
                            {item.roomName || roomMap[item.roomId] || `Room ID: ${item.roomId}`}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic font-medium opacity-50">
                            {t('manager.staff.unassigned_room') || "Not Assigned"}
                          </span>
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
                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <DialogTitle className="text-2xl font-black flex items-center gap-3">
                         <History className="h-7 w-7 text-primary" />
                         {t('common.recent_deletions') || "Recent Deletions"}
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 font-medium">
                         Records deleted in the last 24 hours can be recovered here.
                      </DialogDescription>
                   </div>
                   {backupList.length > 0 && (
                     <Button 
                        variant="destructive" 
                        size="sm" 
                        className="rounded-xl font-bold gap-2 shadow-lg shadow-rose-900/20"
                        onClick={handlePermanentDeleteAll}
                     >
                        <Trash2 className="h-4 w-4" /> {t('common.clear_all') || 'Xóa tất cả'}
                     </Button>
                   )}
                </div>
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
                           <span className="font-bold text-slate-900 leading-tight">{record.account.fullName || record.account.FullName}</span>
                           <span className="text-[11px] text-slate-500 font-medium mb-1">{record.account.email}</span>
                           <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-1.5">
                              <div className="h-1 w-1 rounded-full bg-slate-300" />
                              Deleted at: {new Date(record.deletedAt).toLocaleTimeString()}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="font-bold rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white"
                            onClick={() => handleRestore(record)}
                          >
                            Restore
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-9 w-9 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            onClick={() => handlePermanentDelete(record)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* Premium Confirm Dialog */}
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
