'use client';

import { useParams } from 'next/navigation';
import { CaregiverElderlyWorkspace, type CaregiverWorkspaceTab } from '@/components/dashboard/caregiver/CaregiverElderlyWorkspace';

const validTabs = new Set<CaregiverWorkspaceTab>([
  'overview',
  'reminders',
  'robot',
  'logs',
  'room-device',
  'exercise',
  'package-exercise',
]);

export default function CaregiverElderlyTabPage() {
  const params = useParams();
  const elderlyId = Number(params.id);
  const activeTab = String(params.tab) as CaregiverWorkspaceTab;

  return (
    <CaregiverElderlyWorkspace
      selectedElderlyId={Number.isFinite(elderlyId) ? elderlyId : undefined}
      activeTab={validTabs.has(activeTab) ? activeTab : 'overview'}
    />
  );
}