import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CaregiverPatientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <p className="text-muted-foreground">Manage and view details of your assigned patients.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>A list of all patients currently assigned to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Table UI coming soon...</div>
        </CardContent>
      </Card>
    </div>
  );
}
