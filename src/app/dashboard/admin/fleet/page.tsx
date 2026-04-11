'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Loader2, 
  Bot, 
  Trash2, 
  Settings2,
  RefreshCw,
  Cpu,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { robotService } from '@/services/api/robotService';
import { RobotResponse } from '@/services/api/types';
import { useI18nStore } from '@/store/useI18nStore';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { normalizeRobotStatus } from '@/lib/utils';


export default function AdminFleetPage() {
  const { t } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'delete' | 'ota';
    targetId?: number;
  }>({ open: false, type: 'delete' });

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: 'add' | 'edit';
    robot?: RobotResponse;
  }>({ open: false, mode: 'add' });

  const [formData, setFormData] = useState({
    robotName: '',
    serialNumber: '',
    model: 'CareBot Standard v2',
    firmwareVersion: '2.4.8',
    status: 'ACTIVE'
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'OLDEST'>('NEWEST');

  const fetchRobots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await robotService.getAll();
      setRobots(data || []);
    } catch (e) {
      toast.error(t('admin.fleet.toasts.connect_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRobots();
  }, [fetchRobots]);

  const handleUpdateFirmware = async (robotId: number) => {
    toast.promise(
      robotService.updateFirmware(robotId, "v2.5.0"),
      {
        pending: t('admin.fleet.ota.loading'),
        success: {
          render: () => {
            fetchRobots();
            return t('admin.fleet.ota.success');
          }
        },
        error: t('admin.fleet.ota.error')
      }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formDialog.mode === 'add') {
        await robotService.create(formData as any);
      } else if (formDialog.robot) {
        await robotService.update(formDialog.robot.id, formData as any);
      }
      setFormDialog(prev => ({ ...prev, open: false }));
      fetchRobots();
      toast.success(formDialog.mode === 'add' ? t('admin.fleet.toasts.register_success') : t('admin.fleet.toasts.update_success'));
    } catch (e: any) {
      toast.error(e.message || t('admin.fleet.ota.error'));
    }
  };

  const openAddDialog = () => {
    setFormData({
      robotName: '',
      serialNumber: `CB-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`,
      model: 'CareBot Standard v2',
      firmwareVersion: '2.4.8',
      status: 'ACTIVE'
    });
    setFormDialog({ open: true, mode: 'add' });
  };

  const openEditDialog = (robot: RobotResponse) => {
    setFormData({
      robotName: robot.robotName,
      serialNumber: robot.serialNumber,
      model: robot.model,
      firmwareVersion: robot.firmwareVersion,
      status: robot.status
    });
    setFormDialog({ open: true, mode: 'edit', robot });
  };

  const handleDelete = async (id: number) => {
    try {
      await robotService.delete(id);
      fetchRobots();
      toast.success(t('admin.fleet.toasts.delete_success'));
    } catch (e) {
      toast.error(t('admin.fleet.toasts.delete_error'));
    }
  };

  // Filter Logic
  const filteredRobots = useMemo(() => {
    const filtered = robots.filter(robot => {
      const normalizedStatus = normalizeRobotStatus(robot.status);
      const matchesSearch = 
        robot.robotName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        robot.serialNumber.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === 'ALL' || 
        normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'NEWEST') return b.id - a.id;
      return a.id - b.id;
    });
  }, [robots, searchQuery, statusFilter, sortBy]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(robots.map(r => normalizeRobotStatus(r.status)));
    return Array.from(statuses);
  }, [robots]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            <Bot className="h-9 w-9 text-indigo-600" /> {t('admin.fleet.title')}
          </h2>
          <p className="text-muted-foreground font-medium"> {t('admin.fleet.subtitle') || 'Global inventory and system hardware configuration.'} </p>
        </div>
      </div>

      {/* Toolbar: Search and Filter */}
      <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/20">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.fleet.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground whitespace-nowrap">
              <Filter className="h-4 w-4" /> {t('admin.fleet.filter_status')}:
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-slate-200 rounded-xl font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="ALL" className="font-medium">{t('admin.fleet.all_statuses')}</SelectItem>
                {uniqueStatuses.map(status => (
                  <SelectItem key={status} value={status} className="font-medium">
                    {t(`common.robot_status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground whitespace-nowrap">
              {t('admin.fleet.sort_date') || 'Sort'}:
            </div>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-slate-200 rounded-xl font-medium">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                <SelectItem value="NEWEST" className="font-medium">{t('admin.fleet.sort_newest') || 'Newest'}</SelectItem>
                <SelectItem value="OLDEST" className="font-medium">{t('admin.fleet.sort_oldest') || 'Oldest'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || sortBy !== 'NEWEST') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                clearFilters();
                setSortBy('NEWEST');
              }}
              className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold gap-1"
            >
              <X className="h-3 w-3" /> {t('common.clear_all')}
            </Button>
          )}

          <div className="ml-auto text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-widest hidden lg:block">
            {filteredRobots.length} / {robots.length} {t('common.results') || 'Devices'}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="border-none shadow-xl overflow-hidden rounded-2xl">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between border-b border-border/40 py-6">
             <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-indigo-500" /> {t('admin.fleet.tech_inventory')}
                </CardTitle>
                <CardDescription>{t('admin.fleet.tech_desc')}</CardDescription>
             </div>
             <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 font-bold px-5"
                onClick={openAddDialog}
              >
                <Plus className="h-4 w-4 mr-2" /> {t('admin.fleet.dialogs.btn_register')}
             </Button>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
               <TableHeader className="bg-slate-100/50 dark:bg-slate-800/50">
                  <TableRow className="border-none">
                    <TableHead className="w-[250px] font-bold uppercase text-[11px] tracking-wider pl-6">{t('admin.fleet.table.robot_serial')}</TableHead>
                    <TableHead className="font-bold uppercase text-[11px] tracking-wider">{t('admin.fleet.table.config')}</TableHead>
                    <TableHead className="font-bold uppercase text-[11px] tracking-wider">{t('admin.fleet.table.status')}</TableHead>
                    <TableHead className="text-right font-bold uppercase text-[11px] tracking-wider pr-6">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
               <TableBody>
                 {loading ? (
                   <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center text-muted-foreground">
                         <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary/40" />
                         <span className="text-xs font-bold uppercase tracking-widest animate-pulse">{t("common.loading")}</span>
                      </TableCell>
                   </TableRow>
                 ) : filteredRobots.map((robot) => {
                    const normalizedStatus = normalizeRobotStatus(robot.status);
                    return (
                    <TableRow key={robot.id} className="group transition-all hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 border-b border-border/40">
                       <TableCell className="pl-6 py-5">
                          <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Bot className="h-4 w-4 text-indigo-500" /> {robot.robotName}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-tighter opacity-70">
                            SN: {robot.serialNumber}
                          </div>
                       </TableCell>
                       <TableCell>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{robot.model}</div>
                          <Badge variant="outline" className="text-[10px] h-5 mt-1 font-bold border-indigo-200 text-indigo-600 bg-indigo-50/50">
                            FIRMWARE: v{robot.firmwareVersion}
                          </Badge>
                       </TableCell>
                       <TableCell>
                          <Badge className={`font-black text-[10px] uppercase px-2 py-0.5 rounded-md ${
                            normalizedStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' :
                            normalizedStatus === 'MAINTENANCE' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          }`}>
                            {t(`common.robot_status.${normalizedStatus}`)}
                          </Badge>
                       </TableCell>
                      <TableCell className="text-right pr-6">
                         <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 text-indigo-600 hover:bg-indigo-50 rounded-full"
                              onClick={() => setConfirmDialog({ open: true, type: 'ota', targetId: robot.id })}
                              title="OTA Update"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 text-slate-600 hover:bg-slate-100 rounded-full"
                              onClick={() => openEditDialog(robot)}
                              title="Edit Technical"
                            >
                              <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-9 w-9 text-rose-600 hover:bg-rose-50 rounded-full"
                              onClick={() => setConfirmDialog({ open: true, type: 'delete', targetId: robot.id })}
                              title="Delete Robot"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </TableCell>
                   </TableRow>
                   );
                 })}
                 {filteredRobots.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-64 text-center text-muted-foreground italic">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <Bot className="h-12 w-12" />
                          <p className="font-bold text-lg">{t('admin.fleet.no_results') || t('admin.fleet.no_robots') || "No matching robots found"}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                 )}
               </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialogs */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md rounded-2xl">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Settings2 className="h-6 w-6 text-indigo-500" />
                {confirmDialog.type === 'delete' && t('admin.fleet.dialogs.confirm_delete')}
                {confirmDialog.type === 'ota' && t('admin.fleet.dialogs.confirm_ota')}
              </DialogTitle>
              <DialogDescription className="py-4 font-medium text-slate-600 dark:text-slate-400">
                {confirmDialog.type === 'delete' && t('admin.fleet.dialogs.confirm_delete_desc')}
                {confirmDialog.type === 'ota' && t('admin.fleet.dialogs.confirm_ota_desc', { version: 'v2.5.0', id: confirmDialog.targetId ?? 0 })}
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2 pt-2">
              <Button variant="ghost" className="font-bold rounded-xl" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant={confirmDialog.type === 'delete' ? "destructive" : "default"}
                className="font-bold rounded-xl px-6"
                onClick={() => {
                   setConfirmDialog(prev => ({ ...prev, open: false }));
                   if (confirmDialog.type === 'delete' && confirmDialog.targetId) handleDelete(confirmDialog.targetId);
                   if (confirmDialog.type === 'ota' && confirmDialog.targetId) handleUpdateFirmware(confirmDialog.targetId);
                }}
              >
                {t('common.confirm')}
              </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Add/Edit Form Dialog */}
      <Dialog open={formDialog.open} onOpenChange={(open) => setFormDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
          <form onSubmit={handleFormSubmit}>
            <div className="bg-indigo-600 p-8 text-white">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                <Bot className="h-8 w-8 text-indigo-200" />
                {formDialog.mode === 'add' ? t('admin.fleet.dialogs.register_title') : t('admin.fleet.dialogs.edit_title')}
              </DialogTitle>
              <DialogDescription className="text-indigo-100 mt-2 font-medium">
                {t('admin.fleet.dialogs.register_desc') || "Define technical specifications for the robotic asset."}
              </DialogDescription>
            </div>
            
            <div className="grid gap-5 p-8 bg-card">
              <div className="space-y-2">
                <Label htmlFor="robotName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t('admin.fleet.dialogs.robot_name')}</Label>
                <input
                  id="robotName"
                  className="flex h-12 w-full rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                  placeholder={t('admin.fleet.dialogs.placeholder_name')}
                  value={formData.robotName}
                  onChange={(e) => setFormData(prev => ({ ...prev, robotName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t('admin.fleet.dialogs.serial')}</Label>
                <input
                  id="serialNumber"
                  className="flex h-12 w-full rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-sm font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all opacity-80"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="model" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t('admin.fleet.dialogs.model')}</Label>
                  <select
                    id="model"
                    className="flex h-12 w-full rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  >
                    <option value="CareBot Standard v2">Standard v2</option>
                    <option value="CareBot Pro v1">Pro v1</option>
                    <option value="CareBot Mini X">Mini X</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firmware" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">{t('admin.fleet.dialogs.firmware')}</Label>
                  <input
                    id="firmware"
                    className="flex h-12 w-full rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50 px-4 py-2 text-sm font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all"
                    value={formData.firmwareVersion}
                    onChange={(e) => setFormData(prev => ({ ...prev, firmwareVersion: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex justify-end gap-3 border-t border-border/40">
              <Button type="button" variant="ghost" className="font-bold rounded-xl px-6" onClick={() => setFormDialog(prev => ({ ...prev, open: false }))}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl px-8 shadow-lg shadow-indigo-600/20">
                {formDialog.mode === 'add' ? t('admin.fleet.dialogs.btn_register') : t('admin.fleet.dialogs.btn_save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

