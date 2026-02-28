import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Access Denied</h1>
        <p className="text-lg text-muted-foreground">
          You do not have the required permissions to access this dashboard area. Please log in with an authorized role.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/login">Return to Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
