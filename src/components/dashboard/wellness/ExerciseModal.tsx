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
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExerciseScript, ExerciseScriptRequest } from "@/services/api/types";
import { useI18nStore } from "@/store/useI18nStore";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
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
}

export function ExerciseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: ExerciseModalProps) {
  const { t } = useI18nStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      durationMinutes: initialData?.durationMinutes || 10,
      difficultyLevel: initialData?.difficultyLevel || "MEDIUM",
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
        difficultyLevel: initialData?.difficultyLevel || "MEDIUM",
        uploadScript: initialData?.uploadScript || "",
      });
    }
  }, [isOpen, initialData, form]);

  const handleFormSubmit: SubmitHandler<FormValues> = (values) => {
    onSubmit(values as ExerciseScriptRequest);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {initialData ? t("wellness.scripts.modal.edit_title") : t("wellness.scripts.modal.create_title")}
          </DialogTitle>
          <DialogDescription>
            {t("wellness.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("wellness.scripts.modal.name_label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("wellness.scripts.modal.name_label")} {...field} className="bg-background/50" />
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
                      <Input type="number" {...field} className="bg-background/50" />
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
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder={t("wellness.scripts.modal.difficulty_label")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY">{t("wellness.difficulty.easy")}</SelectItem>
                        <SelectItem value="MEDIUM">{t("wellness.difficulty.medium")}</SelectItem>
                        <SelectItem value="HARD">{t("wellness.difficulty.hard")}</SelectItem>
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
                <FormItem>
                  <FormLabel>{t("wellness.scripts.modal.script_label")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("wellness.scripts.modal.script_placeholder")} 
                      {...field} 
                      className="bg-background/50 font-mono text-xs min-h-[150px] border-dashed border-primary/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                {isLoading ? t("common.processing") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
