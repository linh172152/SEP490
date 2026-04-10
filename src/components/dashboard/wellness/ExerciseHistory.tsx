"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  Terminal, 
  Cpu, 
  Calendar,
  Clock,
  Code,
  ChevronLeft,
  ChevronRight,
  Activity,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useI18nStore } from "@/store/useI18nStore";
import { exerciseService } from "@/services/api/exerciseService";
import { ExerciseSession } from "@/services/api/types";
import { toast } from "react-toastify";

export function ExerciseHistory() {
  const { t } = useI18nStore();
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await exerciseService.getAllSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error(t("common.error") + ": Could not load exercise history.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(s => 
    s.elderlyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.exerciseName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const currentSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatSessionDate = (dateStr: string) => {
    if (!dateStr) return "--";
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(dateStr));
    } catch (e) {
      return dateStr;
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return "--";
    try {
      const s = new Date(start);
      const e = new Date(end);
      const diffMs = e.getTime() - s.getTime();
      const diffMins = Math.round(diffMs / 60000);
      return `${diffMins} min`;
    } catch (e) {
      return "--";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("wellness.history.search_placeholder")}
            className="pl-10 h-11 bg-card border-border/50 shadow-sm focus-visible:ring-indigo-500 rounded-xl"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
          <Terminal className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-bold text-indigo-700">{sessions.length} {t("wellness.history_tab")}</span>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card/60 backdrop-blur-sm overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/40">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="pl-6 py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.history.table.robot")}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.history.table.exercise")}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.history.table.elderly")}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.history.table.time")}</TableHead>
                <TableHead className="py-4 uppercase tracking-wider text-[11px] font-bold opacity-70">{t("wellness.history.table.feedback")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-border/40">
                    <TableCell colSpan={5} className="h-16 bg-slate-100/20 dark:bg-slate-800/20" />
                  </TableRow>
                ))
              ) : currentSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground/60 italic">
                    <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    {t("common.no_data")}
                  </TableCell>
                </TableRow>
              ) : (
                currentSessions.map((session) => (
                  <TableRow key={session.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-border/40 transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Cpu className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">#{session.robotName || `BOT-${session.robotId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <Code className="h-3 w-3 text-muted-foreground" />
                         <span className="font-bold text-slate-900 dark:text-slate-100">{session.exerciseName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded opacity-60">
                        NODE_UUID_{session.elderlyId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                          <Calendar className="h-3 w-3 opacity-60" />
                          {formatSessionDate(session.startedAt)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-1 rounded-md w-fit ${
                        session.feedback ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {session.feedback ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {session.feedback ? 'Executed OK' : 'No Exit Log'}
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
                {t("common.showing")} <span className="text-foreground">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-foreground">{Math.min(currentPage * itemsPerPage, filteredSessions.length)}</span> {t("common.of")} <span className="text-foreground">{filteredSessions.length}</span> {t("common.results")}
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
    </div>
  );
}
