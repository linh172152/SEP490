import { ServicePackageResponse, UserPackageResponse } from '@/services/api/types';
import { cn } from '@/lib/utils';

const unpurchasedTheme = {
  surfaceClassName: 'border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900',
  accentClassName: 'bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300',
  badgeClassName: 'border-slate-300 bg-slate-100 text-slate-700',
  subtleClassName: 'bg-slate-100/90 text-slate-700',
  ringClassName: 'ring-slate-200',
};

const packageThemes = [
  {
    surfaceClassName: 'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-100 text-emerald-950',
    accentClassName: 'bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500',
    badgeClassName: 'border-emerald-300 bg-emerald-100 text-emerald-900',
    subtleClassName: 'bg-emerald-100/80 text-emerald-900',
    ringClassName: 'ring-emerald-200',
  },
  {
    surfaceClassName: 'border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-100 text-sky-950',
    accentClassName: 'bg-gradient-to-r from-sky-400 via-blue-400 to-sky-600',
    badgeClassName: 'border-sky-300 bg-sky-100 text-sky-900',
    subtleClassName: 'bg-sky-100/80 text-sky-900',
    ringClassName: 'ring-sky-200',
  },
  {
    surfaceClassName: 'border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-100 text-violet-950',
    accentClassName: 'bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-500',
    badgeClassName: 'border-violet-300 bg-violet-100 text-violet-900',
    subtleClassName: 'bg-violet-100/80 text-violet-900',
    ringClassName: 'ring-violet-200',
  },
  {
    surfaceClassName: 'border-yellow-200 bg-gradient-to-br from-yellow-50 via-white to-amber-100 text-yellow-950',
    accentClassName: 'bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-500',
    badgeClassName: 'border-yellow-300 bg-yellow-100 text-yellow-900',
    subtleClassName: 'bg-yellow-100/80 text-yellow-900',
    ringClassName: 'ring-yellow-200',
  },
  {
    surfaceClassName: 'border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-100 text-orange-950',
    accentClassName: 'bg-gradient-to-r from-orange-400 via-amber-400 to-orange-600',
    badgeClassName: 'border-orange-300 bg-orange-100 text-orange-900',
    subtleClassName: 'bg-orange-100/80 text-orange-900',
    ringClassName: 'ring-orange-200',
  },
  {
    surfaceClassName: 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-red-100 text-rose-950',
    accentClassName: 'bg-gradient-to-r from-rose-400 via-red-400 to-rose-600',
    badgeClassName: 'border-rose-300 bg-rose-100 text-rose-900',
    subtleClassName: 'bg-rose-100/80 text-rose-900',
    ringClassName: 'ring-rose-200',
  },
  {
    surfaceClassName: 'border-amber-300 bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200 text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]',
    accentClassName: 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500',
    badgeClassName: 'border-amber-300 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-950',
    subtleClassName: 'bg-gradient-to-r from-yellow-100/90 to-amber-100/90 text-amber-950',
    ringClassName: 'ring-amber-200',
  },
  {
    surfaceClassName: 'border-slate-300 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.9),transparent_24%),linear-gradient(135deg,#f8fafc_0%,#e5e7eb_30%,#cbd5e1_55%,#f8fafc_100%)] text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]',
    accentClassName: 'bg-[linear-gradient(90deg,#e2e8f0_0%,#ffffff_18%,#cbd5e1_38%,#f8fafc_55%,#dbe4f0_73%,#ffffff_100%)]',
    badgeClassName: 'border-slate-300 bg-[linear-gradient(90deg,#f8fafc,#e5e7eb,#f8fafc)] text-slate-900',
    subtleClassName: 'bg-white/80 text-slate-800 backdrop-blur-sm',
    ringClassName: 'ring-slate-300',
  },
  {
    surfaceClassName: 'border-cyan-300 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.98),transparent_18%),radial-gradient(circle_at_82%_26%,rgba(255,255,255,0.85),transparent_16%),radial-gradient(circle_at_68%_78%,rgba(224,242,254,0.9),transparent_22%),linear-gradient(135deg,#ecfeff_0%,#dbeafe_22%,#e0e7ff_48%,#cffafe_70%,#f5f3ff_100%)] text-cyan-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_30px_rgba(56,189,248,0.14)]',
    accentClassName: 'bg-[linear-gradient(90deg,#67e8f9_0%,#93c5fd_18%,#ffffff_34%,#c4b5fd_52%,#22d3ee_72%,#dbeafe_100%)]',
    badgeClassName: 'border-cyan-300 bg-[linear-gradient(90deg,#ecfeff,#dbeafe,#eef2ff)] text-cyan-950',
    subtleClassName: 'bg-white/75 text-cyan-900 backdrop-blur-sm',
    ringClassName: 'ring-cyan-200',
  },
  // ── Ember Gold — Ultimate / most expensive package ─────────────────
  {
    surfaceClassName: [
      'border-2 border-orange-700/75',
      'bg-[radial-gradient(ellipse_at_0%_0%,rgba(255,247,237,0.97),transparent_45%),radial-gradient(ellipse_at_100%_0%,rgba(254,243,199,0.88),transparent_42%),radial-gradient(ellipse_at_100%_100%,rgba(255,237,213,0.80),transparent_40%),radial-gradient(ellipse_at_0%_100%,rgba(253,230,138,0.55),transparent_38%),linear-gradient(145deg,#fff7ed_0%,#fef3c7_18%,#ffedd5_36%,#fef9c3_56%,#fff7ed_76%,#fef3c7_100%)]',
      'text-orange-950',
      'shadow-[0_0_0_1px_rgba(194,65,12,0.28),0_8px_40px_rgba(194,65,12,0.14),0_0_60px_rgba(245,158,11,0.12),inset_0_1px_0_rgba(255,255,255,0.95)]',
    ].join(' '),
    accentClassName: [
      'gold-shimmer-bar',
      'bg-[linear-gradient(90deg,#7c2d12_0%,#c2410c_8%,#ea580c_18%,#f97316_28%,#fbbf24_38%,#fef08a_45%,#ffffff_50%,#fef08a_55%,#fbbf24_62%,#f97316_72%,#ea580c_82%,#c2410c_92%,#7c2d12_100%)]',
    ].join(' '),
    badgeClassName: [
      'border-orange-600/50',
      'bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-100',
      'text-orange-900 font-bold',
      'shadow-[0_1px_4px_rgba(194,65,12,0.20)]',
    ].join(' '),
    subtleClassName: 'bg-gradient-to-r from-orange-100/90 via-amber-50/80 to-yellow-100/90 text-orange-950',
    ringClassName: 'ring-orange-600',
  },
];

