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
import { RoomResponse, ElderlyDTO, ElderlyProfileResponse, RobotResponse } from '@/services/api/types';
import { roomService } from '@/services/api/roomService';
import { accountService } from '@/services/api/accountService';
import { elderlyService } from '@/services/api/elderlyService';
import { robotService } from '@/services/api/robotService';
import { toast } from 'react-toastify';
import { Loader2, Plus, Bot, Home, Check, Baby, Trash2, X, Search } from 'lucide-react';
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
  const [elderlies, setElderlies] = useState<ElderlyProfileResponse[]>([]);
  const [robots, setRobots] = useState<RobotResponse[]>([]);
  const [occupiedRobotIds, setOccupiedRobotIds] = useState<Set<number>>(new Set());
  const [occupiedElderlyIds, setOccupiedElderlyIds] = useState<Set<number>>(new Set());
  const [loadingLists, setLoadingLists] = useState(false);

  // Search states
  const [searchStaff, setSearchStaff] = useState('');
  const [searchElderly, setSearchElderly] = useState('');
  const [searchRobot, setSearchRobot] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (room) {
        setRoomName(room.roomName || '');
      } else {
        setRoomName('');
      }
      setActiveTab('basic');
      // Reset search fields when opening
      setSearchStaff('');
      setSearchElderly('');
      setSearchRobot('');
    }
  }, [isOpen, room?.id]);

  const loadSelectionLists = async () => {
    setLoadingLists(true);
    try {
      const [elderlyRes, robotsRes, allRoomsRes, accountsRes] = await Promise.all([
        elderlyService.getAll(),
        robotService.getAll(),
        roomService.getAllRooms(),
        accountService.getAccounts()
      ]);
      
      // Identify robots and patients assigned to OTHER rooms
      const occupiedRobots = new Set<number>();
      const occupiedElderly = new Set<number>();
      
      allRoomsRes.forEach(r => {
        if (room && r.id === room.id) return; // Skip current room
        
        if (r.robot) {
          occupiedRobots.add(r.robot.id);
        }
        r.elderlies?.forEach(e => {
          occupiedElderly.add(e.id);
        });
      });

      // Filter out deleted or ghost caregivers/elderlies
      const activeAccountsMap = new Map();
      accountsRes.forEach(acc => {
        if (!acc.deleted) activeAccountsMap.set(acc.email?.toLowerCase(), acc);
      });


      const filteredElderlies = (elderlyRes || []).filter(el => {
        if (!el.accountId) return true;
        // Check if account exists and is not deleted
        const acc = accountsRes.find(a => a.id === el.accountId);
        return acc && !acc.deleted;
      });

      setElderlies(filteredElderlies);
      setRobots(robotsRes);
      setOccupiedRobotIds(occupiedRobots);
      setOccupiedElderlyIds(occupiedElderly);
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

  const handleUnassignRobot = async () => {
    if (!room) return;
    try {
      await roomService.unassignRobotFromRoom(room.id);
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
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/50 p-1 rounded-xl">
            <TabsTrigger value="basic" className="rounded-lg font-bold">{t('manager.rooms.modal.tab_info')}</TabsTrigger>
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


          <TabsContent value="elderlies" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Baby className="h-4 w-4" /> {t('manager.rooms.modal.elderly_desc')}
              </div>
              <Badge variant={room && room.elderlies?.length >= 4 ? "destructive" : "secondary"} className="rounded-xl font-black text-[10px] tracking-wider uppercase">
                {room?.elderlies?.length || 0} / 4 
              </Badge>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('common.search', 'Search...')} 
                value={searchElderly}
                onChange={(e) => setSearchElderly(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-white shadow-sm border-slate-200 focus-visible:ring-primary/20"
              />
            </div>

            <ScrollArea className="h-[280px] border border-slate-100 rounded-xl p-2 bg-slate-50/30">
              {loadingLists ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary/40 h-10 w-10" /></div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const availableElderlies = elderlies.filter(el => !occupiedElderlyIds.has(el.id));
                    const filteredElderlies = availableElderlies.filter(el => 
                      (el.name || '').toLowerCase().includes(searchElderly.toLowerCase())
                    );
                    const assignedList = filteredElderlies.filter(el => room?.elderlies.some((re: ElderlyDTO) => re.id === el.id));
                    const unassignedList = filteredElderlies.filter(el => !room?.elderlies.some((re: ElderlyDTO) => re.id === el.id));

                    return (
                      <>
                        {assignedList.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">{t('common.assigned', 'Assigned')}</h5>
                            {assignedList.map(el => (
                              <div key={el.id} className="flex items-center justify-between p-3 rounded-xl border bg-emerald-50/30 shadow-sm border-emerald-100 transition-all hover:border-emerald-300">
                                <div>
                                  <p className="font-bold text-sm text-emerald-900">{el.name}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="rounded-lg font-bold min-w-[100px] bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 h-8"
                                  onClick={() => handleRemoveElderly(el.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1"/> {t('manager.rooms.modal.btn_remove') || "Remove"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {unassignedList.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2 pt-2">{t('common.available', 'Available')}</h5>
                            {unassignedList.map(el => {
                              const limitReached = (room?.elderlies?.length || 0) >= 4;
                              return (
                                <div key={el.id} className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm border-slate-100 transition-all hover:border-primary/20 hover:shadow-md">
                                  <div>
                                    <p className="font-bold text-sm text-slate-900">{el.name}</p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    disabled={limitReached}
                                    className={cn("rounded-lg font-bold min-w-[100px] shadow-sm h-8", limitReached && "opacity-50")}
                                    onClick={() => handleAssignElderly(el.id)}
                                  >
                                    <Plus className="h-4 w-4 mr-1"/> {t('manager.rooms.modal.btn_add')}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {assignedList.length === 0 && unassignedList.length === 0 && (
                          <div className="text-center py-10 text-sm font-medium text-slate-400 italic">
                            {t('common.no_results', 'No results found.')}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="robot" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bot className="h-4 w-4" /> {t('manager.rooms.modal.robot_desc')}
              </div>
              <Badge variant={room && room.robot ? "destructive" : "secondary"} className="rounded-xl font-black text-[10px] tracking-wider uppercase">
                {room?.robot ? 1 : 0} / 1 
              </Badge>
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('common.search', 'Search...')} 
                value={searchRobot}
                onChange={(e) => setSearchRobot(e.target.value)}
                className="pl-9 h-10 rounded-xl bg-white shadow-sm border-slate-200 focus-visible:ring-primary/20"
              />
            </div>

            <ScrollArea className="h-[280px] border border-slate-100 rounded-xl p-2 bg-slate-50/30">
              {loadingLists ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary/40 h-10 w-10" /></div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const availableRobots = robots.filter(rb => !occupiedRobotIds.has(rb.id));
                    const filteredRobots = availableRobots.filter(rb => 
                      (rb.robotName || rb.serialNumber || '').toLowerCase().includes(searchRobot.toLowerCase())
                    );
                    const assignedList = filteredRobots.filter(rb => room?.robot?.id === rb.id);
                    const unassignedList = filteredRobots.filter(rb => room?.robot?.id !== rb.id);

                    return (
                      <>
                        {assignedList.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">{t('common.assigned', 'Assigned')}</h5>
                            {assignedList.map(rb => (
                              <div key={rb.id} className="flex items-center justify-between p-3 rounded-xl border bg-amber-50/30 shadow-sm border-amber-100 transition-all hover:border-amber-300">
                                <div className="flex items-center gap-3">
                                  <Bot className="h-8 w-8 text-amber-500 opacity-60" />
                                  <div>
                                    <p className="font-bold text-sm text-amber-900">{rb.robotName}</p>
                                    <p className="text-[10px] uppercase font-black tracking-wider text-amber-600/70">{rb.model} | {rb.serialNumber}</p>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="rounded-lg font-bold min-w-[100px] bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100 h-8"
                                  onClick={() => handleUnassignRobot()}
                                >
                                  <Trash2 className="h-4 w-4 mr-1"/> {t('manager.rooms.modal.btn_remove') || "Remove"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {unassignedList.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2 pt-2">{t('common.available', 'Available')}</h5>
                            {unassignedList.map(rb => {
                              const limitReached = !!room?.robot;
                              return (
                                <div key={rb.id} className="flex items-center justify-between p-3 rounded-xl border bg-white shadow-sm border-slate-100 transition-all hover:border-primary/20 hover:shadow-md">
                                  <div className="flex items-center gap-3">
                                    <Bot className="h-8 w-8 text-primary opacity-20" />
                                    <div>
                                      <p className="font-bold text-sm text-slate-900">{rb.robotName}</p>
                                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">{rb.model} | {rb.serialNumber}</p>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    disabled={limitReached}
                                    className={cn("rounded-lg font-bold min-w-[100px] shadow-sm h-8", limitReached && "opacity-50")}
                                    onClick={() => handleAssignRobot(rb.id)}
                                  >
                                    <Bot className="h-4 w-4 mr-1"/> {t('manager.rooms.modal.btn_assign')}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {assignedList.length === 0 && unassignedList.length === 0 && (
                          <div className="text-center py-10 text-sm font-medium text-slate-400 italic">
                            {t('common.no_results', 'No results found.')}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

