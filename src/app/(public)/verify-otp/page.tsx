'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import Link from 'next/link';

import { useAuthStore } from '@/store/useAuthStore';
import { useI18nStore } from '@/store/useI18nStore';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { HeartPulse, Loader2, Mail } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  otp: z.string().length(6, 'OTP phải có 6 chữ số.'),
});

function getRolePath(role: string): string {
  const key = role?.trim().toLowerCase() || 'caregiver';
  const roleMap: Record<string, string> = {
    admin: 'admin',
    manager: 'manager',
    caregiver: 'caregiver',
    family: 'family',
    elderly: 'family',
    administrator: 'admin',
    elderlyuser: 'family', 
    'elderly user': 'family',
    caregiveruser: 'caregiver',
    familymember: 'family',
    'family member': 'family',
  };

  return roleMap[key] || 'caregiver';
}

function VerifyOtpContent() {
  const { t } = useI18nStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  // Lấy email từ query params nếu có
  const emailParam = searchParams.get('email') || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailParam,
      otp: '',
    },
  });

  // Tự động điền email nếu query param thay đổi
  useEffect(() => {
    if (emailParam) {
      form.setValue('email', emailParam);
    }
  }, [emailParam, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await verifyOtp(values.email, values.otp);
      
      // Kiểm tra xem store đã có user chưa (nếu BE trả về token)
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser) {
        toast.success(t('auth.verify_otp.success_msg'));
        const rolePath = getRolePath(currentUser.role || 'caregiver');
        router.replace(`/dashboard/${rolePath}`);
      } else {
        toast.success(t('auth.verify_otp.success_no_login'));
        router.push('/login');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message || '')
            : undefined;

      toast.error(message || t('auth.verify_otp.error_generic'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          {t('auth.verify_otp.title')}
        </CardTitle>
        <CardDescription>
          {t('auth.verify_otp.subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.verify_otp.email_label')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('auth.verify_otp.email_placeholder')} type="email" disabled={isLoading || !!emailParam} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.verify_otp.otp_label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('auth.verify_otp.otp_placeholder')}
                      maxLength={6}
                      disabled={isLoading}
                      {...field}
                      className="text-center text-2xl tracking-[0.5em] font-bold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.verify_otp.submitting_btn')}
                </>
              ) : (
                t('auth.verify_otp.submit_btn')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground bg-muted/20 py-4 border-t">
        <p>
          {t('auth.verify_otp.resend_prompt')}{' '}
          <button className="text-primary hover:underline font-medium" type="button" onClick={() => toast.info(t('auth.verify_otp.resend_wip'))}>
            {t('auth.verify_otp.resend_link')}
          </button>
        </p>
        <div className="pt-2 text-xs">
          <p>
            {t('auth.verify_otp.back_to')}{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t('auth.verify_otp.register_link')}
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={<div>Loading...</div>}>
         <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
