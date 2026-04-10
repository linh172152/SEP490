import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  
  return `${d}/${m}/${y} ${h}:${min}`;
}

export function normalizeRobotStatus(status: string): string {
  const s = status?.toUpperCase() || 'OFFLINE';
  
  if (['ACTIVE', 'ONLINE', 'ONNLINE', 'RUNNING', 'READY'].includes(s)) {
    return 'ACTIVE';
  }
  
  if (['MAINTENANCE', 'REPAIRING', 'FIXING'].includes(s)) {
    return 'MAINTENANCE';
  }
  
  return 'OFFLINE';
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-sky-500',
    'bg-slate-500',
  ];
  
  if (!name) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

