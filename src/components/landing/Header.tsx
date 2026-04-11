'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

import { useI18nStore } from '@/store/useI18nStore';

export function Header() {
  const { t } = useI18nStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground">
            CAREBOT<span className="text-primary font-light">MH</span>
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary hidden sm:block">
            {t('landing.header.login', 'Log In')}
          </Link>
          <Link href="/register">
            <Button variant="default" className="px-6 rounded-full shadow-sm">
              {t('landing.header.signup', 'Sign Up')}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
