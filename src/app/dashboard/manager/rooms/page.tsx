'use client';

import { useEffect, useState, useMemo } from 'react';
import { roomService } from '@/services/api/roomService';
import { RoomResponse } from '@/services/api/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Search, 
  Home, 
  Baby, 
  Bot, 
  Loader2, 
  MoreVertical, 
  Pencil, 
  Trash2,
  Settings2,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
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
import { useI18nStore } from '@/store/useI18nStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';
import { RoomModal } from './RoomModal';
import { RoomViewModal } from './RoomViewModal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RoomsManagerPage() {
  const { t } = useI18nStore();
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [robotFilter, setRobotFilter] = useState<'all' | 'assigned' | 'none'>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'filled' | 'empty'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);

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

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await roomService.getAllRooms();
      setRooms(data || []);
      
      // Auto-update the selected room to reflect changes immediately
      if (selectedRoom) {
        const updatedRoom = data.find(r => r.id === selectedRoom.id);
        if (updatedRoom) {
          setSelectedRoom(updatedRoom);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(t('manager.rooms.toasts.fetch_error') || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const searchLower = searchQuery.toLowerCase();
      const matchesRoomName = (r.roomName || '').toLowerCase().includes(searchLower);
      const matchesElderlyName = r.elderlies?.some(e => (e.name || '').toLowerCase().includes(searchLower));
      const matchesSearch = matchesRoomName || matchesElderlyName;
      
      const hasRobot = !!r.robot;
      const matchesRobot = robotFilter === 'all' 
        || (robotFilter === 'assigned' && hasRobot)
        || (robotFilter === 'none' && !hasRobot);

      const hasOccupants = (r.elderlies?.length || 0) > 0;
      const matchesOccupancy = occupancyFilter === 'all'
        || (occupancyFilter === 'filled' && hasOccupants)
        || (occupancyFilter === 'empty' && !hasOccupants);

      return matchesSearch && matchesRobot && matchesOccupancy;
    });
  }, [rooms, searchQuery, robotFilter, occupancyFilter]);

  const handleCreate = () => {
    setSelectedRoom(null);
    setIsModalOpen(true);
  };

  const handleView = (room: RoomResponse) => {
    setSelectedRoom(room);
    setIsViewModalOpen(true);
  };

  const handleEdit = (room: RoomResponse) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleDelete = (room: RoomResponse) => {
    setConfirmDelete({
      isOpen: true,
      title: t('manager.rooms.toasts.delete_confirm') || "Xác nhận xóa?",
      description: t('manager.rooms.toasts.delete_confirm_desc') || `Bạn có chắc chắn muốn xóa "${room.roomName}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          setConfirmDelete(prev => ({ ...prev, isLoading: true }));
          await roomService.deleteRoom(room.id);
          toast.success(t('manager.rooms.toasts.delete_success') || "Room deleted successfully");
          fetchRooms();
        } catch (e: any) {
          console.error("Delete error:", e);
          const serverMsg = e.message || e.details || e.error;
          // Check for constraint error (status 400 or specific message)
          if (serverMsg?.toLowerCase().includes('caregiver') || serverMsg?.toLowerCase().includes('elderly')) {
            toast.error(t('manager.rooms.toasts.delete_not_empty', { name: room.roomName }) || "Vui lòng giải phóng không gian trước khi xóa.");
          } else {
            toast.error(serverMsg || t('manager.rooms.toasts.delete_error') || "Failed to delete room");
          }
        } finally {
          setConfirmDelete(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
            <Home className="h-8 w-8 text-primary" /> {t('manager.rooms.title')}
          </h2>
          <p className="text-muted-foreground">{t('manager.rooms.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> {t('manager.rooms.add_btn')}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t('manager.rooms.search_placeholder')} 
            className="pl-10 h-11 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="outline" className="h-10 px-3.5 rounded-xl flex items-center gap-1.5 border-slate-200 bg-white dark:bg-slate-900 font-bold text-[11px] shadow-sm hover:bg-slate-50 transition-all select-none">
                 <Bot className="h-3.5 w-3.5 text-primary shrink-0" />
                 <span className="leading-none">{robotFilter === 'all' ? t('manager.rooms.robot_all') : robotFilter === 'assigned' ? t('manager.rooms.robot_assigned') : t('manager.rooms.robot_none')}</span>
                 <ChevronDown className="h-3 w-3 opacity-30 shrink-0" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="rounded-xl p-1 border-slate-200 shadow-xl min-w-[160px]">
                <DropdownMenuItem onClick={() => setRobotFilter('all')} className="rounded-lg font-medium cursor-pointer text-xs">
                  {t('manager.rooms.robot_all')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRobotFilter('assigned')} className="rounded-lg font-medium cursor-pointer text-xs">
                  {t('manager.rooms.robot_assigned')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRobotFilter('none')} className="rounded-lg font-medium cursor-pointer text-xs">
                  {t('manager.rooms.robot_none')}
                </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>

           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="outline" className="h-10 px-3.5 rounded-xl flex items-center gap-1.5 border-slate-200 bg-white dark:bg-slate-900 font-bold text-[11px] shadow-sm hover:bg-slate-50 transition-all select-none">
                 <Baby className="h-3.5 w-3.5 text-primary shrink-0" />
                 <span className="leading-none">{occupancyFilter === 'all' ? t('manager.rooms.occupancy_all') : occupancyFilter === 'filled' ? t('manager.rooms.occupancy_filled') : t('manager.rooms.occupancy_empty')}</span>
                 <ChevronDown className="h-3 w-3 opacity-30 shrink-0" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="start" className="rounded-xl p-1 border-slate-200 shadow-xl min-w-[160px]">
                <DropdownMenuItem onClick={() => setOccupancyFilter('all')} className="rounded-lg font-medium cursor-pointer text-xs">
                  {t('manager.rooms.occupancy_all')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOccupancyFilter('filled')} className="rounded-lg font-medium cursor-pointer text-xs">
                  {t('manager.rooms.occupancy_filled')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOccupancyFilter('empty')} className="rounded-lg font-medium cursor-pointer text-xs">
                  {t('manager.rooms.occupancy_empty')}
                </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <Card className="col-span-full border-dashed p-12 text-center rounded-2xl bg-slate-50/50">
            <div className="flex flex-col items-center gap-3 opacity-20">
              <Home className="h-16 w-16" />
              <p className="text-xl font-medium">{t('manager.rooms.empty_state')}</p>
            </div>
          </Card>
        ) : (
          filteredRooms.map((room) => (
            <Card key={room.id} className="group hover:shadow-2xl transition-all duration-300 border-border/60 overflow-hidden rounded-2xl">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/40">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold italic text-slate-900 dark:text-slate-100">{room.roomName}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-slate-200 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl p-2 border-slate-200 shadow-xl">
                      <DropdownMenuItem onClick={() => handleView(room)} className="rounded-lg gap-2 font-medium cursor-pointer">
                        <Home className="h-4 w-4 text-emerald-500" /> {t('common.view', 'View Details')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(room)} className="rounded-lg gap-2 font-medium cursor-pointer">
                        <Pencil className="h-4 w-4 text-sky-500" /> {t('manager.rooms.card.edit_info')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-rose-600 rounded-lg gap-2 font-medium cursor-pointer" onClick={() => handleDelete(room)}>
                        <Trash2 className="h-4 w-4" /> {t('manager.rooms.card.delete_room')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl group-hover:bg-emerald-100/50 transition-colors">
                  <Baby className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">{t('manager.rooms.card.elderly')}</p>
                    <p className="font-bold text-emerald-600">{room.elderlies?.length || 0}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl flex items-center justify-between border border-dashed border-slate-200 group-hover:bg-white group-hover:border-amber-200 transition-all">
                  <div className="flex items-center gap-3">
                    <Bot className={cn("h-5 w-5", room.robot ? "text-amber-500" : "text-slate-300")} />
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">{t('manager.rooms.card.robot')}</p>
                      <p className={cn("font-bold text-xs truncate max-w-[120px]", room.robot ? "text-slate-900 dark:text-slate-100" : "text-slate-400 italic font-medium uppercase text-[10px]")}>
                        {room.robot ? room.robot.robotName : t('manager.rooms.card.none')}
                      </p>
                    </div>
                  </div>
                  {!room.robot && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(room)} className="h-7 text-[10px] font-black uppercase tracking-tighter rounded-lg bg-white shadow-sm border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all">
                      {t('manager.rooms.card.assign_btn')}
                    </Button>
                  )}
                </div>

                <Button 
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-none font-bold text-xs uppercase tracking-widest mt-2 shadow-xl shadow-slate-200 dark:shadow-none rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => handleEdit(room)}
                >
                  <Settings2 className="h-4 w-4 mr-2" /> {t('manager.rooms.card.manage_btn')}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <RoomModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={selectedRoom}
        onRefresh={fetchRooms}
        managerId={Number(user?.id) || 0}
      />
      <RoomViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        room={selectedRoom}
      />

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
