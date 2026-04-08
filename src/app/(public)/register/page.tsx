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
import { HeartPulse, Loader2, Mail } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter } from '@/components/ui/alert-dialog';

const formSchema = z.object({
  name: z.string().min(2, 'Họ tên ít nhất 2 ký tự.'),
  email: z.string().email('Email không hợp lệ.'),
  phone: z.string().regex(/^(84|0[3|5|7|8|9])\d{8}$/, 'Số điện thoại VN không hợp lệ (10 số, bắt đầu 0[3|5|7|8|9] hoặc 84).'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự.'),
  gender: z.union([z.literal('Male'), z.literal('Female'), z.literal('Other')], {
    message: 'Vui lòng chọn giới tính',
  }),
});

export default function RegisterPage() {
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
      
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
      setRegisteredEmail(values.email);
      setShowOtpDialog(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Tạo tài khoản thất bại.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpValue || otpValue.length !== 6) {
      toast.error('Vui lòng nhập mã OTP gồm 6 chữ số hợp lệ.');
      return;
    }
    
    setIsVerifying(true);
    try {
      await verifyOtp(registeredEmail, otpValue);
      toast.success('Xác thực OTP thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setShowOtpDialog(false);
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
      setIsVerifying(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HeartPulse className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join CareBot-MH to start monitoring mental well-being
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
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" disabled={isLoading} {...field} />
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" disabled={isLoading} {...field} />
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
                    <FormLabel>Gender</FormLabel>
                    <Select disabled={isLoading} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
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
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center text-muted-foreground bg-muted/20 py-4 border-t">
          <p>Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in here</Link></p>
        </CardFooter>
      </Card>

      <AlertDialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">Xác thực OTP</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Chúng tôi đã gửi mã OTP đến email <b>{registeredEmail}</b>. Vui lòng nhập mã bên dưới để kích hoạt tài khoản.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium">Mã OTP (6 chữ số)</label>
              <Input
                placeholder="000000"
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
                  Đang xác thực...
                </>
              ) : (
                'Xác nhận OTP'
              )}
            </Button>
          </div>
          <AlertDialogFooter className="sm:justify-center">
             <div className="text-sm text-muted-foreground text-center">
                Chưa nhận được mã?{' '}
                <button className="text-primary hover:underline font-medium" type="button" onClick={() => toast.info('Tính năng gửi lại OTP đang được phát triển!')}>
                   Gửi lại OTP
                </button>
             </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
