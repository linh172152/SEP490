'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18nStore } from '@/store/useI18nStore';
import { RoomRequest, RoomResponse, CaregiverDTO, ElderlyDTO, RobotDTO, AccountResponse, ElderlyProfileResponse, RobotResponse, CaregiverProfileResponse } from '@/services/api/types';
import { roomService } from '@/services/api/roomService';
import { accountService } from '@/services/api/accountService';
import { elderlyService } from '@/services/api/elderlyService';
import { robotService } from '@/services/api/robotService';
import { caregiverService } from '@/services/api/caregiverService';
import { toast } from 'react-toastify';
import { Loader2, Plus, Bot, Home, Check, Users, Trash2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomResponse | null;
  onRefresh: () => void;
  managerId: number;
}

export function RoomModal({ isOpen, onClose, room, onRefresh, managerId }: RoomModalProps) {
  const { t } = useI18nStore();
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [roomName, setRoomName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assignment states
  const [caregivers, setCaregivers] = useState<CaregiverProfileResponse[]>([]);
  const [elderlies, setElderlies] = useState<ElderlyProfileResponse[]>([]);
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [occupiedRobotIds, setOccupiedRobotIds] = useState<Set<number>>(new Set());
  const [occupiedElderlyIds, setOccupiedElderlyIds] = useState<Set<number>>(new Set());
  const [occupiedCaregiverIds, setOccupiedCaregiverIds] = useState<Set<number>>(new Set());
  const [loadingLists, setLoadingLists] = useState(false);

  useEffect(() => {
    if (room) {
      setRoomName(room.roomName || '');
    } else {
      setRoomName('');
    }
    setActiveTab('basic');
  }, [room, isOpen]);

  const loadSelectionLists = async () => {
    setLoadingLists(true);
    try {
      const [caregiversRes, elderlyRes, robotsRes, allRoomsRes] = await Promise.all([
        caregiverService.getAll(),
        elderlyService.getAll(),
        robotService.getAll(),
        roomService.getAllRooms()
      ]);
      
      // Identify robots, patients and STAFF assigned to OTHER rooms
      const occupiedRobots = new Set<number>();
      const occupiedElderly = new Set<number>();
      const occupiedCaregivers = new Set<number>();
      
      allRoomsRes.forEach(r => {
        if (room && r.id === room.id) return; // Skip current room
        
        if (r.robot) {
          occupiedRobots.add(r.robot.id);
        }
        r.elderlies?.forEach(e => {
          occupiedElderly.add(e.id);
        });
        r.caregivers?.forEach(c => {
          occupiedCaregivers.add(c.id);
        });
      });

      setCaregivers(caregiversRes || []);
      setElderlies(elderlyRes);
      setRobots(robotsRes);
      setOccupiedRobotIds(occupiedRobots);
      setOccupiedElderlyIds(occupiedElderly);
      setOccupiedCaregiverIds(occupiedCaregivers);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load members lists");
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab !== 'basic') {
      loadSelectionLists();
    }
  }, [isOpen, activeTab]);

  const handleSaveBasic = async () => {
    if (!roomName?.trim()) return;
    setIsSubmitting(true);
    try {
      if (room) {
        await roomService.updateRoom(room.id, { roomName, managerId });
        toast.success(t('manager.rooms.toasts.update_success'));
      } else {
        await roomService.createRoom({ roomName, managerId });
        toast.success(t('manager.rooms.toasts.create_success'));
      }
      onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
      toast.error(t('manager.rooms.toasts.error_generic') || "Error saving room");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignCaregiver = async (caregiverId: number) => {
    if (!room) return;
    try {
      await roomService.addCaregiverToRoom(room.id, caregiverId);
      toast.success(t('manager.rooms.modal.status_assigned') || "Caregiver assigned");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || t('manager.staff.toasts.error_generic'));
    }
  };

  const handleRemoveCaregiver = async (caregiverId: number) => {
    if (!room) return;
    try {
      await roomService.removeCaregiverFromRoom(room.id, caregiverId);
      toast.success(t('manager.rooms.toasts.remove_success') || "Caregiver removed from room");
      onRefresh();
      loadSelectionLists(); 
    } catch (e: any) {
      toast.error(e.message || t('common.error'));
    }
  };

  const handleAssignElderly = async (elderlyId: number) => {
    if (!room) return;
    try {
      await roomService.addElderlyToRoom(room.id, elderlyId);
      toast.success(t('manager.rooms.modal.status_in_room') || "Elderly added to room");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || t('common.error'));
    }
  };

  const handleRemoveElderly = async (elderlyId: number) => {
    if (!room) return;
    try {
      await roomService.removeElderlyFromRoom(room.id, elderlyId);
      toast.success(t('manager.rooms.toasts.remove_success') || "Elderly removed from room");
      onRefresh();
      loadSelectionLists();
    } catch (e: any) {
      toast.error(e.message || t('common.error'));
    }
  };

  const handleAssignRobot = async (robotId: number) => {
    if (!room) return;
    try {
      await roomService.assignRobotToRoom(room.id, robotId);
      toast.success(t('manager.rooms.modal.status_active') || "Robot assigned to room");
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || t('common.error'));
    }
  };

  const handleUnassignRobot = async (robotId: number) => {
    if (!room) return;
    try {
      await roomService.unassignRobotFromRoom(room.id, robotId);
      toast.success(t('manager.rooms.toasts.remove_success') || "Robot removed from room");
      onRefresh();
      loadSelectionLists();
    } catch (e: any) {
      toast.error(e.message || t('common.error'));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            {room ? t('manager.rooms.modal.edit_title') : t('manager.rooms.modal.create_title')}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-slate-100/50 p-1 rounded-xl">
            <TabsTrigger value="basic" className="rounded-lg font-bold">{t('manager.rooms.modal.tab_info')}</TabsTrigger>
            <TabsTrigger value="caregivers" disabled={!room} className="rounded-lg font-bold">{t('manager.rooms.modal.tab_staff')}</TabsTrigger>
            <TabsTrigger value="elderlies" disabled={!room} className="rounded-lg font-bold">{t('manager.rooms.modal.tab_elderly')}</TabsTrigger>
            <TabsTrigger value="robot" disabled={!room} className="rounded-lg font-bold">{t('manager.rooms.modal.tab_robot')}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="roomName" className="font-bold text-slate-700">{t('manager.rooms.modal.room_name')}</Label>
              <Input 
                id="roomName" 
                value={roomName} 
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={t('manager.rooms.modal.placeholder_name')}
                className="h-11 rounded-xl"
              />
            </div>
            <DialogFooter className="pt-4 gap-2">
              <Button variant="ghost" className="rounded-xl font-bold" onClick={onClose}>{t('common.cancel')}</Button>
              <Button onClick={handleSaveBasic} disabled={isSubmitting || !roomName?.trim()} className="rounded-xl font-bold shadow-lg shadow-primary/20">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {room ? t('manager.rooms.modal.btn_update') : t('manager.rooms.modal.btn_save')}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground pb-2 flex items-center gap-2">
              <Users className="h-4 w-4" /> {t('manager.rooms.modal.staff_desc')}
            </div>
            <ScrollArea className="h-[300px] border border-slate-100 rounded-xl p-2 bg-slate-50/30">
              {loadingLists ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary/40 h-10 w-10" /></div>
              ) : (
                <div className="space-y-2">
                  {caregivers.filter(cg => !occupiedCaregiverIds.has(cg.id)).map(cg => {
                    const isAssigned = room?.caregivers.some((rc: CaregiverDTO) => rc.id === cg.id);
                    return (
                      <div key={cg.id} className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm transition-all hover:border-primary/20">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{cg.name || cg.accountEmail}</p>
                          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">{cg.accountEmail}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={isAssigned ? "destructive" : "default"}
                          className={cn("rounded-lg font-bold min-w-[100px]", isAssigned && "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100")}
                          onClick={() => isAssigned ? handleRemoveCaregiver(cg.id) : handleAssignCaregiver(cg.id)}
                        >
                          {isAssigned ? <Trash2 className="h-4 w-4 mr-1"/> : <Plus className="h-4 w-4 mr-1"/>}
                          {isAssigned ? t('manager.rooms.modal.btn_remove') || "Remove" : t('manager.rooms.modal.btn_add')}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="elderlies" className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground pb-2 flex items-center gap-2">
              <Users className="h-4 w-4" /> {t('manager.rooms.modal.elderly_desc')}
            </div>
            <ScrollArea className="h-[300px] border border-slate-100 rounded-xl p-2 bg-slate-50/30">
              {loadingLists ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary/40 h-10 w-10" /></div>
              ) : (
                <div className="space-y-2">
                  {elderlies.filter(el => {
                    const isAlreadyInAnotherRoom = occupiedElderlyIds.has(el.id);
                    return !isAlreadyInAnotherRoom;
                  }).map(el => {
                    const isAssigned = room?.elderlies.some((re: ElderlyDTO) => re.id === el.id);
                    return (
                      <div key={el.id} className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm transition-all hover:border-primary/20">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{el.name}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={isAssigned ? "destructive" : "default"}
                          className={cn("rounded-lg font-bold min-w-[100px]", isAssigned && "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100")}
                          onClick={() => isAssigned ? handleRemoveElderly(el.id) : handleAssignElderly(el.id)}
                        >
                          {isAssigned ? <Trash2 className="h-4 w-4 mr-1"/> : <Plus className="h-4 w-4 mr-1"/>}
                          {isAssigned ? t('manager.rooms.modal.btn_remove') || "Remove" : t('manager.rooms.modal.btn_add')}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="robot" className="space-y-4">
            <div className="text-sm font-medium text-muted-foreground pb-2 flex items-center gap-2">
              <Bot className="h-4 w-4" /> {t('manager.rooms.modal.robot_desc')}
            </div>
            <ScrollArea className="h-[300px] border border-slate-100 rounded-xl p-2 bg-slate-50/30">
              {loadingLists ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary/40 h-10 w-10" /></div>
              ) : (
                <div className="space-y-2">
                  {robots.filter(rb => {
                    const isAlreadyInAnotherRoom = occupiedRobotIds.has(rb.id);
                    return !isAlreadyInAnotherRoom;
                  }).map(rb => {
                    const isAssigned = room?.robot?.id === rb.id;
                    return (
                      <div key={rb.id} className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm transition-all hover:border-primary/20">
                        <div className="flex items-center gap-3">
                          <Bot className="h-8 w-8 text-primary opacity-20" />
                          <div>
                            <p className="font-bold text-sm text-slate-900">{rb.robotName}</p>
                            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">{rb.model} | {rb.serialNumber}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant={isAssigned ? "destructive" : "default"}
                          className={cn("rounded-lg font-bold min-w-[100px]", isAssigned && "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100")}
                          onClick={() => isAssigned ? handleUnassignRobot(rb.id) : handleAssignRobot(rb.id)}
                        >
                          {isAssigned ? <Trash2 className="h-4 w-4 mr-1"/> : <Bot className="h-4 w-4 mr-1"/>}
                          {isAssigned ? t('manager.rooms.modal.btn_remove') || "Remove" : t('manager.rooms.modal.btn_assign')}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

