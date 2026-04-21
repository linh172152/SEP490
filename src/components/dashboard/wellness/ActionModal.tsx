"use client";

import React from "react";
import { useI18nStore } from "@/store/useI18nStore";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Terminal, Clock, Tag } from "lucide-react";
import { RobotActionLibrary } from "@/services/api/types";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RobotActionLibrary>) => void;
  initialData?: RobotActionLibrary | null;
  isLoading?: boolean;
}

export function ActionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: ActionModalProps) {
  const { t } = useI18nStore();

  const formSchema = z.object({
    name: z.string().min(2, t("wellness.modal.validation.name_min")),
    code: z.string().min(1, t("wellness.modal.validation.code_required")),
    type: z.string().default("ACTION"),
    description: z.string().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      type: initialData?.type || "ACTION",
      description: initialData?.description || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialData?.name || "",
        code: initialData?.code || "",
        type: initialData?.type || "ACTION",
        description: initialData?.description || "",
      });
    }
  }, [isOpen, initialData, form]);

  const handleFormSubmit: SubmitHandler<FormValues> = (values) => {
    onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-8 bg-slate-50 dark:bg-slate-900/50 border-b">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 shadow-sm font-bold">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {!!initialData ? t("wellness.modal.edit_title") : t("wellness.modal.create_title")}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t("wellness.modal.subtitle")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-6 px-8 bg-card">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest opacity-70">{t("wellness.modal.fields.code")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder={t("wellness.modal.fields.code_placeholder")} {...field} className="pl-10 h-11 bg-slate-50/50 rounded-xl font-mono" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest opacity-70">{t("wellness.modal.fields.type")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 bg-slate-50/50 rounded-xl">
                            <SelectValue placeholder={t("wellness.modal.fields.type_placeholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl shadow-xl">
                          <SelectItem value="ACTION">{t('wellness.types.ACTION')}</SelectItem>
                          <SelectItem value="DANCE">{t('wellness.types.DANCE')}</SelectItem>
                          <SelectItem value="EMOTION">{t('wellness.types.EMOTION')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest opacity-70">{t("wellness.modal.fields.name")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder={t("wellness.modal.fields.name_placeholder")} {...field} className="pl-10 h-11 bg-slate-50/50 rounded-xl" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest opacity-70">{t("wellness.modal.fields.description")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("wellness.modal.fields.description_placeholder")} 
                        {...field} 
                        className="min-h-[100px] bg-slate-50/50 rounded-xl resize-none" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 gap-3">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-11 border border-slate-200">
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl h-11 px-8 font-bold text-white transition-all hover:scale-[1.02]">
                {isLoading ? t("common.saving") : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
