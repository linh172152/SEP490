'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';

export function Topbar() {
  const currentUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();

  if (!currentUser) return null;

  const roleLabel = (() => {
    if (pathname.startsWith('/dashboard/family')) return 'Family Member';
    if (pathname.startsWith('/dashboard/caregiver')) return 'Caregiver';
    if (pathname.startsWith('/dashboard/manager')) return 'Manager';
    if (pathname.startsWith('/dashboard/admin')) return 'Administrator';

    switch ((currentUser.role || '').toUpperCase()) {
      case 'ADMIN':
      case 'ADMINISTRATOR':
        return 'Administrator';
      case 'MANAGER':
        return 'Manager';
      case 'CAREGIVER':
        return 'Caregiver';
      case 'FAMILYMEMBER':
        return 'Family Member';
      case 'ELDERLY':
      case 'ELDERLYUSER':
        return 'Family Member';
      default:
        return String(currentUser.role || 'User')
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  })();

  return (
    <header className="fixed top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:left-72 sm:w-[calc(100%-18rem)] sm:px-6 lg:px-8">
      <div className="min-w-0 flex-1 pr-4">
  <div className="inline-flex items-center gap-2 min-w-0 max-w-full rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-indigo-50 px-4 py-2 shadow-sm dark:border-sky-900/40 dark:from-sky-950/30 dark:via-slate-950 dark:to-indigo-950/30">
    
    <p className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-lg">
      {currentUser.name}
    </p>

    <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 sm:text-xs">
      {roleLabel}
    </p>

  </div>
</div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:scale-110 active:scale-95">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm overflow-hidden">
                <AvatarFallback className={cn(
                  "text-xs text-white font-bold uppercase",
                  getAvatarColor(currentUser.name)
                )}>
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {
              logout();
              window.location.href = '/';
            }}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
