'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
import { KeyRound, Mail, Loader2, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
  otp: z.string().length(6, 'OTP must be exactly 6 digits.'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const { t } = useI18nStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailFromQuery = searchParams.get('email') || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (emailFromQuery) {
      form.setValue('email', emailFromQuery);
    }
  }, [emailFromQuery, form]);

  const handleNextStep = async () => {
    const isOtpValid = await form.trigger(['email', 'otp']);
    if (isOtpValid) {
      setStep(2);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(values);
      toast.success(response.message || t('auth.reset_password.success') || 'Password reset successful. Please log in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || t('auth.reset_password.error_generic') || 'Failed to reset password. Please check OTP.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-8 border-b bg-muted/10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            {step === 1 ? <CheckCircle2 className="h-8 w-8 text-white" /> : <KeyRound className="h-8 w-8 text-white" />}
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {t('auth.reset_password.title') || 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? (t('auth.reset_password.subtitle_step1') || 'Enter the OTP sent to your email.')
              : (t('auth.reset_password.subtitle_step2') || 'Choose a strong new password.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
                              disabled={isLoading || !!emailFromQuery} 
                              className="pl-10 h-11"
                              {...field} 
                            />
                          </div>
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
                        <FormLabel>{t('auth.verify_otp.otp_label') || 'OTP Code'}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123456" 
                            maxLength={6}
                            disabled={isLoading} 
                            className="text-center text-3xl h-14 tracking-[0.5em] font-bold border-2 focus:border-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="button" className="w-full h-11 text-lg font-bold" onClick={handleNextStep}>
                    {t('common.next') || 'Next'} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.reset_password.new_password_label') || 'New Password'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              placeholder="••••••••" 
                              type={showNewPassword ? "text" : "password"} 
                              disabled={isLoading} 
                              className="pl-10 pr-10 h-11"
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.reset_password.confirm_password_label') || 'Confirm Password'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                              placeholder="••••••••" 
                              type={showConfirmPassword ? "text" : "password"} 
                              disabled={isLoading} 
                              className="pl-10 pr-10 h-11"
                              {...field} 
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" type="button" className="flex-1 h-11 font-bold" onClick={() => setStep(1)} disabled={isLoading}>
                      {t('common.prev') || 'Back'}
                    </Button>
                    <Button type="submit" className="flex-[2] h-11 text-lg font-bold" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('common.processing') || 'Processing...'}
                        </>
                      ) : (
                        t('auth.reset_password.submit_btn') || 'Reset Password'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="bg-muted/5 border-t p-4 justify-center">
            <p className="text-xs text-muted-foreground text-center">
              CareBot-MH Security Protocol • High Sensitivity Area
            </p>
        </CardFooter>
      </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground font-medium">Loading security protocols...</p>
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
