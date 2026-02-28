import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CaregiverSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and notification settings.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Update your Caregiver profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Settings form UI coming soon...</div>
        </CardContent>
      </Card>
    </div>
  );
}
