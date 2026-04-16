import { redirect } from 'next/navigation';

export default async function CaregiverElderlyRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/caregiver/elderly/${id}/overview`);
}
