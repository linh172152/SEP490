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

export function normalizeRobotStatus(status?: string | null): string {
  const normalized = String(status || '').trim().toLowerCase();
  if (!normalized) {
    return 'UNKNOWN';
  }

  const activeTokens = ['active', 'online', 'available', 'ready', 'idle', 'charging', 'working', 'busy'];
  const maintenanceTokens = ['maintenance', 'maint', 'error', 'fault', 'offline', 'unavailable', 'paused'];

  if (activeTokens.some((token) => normalized.includes(token))) {
    return 'ACTIVE';
  }

  if (maintenanceTokens.some((token) => normalized.includes(token))) {
    return 'MAINTENANCE';
  }

  return 'UNKNOWN';
}
