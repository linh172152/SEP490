import { SettingsModule } from '@/modules/settings';

export default function DoctorSettingsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8">
      <SettingsModule role="doctor" />
    </div>
  );
}
