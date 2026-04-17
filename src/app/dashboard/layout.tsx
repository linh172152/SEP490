import { DashboardRootLayout } from '@/components/layout/DashboardRootLayout';

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRootLayout>{children}</DashboardRootLayout>;
}
