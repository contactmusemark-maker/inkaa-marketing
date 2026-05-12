'use client';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import { CreditCardIcon } from '@heroicons/react/24/outline';

const transactions: Array<{
  id: string;
  client: string;
  amount: string;
  method: string;
  status: string;
  date: string;
}> = [];

export default function PaymentsPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <CreditCardIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payments</h1>
            <p className="text-sm text-muted-foreground">Transaction history and billing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Total Collected', 'Pending', 'Failed'].map((label) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">₹0</p>
              <p className="text-xs text-muted-foreground mt-0.5">Waiting for live data</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Transaction History</h2>
          </div>
          {transactions.length === 0 && (
            <EmptyState
              icon="CreditCardIcon"
              title="No payments found"
              description="Successful, pending, and failed payments will appear here."
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
