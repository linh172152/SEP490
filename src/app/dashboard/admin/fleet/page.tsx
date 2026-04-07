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
  Cpu, 
  ShieldAlert, 
  Activity, 
  RefreshCw,
  Camera,
  Mic,
  Brain,
  History,
  AlertTriangle,
  Settings2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { robotService } from '@/services/api/robotService';
import { RobotResponse } from '@/services/api/types';
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// --- MOCK DATABASE FOR ROOMS & AUDIT LOGS ---
const MOCK_ROOMS = [
  { id: 1, name: "Phòng 101 - A", elderlyCount: 3 },
  { id: 2, name: "Phòng 102 - B", elderlyCount: 2 },
  { id: 3, name: "Phòng 201 - VIP", elderlyCount: 1 },
  { id: 4, name: "Phòng 205 - C", elderlyCount: 4 },
];

export default function AdminFleetPage() {
  const { t } = useI18nStore();
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);

  // Toggles State
  const [globalFeatures, setGlobalFeatures] = useState({
    camera: true,
    ai: true,
    voice: true
  });

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
    status: 'ACTIVE'
  });

  // --- ACTIONS ---

  const mockAuditLog = (action: string, details: string) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      details
    };
    setAdminLogs(prev => [newLog, ...prev.slice(0, 9)]);
    console.log(`[Audit Log] ${action}: ${details}`);
  };

  const fetchRobots = useCallback(async () => {
    setLoading(true);
    try {
      const data = await robotService.getAll();
      setRobots(data || []);
    } catch (e) {
      toast.error("Không thể kết nối danh sách Robot");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRobots();
  }, [fetchRobots]);

  const handleUpdateFirmware = async (robotId: number) => {
    toast.promise(
      robotService.updateFirmware(robotId, "v2.5.0"),
      {
        loading: 'Đang đẩy Firmware qua OTA...',
        success: () => {
          mockAuditLog("OTA Update", `Cập nhật v2.5.0 cho Robot #${robotId}`);
          fetchRobots();
          return "Cập nhật thành công!";
        },
        error: "Cập nhật thất bại"
      }
    );
  };

  const handleToggleFeature = async (feature: 'camera' | 'ai' | 'voice', value: boolean) => {
    setGlobalFeatures(prev => ({ ...prev, [feature]: value }));
    toast.promise(
      robotService.toggleHardwareFeature(feature, value),
      {
        loading: `Đang ${value ? 'bật' : 'tắt'} ${feature.toUpperCase()} toàn cục...`,
        success: () => {
          mockAuditLog("Global Toggle", `${value ? 'Bật' : 'Tắt'} tính năng ${feature}`);
          return `Đã cập nhật tính năng ${feature}`;
        },
        error: "Thao tác thất bại"
      }
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formDialog.mode === 'add') {
        const newRobot = await robotService.create(formData as any);
        mockAuditLog("Register Robot", `Thêm mới Robot ${formData.robotName} (${formData.serialNumber})`);
      } else if (formDialog.robot) {
        await robotService.update(formDialog.robot.id, formData as any);
        mockAuditLog("Edit Robot", `Cập nhật thông tin kỹ thuật Robot #${formDialog.robot.id}`);
      }
      setFormDialog(prev => ({ ...prev, open: false }));
      fetchRobots();
      toast.success(formDialog.mode === 'add' ? "Đã đăng ký robot!" : "Đã cập nhật!");
    } catch (e) {
      toast.error("Thao tác thất bại");
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
      mockAuditLog("Delete Robot", `Gỡ bỏ Robot #${id} khỏi hệ thống kỹ thuật`);
      fetchRobots();
      toast.success("Đã xóa Robot!");
    } catch (e) {
      toast.error("Lỗi khi xóa Robot");
    }
  };

  // --- RENDER HELPERS ---

  const getRoomName = (id: number) => {
    const room = MOCK_ROOMS.find(r => r.id === (id % 4) + 1);
    return room ? `${room.name} (${room.elderlyCount} người)` : "Chưa gán";
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header section with Global Controls */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Bot className="h-9 w-9 text-indigo-600" /> Quản Trị Đội Tàu Robot (Fleet)
          </h2>
          <p className="text-muted-foreground font-medium"> Quản lý thông số kỹ thuật, Firmware và quyền can thiệp phần cứng toàn cục. </p>
        </div>

        {/* Global Toggles Card */}
        <Card className="border-none shadow-xl bg-slate-900 text-white min-w-[320px]">
           <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-400 uppercase tracking-widest">
                 <ShieldAlert className="h-4 w-4" /> Bảng Điều Khiển Toàn Cục
              </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Camera className={`h-4 w-4 ${globalFeatures.camera ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">Camera (Video Call)</span>
                 </div>
                 <Switch 
                    checked={globalFeatures.camera} 
                    onCheckedChange={(val) => setConfirmDialog({ open: true, type: 'toggle', feature: 'camera', newValue: val })}
                    className="data-[state=checked]:bg-emerald-500"
                 />
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Brain className={`h-4 w-4 ${globalFeatures.ai ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">AI Processing</span>
                 </div>
                 <Switch 
                    checked={globalFeatures.ai} 
                    onCheckedChange={(val) => setConfirmDialog({ open: true, type: 'toggle', feature: 'ai', newValue: val })}
                    className="data-[state=checked]:bg-blue-500"
                 />
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Mic className={`h-4 w-4 ${globalFeatures.voice ? 'text-violet-400' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold">Voice Interface</span>
                 </div>
                 <Switch 
                    checked={globalFeatures.voice} 
                    onCheckedChange={(val) => setConfirmDialog({ open: true, type: 'toggle', feature: 'voice', newValue: val })}
                    className="data-[state=checked]:bg-violet-500"
                 />
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Robot Table */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50/50 flex flex-row items-center justify-between border-b">
               <div>
                  <CardTitle className="text-lg">Danh Sách Kỹ Thuật (Inventory)</CardTitle>
                  <CardDescription>Dữ liệu định danh và trạng thái phần cứng của toàn bộ Robot.</CardDescription>
               </div>
               <Button 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  onClick={openAddDialog}
                >
                  <Plus className="h-4 w-4 mr-2" /> Đăng ký Robot mới
               </Button>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow className="bg-slate-50/30">
                     <TableHead className="w-[200px] font-bold">Robot & Serial</TableHead>
                     <TableHead className="font-bold">Cấu Hình</TableHead>
                     <TableHead className="font-bold">Phòng (Vị Trí)</TableHead>
                     <TableHead className="font-bold">Trạng Thái</TableHead>
                     <TableHead className="text-right font-bold">Thao Tác</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {loading ? (
                     <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                           <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                           Đang tải dữ liệu kỹ thuật...
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
                           <div className="text-xs font-medium text-slate-600 italic">
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
                 </TableBody>
               </Table>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log column */}
        <div className="space-y-6">
           <Card className="border-none shadow-md bg-white dark:bg-slate-950">
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wider text-slate-500">
                    <History className="h-4 w-4" /> Nhật Ký Kỹ Thuật (Admin)
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {adminLogs.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                       <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                       <p className="text-xs italic">Chưa có hành động mới</p>
                    </div>
                 ) : adminLogs.map(log => (
                    <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-l-4 border-indigo-500 relative">
                       <div className="text-[10px] font-bold text-indigo-500 mb-1 leading-none uppercase">{log.action}</div>
                       <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">{log.details}</div>
                       <div className="text-[9px] text-muted-foreground mt-2 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString()}
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>

           <Card className="border-none shadow-md bg-amber-50">
              <CardHeader className="pb-2">
                 <CardTitle className="text-xs font-bold text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Lưu ý Quan trọng
                 </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-amber-700 leading-relaxed font-medium">
                 Các hành động thay đổi trạng thái phần cứng và Firmware sẽ ảnh hưởng trực tiếp đến trải nghiệm thực tế của người cao tuổi. 
                 <br/><br/>
                 Việc gán phòng được quản lý bởi Role **Manager**.
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-md">
           <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {confirmDialog.type === 'delete' && "Xác nhận xóa Robot?"}
                {confirmDialog.type === 'ota' && "Xác nhận cập nhật Firmware mới?"}
                {confirmDialog.type === 'toggle' && "Cảnh báo thay đổi toàn cục!"}
              </DialogTitle>
              <DialogDescription className="py-4 font-medium text-slate-600">
                {confirmDialog.type === 'delete' && "Hành động này sẽ gỡ bỏ Robot ra khỏi hệ thống. Bạn không thể hoàn tác thao tác này."}
                {confirmDialog.type === 'ota' && `Hệ thống sẽ đẩy bản cập nhật v2.5.0 qua mạng. Robot #${confirmDialog.targetId} sẽ khởi động lại.`}
                {confirmDialog.type === 'toggle' && `Việc ${confirmDialog.newValue ? 'MỞ' : 'TẮT'} tính năng ${confirmDialog.feature?.toUpperCase()} sẽ áp dụng ngay lập tức cho toàn bộ các Robot đang hoạt động.`}
              </DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
                Hủy bỏ
              </Button>
              <Button 
                variant={confirmDialog.type === 'delete' ? "destructive" : "default"}
                onClick={() => {
                   setConfirmDialog(prev => ({ ...prev, open: false }));
                   if (confirmDialog.type === 'delete' && confirmDialog.targetId) handleDelete(confirmDialog.targetId);
                   if (confirmDialog.type === 'ota' && confirmDialog.targetId) handleUpdateFirmware(confirmDialog.targetId);
                   if (confirmDialog.type === 'toggle' && confirmDialog.feature) handleToggleFeature(confirmDialog.feature as any, confirmDialog.newValue!);
                }}
              >
                Xác nhận
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
                {formDialog.mode === 'add' ? "Đăng ký Robot Mới" : "Cập nhật Thông số Kỹ thuật"}
              </DialogTitle>
              <DialogDescription>
                Nhập các thông số định danh thiết bị. Mọi thay đổi sẽ được lưu vào hệ thống Audit Log.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="robotName">Tên Robot</Label>
                <input
                  id="robotName"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ví dụ: CareBot Alpha"
                  value={formData.robotName}
                  onChange={(e) => setFormData(prev => ({ ...prev, robotName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Mã Serial (S/N)</Label>
                <input
                  id="serialNumber"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
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
                  <Label htmlFor="firmware">Firmware</Label>
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
                Hủy
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {formDialog.mode === 'add' ? "Đăng ký ngay" : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
