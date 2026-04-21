'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { userPackageService } from '@/services/api/userPackageService';
import { useAuthStore } from '@/store/useAuthStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

const FAMILY_PAYMENT_STORAGE_KEY = 'family-payment-preview';
const POLL_INTERVAL_MS = 5000;

type FamilyPaymentPreview = {
  checkoutUrl: string;
  amount: number;
  description: string;
  elderlyId: number;
  elderlyName?: string;
  servicePackageId: number;
  servicePackageName?: string;
  servicePackageLevel?: string;
};

export default function FamilyPaymentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fetchDashboardData = useFamilyStore((state) => state.fetchDashboardData);
  const [paymentPreview, setPaymentPreview] = useState<FamilyPaymentPreview | null>(null);
  const [paid, setPaid] = useState(false);

  // Load from sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.sessionStorage.getItem(FAMILY_PAYMENT_STORAGE_KEY);
    if (!raw) {
      toast.error('Không tìm thấy dữ liệu thanh toán.');
      router.replace('/dashboard/family/packages');
      return;
    }

    try {
      setPaymentPreview(JSON.parse(raw) as FamilyPaymentPreview);
    } catch {
      window.sessionStorage.removeItem(FAMILY_PAYMENT_STORAGE_KEY);
      toast.error('Dữ liệu thanh toán bị lỗi.');
      router.replace('/dashboard/family/packages');
    }
  }, [router]);

  // Poll every 5s to detect PENDING → PAID transition
  useEffect(() => {
    if (!paymentPreview || paid) return;

    const check = async () => {
      try {
        const packages = await userPackageService.getByElderlyId(paymentPreview.elderlyId);
        const found = packages.find(
          (p) => p.servicePackageId === paymentPreview.servicePackageId && p.status === 'PAID'
        );
        if (found) {
          setPaid(true);
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(FAMILY_PAYMENT_STORAGE_KEY);
          }
          toast.success('Thanh toán thành công! Gói dịch vụ đã được kích hoạt.');
          if (user?.id) {
            await fetchDashboardData(Number(user.id));
          }
          router.push('/dashboard/family/elderly');
        }
      } catch {
        // silent – keep polling
      }
    };

    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [paymentPreview, paid, user?.id, fetchDashboardData, router]);

  const handleCancel = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(FAMILY_PAYMENT_STORAGE_KEY);
    }
    router.push('/dashboard/family/packages');
  };

  if (!paymentPreview) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Đang tải trang thanh toán...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thanh toán</h1>
          <p className="mt-1 text-muted-foreground">
            Quét mã QR để hoàn tất. Hệ thống sẽ tự nhận diện sau khi thanh toán thành công.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/family/packages">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Link>
        </Button>
      </div>

      {/* Embedded PayOS checkout page */}
      <div className="w-full overflow-hidden rounded-2xl border shadow-sm bg-white">
        <iframe
          src={paymentPreview.checkoutUrl}
          title="PayOS Payment"
          className="w-full"
          style={{ height: '640px', border: 'none' }}
          allow="payment"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between rounded-2xl border bg-slate-50 px-5 py-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang chờ xác nhận thanh toán...
        </div>
        <Button variant="outline" size="sm" onClick={handleCancel}>
          Huỷ
        </Button>
      </div>
    </div>
  );
}