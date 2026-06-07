import {
  AccountResponse,
  ServicePackageResponse,
  UserPackageResponse,
} from '@/services/api/types';

const PRIOR_ORDER_STATUSES = new Set(['PAID', 'REPLACED']);

export function isPriorOrderStatus(status?: string): boolean {
  return !!status && PRIOR_ORDER_STATUSES.has(status);
}

/** Account exists and is not soft-deleted (checks camelCase + PascalCase from BE). */
export function isActiveAccount(account?: AccountResponse | null): boolean {
  if (!account) return false;
  const a = account as AccountResponse & { Deleted?: boolean };
  const deleted = a.deleted ?? a.Deleted;
  return deleted !== true;
}

/** Same map builder as OrderTrackingTab fetch — skips deleted accounts. */
export function buildAccountMap(
  accountData: AccountResponse[] | null | undefined
): Record<string, AccountResponse> {
  const map: Record<string, AccountResponse> = {};
  (accountData || []).forEach((a: any) => {
    if (!isActiveAccount(a)) return;
    const id = a.id ?? a.Id ?? a.ID;
    if (id !== undefined) map[String(id)] = a;
  });
  return map;
}

/** Same map builder as OrderTrackingTab fetch. */
export function buildPackageMap(
  packageData: ServicePackageResponse[] | null | undefined
): Record<string, ServicePackageResponse> {
  const map: Record<string, ServicePackageResponse> = {};
  (packageData || []).forEach((p: any) => {
    const id = p.id ?? p.Id ?? p.ID;
    if (id !== undefined) map[String(id)] = p;
  });
  return map;
}

/** Same field fallbacks as OrderTrackingTab table rows. */
export function resolveOrderAccountId(order: UserPackageResponse | Record<string, unknown>): number | null {
  const o = order as any;
  const id = o.accountId ?? o.AccountId ?? o.account_id ?? o.AccountID;
  if (id == null || id === '') return null;
  const num = Number(id);
  return Number.isNaN(num) ? null : num;
}

export function resolveOrderPackageId(order: UserPackageResponse | Record<string, unknown>): number | null {
  const o = order as any;
  const id = o.servicePackageId ?? o.ServicePackageId ?? o.service_package_id ?? o.ServicePackageID;
  if (id == null || id === '') return null;
  const num = Number(id);
  return Number.isNaN(num) ? null : num;
}

export function resolveOrderAccount(
  order: UserPackageResponse,
  accounts: Record<string, AccountResponse>
): AccountResponse | null {
  const id = resolveOrderAccountId(order);
  if (id == null) return null;
  return accounts[String(id)] ?? null;
}

export function resolveOrderPackage(
  order: UserPackageResponse,
  packages: Record<string, ServicePackageResponse>
): ServicePackageResponse | null {
  const id = resolveOrderPackageId(order);
  if (id == null) return null;
  return packages[String(id)] ?? null;
}

export function getSoftDeletedAccountIdsFromBackup(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('deleted_accounts_backup');
    if (!raw) return new Set();
    const records = JSON.parse(raw) as { account: { id?: number; accountId?: number } }[];
    return new Set(
      records
        .map((r) => r.account?.id ?? r.account?.accountId)
        .filter((id): id is number => id != null)
        .map(Number)
    );
  } catch {
    return new Set();
  }
}

export function getDeletedAccountIds(
  accountData: AccountResponse[] | null | undefined
): Set<number> {
  const ids = new Set<number>();
  (accountData || []).forEach((a: any) => {
    if (!isActiveAccount(a)) {
      const id = a.id ?? a.Id ?? a.ID;
      if (id != null) ids.add(Number(id));
    }
  });
  return ids;
}

/**
 * Orders that Order Tracking can render with a valid, non-deleted account and package.
 * Deleted accounts are excluded from the map; orders linked to them are dropped.
 */
