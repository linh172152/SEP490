'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { mockUsers } from '@/services/mock';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (userId: string) => {
    setIsLoading(true);
    const user = mockUsers.find((u) => u.id === userId);
    
    // Simulate network delay
    setTimeout(() => {
      if (user) {
        setCurrentUser(user);
        router.push('/dashboard');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-primary shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <HeartPulse className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            CareBot-MH System
          </CardTitle>
          <CardDescription>
            Select a mock persona to log into the portal
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {mockUsers.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              className="flex h-14 items-center justify-start space-x-4 px-4 text-left transition-all hover:border-primary hover:bg-primary/5"
              onClick={() => handleLogin(user.id)}
              disabled={isLoading}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                <span className="font-semibold text-foreground">{user.name.charAt(0)}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.role}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
