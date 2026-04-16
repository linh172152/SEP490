'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18nStore } from '@/store/useI18nStore';
import { RoomResponse, CaregiverDTO, ElderlyDTO } from '@/services/api/types';
import { Bot, Home, Users, Baby, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface RoomViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomResponse | null;
}

export function RoomViewModal({ isOpen, onClose, room }: RoomViewModalProps) {
  const { t } = useI18nStore();

  if (!room) return null;

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-0 overflow-hidden bg-white shadow-2xl border-slate-100 dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader className="p-6 bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-slate-900">{room.roomName}</span>
              <span className="block text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">{t('manager.rooms.modal.tab_info')}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] px-6 py-4">
          <div className="space-y-6">
            
            {/* Robot Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('manager.rooms.modal.tab_robot')}</h4>
                <div className="flex-1 border-b border-dashed border-slate-200"></div>
                <Badge variant={room.robot ? "default" : "outline"} className="rounded-lg text-[10px]">
                  {room.robot ? "1/1" : "0/1"}
                </Badge>
              </div>
              
              {room.robot ? (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-slate-100/50">
                  <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{room.robot.robotName}</h5>
                    <p className="text-xs text-slate-500 font-medium">{room.robot.model} • {room.robot.serialNumber}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
                  {t('manager.rooms.card.none')}
                </div>
              )}
            </div>

            {/* Caregivers Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('manager.rooms.modal.tab_staff')}</h4>
                <div className="flex-1 border-b border-dashed border-slate-200"></div>
                <Badge variant={room.caregivers?.length ? "default" : "outline"} className="rounded-lg text-[10px] bg-indigo-500/10 text-indigo-600 border-none">
                  {room.caregivers?.length || 0}/2
                </Badge>
              </div>

              {room.caregivers && room.caregivers.length > 0 ? (
                <div className="grid gap-2">
                  {room.caregivers.map((cg: CaregiverDTO) => (
                    <div key={cg.id} className="flex items-center gap-4 p-3 rounded-xl bg-white shadow-sm border border-slate-100/50">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold text-sm">
                          {getInitials(cg.name || cg.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{cg.name || cg.email}</p>
                        <p className="text-xs text-slate-500 truncate">{cg.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
                  {t('common.no_data')}
                </div>
              )}
            </div>

            {/* Elderlies Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Baby className="h-4 w-4 text-emerald-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{t('manager.rooms.modal.tab_elderly')}</h4>
                <div className="flex-1 border-b border-dashed border-slate-200"></div>
                <Badge variant={room.elderlies?.length ? "default" : "outline"} className="rounded-lg text-[10px] bg-emerald-500/10 text-emerald-600 border-none">
                  {room.elderlies?.length || 0}/4
                </Badge>
              </div>

              {room.elderlies && room.elderlies.length > 0 ? (
                <div className="grid gap-2">
                  {room.elderlies.map((el: ElderlyDTO) => (
                    <div key={el.id} className="flex items-center gap-4 p-3 rounded-xl bg-white shadow-sm border border-slate-100/50">
                      <Avatar className="h-10 w-10 border border-slate-100">
                        <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold text-sm">
                          {getInitials(el.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 truncate">{el.name}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                          <Activity className="h-3 w-3" /> Active
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-400">
                  {t('common.no_data')}
                </div>
              )}
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
