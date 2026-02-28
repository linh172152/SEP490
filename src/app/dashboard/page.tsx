'use client';

import { useStore } from '@/store/useStore';
import { CaregiverDashboard } from '@/components/dashboard/CaregiverDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { FamilyDashboard } from '@/components/dashboard/FamilyDashboard';

export default function DashboardPage() {
  const currentUser = useStore((state) => state.currentUser);

  if (!currentUser) return null;

  switch (currentUser.role) {
    case 'CAREGIVER':
      return <CaregiverDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'FAMILY':
      return <FamilyDashboard />;
    default:
      return <div>Role not recognized</div>;
  }
}
