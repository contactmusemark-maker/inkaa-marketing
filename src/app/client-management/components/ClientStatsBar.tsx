import React from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Client } from './ClientManagementScreen';

interface ClientStatsBarProps {
  clients: Client[];
}

export default function ClientStatsBar({ clients }: ClientStatsBarProps) {
  const active = clients.filter((c) => c.status === 'Active').length;
  const trial = clients.filter((c) => c.status === 'Trial').length;
  const churned = clients.filter((c) => c.status === 'Churned').length;
  const totalMRR = clients.reduce((s, c) => s + c.mrr, 0);

  const stats = [
    {
      id: 'cs-total',
      label: 'Total Clients',
      value: clients.length.toString(),
      icon: 'UserGroupIcon',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'cs-active',
      label: 'Active Clients',
      value: active.toString(),
      icon: 'CheckCircleIcon',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      id: 'cs-trial',
      label: 'In Trial',
      value: trial.toString(),
      icon: 'ClockIcon',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      id: 'cs-churned',
      label: 'Churned',
      value: churned.toString(),
      icon: 'XCircleIcon',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-500',
    },
    {
      id: 'cs-mrr',
      label: 'Total MRR',
      value: totalMRR === 0 ? '₹0' : `₹${(totalMRR / 1000).toFixed(0)}K`,
      icon: 'CurrencyRupeeIcon',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div key={s.id} className="card p-4 flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}
          >
            <Icon
              name={s.icon as Parameters<typeof Icon>[0]['name']}
              size={17}
              className={s.iconColor}
            />
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {s.label}
            </p>
            <p className="text-xl font-bold text-foreground font-tabular leading-tight">
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
