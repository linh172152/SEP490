import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CaregiverRobotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Robot Control</h1>
        <p className="text-muted-foreground">Monitor and control the CareBot units deployed to your patients.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Units</CardTitle>
          <CardDescription>Status and controls for assigned robots.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Robot control UI coming soon...</div>
        </CardContent>
      </Card>
    </div>
  );
}
