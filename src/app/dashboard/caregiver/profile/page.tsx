import { redirect } from 'next/navigation';

export default function CaregiverProfilePage() {
  redirect('/dashboard/caregiver/settings?section=profile');
}
