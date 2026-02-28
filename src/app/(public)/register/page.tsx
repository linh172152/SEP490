import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <HeartPulse className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Sign Up</h1>
        <p className="text-lg text-muted-foreground">
          Registration is currently closed for the public beta. Please use one of the mock accounts provided on the login page.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
