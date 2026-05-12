'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

const kpiData = [
  {
    id: 'kpi-revenue',
    label: 'Total Revenue',
    value: '₹0',
    icon: 'CurrencyRupeeIcon',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    id: 'kpi-clients',
    label: 'Active Clients',
    value: '0',
    icon: 'UserGroupIcon',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'kpi-leads',
    label: 'New Leads',
    value: '0',
    icon: 'UserPlusIcon',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'kpi-invoices',
    label: 'Pending Invoices',
    value: '₹0',
    icon: 'DocumentTextIcon',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    id: 'kpi-projects',
    label: 'Projects In Progress',
    value: '0',
    icon: 'BriefcaseIcon',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

export default function KPIBentoGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
      {kpiData.map((kpi) => (
        <div key={kpi.id} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
              <Icon
                name={kpi.icon as Parameters<typeof Icon>[0]['name']}
                size={18}
                className={kpi.iconColor}
              />
            </div>
          </div>

          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {kpi.label}
          </p>
          <p className="text-2xl font-bold text-foreground font-tabular leading-none mb-0.5">
            {kpi.value}
          </p>
          <p className="text-[11px] text-muted-foreground">Waiting for live data</p>
        </div>
      ))}
    </div>
  );
}
