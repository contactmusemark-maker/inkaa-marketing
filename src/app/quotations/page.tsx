'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline';

type Quotation = {
  id: string;
  client: string;
  services: string;
  amount: string;
  status: string;
  date: string;
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quotations</h1>
              <p className="text-sm text-muted-foreground">Manage client quotations</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5">
            <PlusIcon className="w-4 h-4" />
            New Quotation
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Total', 'Pending', 'Approved', 'Draft'].map((label) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold mt-1 text-foreground">
                {label === 'Total'
                  ? quotations.length
                  : quotations.filter((quotation) => quotation.status === label).length}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {quotations.length === 0 ? (
            <EmptyState
              icon="DocumentTextIcon"
              title="No quotations found"
              description="Create a quotation to start sending proposals to clients."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {quotations.map((quotation) => (
                    <tr key={quotation.id} className="border-t border-border">
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {quotation.id}
                      </td>
                      <td className="px-6 py-3 font-medium text-foreground">{quotation.client}</td>
                      <td className="px-6 py-3 text-muted-foreground">{quotation.services}</td>
                      <td className="px-6 py-3 text-foreground">{quotation.amount}</td>
                      <td className="px-6 py-3 text-muted-foreground">{quotation.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateRecordModal
          title="New Quotation"
          submitLabel="Create Quotation"
          onClose={() => setShowCreate(false)}
          fields={[
            { name: 'client', label: 'Client', required: true },
            { name: 'services', label: 'Services', required: true },
            { name: 'amount', label: 'Amount', placeholder: '₹0', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Draft', 'Pending', 'Approved'],
            },
          ]}
          onSubmit={(values) => {
            setQuotations((current) => [
              {
                id: `QT-${String(current.length + 1).padStart(4, '0')}`,
                client: values.client,
                services: values.services,
                amount: values.amount,
                status: values.status,
                date: new Date().toISOString().slice(0, 10),
              },
              ...current,
            ]);
            setShowCreate(false);
          }}
        />
      )}
    </AppLayout>
  );
}
