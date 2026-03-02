'use client';

import { useParams } from 'next/navigation';
import { ElderlyDetailView } from '@/components/dashboard/ElderlyDetailView';

export default function DoctorElderlyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <ElderlyDetailView elderlyId={id} role="DOCTOR" />;
}
