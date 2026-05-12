'use client';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const revenueData: Array<{ period: string; revenue: number }> = [];
const leadData: Array<{ period: string; leads: number }> = [];

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <ChartBarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">Business performance from live data</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Total Revenue', 'New Clients', 'Active Projects', 'Average ROI'].map((label) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">0</p>
              <p className="text-xs text-muted-foreground mt-0.5">Waiting for live data</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">Revenue Trend</h2>
            {revenueData.length === 0 && (
              <EmptyState
                icon="ChartBarIcon"
                title="No revenue data yet"
                description="Revenue analytics will appear after invoices or payments are recorded."
              />
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground mb-4">Lead Growth</h2>
            {leadData.length === 0 && (
              <EmptyState
                icon="UserPlusIcon"
                title="No lead data yet"
                description="Lead analytics will appear after CRM leads are added."
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
