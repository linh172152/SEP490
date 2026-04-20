'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { paymentService } from '@/services/api/paymentService';
import { useAuthStore } from '@/store/useAuthStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, QrCode } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';

const FAMILY_PAYMENT_STORAGE_KEY = 'family-payment-preview';

type FamilyPaymentPreview = {
  qrCodeUrl: string;
  amount: number;
  description: string;
  elderlyId: number;
  elderlyName?: string;
  servicePackageId: number;
  servicePackageName?: string;
  servicePackageLevel?: string;
};

export default function FamilyPaymentPage() {
  const { t } = useI18nStore();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fetchDashboardData = useFamilyStore((state) => state.fetchDashboardData);
  const [paymentPreview, setPaymentPreview] = useState<FamilyPaymentPreview | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [statusText, setStatusText] = useState('Preparing payment details...');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.sessionStorage.getItem(FAMILY_PAYMENT_STORAGE_KEY);
    if (!raw) {
      toast.error(t('family.payment.toasts.no_data'));
      router.replace('/dashboard/family/packages');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as FamilyPaymentPreview;
      setPaymentPreview(parsed);
      setStatusText('QR đã sẵn sàng. Hệ thống đang tự xác nhận thanh toán...');
    } catch {
      window.sessionStorage.removeItem(FAMILY_PAYMENT_STORAGE_KEY);
      toast.error(t('family.payment.toasts.data_error'));
      router.replace('/dashboard/family/packages');
    }
  }, [router, t]);

  useEffect(() => {
    if (!paymentPreview || confirming) {
      return;
    }

    let cancelled = false;

    const confirmPayment = async () => {
      setConfirming(true);
      try {
        const response = await paymentService.confirm({
          description: paymentPreview.description,
          amount: paymentPreview.amount,
        });

        const responseMessage = typeof response === 'string'
          ? response
          : response.message || response.status || 'Payment confirmed';

        if (cancelled) {
          return;
        }

        if (responseMessage.toLowerCase().includes('payment confirmed') || responseMessage.toLowerCase().includes('package created')) {
          setStatusText('Payment confirmed & package created');
          toast.success(t('family.payment.toasts.success_redirect'));
          if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(FAMILY_PAYMENT_STORAGE_KEY);
          }
          if (user?.id) {
            await fetchDashboardData(Number(user.id));
          }
          window.setTimeout(() => {
            router.push('/dashboard/family/elderly');
          }, 1200);
          return;
        }

        setStatusText(responseMessage);
        toast.info(responseMessage);
      } catch {
        if (!cancelled) {
          setStatusText('Auto confirm failed. Please try again.');
          toast.error(t('family.payment.toasts.confirm_failed'));
        }
      } finally {
        if (!cancelled) {
          setConfirming(false);
        }
      }
    };

    confirmPayment();

    return () => {
      cancelled = true;
    };
  }, [confirming, fetchDashboardData, paymentPreview, router, user?.id, t]);

  const formattedAmount = useMemo(() => {
    if (!paymentPreview) {
      return '0';
    }

    return paymentPreview.amount.toLocaleString();
  }, [paymentPreview]);

  if (!paymentPreview) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading payment page...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('family.payment.title')}</h1>
          <p className="mt-1 text-muted-foreground">{t('family.payment.desc')}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/family/packages">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('family.payment.back_to_plans')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 shadow-sm">
          <div className="h-2 w-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><QrCode className="h-5 w-5 text-sky-600" /> {t('family.payment.qr_title')}</CardTitle>
            <CardDescription>{t('family.payment.qr_desc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border bg-white p-4 shadow-inner">
              <Image
                src={paymentPreview.qrCodeUrl}
                alt="Payment QR code"
                width={360}
                height={360}
                className="mx-auto aspect-square w-full max-w-[360px] rounded-2xl object-contain"
                unoptimized
              />
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
              <div className="flex items-start gap-3">
                {confirming ? <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-sky-600" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />}
                <div>
                  <div className="font-semibold">{t('manager.packages.table.status')}</div>
                  <p className="mt-1 text-sky-800/90">{statusText}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('family.payment.summary_title')}</CardTitle>
              <CardDescription>{t('family.payment.summary_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <InfoRow label={t('caregiver.reminders.table.elderly')} value={paymentPreview.elderlyName || `EL #${paymentPreview.elderlyId}`} />
              <InfoRow label="EL ID" value={`#${paymentPreview.elderlyId}`} />
              <InfoRow label={t('manager.packages.table.name')} value={paymentPreview.servicePackageName || `Package #${paymentPreview.servicePackageId}`} />
              <InfoRow label={t('manager.packages.table.level')} value={paymentPreview.servicePackageLevel || 'Unknown'} />
              <InfoRow label={t('manager.packages.table.price')} value={`${formattedAmount} VND`} />
              <InfoRow label={t('manager.packages.table.desc')} value={paymentPreview.description} mono />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('family.payment.auto_confirm_title')}</CardTitle>
              <CardDescription>{t('family.payment.auto_confirm_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-slate-900 text-white hover:bg-slate-900">POST /api/payments/confirm</Badge>
                <Badge variant="outline">{t('manager.packages.table.desc')}: {paymentPreview.description}</Badge>
                <Badge variant="outline">{t('manager.packages.table.price')}: {formattedAmount}</Badge>
              </div>
              <div className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">
                {t('family.payment.auto_confirm_note')}
              </div>
              <Button onClick={() => router.push('/dashboard/family/elderly')} variant="outline">
                {t('common.back')}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/70">
            <CardContent className="flex items-start gap-3 p-5 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Trong lúc chờ backend hoàn thiện auto callback, trang này đóng vai trò bước trung gian để người dùng vẫn thấy đủ QR, amount, description và luồng quay về không bị mất.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={`mt-2 break-all font-semibold text-foreground ${mono ? 'font-mono text-xs sm:text-sm' : ''}`}>{value}</div>
    </div>
  );
}