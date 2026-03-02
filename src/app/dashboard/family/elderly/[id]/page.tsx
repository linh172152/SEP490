'use client';

import { ElderlyDetailView } from '@/components/dashboard/ElderlyDetailView';
import { useParams } from 'next/navigation';

export default function FamilyElderlyDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto py-6">
      <ElderlyDetailView elderlyId={id} role="FAMILY" />
    </div>
  );
}