export function getVisibleTrackingOrders(
  orders: UserPackageResponse[],
  accounts: Record<string, AccountResponse>,
  packages: Record<string, ServicePackageResponse>,
  excludedAccountIds?: Set<number>
): UserPackageResponse[] {
  return orders.filter((order) => {
    const accountId = resolveOrderAccountId(order);
    if (accountId != null && excludedAccountIds?.has(accountId)) return false;

    const acc = resolveOrderAccount(order, accounts);
    const pkg = resolveOrderPackage(order, packages);
    return acc != null && isActiveAccount(acc) && pkg != null;
  });
}

/** Full Order Tracking list filter — same as the tracking table (search + status). */
export function filterTrackingOrders(
  orders: UserPackageResponse[],
  accounts: Record<string, AccountResponse>,
  packages: Record<string, ServicePackageResponse>,
  options?: { searchTerm?: string; statusFilter?: string; excludedAccountIds?: Set<number> }
): UserPackageResponse[] {
  const search = (options?.searchTerm ?? '').toLowerCase();
  const statusFilter = options?.statusFilter ?? 'all';

  return getVisibleTrackingOrders(orders, accounts, packages, options?.excludedAccountIds)
    .filter((order) => {
      const acc = resolveOrderAccount(order, accounts)!;
      const pkg = resolveOrderPackage(order, packages)!;

      const matchesSearch =
        (acc.fullName || acc.FullName || acc.email || '').toLowerCase().includes(search) ||
        (pkg.name || '').toLowerCase().includes(search);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
      const dateB = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
      return dateB - dateA;
    });
}

export function getPreviousPaidOrders(
  order: UserPackageResponse,
  allOrders: UserPackageResponse[]
): UserPackageResponse[] {
  const accountId = resolveOrderAccountId(order);
  if (!accountId || !order.assignedAt) return [];

  const orderTime = new Date(order.assignedAt).getTime();

  return allOrders
    .filter((o) => {
      const oAccountId = resolveOrderAccountId(o);
      return (
        o.id !== order.id &&
        oAccountId === accountId &&
        isPriorOrderStatus(o.status) &&
        o.assignedAt &&
        new Date(o.assignedAt).getTime() < orderTime
      );
    })
    .sort(
      (a, b) =>
        new Date(a.assignedAt!).getTime() - new Date(b.assignedAt!).getTime()
    );
}

export function isUpgradeOrder(
  order: UserPackageResponse,
  allOrders: UserPackageResponse[]
): boolean {
  return getPreviousPaidOrders(order, allOrders).length > 0;
}

export function buildUpgradePathData(
  orders: UserPackageResponse[],
  accounts: Record<string, AccountResponse>,
  packages: Record<string, ServicePackageResponse>,
  excludedAccountIds?: Set<number>
): { name: string; value: number }[] {
  const visibleOrders = getVisibleTrackingOrders(orders, accounts, packages, excludedAccountIds);
  const paths: Record<string, number> = {};

  visibleOrders.forEach((order) => {
    if (order.status !== 'PAID') return;

    const previousPaid = getPreviousPaidOrders(order, visibleOrders);
    if (previousPaid.length === 0) return;

    const prevOrder = previousPaid[previousPaid.length - 1];
    const fromPkg = resolveOrderPackage(prevOrder, packages);
    const toPkg = resolveOrderPackage(order, packages);

    if (fromPkg && toPkg && fromPkg.id !== toPkg.id) {
      const pathName = `${fromPkg.name} ➔ ${toPkg.name}`;
      paths[pathName] = (paths[pathName] || 0) + 1;
    }
  });

  return Object.entries(paths)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export function buildPackagePopularityStats(
  packages: Record<string, ServicePackageResponse>,
  visibleOrders: UserPackageResponse[]
): { name: string; value: number }[] {
  const packageList = Object.values(packages);

  return packageList
    .map((pkg) => ({
      name: pkg.name,
      value: visibleOrders.filter(
        (up) => resolveOrderPackageId(up) === pkg.id && up.status === 'PAID'
      ).length,
    }))
    .sort((a, b) => b.value - a.value);
}
