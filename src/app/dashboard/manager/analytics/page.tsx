'use client';
import { useI18nStore } from "@/store/useI18nStore";
import { BarChart3, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const { t } = useI18nStore();
  
  return (
    <div className="flex h-[70vh] items-center justify-center p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
      <div className="max-w-md">
        <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="h-10 w-10 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          {t('manager.analytics.title')}
        </h2>
        <p className="text-indigo-600 font-bold mt-2 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
          <Activity className="h-3 w-3" /> {t('manager.analytics.subtitle')}
        </p>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          {t('manager.analytics.placeholder_desc')}
        </p>
      </div>
    </div>
  );
}
