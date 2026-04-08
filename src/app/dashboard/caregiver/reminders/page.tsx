'use client';

import { useEffect, useState, useMemo } from 'react';
import { useReminderStore } from '@/store/useReminderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useElderlyProfileStore } from '@/store/useElderlyProfileStore';
import { useCaregiverStore } from '@/store/useCaregiverStore';
import { useI18nStore } from '@/store/useI18nStore';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Search,
  Bell,
  Edit,
  RefreshCcw,
  Info
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { ReminderRequest, ReminderResponse } from '@/services/api/types';
import { format } from 'date-fns';

export default function CaregiverRemindersPage() {
  const { t } = useI18nStore();
  const { user } = useAuthStore();
  const { reminders, fetchReminders, createReminder, updateReminder, deleteReminder, isLoading } = useReminderStore();
  const { profiles, fetchProfiles } = useElderlyProfileStore();
  const { currentProfile, fetchProfileByAccountId } = useCaregiverStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<ReminderResponse | null>(null);
  const [viewingReminder, setViewingReminder] = useState<ReminderResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [formData, setFormData] = useState<ReminderRequest>({
    elderlyId: 0,
    caregiverId: 0,
    title: '',
    reminderType: 'medication',
    scheduleTime: new Date().toISOString(),
    repeatPattern: 'daily',
    active: true
  });

  useEffect(() => {
    if (user?.id) {
      const accountId = Number(user.id);
      fetchReminders(accountId);
      fetchProfiles();
      fetchProfileByAccountId(accountId);
    }
  }, [user?.id, fetchReminders, fetchProfiles, fetchProfileByAccountId]);

  const filteredReminders = useMemo(() => {
    return reminders.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.elderlyName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || r.reminderType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [reminders, searchQuery, filterType]);

  const handleOpenModal = (reminder: ReminderResponse | null = null) => {
    const realCaregiverId = currentProfile?.id || 0;
    
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        elderlyId: reminder.elderlyId,
        caregiverId: realCaregiverId,
        title: reminder.title,
        reminderType: reminder.reminderType,
        scheduleTime: reminder.scheduleTime,
        repeatPattern: reminder.repeatPattern,
        active: reminder.active
      });
    } else {
      setEditingReminder(null);
      setFormData({
        elderlyId: profiles[0]?.id || 0,
        caregiverId: realCaregiverId,
        title: '',
        reminderType: 'medication',
        scheduleTime: new Date().toISOString(),
        repeatPattern: 'daily',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we have the caregiver profile ID
    const realCaregiverId = currentProfile?.id;

    if (!realCaregiverId) {
      toast.error("Caregiver profile not found. Please sync your profile first.");
      return;
    }

    const payload: ReminderRequest = {
      ...formData,
      caregiverId: realCaregiverId
    };

    try {
      if (editingReminder) {
        await updateReminder(editingReminder.id, payload);
        toast.success(t('common.update_success'));
      } else {
        await createReminder(payload);
        toast.success(t('common.create_success'));
      }
      setIsModalOpen(false);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleToggleActive = async (reminder: ReminderResponse) => {
    const realCaregiverId = currentProfile?.id;
    if (!realCaregiverId) return;

    try {
      await updateReminder(reminder.id, {
        ...reminder,
        caregiverId: realCaregiverId,
        active: !reminder.active
      });
      toast.success(t('common.update_success'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleViewDetail = (reminder: ReminderResponse) => {
    setViewingReminder(reminder);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('common.confirm_delete'))) {
      try {
        await deleteReminder(id);
        toast.success(t('common.delete_success'));
      } catch {
        toast.error(t('common.error'));
      }
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'medication': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'exercise': return 'bg-sky-500/10 text-sky-500 border-sky-500/20';
      case 'meal': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'appointment': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'hydration': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'daily': return <RefreshCcw className="h-4 w-4 mr-1.5" />;
      case 'weekly': return <Calendar className="h-4 w-4 mr-1.5" />;
      case 'monthly': return <Calendar className="h-4 w-4 mr-1.5" />;
      case 'every_2_hours': return <Clock className="h-4 w-4 mr-1.5" />;
      case 'once': return <Clock className="h-4 w-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
            {t('caregiver.reminders.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('caregiver.reminders.subtitle')}
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()} 
          className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-2 h-11 px-6 rounded-xl"
        >
          <Plus className="h-5 w-5" />
          {t('caregiver.reminders.create')}
        </Button>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6 pt-8 px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <Input 
                placeholder={t('caregiver.reminders.search')} 
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500 transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px] h-11 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-sky-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="medication">Medication</SelectItem>
                  <SelectItem value="hydration">Hydration</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-8 h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.table.title')}</TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.table.elderly')}</TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.table.time')}</TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.table.type')}</TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.table.pattern')}</TableHead>
                  <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">{t('caregiver.reminders.table.status')}</TableHead>
                  <TableHead className="h-12 text-right pr-8 text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse border-slate-50 dark:border-slate-800">
                      <TableCell colSpan={7} className="h-20 px-8">
                        <div className="flex gap-4 items-center">
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-40 opacity-50"></div>
                          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-24 opacity-50"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredReminders.length > 0 ? (
                  filteredReminders.map((reminder) => (
                    <TableRow key={reminder.id} className="group hover:bg-sky-50/30 dark:hover:bg-sky-900/10 transition-colors border-slate-100 dark:border-slate-800">
                      <TableCell className="px-8 font-semibold py-5">
                        <div className="text-slate-900 dark:text-slate-100">{reminder.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                            {reminder.elderlyName?.charAt(0) || 'E'}
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{reminder.elderlyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4 mr-2 text-sky-500/80" />
                          <span className="font-medium">{format(new Date(reminder.scheduleTime), 'HH:mm')}</span>
                          <span className="mx-1.5 opacity-30">|</span>
                          <span className="text-xs">{format(new Date(reminder.scheduleTime), 'dd/MM')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize rounded-lg px-2.5 py-1 border font-medium ${getTypeBadgeColor(reminder.reminderType)}`}>
                          {t(`caregiver.reminders.types.${reminder.reminderType}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {getPatternIcon(reminder.repeatPattern)}
                          <span className="capitalize">{t(`caregiver.reminders.patterns.${reminder.repeatPattern}`)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          className="p-0 hover:bg-transparent" 
                          onClick={() => handleToggleActive(reminder)}
                        >
                          <Badge variant={reminder.active ? "default" : "secondary"} className={`rounded-full px-3.5 py-1 font-bold tracking-wide cursor-pointer transition-all active:scale-90 ${reminder.active ? 'bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-100' : ''}`}>
                            {reminder.active ? t('caregiver.reminders.status.active') : t('caregiver.reminders.status.inactive')}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Button variant="ghost" size="icon" onClick={() => handleViewDetail(reminder)} className="h-9 w-9 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl transition-all">
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(reminder)} className="h-9 w-9 text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950 rounded-xl transition-all">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)} className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-all">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64">
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-5 py-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-sky-200/20 rounded-full blur-2xl"></div>
                          <div className="relative p-6 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-800 shadow-inner">
                            <Bell className="h-10 w-10 text-slate-400" />
                          </div>
                        </div>
                        <div className="text-center max-w-xs px-6">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{t('caregiver.reminders.empty_title')}</p>
                          <p className="text-sm opacity-70 leading-relaxed">{t('caregiver.reminders.empty_desc')}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal create/edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-2xl overflow-hidden p-0">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                {editingReminder ? (
                  <><Edit className="h-6 w-6 text-sky-600" /> {t('caregiver.reminders.modal.edit_title')}</>
                ) : (
                  <><Plus className="h-6 w-6 text-sky-600" /> {t('caregiver.reminders.modal.create_title')}</>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                {t('caregiver.reminders.modal.desc')}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 p-8 bg-white dark:bg-slate-950">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.modal.title_label')}</Label>
                <Input
                  id="title"
                  placeholder="e.g. Evening Blood Pressure Meds"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.modal.type_label')}</Label>
                  <Select 
                    value={formData.reminderType} 
                    onValueChange={(val: string) => setFormData({...formData, reminderType: val})}
                  >
                    <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-sky-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">{t('caregiver.reminders.types.medication')}</SelectItem>
                      <SelectItem value="hydration">{t('caregiver.reminders.types.hydration')}</SelectItem>
                      <SelectItem value="exercise">{t('caregiver.reminders.types.exercise')}</SelectItem>
                      <SelectItem value="meal">{t('caregiver.reminders.types.meal')}</SelectItem>
                      <SelectItem value="appointment">{t('caregiver.reminders.types.appointment')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="elderly" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.modal.elderly_label')}</Label>
                  <Select 
                    value={formData.elderlyId.toString()} 
                    onValueChange={(val) => setFormData({...formData, elderlyId: Number(val)})}
                  >
                    <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-sky-500">
                      <SelectValue placeholder="Select elderly" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.modal.time_label')}</Label>
                  <Input
                    id="time"
                    type="datetime-local"
                    value={formData.scheduleTime.slice(0, 16)}
                    onChange={(e) => setFormData({...formData, scheduleTime: new Date(e.target.value).toISOString()})}
                    required
                    className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pattern" className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('caregiver.reminders.modal.pattern_label')}</Label>
                  <Select 
                    value={formData.repeatPattern} 
                    onValueChange={(val: string) => setFormData({...formData, repeatPattern: val})}
                  >
                    <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl focus:ring-sky-500">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">{t('caregiver.reminders.patterns.once')}</SelectItem>
                      <SelectItem value="daily">{t('caregiver.reminders.patterns.daily')}</SelectItem>
                      <SelectItem value="weekly">{t('caregiver.reminders.patterns.weekly')}</SelectItem>
                      <SelectItem value="monthly">{t('caregiver.reminders.patterns.monthly')}</SelectItem>
                      <SelectItem value="every_2_hours">{t('caregiver.reminders.patterns.every_2_hours')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="h-5 w-5 rounded-lg border-slate-300 text-sky-600 focus:ring-sky-500 transition-all cursor-pointer"
                />
                <Label htmlFor="active" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  {t('caregiver.reminders.modal.active_label')}
                </Label>
              </div>
            </div>

            <DialogFooter className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 gap-3 sm:gap-0">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
                className="h-11 px-6 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                className="bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-100 dark:shadow-none h-11 px-8 rounded-xl font-bold transition-all active:scale-95"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingReminder ? t('common.update') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl rounded-2xl overflow-hidden p-0">
          <DialogHeader className="p-8 bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${viewingReminder ? getTypeBadgeColor(viewingReminder.reminderType) : ''}`}>
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {viewingReminder?.title}
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  {viewingReminder ? t(`caregiver.reminders.types.${viewingReminder.reminderType}`) : ''}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('caregiver.reminders.table.elderly')}</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">{viewingReminder?.elderlyName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('caregiver.reminders.table.time')}</span>
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {viewingReminder && format(new Date(viewingReminder.scheduleTime), 'HH:mm | dd/MM/yyyy')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('caregiver.reminders.table.pattern')}</span>
                <div className="flex items-center font-semibold text-slate-700 dark:text-slate-300">
                  {viewingReminder && getPatternIcon(viewingReminder.repeatPattern)}
                  <span className="capitalize">{viewingReminder ? t(`caregiver.reminders.patterns.${viewingReminder.repeatPattern}`) : ''}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('caregiver.reminders.table.status')}</span>
                <div className="flex items-center gap-2">
                  {viewingReminder?.active ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-slate-400" />
                  )}
                  <span className={`font-semibold ${viewingReminder?.active ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {viewingReminder?.active ? t('caregiver.reminders.status.active') : t('caregiver.reminders.status.inactive')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <RefreshCcw className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">Robot Broadcast</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      This reminder is synchronized with the CareBot fleet. The robot in the assigned room will perform a voice broadcast at the scheduled intervals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailModalOpen(false)}
              className="w-full h-11 rounded-xl font-bold"
            >
              Close Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