export function getOrderedServicePackages(servicePackages: ServicePackageResponse[]) {
  return [...servicePackages].sort((left, right) => {
    if (left.price !== right.price) {
      return left.price - right.price;
    }

    return left.name.localeCompare(right.name);
  });
}

export function getServicePackageTheme(
  servicePackage?: ServicePackageResponse | null,
  servicePackages: ServicePackageResponse[] = []
) {
  if (!servicePackage) {
    return unpurchasedTheme;
  }

  const orderedPackages = getOrderedServicePackages(servicePackages.length > 0 ? servicePackages : [servicePackage]);
  const rankedIndex = orderedPackages.findIndex((item) => item.id === servicePackage.id);

  if (rankedIndex < 0) {
    return packageThemes[0];
  }

  return packageThemes[Math.min(rankedIndex, packageThemes.length - 1)];
}

export function getUnpurchasedPackageTheme() {
  return unpurchasedTheme;
}

export function getActiveUserPackageForElderly(
  userPackages: UserPackageResponse[],
  elderlyId: number
) {
  const now = Date.now();

  return userPackages
    .filter((item) => item.elderlyProfileId === elderlyId)
    .filter((item) => {
      if (!item.expiredAt) return true;
      const expiry = Date.parse(item.expiredAt);
      return Number.isNaN(expiry) || expiry >= now;
    })
    .sort((left, right) => Date.parse(right.assignedAt) - Date.parse(left.assignedAt))[0] || null;
}

export function getCatalogPackageForUserPackage(
  servicePackages: ServicePackageResponse[],
  userPackage: UserPackageResponse | null | undefined
) {
  if (!userPackage) {
    return null;
  }

  return servicePackages.find((item) => item.id === userPackage.servicePackageId) || null;
}

export function getServicePackageCardClassName(level?: string | null, extra?: string) {
  return cn(getServicePackageTheme(undefined, []).surfaceClassName, extra);
}