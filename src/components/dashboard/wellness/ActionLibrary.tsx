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

  const fetchActions = async () => {
    try {
      setIsLoading(true);
      const [actionData, packageData] = await Promise.all([
        robotActionService.getAllActions(),
        servicePackageService.getAll()
      ]);
      setActions(actionData);
      setPackages(packageData);
    } catch (error) {
      toast.error(t('wellness.toasts.fetch_error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleCreate = async (data: Partial<RobotActionLibrary>) => {
    try {
      setIsSubmitting(true);
      await robotActionService.createAction(data);
      toast.success(t('wellness.toasts.create_success'));
      setIsModalOpen(false);
      fetchActions();
    } catch (error) {
      toast.error(t('wellness.toasts.create_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionUsage = (actionId: number) => {
    return packages.filter(pkg =>
      pkg.robotActions?.some(ra => ra.id === actionId)
    );
  };

  const handleDelete = async (id: number) => {
    const usages = getActionUsage(id);
    if (usages.length > 0) {
      const pkgNames = usages.map(u => u.name).join(", ");
      toast.error(`${t('wellness.toasts.delete_error')}: ${t('wellness.toasts.in_use_error', 'This action is in use by packages')} [${pkgNames}]`);
      return;
    }

    if (!confirm(t("common.confirm_delete"))) return;
    try {
      await robotActionService.deleteAction(id);
      toast.success(t('wellness.toasts.delete_success'));
      fetchActions();
    } catch (error: any) {
      // Check if it's a foreign key constraint error (400)
      const errorData = error.response?.data;
      const errorMsg = typeof errorData === 'string' ? errorData : errorData?.message || '';

      if (errorMsg.includes("foreign key constraint fails") || errorMsg.includes("servicepackage_robot_action")) {
        toast.error(`${t('wellness.toasts.delete_error')}: ${t('wellness.toasts.in_use_error', 'This action is in use by packages and cannot be deleted.')}`);
      } else {
        toast.error(t('wellness.toasts.delete_error'));
      }
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
  });

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
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/40">
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
                  <TableRow key={action.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-border/40 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <Badge variant="outline" className="font-mono bg-slate-50 dark:bg-slate-900 border-border/60 text-sm py-1">
                        {action.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{action.name}</span>
                        {getActionUsage(action.id).length > 0 && (
                          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                            <Lock className="h-3 w-3" /> {t('wellness.in_use', 'Part of Package')}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(
                        "text-[10px] font-bold",
                        action.type === 'ACTION' ? "bg-blue-100 text-blue-700 border-blue-200" :
                          action.type === 'DANCE' ? "bg-purple-100 text-purple-700 border-purple-200" :
                            "bg-pink-100 text-pink-700 border-pink-200"
                      )}>
                        {t(`wellness.types.${action.type || 'ACTION'}`)}
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
                          className="h-9 w-9 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 rounded-xl"
                          onClick={() => handleTrigger(action.code, action.id)}
                          disabled={isTriggering === action.id}
                        >
                          {isTriggering === action.id ? <Zap className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4 fill-current" />}
                        </Button>

                        {!readOnly && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-border/50 animate-in fade-in zoom-in duration-200">
                              <DropdownMenuItem
                                onClick={() => handleDelete(action.id)}
                                className={cn(
                                  "cursor-pointer font-medium",
                                  getActionUsage(action.id).length > 0
                                    ? "text-slate-400 cursor-not-allowed opacity-70"
                                    : "text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                                )}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {getActionUsage(action.id).length > 0 ? t('wellness.locked', 'Locked') : t("common.delete")}
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
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />
    </div>
  );
}
