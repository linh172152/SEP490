'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { Mail, Loader2, ArrowLeft, Bot } from 'lucide-react';

import { authService } from '@/services/api/authService';
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

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

export default function ForgotPasswordPage() {
  const { t } = useI18nStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(values);
      toast.success(response.message || t('auth.forgot_password.otp_sent_success') || 'OTP has been sent to your email.');
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      toast.error(error.message || t('auth.forgot_password.error_generic') || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {t('auth.forgot_password.title') || 'Forgot Password'}
          </CardTitle>
          <CardDescription>
            {t('auth.forgot_password.subtitle') || 'Enter your email to receive a password reset OTP.'}
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
                    <FormLabel>{t('auth.login.email_label')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          placeholder={t('auth.login.email_placeholder')} 
                          type="email" 
                          disabled={isLoading} 
                          className="pl-10"
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.processing') || 'Processing...'}
                  </>
                ) : (
                  t('auth.forgot_password.submit_btn') || 'Send OTP'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground bg-muted/20 py-4 border-t">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.forgot_password.back_to_login') || 'Back to login'}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
