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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { ServicePackageRequest, ServicePackageResponse } from '@/services/api/types';

interface ServicePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ServicePackageRequest) => Promise<void>;
  initialData?: ServicePackageResponse | null;
  mode: 'create' | 'edit';
}

export function ServicePackageModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  mode 
}: ServicePackageModalProps) {
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ServicePackageRequest>({
    name: '',
    description: '',
    level: '',
    price: 0,
    active: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        level: initialData.level,
        price: initialData.price,
        active: initialData.active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        level: '',
        price: 0,
        active: true
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('admin.packages.modal.create_title') : t('admin.packages.modal.edit_title')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.packages.table_card_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('admin.packages.modal.fields.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Premium Care+"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">{t('admin.packages.modal.fields.level')}</Label>
              <Input
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                placeholder="e.g. PRO"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">{t('admin.packages.modal.fields.price')}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('admin.packages.modal.fields.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detail what services are included in this plan..."
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="active" className="text-sm font-medium">
                {t('admin.packages.table.status')}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t('admin.packages.modal.fields.status_active')}
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? t('admin.packages.create_btn') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
