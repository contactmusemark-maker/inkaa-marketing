'use client';

import { formatRole, normalizeRole } from '@/lib/rbacCore';

type RoleBadgeProps = {
  role?: string | null;
  className?: string;
};

const badgeClasses = {
  super_admin: 'bg-red-50 text-red-700 border-red-100',
  admin: 'bg-purple-50 text-purple-700 border-purple-100',
  manager: 'bg-blue-50 text-blue-700 border-blue-100',
  member: 'bg-slate-100 text-slate-700 border-slate-200',
  client: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export default function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const normalizedRole = normalizeRole(role);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeClasses[normalizedRole]} ${className}`}
    >
      {formatRole(normalizedRole)}
    </span>
  );
}
