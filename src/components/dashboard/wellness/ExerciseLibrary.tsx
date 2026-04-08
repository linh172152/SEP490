"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  FileEdit, 
  Trash2, 
  Smile, 
  Clock, 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
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
import { exerciseService } from "@/services/api/exerciseService";
import { ExerciseScript, ExerciseScriptRequest } from "@/services/api/types";
import { toast } from "react-toastify";
import { ExerciseModal } from "./ExerciseModal";

export function ExerciseLibrary() {
  const { t } = useI18nStore();
  const [scripts, setScripts] = useState<ExerciseScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<ExerciseScript | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScripts = async () => {
    try {
      setIsLoading(true);
      const data = await exerciseService.getAllScripts();
      setScripts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch scripts:", error);
      toast.error(t("common.error") + ": Could not load exercise library.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleCreate = async (data: ExerciseScriptRequest) => {
    try {
      setIsSubmitting(true);
      await exerciseService.createScript(data);
      toast.success("Exercise script created successfully.");
      setIsModalOpen(false);
      fetchScripts();
    } catch (error) {
      toast.error(t("common.error"), {
        description: "Failed to create exercise script.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: ExerciseScriptRequest) => {
    if (!selectedScript) return;
    try {
      setIsSubmitting(true);
      await exerciseService.updateScript(selectedScript.id, data);
      toast.success("Exercise script updated successfully.");
      setIsModalOpen(false);
      fetchScripts();
    } catch (error) {
      toast.error("Failed to update exercise script.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this script?")) return;
    try {
      await exerciseService.deleteScript(id);
      toast.success("Exercise script deleted.");
      fetchScripts();
    } catch (error) {
      toast.error("Failed to delete exercise script.");
    }
  };

  const filteredScripts = scripts.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredScripts.length / itemsPerPage);
  const currentScripts = filteredScripts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDifficultyBadge = (level: string) => {
    switch (level?.toUpperCase()) {
      case "EASY":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20">{t("wellness.difficulty.easy")}</Badge>;
      case "MEDIUM":
        return <Badge className="bg-sky-500/15 text-sky-600 border-sky-500/20">{t("wellness.difficulty.medium")}</Badge>;
      case "HARD":
        return <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/20">{t("wellness.difficulty.hard")}</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("wellness.scripts.search_placeholder")}
            className="pl-10 h-11 bg-card border-border/50 shadow-sm focus-visible:ring-primary/30"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedScript(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-11 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("wellness.scripts.add_btn")}
        </Button>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/40">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="pl-6 py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.scripts.table.name")}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.scripts.table.duration")}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.scripts.table.difficulty")}</TableHead>
                <TableHead className="pr-6 py-4 text-right uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.scripts.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-border/40">
                    <TableCell colSpan={4} className="h-16 bg-slate-100/20 dark:bg-slate-800/20" />
                  </TableRow>
                ))
              ) : currentScripts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground/60 italic">
                    <Smile className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    {t("common.no_data")}
                  </TableCell>
                </TableRow>
              ) : (
                currentScripts.map((script) => (
                  <TableRow key={script.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-border/40 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{script.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">{script.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5 opacity-60" />
                        {script.durationMinutes} min
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDifficultyBadge(script.difficultyLevel)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-border/50 animate-in fade-in zoom-in duration-200">
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedScript(script);
                              setIsModalOpen(true);
                            }}
                            className="cursor-pointer focus:bg-primary/10 focus:text-primary"
                          >
                            <FileEdit className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(script.id)}
                            className="cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 dark:bg-slate-900/10 border-t border-border/40">
              <p className="text-xs text-muted-foreground font-medium">
                {t("common.showing")} <span className="text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredScripts.length)}</span> {t("common.of")} <span className="text-foreground">{filteredScripts.length}</span> {t("common.results")}
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

      <ExerciseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={selectedScript ? handleUpdate : handleCreate}
        initialData={selectedScript}
        isLoading={isSubmitting}
      />
    </div>
  );
}
