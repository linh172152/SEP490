import { SettingsModule } from '@/modules/settings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Manager Dashboard',
  description: 'Manage your personal preferences and account security.',
};

export default function ManagerSettingsPage() {
  return (
    <div className="p-6">
      <SettingsModule role="manager" />
    </div>
  );
}
