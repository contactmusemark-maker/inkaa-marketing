export const roles = ['super_admin', 'admin', 'manager', 'member', 'client'] as const;
export type AppRole = (typeof roles)[number];

const roleRank: Record<AppRole, number> = {
  client: 0,
  member: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

export function normalizeRole(role?: string | null): AppRole {
  const normalized = role?.toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'owner') return 'admin';
  if (roles.includes(normalized as AppRole)) return normalized as AppRole;
  return 'member';
}

export function hasRole(role: string | null | undefined, allowedRoles: AppRole[]) {
  return allowedRoles.includes(normalizeRole(role));
}

export function hasMinimumRole(role: string | null | undefined, minimumRole: AppRole) {
  return roleRank[normalizeRole(role)] >= roleRank[minimumRole];
}

export function formatRole(role?: string | null) {
  return normalizeRole(role)
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const routeRoleAccess: Record<string, AppRole[]> = {
  '/super-admin': ['super_admin'],
  '/settings': ['super_admin', 'admin'],
  '/billing': ['super_admin', 'admin'],
  '/team': ['super_admin', 'admin', 'manager'],
  '/integrations': ['super_admin', 'admin'],
  '/analytics': ['super_admin', 'admin', 'manager'],
  '/reports': ['super_admin', 'admin', 'manager'],
  '/client-management': ['super_admin', 'admin', 'manager', 'member'],
  '/crm': ['super_admin', 'admin', 'manager', 'member'],
  '/projects': ['super_admin', 'admin', 'manager', 'member'],
  '/pricing-estimator': ['super_admin', 'admin', 'manager', 'member'],
  '/quotations': ['super_admin', 'admin', 'manager', 'member'],
  '/invoices': ['super_admin', 'admin', 'manager'],
  '/payments': ['super_admin', 'admin'],
  '/campaigns': ['super_admin', 'admin', 'manager', 'member'],
  '/ai-tools': ['super_admin', 'admin', 'manager', 'member'],
  '/tasks': ['super_admin', 'admin', 'manager', 'member'],
  '/calendar': ['super_admin', 'admin', 'manager', 'member', 'client'],
  '/documents': ['super_admin', 'admin', 'manager', 'member', 'client'],
  '/profile': ['super_admin', 'admin', 'manager', 'member', 'client'],
  '/help': ['super_admin', 'admin', 'manager', 'member', 'client'],
};

export function getAllowedRolesForPath(pathname: string) {
  const match = Object.entries(routeRoleAccess).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  return match?.[1] ?? null;
}
