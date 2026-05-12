'use client';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import { DocumentChartBarIcon } from '@heroicons/react/24/outline';

const reports: Array<{ title: string; description: string; date: string; type: string }> = [];

export default function ReportsPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <DocumentChartBarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Business intelligence and insights</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm">
          {reports.length === 0 && (
            <EmptyState
              icon="DocumentChartBarIcon"
              title="No reports available"
              description="Reports will be generated after enough live activity is available."
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
