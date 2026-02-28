import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CaregiverPatientDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patient Details</h1>
        <p className="text-muted-foreground">Viewing data for patient ID: {params.id}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Health Overview</CardTitle>
          <CardDescription>Detailed metrics and robot observations for this patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Detailed UI coming soon...</div>
        </CardContent>
      </Card>
    </div>
  );
}
