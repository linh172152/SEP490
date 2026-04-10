'use client';

import React, { useEffect, useState } from 'react';
import { useI18nStore } from '@/store/useI18nStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Calendar as CalendarIcon, Info } from 'lucide-react';
import { 
  UserPackageRequest, 
  ServicePackageResponse, 
  ElderlyProfileResponse 
} from '@/services/api/types';
import { calculateExpiryDate, getQuotaDescription } from '@/utils/privilegeEngine';
import { format } from 'date-fns';

interface UserPackageAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserPackageRequest) => Promise<void>;
  elderlies: ElderlyProfileResponse[];
  packages: ServicePackageResponse[];
}

export function UserPackageAssignmentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  elderlies,
  packages
}: UserPackageAssignmentModalProps) {
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UserPackageRequest>>({
    assignedAt: new Date().toISOString(),
  });

  const selectedPkg = packages.find(p => p.id === formData.servicePackageId);

  useEffect(() => {
    if (formData.servicePackageId && formData.assignedAt) {
      const pkg = packages.find(p => p.id === formData.servicePackageId);
      if (pkg) {
        const expiry = calculateExpiryDate(pkg.level, new Date(formData.assignedAt));
        setFormData(prev => ({ ...prev, expiredAt: expiry }));
      }
    }
  }, [formData.servicePackageId, formData.assignedAt, packages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId || !formData.servicePackageId || !formData.expiredAt || !formData.assignedAt) return;

    setLoading(true);
    try {
      await onSave(formData as UserPackageRequest);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Gán Gói Dịch Vụ
          </DialogTitle>
          <DialogDescription>
            Thiết lập đặc quyền và thời hạn sử dụng cho người cao tuổi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* User Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Chọn Người cao tuổi</Label>
            <Select 
              onValueChange={(val) => setFormData({ ...formData, accountId: Number(val) })}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Tìm theo tên..." />
              </SelectTrigger>
              <SelectContent>
                {elderlies.map(e => (
                   <SelectItem key={e.id} value={e.accountId.toString()}>
                     {e.name}
                   </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Package Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest opacity-60">Chọn Gói Dịch Vụ</Label>
            <Select 
              onValueChange={(val) => setFormData({ ...formData, servicePackageId: Number(val) })}
            >
              <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50">
                <SelectValue placeholder="Chọn cấp độ gói..." />
              </SelectTrigger>
              <SelectContent>
                {packages.filter(p => p.active).map(p => (
                   <SelectItem key={p.id} value={p.id.toString()}>
                     <div className="flex flex-col items-start">
                        <span className="font-bold">{p.name} - {p.price.toLocaleString()} VNĐ</span>
                        <span className="text-[10px] opacity-50">{p.level}</span>
                     </div>
                   </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Privilege Preview */}
          {selectedPkg && (
            <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-4 rounded-2xl flex items-start gap-3">
              <Info className="h-4 w-4 text-indigo-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold">Đặc quyền hệ thống</p>
                <p className="text-xs font-medium">
                  {getQuotaDescription(selectedPkg.level)}
                </p>
              </div>
            </div>
          )}

          {/* Date Info */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 italic">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> Ngày kích hoạt
              </span>
              <p className="text-sm font-bold text-slate-700">
                {format(new Date(formData.assignedAt || ''), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" /> Ngày hết hạn
              </span>
              <p className="text-sm font-bold text-emerald-600">
                {formData.expiredAt ? format(new Date(formData.expiredAt), 'dd/MM/yyyy') : '---'}
              </p>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.accountId || !formData.servicePackageId}
              className="rounded-xl px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận gán gói
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
