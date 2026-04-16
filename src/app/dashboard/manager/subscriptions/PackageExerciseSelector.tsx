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
import { Card } from '@/components/ui/card';
import { Loader2, Search, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { ExerciseScriptResponse } from '@/services/api/types';
import { exerciseService } from '@/services/api/exerciseService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { filterScriptsByQuota, getQuotaDescription } from '@/utils/privilegeEngine';
import { cn } from '@/lib/utils';

interface PackageExerciseSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ids: number[]) => Promise<void>;
  currentIds: number[];
  packageLevel: string;
}

export function PackageExerciseSelector({ 
  isOpen, 
  onClose, 
  onSave, 
  currentIds,
  packageLevel 
}: PackageExerciseSelectorProps) {
  const { t } = useI18nStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allScripts, setAllScripts] = useState<ExerciseScriptResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const data = await exerciseService.getAllScripts();
        setAllScripts(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      fetchScripts();
      setSelectedIds(currentIds);
    }
  }, [isOpen, currentIds]);

  const toggleExercise = (id: number) => {
    setSelectedIds(current => 
      current.includes(id) 
        ? current.filter(x => x !== id) 
        : [...current, id]
    );
  };


  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(selectedIds);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const filteredScripts = allScripts.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl rounded-2xl">
        <div className="bg-indigo-600 p-8 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-indigo-200" />
              {t('manager.subscriptions.assign_exercises') || 'Assign Exercises'}
            </DialogTitle>
            <DialogDescription className="text-indigo-100 font-medium">
              {t('manager.subscriptions.quota_hint') || 'Configure exercise content for'} <Badge variant="secondary" className="bg-indigo-500/50 text-white border-indigo-400 ml-1">{packageLevel}</Badge>
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-white overflow-hidden flex flex-col flex-1">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder={t('common.search') || 'Search scripts...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl border-slate-200"
              />
            </div>
          </div>


          <ScrollArea className="flex-1 rounded-xl border border-slate-100 bg-slate-50/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                 <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                 <p className="text-sm text-slate-400 font-medium">{t('common.loading')}</p>
              </div>
            ) : filteredScripts.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <p className="italic">{t('common.no_data')}</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                {filteredScripts.map((script) => {
                  const isSelected = selectedIds.includes(script.id);
                  return (
                    <button
                      key={script.id}
                      onClick={() => toggleExercise(script.id)}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl text-left transition-all border group",
                        isSelected 
                          ? "bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600" 
                          : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-lg"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl transition-colors",
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-50"
                      )}>
                        {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-700 truncate">{script.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                           <Badge variant="outline" className="text-[9px] uppercase font-black px-1.5 h-4 border-slate-200 text-slate-500">
                             {script.level}
                           </Badge>
                           <span className="text-[10px] text-slate-400 font-bold">{script.durationMinutes}m</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between sm:justify-between">
          <div className="text-sm text-slate-500 font-bold">
            {t('common.selected') || 'Selected'}: <span className="text-indigo-600">{selectedIds.length}</span> {t('common.items') || 'items'}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="font-bold rounded-xl px-6">
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="font-bold rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
