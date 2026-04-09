'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { CaregiverDashboard } from '@/components/dashboard/CaregiverDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard';
import { FamilyDashboard } from '@/components/dashboard/FamilyDashboard';

export default function DashboardPage() {
  const currentUser = useAuthStore((state) => state.user);

  if (!currentUser) return null;

  let dashboardComponent = null;

  switch (currentUser.role) {
    case 'CAREGIVER':
      dashboardComponent = <CaregiverDashboard />;
      break;
    case 'ADMIN':
      dashboardComponent = <AdminDashboard />;
      break;
    case 'MANAGER':
      dashboardComponent = <ManagerDashboard />;
      break;
    case 'ELDERLY':
      dashboardComponent = <FamilyDashboard />; // To be renamed to ElderlyDashboard
      break;
    default:
      dashboardComponent = <div>Role &quot;{currentUser.role}&quot; not recognized</div>;
  }

  return (
    <>
      {dashboardComponent}
    </>
  );
}
