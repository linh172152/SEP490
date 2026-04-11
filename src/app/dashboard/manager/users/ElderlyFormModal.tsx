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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useI18nStore } from '@/store/useI18nStore';
import { ElderlyProfileResponse, ElderlyProfileRequest, RegisterDTO } from '@/services/api/types';
import { elderlyService } from '@/services/api/elderlyService';
import { accountService } from '@/services/api/accountService';
import { toast } from 'react-toastify';
import { Loader2, UserPlus, Save, HeartPulse, User } from 'lucide-react';

interface ElderlyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: ElderlyProfileResponse | null;
  onRefresh: () => void;
  isReadOnly?: boolean;
}

export function ElderlyFormModal({ isOpen, onClose, patient, onRefresh, isReadOnly = false }: ElderlyFormModalProps) {
  const { t } = useI18nStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    healthNotes: '',
    preferredLanguage: 'Vietnamese',
    speakingSpeed: 'Normal',
    // Account fields (only for new)
    email: '',
    phone: '',
    password: 'Password123!', // default password for now
    gender: 'Male'
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
        healthNotes: patient.healthNotes || '',
        preferredLanguage: patient.preferredLanguage || 'Vietnamese',
        speakingSpeed: patient.speakingSpeed || 'Normal',
        email: '', // Not used in edit profile
        phone: '',
        password: '',
        gender: 'Male'
      });
    } else {
      setFormData({
        name: '',
        dateOfBirth: '',
        healthNotes: '',
        preferredLanguage: 'Vietnamese',
        speakingSpeed: 'Normal',
        email: '',
        phone: '',
        password: 'Password123!',
        gender: 'Male'
      });
    }
  }, [patient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setIsSubmitting(true);
    try {
      if (patient) {
        // Update Profile
        const profileData: ElderlyProfileRequest = {
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          healthNotes: formData.healthNotes,
          preferredLanguage: formData.preferredLanguage,
          speakingSpeed: formData.speakingSpeed,
        };
        await elderlyService.update(patient.id, profileData);
        toast.success(t('manager.patients.toasts.update_success') || "Elderly profile updated successfully");
      } else {
        // New Registration Flow (Account + Profile)
        // 1. Create Account
        const accountData: RegisterDTO = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: "ELDERLYUSER",
          gender: formData.gender
        };
        
        const account = await accountService.createAccount(accountData);
        
        // 2. Create Profile linked to Account
        if (account && account.id) {
            const profileData: ElderlyProfileRequest = {
                name: formData.name,
                dateOfBirth: formData.dateOfBirth,
                healthNotes: formData.healthNotes,
                preferredLanguage: formData.preferredLanguage,
                speakingSpeed: formData.speakingSpeed,
            };
            await elderlyService.create(account.id, profileData);
            toast.success(t('manager.patients.toasts.create_success') || "Elderly account and profile created");
        }
      }
      onRefresh();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl overflow-hidden p-0 border-none shadow-2xl rounded-2xl">
        <form onSubmit={handleSubmit}>
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3">
                {isReadOnly ? <User className="h-7 w-7 text-primary-foreground/60" /> : patient ? <Save className="h-7 w-7 text-primary-foreground/60" /> : <UserPlus className="h-7 w-7 text-primary-foreground/60" />}
                {isReadOnly ? `${t('common.view')}: ${patient?.name}` : patient ? `${t('common.edit')}: ${patient.name}` : t('manager.patients.dialog.add_title')}
              </DialogTitle>
              <p className="text-primary-foreground/80 mt-2 font-medium">
                {patient ? t('manager.rooms.modal.elderly_desc') : t('manager.patients.subtitle')}
              </p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6 bg-card max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                   <User className="h-3 w-3" /> {t('manager.patients.table.name')}
                </Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  disabled={isReadOnly}
                  className="h-12 rounded-xl font-bold bg-slate-50 border-none focus-visible:ring-primary/20 disabled:opacity-100"
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('manager.patients.table.dob')}</Label>
                <Input 
                  id="dob" 
                  type="date"
                  disabled={isReadOnly}
                  value={formData.dateOfBirth} 
                  className="h-12 rounded-xl font-bold bg-slate-50 border-none px-4 disabled:opacity-100"
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  required 
                />
              </div>
            </div>

            {!patient && (
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">{t('user_modal.email')}</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="elderly@example.com"
                    value={formData.email} 
                    className="h-10 rounded-lg font-medium border-slate-200"
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">{t('user_modal.gender')}</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(v) => setFormData({...formData, gender: v})}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-slate-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{t('user_modal.gender_options.male')}</SelectItem>
                      <SelectItem value="Female">{t('user_modal.gender_options.female')}</SelectItem>
                      <SelectItem value="Other">{t('user_modal.gender_options.other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="healthNotes" className="text-[10px] uppercase font-bold tracking-widest text-rose-500 flex items-center gap-2">
                <HeartPulse className="h-3 w-3" /> {t('manager.patients.table.health')}
              </Label>
              <Textarea 
                id="healthNotes" 
                disabled={isReadOnly}
                placeholder={t('manager.rooms.modal.none')}
                value={formData.healthNotes} 
                className="min-h-[100px] rounded-xl font-medium bg-slate-50 border-none resize-none p-4 disabled:opacity-100"
                onChange={(e) => setFormData({...formData, healthNotes: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('user_modal.placeholders.lang')}</Label>
                <Select 
                    disabled={isReadOnly}
                    value={formData.preferredLanguage} 
                    onValueChange={(v) => setFormData({...formData, preferredLanguage: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-none bg-slate-50 font-bold disabled:opacity-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{t('user_modal.placeholders.speaking_speed')}</Label>
                <Select 
                    disabled={isReadOnly}
                    value={formData.speakingSpeed} 
                    onValueChange={(v) => setFormData({...formData, speakingSpeed: v})}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-none bg-slate-50 font-bold disabled:opacity-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Slow">Slow</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-border/40 flex justify-end gap-3">
            {isReadOnly ? (
              <Button type="button" variant="default" className="font-bold px-10 rounded-xl" onClick={onClose}>
                {t('common.close')}
              </Button>
            ) : (
              <>
                <Button type="button" variant="ghost" className="font-bold px-6 rounded-xl" onClick={onClose}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="font-bold px-8 rounded-xl shadow-lg shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {patient ? t('manager.patients.btn_update') : t('manager.patients.add_btn')}
                </Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
