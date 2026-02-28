'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulse } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <HeartPulse className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">CareBot-MH</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-8 text-sm font-medium">
          <Link href="#features" className="transition-colors hover:text-primary text-muted-foreground">Features</Link>
          <Link href="#roles" className="transition-colors hover:text-primary text-muted-foreground">Roles</Link>
          <Link href="#tech" className="transition-colors hover:text-primary text-muted-foreground">Technology</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="default" className="px-6 rounded-full shadow-sm">
              Log In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
