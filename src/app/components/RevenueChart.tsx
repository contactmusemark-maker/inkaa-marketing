'use client';

import React, { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';

type RevenuePoint = {
  period: string;
  revenue: number;
  expenses: number;
};

const monthlyData: RevenuePoint[] = [];
const quarterlyData: RevenuePoint[] = [];

export default function RevenueChart() {
  const [view, setView] = useState<'monthly' | 'quarterly'>('monthly');
  const data = view === 'monthly' ? monthlyData : quarterlyData;

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="section-header">Revenue Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Revenue and expenses from live data
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(['monthly', 'quarterly'] as const).map((v) => (
            <button
              key={`view-${v}`}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                view === v
                  ? 'bg-card text-foreground shadow-card'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 && (
        <EmptyState
          icon="ChartBarIcon"
          title="No revenue data yet"
          description="Revenue charts will populate after invoices or payments are recorded."
          className="min-h-[260px]"
        />
      )}
    </div>
  );
}
