'use client';

import { useEffect, useState, useCallback } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { robotService } from '@/services/api/robotService';
import { elderlyService } from '@/services/api/elderlyService';
import { RobotResponse, ElderlyProfileResponse } from '@/services/api/types';
import { useI18nStore } from '@/store/useI18nStore';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// --- MOCK DATABASE FOR ROOMS & AUDIT LOGS ---
const MOCK_ROOMS = [
  { id: 1, name: "Room 101 - A", elderlyCount: 3 },
  { id: 2, name: "Room 102 - B", elderlyCount: 2 },
  { id: 3, name: "Room 201 - VIP", elderlyCount: 1 },
  { id: 4, name: "Room 205 - C", elderlyCount: 4 },
];

export default function AdminFleetPage() {
  const { t } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [elderlies, setElderlies] = useState<ElderlyProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'delete' | 'ota' | 'toggle';
    targetId?: number;
    feature?: string;
    newValue?: boolean;
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
    status: 'ACTIVE',
    assignedElderlyId: undefined as number | undefined
  });

  // --- ACTIONS ---


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

  const fetchElderlies = useCallback(async () => {
    try {
      const data = await elderlyService.getAll();
      setElderlies(data || []);
    } catch (e) {
      console.error("Failed to fetch elderlies", e);
    }
  }, []);

  useEffect(() => {
    fetchRobots();
    fetchElderlies();
  }, [fetchRobots, fetchElderlies]);

  const handleUpdateFirmware = async (robotId: number) => {
    toast.promise(
      robotService.updateFirmware(robotId, "v2.5.0"),
      {
        loading: t('admin.fleet.ota.loading'),
        success: () => {
          fetchRobots();
          return t('admin.fleet.ota.success');
        },
        error: t('admin.fleet.ota.error')
      }
    );
  };


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formDialog.mode === 'add') {
        const newRobot = await robotService.create(formData as any);
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
      status: 'ACTIVE',
      assignedElderlyId: elderlies.length > 0 ? elderlies[0].id : undefined
    });
    setFormDialog({ open: true, mode: 'add' });
  };

  const openEditDialog = (robot: RobotResponse) => {
    setFormData({
      robotName: robot.robotName,
      serialNumber: robot.serialNumber,
      model: robot.model,
      firmwareVersion: robot.firmwareVersion,
      status: robot.status,
      assignedElderlyId: robot.assignedElderlyId
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

  // --- RENDER HELPERS ---

  const getRoomName = (id: number) => {
    const room = MOCK_ROOMS.find(r => r.id === (id % 4) + 1);
    return room ? t('admin.fleet.room_with_count', { name: room.name, count: room.elderlyCount }) : t('admin.fleet.unassigned');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Bot className="h-9 w-9 text-indigo-600" /> {t('admin.fleet.title')}
          </h2>
          <p className="text-muted-foreground font-medium"> {t('admin.fleet.subtitle')} </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between border-b">
             <div>
                <CardTitle className="text-lg">{t('admin.fleet.tech_inventory')}</CardTitle>
                <CardDescription>{t('admin.fleet.tech_desc')}</CardDescription>
             </div>
             <Button 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                onClick={openAddDialog}
              >
                <Plus className="h-4 w-4 mr-2" /> {t('admin.fleet.dialogs.btn_register')}
             </Button>
          </CardHeader>
          <CardContent className="p-0">
             <Table>
               <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="w-[200px] font-bold">{t('admin.fleet.table.robot_serial')}</TableHead>
                    <TableHead className="font-bold">{t('admin.fleet.table.config')}</TableHead>
                    <TableHead className="font-bold">{t('admin.fleet.table.location')}</TableHead>
                    <TableHead className="font-bold">{t('admin.fleet.table.status')}</TableHead>
                    <TableHead className="text-right font-bold">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
               <TableBody>
                 {loading ? (
                   <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                         <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                         {t("common.loading")}
                      </TableCell>
                   </TableRow>
                 ) : robots.map((robot) => (
                   <TableRow key={robot.id} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell>
                         <div className="font-black text-slate-800 flex items-center gap-2">
                           <Bot className="h-4 w-4 text-slate-400" /> {robot.robotName}
                         </div>
                         <div className="text-[10px] font-mono text-muted-foreground mt-0.5 uppercase tracking-tighter">
                           SN: {robot.serialNumber}
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="text-xs font-semibold">{robot.model}</div>
                         <Badge variant="outline" className="text-[10px] h-5 mt-1 font-bold border-slate-300">
                           OS: v{robot.firmwareVersion}
                         </Badge>
                      </TableCell>
                      <TableCell>
                         <div className="text-xs font-black text-indigo-700">
                           {robot.assignedElderlyName || t('admin.fleet.unassigned')}
                         </div>
                         <div className="text-[10px] text-slate-500 italic">
                           {getRoomName(robot.id)}
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge className={`font-bold text-[10px] uppercase ${
                           robot.status?.toLowerCase() === 'active' ? 'bg-emerald-500' :
                           robot.status?.toLowerCase() === 'maintenance' ? 'bg-amber-500' :
                           'bg-slate-400'
                         }`}>
                           {robot.status || 'Offline'}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                              onClick={() => setConfirmDialog({ open: true, type: 'ota', targetId: robot.id })}
                              title="OTA Update"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-slate-600 hover:bg-slate-100"
                              onClick={() => openEditDialog(robot)}
                              title="Edit Technical"
                            >
                              <Settings2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                              onClick={() => setConfirmDialog({ open: true, type: 'delete', targetId: robot.id })}
                              title="Delete Robot"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </TableCell>
                   </TableRow>
                 ))}
                 {robots.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                        {t('admin.fleet.no_robots')}
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
        <DialogContent className="max-w-md">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-indigo-500" />
                {confirmDialog.type === 'delete' && t('admin.fleet.dialogs.confirm_delete')}
                {confirmDialog.type === 'ota' && t('admin.fleet.dialogs.confirm_ota')}
              </DialogTitle>
              <DialogDescription className="py-4 font-medium text-slate-600">
                {confirmDialog.type === 'delete' && t('admin.fleet.dialogs.confirm_delete_desc')}
                {confirmDialog.type === 'ota' && t('admin.fleet.dialogs.confirm_ota_desc', { version: 'v2.5.0', id: confirmDialog.targetId })}
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
                {t('common.cancel')}
              </Button>
              <Button 
                variant={confirmDialog.type === 'delete' ? "destructive" : "default"}
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
        <DialogContent className="max-w-md">
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-indigo-500" />
                {formDialog.mode === 'add' ? t('admin.fleet.dialogs.register_title') : t('admin.fleet.dialogs.edit_title')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.fleet.dialogs.register_desc')}
                <span className="mt-2 block text-[10px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 font-medium">
                   💡 {t('admin.fleet.dialogs.assignment_hint') || "Technical Note: Robot must be assigned to an elderly user during registration to ensure system consistency."}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="robotName">{t('admin.fleet.dialogs.robot_name')}</Label>
                <input
                  id="robotName"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={t('admin.fleet.dialogs.placeholder_name')}
                  value={formData.robotName}
                  onChange={(e) => setFormData(prev => ({ ...prev, robotName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">{t('admin.fleet.dialogs.serial')}</Label>
                <input
                  id="serialNumber"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignment" className="text-indigo-600 font-bold flex items-center gap-2">
                  <Plus className="h-4 w-4" /> {t('admin.fleet.dialogs.assign_to_elderly') || "Assign to Elderly"}
                </Label>
                <select
                  id="assignment"
                  className="flex h-10 w-full rounded-md border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-semibold"
                  value={formData.assignedElderlyId || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedElderlyId: Number(e.target.value) }))}
                  required
                >
                  <option value="" disabled>{t('admin.fleet.dialogs.select_elderly') || "Select Elderly User..."}</option>
                  {elderlies.map(elderly => (
                    <option key={elderly.id} value={elderly.id}>
                      {elderly.name || `User ID: ${elderly.accountId}`} (ID: {elderly.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                <div className="space-y-2">
                  <Label htmlFor="model">{t('admin.fleet.dialogs.model')}</Label>
                  <select
                    id="model"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  >
                    <option value="CareBot Standard v2">Standard v2</option>
                    <option value="CareBot Pro v1">Pro v1</option>
                    <option value="CareBot Mini X">Mini X</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firmware">{t('admin.fleet.dialogs.firmware')}</Label>
                  <input
                    id="firmware"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.firmwareVersion}
                    onChange={(e) => setFormData(prev => ({ ...prev, firmwareVersion: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setFormDialog(prev => ({ ...prev, open: false }))}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {formDialog.mode === 'add' ? t('admin.fleet.dialogs.btn_register') : t('admin.fleet.dialogs.btn_save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
