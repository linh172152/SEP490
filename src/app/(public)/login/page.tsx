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
import { HeartPulse, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

// Map API role names to dashboard routes
function getRolePath(role: string): string {
  const key = role?.trim().toLowerCase() || 'caregiver';
  const roleMap: Record<string, string> = {
    // values used in FE middleware cookie
    admin: 'admin',
    manager: 'manager',

    caregiver: 'caregiver',
    family: 'family',
    elderly: 'family',

    // values from BE Role enum (may or may not be returned by /api/login)
    administrator: 'admin',
    elderlyuser: 'family', 
    'elderly user': 'family',
    caregiveruser: 'caregiver',
    familymember: 'family',
    'family member': 'family',
  };

  return roleMap[key] || 'caregiver';
}

export default function LoginPage() {
  const { t } = useI18nStore();
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser) {
        toast.success(t('auth.login.welcome', { name: currentUser.name }));
        const rolePath = getRolePath(currentUser.role || 'caregiver');
        router.replace(`/dashboard/${rolePath}`);
      } else {
        throw new Error(t('auth.login.error_user_not_found'));
      }
    } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message?: unknown }).message || '')
              : undefined;

        if (message?.toLowerCase().includes('verify otp')) {
            toast.error(t('auth.login.error_unverified'));
            setTimeout(() => {
                router.push(`/verify-otp?email=${values.email}`);
            }, 2500);
        } else {
            toast.error(message || t('auth.login.error_generic'));
        }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HeartPulse className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {t('auth.login.title')}
          </CardTitle>
          <CardDescription>
            {t('auth.login.subtitle')}
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
                      <Input placeholder={t('auth.login.email_placeholder')} type="email" disabled={isLoading} {...field} />
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('auth.login.submitting_btn')}
                  </>
                ) : (
                  t('auth.login.submit_btn')
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground bg-muted/20 py-4 border-t">
          <div className="pt-2 text-xs">
            <p>
              {t('auth.login.no_account')}{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                {t('auth.login.register_link')}
              </Link>
            </p>
            <p className="mt-1">
              {t('auth.login.need_verify')}{' '}
              <Link href="/verify-otp" className="text-primary hover:underline font-medium">
                {t('auth.login.verify_link')}
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

