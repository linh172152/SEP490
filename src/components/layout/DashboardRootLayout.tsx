'use client';

import { usePathname } from 'next/navigation';
import { DashboardLayout } from './DashboardLayout';
import { CaregiverLayout } from './CaregiverLayout';

export function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/dashboard/caregiver')) {
    return <CaregiverLayout>{children}</CaregiverLayout>;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}
