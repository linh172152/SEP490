"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, CheckCircle2, Dumbbell } from "lucide-react";
import { ExerciseScript, ExerciseScriptRequest } from "@/services/api/types";
import { useI18nStore } from "@/store/useI18nStore";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute"),
  difficultyLevel: z.string().min(1, "Please select a difficulty level"),
  uploadScript: z.string().min(1, "Script content is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExerciseScriptRequest) => void;
  initialData?: ExerciseScript | null;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function ExerciseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  readOnly = false,
}: ExerciseModalProps) {
  const { t } = useI18nStore();
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      durationMinutes: initialData?.durationMinutes || 10,
      difficultyLevel: initialData?.difficultyLevel || "2",
      uploadScript: initialData?.uploadScript || "",
    },
  });

  // Reset form when initialData changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        durationMinutes: initialData?.durationMinutes || 10,
        difficultyLevel: initialData?.difficultyLevel || "2",
        uploadScript: initialData?.uploadScript || "",
      });
      setFileName(initialData ? "Existing Script" : null);
    }
  }, [isOpen, initialData, form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict validation for .py extension
    if (!file.name.toLowerCase().endsWith('.py')) {
      toast.error(t("common.supported_python_only") || "Only Python (.py) files are accepted");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      form.setValue("uploadScript", content, { shouldValidate: true });
      toast.success(`Python script "${file.name}" loaded successfully`);
    };
    reader.readAsText(file);
  };

  const handleFormSubmit: SubmitHandler<FormValues> = (values) => {
    onSubmit(values as ExerciseScriptRequest);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl">
        <DialogHeader className="p-8 bg-slate-50 dark:bg-slate-900/50 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight">
                {readOnly ? (t('common.view_details') || "View Script Details") : (!!initialData ? t('wellness.scripts.modal.edit_title') : t('wellness.scripts.modal.create_title'))}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('wellness.scripts.modal.instruction') || "Provide the script details and configuration for the robotic exercise session."}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5 py-4 px-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("wellness.scripts.modal.name_label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("wellness.scripts.modal.name_label")} {...field} className="bg-background/50" disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("wellness.scripts.modal.duration_label")}</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="bg-background/50" disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficultyLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("wellness.scripts.modal.difficulty_label")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-background/50" disabled={readOnly}>
                          <SelectValue placeholder={t("wellness.scripts.modal.difficulty_label")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">{t("wellness.difficulty.easy")}</SelectItem>
                        <SelectItem value="2">{t("wellness.difficulty.medium")}</SelectItem>
                        <SelectItem value="3">{t("wellness.difficulty.hard")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("wellness.scripts.modal.desc_label")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("wellness.scripts.modal.desc_label")} 
                      {...field} 
                      className="bg-background/50 min-h-[80px] resize-none"
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="uploadScript"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {t("wellness.scripts.modal.script_label")}
                  </FormLabel>
                  <FormControl>
                    <div 
                      className={`relative group ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => !readOnly && fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef}
                        accept=".py"
                        onChange={handleFileChange}
                      />
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-primary/20 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-300">
                        {fileName ? (
                          <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                             <div className="p-3 bg-emerald-500/10 rounded-full">
                               <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                             </div>
                             <span className="font-bold text-slate-700 dark:text-slate-200">{fileName}</span>
                             <span className="text-xs text-muted-foreground">{t("common.click_to_change") || "Click to change file"}</span>
                          </div>
                        ) : (
                          <>
                            <div className="p-4 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                              <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="mt-4 text-center">
                              <p className="font-bold text-slate-900 dark:text-slate-100 italic">{t("common.upload_file") || "Upload Script (.py)"}</p>
                              {!readOnly && <p className="text-xs text-muted-foreground mt-1">{t("common.supported_formats") || "Accepted: .py (Python)"}</p>}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  {field.value && (
                    <div className="mt-2 p-3 bg-slate-900 rounded-xl overflow-hidden shadow-lg">
                       <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Python Script Preview</span>
                         <span className="text-[10px] text-slate-500">{field.value.slice(0, 100).length} characters loaded</span>
                       </div>
                       <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[100px] scrollbar-hide opacity-80 italic">
                         {field.value.slice(0, 300)}{field.value.length > 300 ? "..." : ""}
                       </pre>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                {readOnly ? (t("common.close") || "Close") : t("common.cancel")}
              </Button>
              {!readOnly && (
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  {isLoading ? t("common.processing") : t("common.save")}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
