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
      <DialogContent className="sm:max-w-5xl rounded-2xl p-0 overflow-hidden bg-white shadow-2xl border-slate-100 dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader className="p-8 bg-slate-50 border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-black flex items-center gap-4">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                <Home className="h-7 w-7" />
              </div>
              <div>
                <span className="block text-slate-900 tracking-tight">{room.roomName}</span>
                <span className="block text-xs font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">{t('manager.rooms.modal.tab_info')}</span>
              </div>
            </DialogTitle>
            <div className="flex gap-4">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-3 py-1 font-bold">Active Room</Badge>
               </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[650px] p-8">
          <div className="grid grid-cols-2 gap-8">
            
            {/* Top Left: Robot Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-amber-600" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">{t('manager.rooms.modal.tab_robot')}</h4>
                <div className="flex-1 border-b border-dashed border-slate-200"></div>
              </div>
              
              {room.robot ? (
                <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-amber-200">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-amber-50 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110">
                      <Bot className="h-8 w-8 text-amber-600" />
                    </div>
                    <div>
                      <h5 className="text-lg font-black text-slate-900 leading-tight">{room.robot.robotName}</h5>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase bg-slate-50 border-slate-200">{room.robot.model}</Badge>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase bg-slate-50 border-slate-200">{room.robot.serialNumber}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 text-slate-400">
                  <Bot className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">{t('manager.rooms.card.none')}</p>
                </div>
              )}
            </div>

            {/* Top Right: Caregivers Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-indigo-600" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">{t('manager.rooms.modal.tab_staff')}</h4>
                <div className="flex-1 border-b border-dashed border-slate-200"></div>
                <Badge className="rounded-lg text-[10px] bg-indigo-500/10 text-indigo-600 border-none font-black">
                  {room.caregivers?.length || 0}/2
                </Badge>
              </div>

              {room.caregivers && room.caregivers.length > 0 ? (
                <div className="grid gap-3">
                  {room.caregivers.map((cg: CaregiverDTO) => (
                    <div key={cg.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100 transition-all hover:bg-slate-50 group">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                        <AvatarFallback className="bg-indigo-600 text-white font-black text-sm">
                          {getInitials(cg.name || cg.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-black text-slate-900 truncate tracking-tight">{cg.name || cg.email}</p>
                        <p className="text-xs text-slate-500 font-bold truncate opacity-60 uppercase">{cg.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 text-slate-400">
                  <Users className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest">{t('common.no_data')}</p>
                </div>
              )}
            </div>

            {/* Bottom: Elderlies Section - Full Width */}
            <div className="col-span-2 space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Baby className="h-4 w-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-600">{t('manager.rooms.modal.tab_elderly')}</h4>
                <div className="flex-1 border-b border-dashed border-slate-200"></div>
                <Badge className="rounded-lg text-[10px] bg-emerald-500/10 text-emerald-600 border-none font-black">
                  {room.elderlies?.length || 0}/4
                </Badge>
              </div>

              {room.elderlies && room.elderlies.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {room.elderlies.map((el: ElderlyDTO) => (
                    <div key={el.id} className="flex items-center gap-5 p-5 rounded-2xl bg-white shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-emerald-200 group">
                      <Avatar className="h-14 w-14 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                        <AvatarFallback className="bg-emerald-600 text-white font-black text-lg">
                          {getInitials(el.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-lg font-black text-slate-900 truncate tracking-tight">{el.name}</p>
                           <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-black uppercase rounded-md tracking-widest">Resident</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                           <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <Activity className="h-3 w-3" /> Healthy
                           </div>
                           <div>DOB: {el.dateOfBirth?.split('T')[0] || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 text-slate-400">
                  <Baby className="h-12 w-12 mb-3 opacity-20" />
                  <p className="text-base font-black uppercase tracking-widest">{t('common.no_data')}</p>
                </div>
              )}
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
