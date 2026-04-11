'use client';

import { useEffect, useState } from 'react';
import { Package, Plus, Loader2, Trash2, Edit2, Activity, ChevronRight } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-toastify';
import { ServicePackageModal } from './ServicePackageModal';
import { servicePackageService } from '@/services/api/servicePackageService';
import { exerciseService } from '@/services/api/exerciseService';
import { 
  ServicePackageResponse,
  ServicePackageRequest,
  ExerciseScriptResponse
} from '@/services/api/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function SubscriptionsUnifiedPage() {
  const { t } = useI18nStore();
  const user = useAuthStore((state) => state.user);
  
  // Data State
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [allExercises, setAllExercises] = useState<ExerciseScriptResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('definitions');
  const [selectedPkgId, setSelectedPkgId] = useState<number | null>(null);

  // Modal State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackage, setSelectedPackage] = useState<ServicePackageResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgs, scripts] = await Promise.all([
        servicePackageService.getAll(),
        exerciseService.getAllScripts()
      ]);
      setPackages(pkgs || []);
      setAllExercises(scripts || []);
      
      // Select first package by default for config tab
      if (pkgs && pkgs.length > 0 && !selectedPkgId) {
        setSelectedPkgId(pkgs[0].id);
      }
    } catch (e) {
      console.error(e);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPackage = () => {
    setModalMode('create');
    setSelectedPackage(null);
    setIsPkgModalOpen(true);
  };

  const handleEditPackage = (pkg: ServicePackageResponse) => {
    setModalMode('edit');
    setSelectedPackage(pkg);
    setIsPkgModalOpen(true);
  };

  const handleSavePackage = async (data: ServicePackageRequest) => {
    try {
      if (modalMode === 'create') {
        await servicePackageService.create(data);
        toast.success(t('common.create_success'));
      } else if (selectedPackage) {
        await servicePackageService.update(selectedPackage.id, data);
        toast.success(t('common.update_success'));
      }
      fetchData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm(t('common.confirm_delete'))) return;
    try {
       await servicePackageService.delete(id);
       toast.success(t('common.delete_success'));
       fetchData();
    } catch (e) {
       console.error(e);
       toast.error(t('common.error'));
    }
  };

  const handleRemoveExerciseFromPkg = async (pkg: ServicePackageResponse, exerciseId: number) => {
    if (!confirm(t('common.confirm_delete'))) return;
    try {
      const updatedExerciseIds = (pkg.exerciseIds || []).filter(id => id !== exerciseId);
      await servicePackageService.update(pkg.id, {
        ...pkg,
        exerciseIds: updatedExerciseIds
      });
      toast.success(t('common.update_success'));
      fetchData();
    } catch (e) {
      console.error(e);
      toast.error(t('common.error'));
    }
  };

  const canManage = user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.role === 'ADMINISTRATOR';
  const currentConfigPkg = packages.find(p => p.id === selectedPkgId);
  const pkgExercises = allExercises.filter(ex => currentConfigPkg?.exerciseIds?.includes(ex.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-indigo-600" /> 
            {t('manager.subscriptions.title')}
          </h2>
          <p className="text-muted-foreground font-medium"> 
            {t('manager.subscriptions.subtitle')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl h-14 border border-slate-200">
           <TabsTrigger value="definitions" className="rounded-xl px-8 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2 font-bold">
              <Package className="h-4 w-4" /> {t('manager.subscriptions.tab_packages')}
           </TabsTrigger>
           <TabsTrigger value="sessions" className="rounded-xl px-8 h-11 data-[state=active]:bg-white data-[state=active]:shadow-lg gap-2 font-bold">
              <Activity className="h-4 w-4" /> {t('manager.subscriptions.tab_sessions')}
           </TabsTrigger>
        </TabsList>

        <TabsContent value="definitions">
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('admin.packages.table_card_title')}</CardTitle>
                <CardDescription>{t('admin.packages.table_card_desc')}</CardDescription>
              </div>
              {canManage && (
                <Button onClick={handleAddPackage} className="rounded-xl px-6 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white">
                  <Plus className="h-4 w-4" /> {t('admin.packages.create_btn')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead>{t('admin.packages.table.level')}</TableHead>
                      <TableHead>{t('admin.packages.table.name')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('admin.packages.table.desc')}</TableHead>
                      <TableHead>{t('admin.packages.table.price')}</TableHead>
                      <TableHead>{t('admin.packages.table.status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <Badge variant="outline" className="font-bold border-slate-200 text-slate-600 uppercase">
                            {pkg.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{pkg.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground hidden md:table-cell">
                          {pkg.description}
                        </TableCell>
                        <TableCell className="font-bold text-emerald-600">{pkg.price.toLocaleString()} VNĐ</TableCell>
                        <TableCell>
                            <Badge variant={pkg.active ? 'default' : 'secondary'} className={pkg.active ? 'bg-emerald-500' : ''}>
                              {pkg.active ? t('common.active') : t('common.inactive')}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditPackage(pkg)} className="hover:bg-slate-100 rounded-lg">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeletePackage(pkg.id)} className="text-rose-600 hover:bg-rose-50 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-none shadow-xl shadow-slate-200/50 rounded-2xl p-4 space-y-4">
              <h3 className="font-black text-lg px-2">{t('manager.subscriptions.package_select')}</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl text-left transition-all border",
                        selectedPkgId === pkg.id 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 translate-x-1" 
                          : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:border-slate-200 hover:translate-x-1"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-black truncate">{pkg.name}</span>
                        <span className={cn("text-[10px] uppercase font-bold", selectedPkgId === pkg.id ? "text-indigo-100" : "text-slate-400")}>
                          {pkg.level}
                        </span>
                      </div>
                      <ChevronRight className={cn("h-4 w-4", selectedPkgId === pkg.id ? "text-white" : "text-slate-300")} />
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
               <CardHeader className="bg-slate-50/50 border-b">
                 <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-600" />
                        {t('manager.subscriptions.exercises_title')}
                      </CardTitle>
                      <CardDescription>
                        {currentConfigPkg?.name} ({currentConfigPkg?.level})
                      </CardDescription>
                    </div>
                    {canManage && (
                      <Button onClick={() => currentConfigPkg && handleEditPackage(currentConfigPkg)} variant="outline" size="sm" className="rounded-lg gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                        <Plus className="h-3 w-3" /> {t('manager.subscriptions.add_exercise')}
                      </Button>
                    )}
                 </div>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="pl-6 pt-4">{t('wellness.scripts.table.name')}</TableHead>
                        <TableHead className="pt-4">{t('wellness.scripts.table.duration')}</TableHead>
                        <TableHead className="pt-4">{t('wellness.scripts.table.difficulty')}</TableHead>
                        <TableHead className="text-right pr-6 pt-4">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pkgExercises.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">
                            {t('manager.subscriptions.no_exercises')}
                          </TableCell>
                        </TableRow>
                      ) : (
                        pkgExercises.map((ex) => (
                          <TableRow key={ex.id} className="group hover:bg-slate-50 transition-colors border-slate-50">
                            <TableCell className="pl-6 font-bold text-slate-700">{ex.name}</TableCell>
                            <TableCell>{ex.durationMinutes}m</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                                {ex.difficultyLevel}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => currentConfigPkg && handleRemoveExerciseFromPkg(currentConfigPkg, ex.id)}
                                className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
               </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <ServicePackageModal 
        isOpen={isPkgModalOpen}
        onClose={() => setIsPkgModalOpen(false)}
        onSave={handleSavePackage}
        initialData={selectedPackage}
        mode={modalMode}
      />
    </div>
  );
}
