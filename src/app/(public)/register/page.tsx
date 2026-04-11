'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Bot, Loader2, Mail } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';


export default function RegisterPage() {
  const { t } = useI18nStore();

  const formSchema = z.object({
    name: z.string().min(2, t('auth.register.validation.name_min', 'Full name must be at least 2 characters.')),
    email: z.string().email(t('auth.register.validation.email_invalid', 'Invalid email address.')),
    phone: z.string().regex(/^(84|0[3|5|7|8|9])\d{8}$/, t('auth.register.validation.phone_invalid', 'Invalid VN phone number.')),
    password: z.string().min(6, t('auth.register.validation.password_min', 'Password must be at least 6 characters.')),
    gender: z.union([z.literal('Male'), z.literal('Female'), z.literal('Other')], {
      message: t('auth.register.validation.gender_required', 'Please select a gender'),
    }),
  });
  const router = useRouter();
  const { register, verifyOtp } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      gender: '' as any,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await register({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: 'FAMILYMEMBER',
        gender: values.gender,
      });
      
      toast.success(t('auth.register.success_toast', 'Registration successful! Please check your email for the OTP code.'));
      setRegisteredEmail(values.email);
      setShowOtpDialog(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('auth.register.error_toast', 'Account creation failed.');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpValue || otpValue.length !== 6) {
      toast.error(t('auth.register.otp_validation_error', 'Please enter a valid 6-digit OTP code.'));
      return;
    }
    
    setIsVerifying(true);
    try {
      await verifyOtp(registeredEmail, otpValue);
      toast.success(t('auth.register.otp_success_toast', 'OTP verified successfully! Please log in to continue.'));
      setShowOtpDialog(false);
      router.push('/login');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message || '')
            : undefined;

      toast.error(message || t('auth.register.otp_error_toast', 'OTP verification failed. Please check your code.'));
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {t('auth.register.title')}
          </CardTitle>
          <CardDescription>
            {t('auth.register.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.profile.full_name', 'Full Name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('settings.profile.full_name')} disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.email_label', 'Email')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('auth.login.email_placeholder', 'example@gmail.com')} type="email" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.profile.phone', 'Phone Number')}</FormLabel>
                    <FormControl>
                      <Input placeholder="09xxxxxxxx" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('auth.login.password_label')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('auth.login.password_placeholder')} type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.profile.gender')}</FormLabel>
                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('settings.profile.select_gender')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">{t('settings.profile.male')}</SelectItem>
                        <SelectItem value="Female">{t('settings.profile.female')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.register.submitting')}
                  </>
                ) : (
                  t('auth.register.submit_btn')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground bg-muted/20 py-4 border-t">
          <p>{t('auth.login.already_have_account')} <Link href="/login" className="text-primary hover:underline font-medium">{t('auth.login.login_link')}</Link></p>
        </CardFooter>
      </Card>

      <AlertDialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">{t('auth.verify_otp.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('auth.verify_otp.subtitle')} <b>{registeredEmail}</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium">{t('auth.verify_otp.otp_label')}</label>
              <Input
                placeholder={t('auth.verify_otp.otp_placeholder')}
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                disabled={isVerifying}
                className="text-center text-2xl tracking-[0.5em] font-bold h-14"
              />
            </div>
            <Button 
              onClick={handleVerifyOtp} 
              className="w-full" 
              disabled={isVerifying || otpValue.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.verify_otp.submitting_btn')}
                </>
              ) : (
                t('auth.verify_otp.submit_btn')
              )}
            </Button>
          </div>
          <AlertDialogFooter className="sm:justify-center">
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
