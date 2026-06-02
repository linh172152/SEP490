"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Clock,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Play,
  Zap,
  Tag,
  Smile,
  Lock
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useI18nStore } from "@/store/useI18nStore";
import { robotActionService } from "@/services/api/robotActionService";
import { servicePackageService } from "@/services/api/servicePackageService";
import { RobotActionLibrary, ServicePackageResponse } from "@/services/api/types";
import { toast } from "react-toastify";
import { ActionModal } from "./ActionModal";
import { cn } from "@/lib/utils";

export function ActionLibrary({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useI18nStore();
  const [actions, setActions] = useState<RobotActionLibrary[]>([]);
  const [packages, setPackages] = useState<ServicePackageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<RobotActionLibrary | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTriggering, setIsTriggering] = useState<number | null>(null);

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchActions = async () => {
    try {
      setIsLoading(true);
      const actionData = await robotActionService.getAllActions();
      setActions(actionData);
    } catch (error) {
      toast.error(t('wellness.toasts.fetch_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleSubmit = async (data: Partial<RobotActionLibrary>) => {
    try {
      setIsSubmitting(true);
      await robotActionService.createAction(data);
      toast.success(t('wellness.toasts.create_success', 'Tạo hành động thành công.'));
      setIsModalOpen(false);
      fetchActions();
    } catch (error) {
      toast.error(t('wellness.toasts.create_error', 'Lỗi khi tạo mới.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      setIsDeleting(true);
      await robotActionService.deleteAction(deleteConfirmId);
      
      toast.success(
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-emerald-500" />
          <span>{t('wellness.toasts.delete_success', 'Xóa hành động thành công.')}</span>
        </div>
      );
      
      setDeleteConfirmId(null);
      fetchActions();
    } catch (error: any) {
      console.error("Delete Action Error:", error);
      toast.error(t('wellness.toasts.delete_error', 'Lỗi khi xóa hành động.'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTrigger = async (code: string, id: number) => {
    try {
      setIsTriggering(id);
      await robotActionService.triggerAction(code);
      toast.success(t('wellness.toasts.trigger_success', { code }));
    } catch (error) {
      toast.error(t('wellness.toasts.trigger_error'));
    } finally {
      setIsTriggering(null);
    }
  };

  const filteredActions = actions.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.description?.toLowerCase().includes(q) || "");
  }).sort((a, b) => b.id - a.id); // Sắp xếp ID lớn nhất (mới nhất) lên đầu

  const totalPages = Math.ceil(filteredActions.length / itemsPerPage);
  const currentActions = filteredActions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('wellness.search_placeholder')}
              className="pl-10 h-11 bg-card border-border/50 shadow-sm focus-visible:ring-primary/30 rounded-xl"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {!readOnly && (
          <Button
            onClick={() => {
              setSelectedAction(null);
              setIsModalOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('wellness.add_action')}
          </Button>
        )}
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30 dark:bg-muted/10">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="pl-6 py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('wellness.table.code')}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('wellness.table.name')}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('wellness.table.type')}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t('wellness.table.desc')}</TableHead>
                <TableHead className="pr-6 py-4 text-right uppercase tracking-wider text-[11px] font-bold opacity-70">{t('wellness.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-border/40">
                    <TableCell colSpan={5} className="h-16 bg-slate-100/20 dark:bg-slate-800/20" />
                  </TableRow>
                ))
              ) : currentActions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground/60 italic">
                    <Smile className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    {t("common.no_data")}
                  </TableCell>
                </TableRow>
              ) : (
                currentActions.map((action) => (
                  <TableRow key={action.id} className="group hover:bg-muted/30 dark:hover:bg-primary/5 border-border/40 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <Badge variant="outline" className="font-mono bg-muted/20 dark:bg-card border-border/60 text-sm py-1">
                        {action.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{action.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-bold bg-blue-100 text-blue-700 border-blue-200">
                        {t('wellness.types.ACTION')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="text-xs text-muted-foreground line-clamp-1 italic">
                        {action.description || '---'}
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 rounded-xl"
                          onClick={() => handleTrigger(action.code, action.id)}
                          disabled={isTriggering === action.id}
                        >
                          {isTriggering === action.id ? <Zap className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4 fill-current" />}
                        </Button>

                        {!readOnly && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-muted dark:hover:bg-accent rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-border/50 animate-in fade-in zoom-in duration-200">
                                <DropdownMenuItem
                                  onClick={() => setDeleteConfirmId(action.id)}
                                  className="cursor-pointer font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 dark:bg-slate-900/10 border-t border-border/40">
              <p className="text-xs text-muted-foreground font-medium">
                {t('wellness.table.pagination', { count: totalPages })}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-border/50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center px-3 h-8 rounded-lg bg-background border border-border/50 text-xs font-bold text-primary">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-border/50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedAction}
        isLoading={isSubmitting}
      />

      {/* Premium Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="max-w-md rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-md">
          <div className="p-8 pb-0 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6 text-rose-500 shadow-inner">
              <Trash2 className="h-10 w-10 animate-bounce" />
            </div>
            <AlertDialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t("common.confirm_delete") || "Xác nhận xóa?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("wellness.modal.delete_description") || "Hành động này không thể hoàn tác. Dữ liệu liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống."}
            </AlertDialogDescription>
          </div>
          
          <AlertDialogFooter className="p-8 pt-6 flex gap-3 sm:gap-0">
            <AlertDialogCancel className="flex-1 rounded-xl h-12 border-slate-200 dark:border-border font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-200 dark:shadow-none transition-all active:scale-[0.98]"
            >
              {isDeleting ? t("common.deleting") : t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
