'use client';

import React from 'react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';

type Quotation = {
  id: string;
  client: string;
  service: string;
  amount: string;
  status: string;
  date: string;
};

const quotations: Quotation[] = [];

export default function RecentQuotations() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="section-header">Recent Quotations</h2>
        <Link href="/quotations" className="text-xs font-medium text-primary hover:underline">
          View All
        </Link>
      </div>
      {quotations.length === 0 && (
        <EmptyState
          icon="DocumentTextIcon"
          title="No quotations found"
          description="Create a quotation to start tracking client proposals."
          className="min-h-[260px]"
        />
      )}
    </div>
  );
}
