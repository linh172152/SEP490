'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  onSidebarToggle: () => void;
  isSidebarCollapsed: boolean;
}

export function Topbar({ onMenuClick, onSidebarToggle, isSidebarCollapsed }: TopbarProps) {
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
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur transition-all duration-300 sm:px-6 lg:px-8',
        isSidebarCollapsed ? 'sm:left-20' : 'sm:left-72'
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="ghost" size="icon" className="sm:hidden -ml-2 h-10 w-10 text-slate-500" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-10 w-10 text-slate-400 transition-colors hover:text-primary sm:inline-flex"
          onClick={onSidebarToggle}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
        <div className="hidden rounded-full border bg-muted/70 px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground sm:block">
          {roleLabel}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:scale-110 active:scale-95">
              <Avatar className="h-9 w-9 overflow-hidden border-2 border-white shadow-sm">
                <AvatarFallback
                  className={cn(
                    'text-xs font-bold uppercase text-white',
                    getAvatarColor(currentUser.name)
                  )}
                >
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{roleLabel}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                window.location.href = '/';
              }}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
