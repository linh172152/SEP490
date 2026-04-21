'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Zap, Clock, Info, Activity } from 'lucide-react';
import { servicePackageService } from '@/services/api/servicePackageService';
import type { RobotAction } from '@/services/api/types';

interface PackageExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: number | null;
  packageName: string;
}

export function PackageExercisesModal({ isOpen, onClose, packageId, packageName }: PackageExercisesModalProps) {
  const [exercises, setExercises] = useState<RobotAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && packageId) {
      const loadExercises = async () => {
        setIsLoading(true);
        try {
          const data = await servicePackageService.getRobotActions(packageId);
          setExercises(data);
        } catch (error) {
          console.error("Failed to load robot actions:", error);
          setExercises([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadExercises();
    }
  }, [isOpen, packageId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white dark:bg-slate-950">
        <DialogHeader className="p-8 bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">{packageName}</DialogTitle>
              <DialogDescription className="text-sky-100 font-medium">
                Included Exercises & Robot Actions
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
              <p className="font-semibold animate-pulse">Loading exercise catalog...</p>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <Info className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Exercises Found</h3>
              <p className="text-muted-foreground max-w-xs">
                This package level doesn't have specific robot actions assigned or the data is currently unavailable.
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] p-6 lg:p-8">
              <div className="grid gap-4">
                {exercises.map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className="group relative flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-sky-100/30 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                      <Zap className="h-6 w-6" />
                    </div>
                    
                    <div className="flex-grow space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{exercise.name}</h4>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                          Code: {exercise.code}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {exercise.description || "No description provided for this robot action."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shadow-sm self-start sm:self-center shrink-0">
                      <Clock className="h-3.5 w-3.5 text-sky-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {exercise.duration} mins
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                Actions listed above are automatically performed by the CareBot assigned to the elderly profile.
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
