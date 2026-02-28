'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Heart, Clock } from 'lucide-react';
import { mockPatients } from '@/services/mock';

export function FamilyDashboard() {
  // Mock family member viewing their relative (first patient)
  const patient = mockPatients[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Family Portal</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-primary/20 shadow-md">
          <CardHeader className="bg-primary/5 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <CardDescription className="text-base mt-1">Current status overview</CardDescription>
              </div>
              <Badge variant="outline" className="bg-background text-primary border-primary">
                <Heart className="mr-1 h-3 w-3 fill-primary" /> Doing Well
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid gap-4 grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Recent Mood</span>
              <div className="text-xl font-medium">Positive ({patient.moodScore}/100)</div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Medication Taken</span>
              <div className="text-xl font-medium flex items-center">
                <Clock className="mr-2 h-4 w-4 text-green-500" />
                {new Date(patient.lastMedication).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-primary shadow-md bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle>Connect</CardTitle>
            <CardDescription>Start a video call via CareBot</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Video className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full text-lg h-12" size="lg">
              <Video className="mr-2 h-5 w-5" /> Start Call
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
          <CardDescription>Timeline of care activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 items-start relative pb-4 border-b last:border-0 last:pb-0 border-muted">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">CareBot assisted with afternoon medication</p>
                <p className="text-sm text-muted-foreground">Today at 2:00 PM</p>
              </div>
            </div>
            <div className="flex gap-4 items-start relative pb-4 border-b last:border-0 last:pb-0 border-muted">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Completed morning guided meditation</p>
                <p className="text-sm text-muted-foreground">Today at 9:30 AM</p>
              </div>
            </div>
            <div className="flex gap-4 items-start relative pb-4 border-b last:border-0 last:pb-0 border-muted">
              <div className="w-2 h-2 rounded-full bg-muted mt-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Dr. Jenkins reviewed weekly progress</p>
                <p className="text-sm text-muted-foreground">Yesterday at 4:15 PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
