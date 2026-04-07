'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';

import { useAuthStore } from '@/store/useAuthStore';
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
      
      // Get the fresh user from the store after login completes
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser) {
        toast.success(`Chào mừng, ${currentUser.name}!`);
        const rolePath = getRolePath(currentUser.role || 'caregiver');
        // Replace để tránh người dùng bấm Back quay lại trang login
        router.replace(`/dashboard/${rolePath}`);
      } else {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
    } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : typeof error === 'object' && error !== null && 'message' in error
              ? String((error as { message?: unknown }).message || '')
              : undefined;

        if (message?.toLowerCase().includes('verify otp')) {
            toast.error('Tài khoản chưa được kích hoạt. Đang chuyển hướng đến trang xác thực...', {
                action: {
                    label: 'Xác thực ngay',
                    onClick: () => router.push(`/verify-otp?email=${values.email}`)
                }
            });
            setTimeout(() => {
                router.push(`/verify-otp?email=${values.email}`);
            }, 2500);
        } else {
            toast.error(message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
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
            CareBot-MH Portal
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="example@gmail.com" type="email" disabled={isLoading} {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground bg-muted/20 py-4 border-t">
          <div className="pt-2 text-xs">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Register here
              </Link>
            </p>
            <p className="mt-1">
              Need to verify your account?{' '}
              <Link href="/verify-otp" className="text-primary hover:underline font-medium">
                Verify OTP here
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

