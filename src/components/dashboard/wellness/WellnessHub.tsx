"use client";

import React, { useState } from "react";
import { 
  Code, 
  ShieldCheck, 
  Sparkles,
  LayoutDashboard,
  Terminal
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18nStore } from "@/store/useI18nStore";
import { ExerciseLibrary } from "./ExerciseLibrary";
import { ExerciseHistory } from "./ExerciseHistory";

export function WellnessHub({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useI18nStore();
  const [activeTab, setActiveTab] = useState("library");

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
            <Terminal className="h-4 w-4 text-indigo-500" />
            <span>Infrastructure & Script Management</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
             {t("wellness.title") || "Exercise Library"}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed font-medium">
            {t("wellness.subtitle")}
          </p>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="library" className="w-full space-y-8" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b border-border/40 pb-4 overflow-x-auto scrollbar-hide">
          <TabsList className="bg-slate-100/50 dark:bg-slate-900/40 p-1.5 rounded-2xl h-14 border border-border/20 shadow-inner">
            <TabsTrigger 
              value="library" 
              className="rounded-xl px-8 h-11 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2 transition-all duration-300"
            >
              <Code className={`h-4 w-4 ${activeTab === "library" ? "text-indigo-500" : "opacity-50"}`} />
              <span className="font-bold">{t("wellness.library_tab")}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-xl px-8 h-11 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-lg gap-2 transition-all duration-300"
            >
              <ShieldCheck className={`h-4 w-4 ${activeTab === "history" ? "text-indigo-500" : "opacity-50"}`} />
              <span className="font-bold">{t("wellness.history_tab")}</span>
            </TabsTrigger>
          </TabsList>

          <div className="hidden md:flex items-center gap-3">
          </div>
        </div>

        <TabsContent value="library" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <ExerciseLibrary readOnly={readOnly} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <ExerciseHistory />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Decorative background element */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
    </div>
  );
}
