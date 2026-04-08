'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-toastify';
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
import { HeartPulse, Loader2, Mail } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Email không hợp lệ.'),
  otp: z.string().length(6, 'OTP phải có 6 chữ số.'),
});

function VerifyOtpContent() {
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
      toast.success('Xác thực OTP thành công! Bạn có thể đăng nhập ngay bây giờ.');
      router.push('/login');
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message || '')
            : undefined;

      toast.error(message || 'Xác thực OTP thất bại. Vui lòng kiểm tra lại mã.');
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
          Verify Your OTP
        </CardTitle>
        <CardDescription>
          Chúng tôi đã gửi mã OTP đến email của bạn. Vui lòng nhập mã bên dưới để kích hoạt tài khoản.
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
                    <Input placeholder="example@gmail.com" type="email" disabled={isLoading || !!emailParam} {...field} />
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
                  <FormLabel>Mã OTP (6 chữ số)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="000000"
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
                  Verifying...
                </>
              ) : (
                'Kích hoạt tài khoản'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground bg-muted/20 py-4 border-t">
        <p>
          Chưa nhận được mã?{' '}
          <button className="text-primary hover:underline font-medium" type="button" onClick={() => toast.info('Tính năng gửi lại OTP đang được phát triển!')}>
            Gửi lại OTP
          </button>
        </p>
        <div className="pt-2 text-xs">
          <p>
            Quay lại{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              trang đăng ký
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
