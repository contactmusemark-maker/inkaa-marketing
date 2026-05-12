'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import { ReceiptRefundIcon, PlusIcon } from '@heroicons/react/24/outline';

type Invoice = {
  id: string;
  client: string;
  amount: string;
  status: string;
  due: string;
  issued: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const total = invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const pending = invoices
    .filter((invoice) => invoice.status === 'Pending')
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ReceiptRefundIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
              <p className="text-sm text-muted-foreground">Manage billing and invoices</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5">
            <PlusIcon className="w-4 h-4" />
            New Invoice
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Invoiced', value: `₹${total.toLocaleString('en-IN')}` },
            { label: 'Paid', value: '₹0' },
            { label: 'Pending', value: `₹${pending.toLocaleString('en-IN')}` },
            { label: 'Overdue', value: '₹0' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm"
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold mt-1 text-foreground">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {invoices.length === 0 ? (
            <EmptyState
              icon="ReceiptRefundIcon"
              title="No invoices found"
              description="Invoices will appear here after you create or sync billing records."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-border">
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-3 font-medium text-foreground">{invoice.client}</td>
                      <td className="px-6 py-3 text-foreground">
                        ₹{Number(invoice.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{invoice.status}</td>
                      <td className="px-6 py-3 text-muted-foreground">{invoice.due}</td>
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
          title="New Invoice"
          submitLabel="Create Invoice"
          onClose={() => setShowCreate(false)}
          fields={[
            { name: 'client', label: 'Client', required: true },
            { name: 'amount', label: 'Amount', type: 'number', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Pending', 'Paid', 'Overdue'],
            },
            { name: 'due', label: 'Due Date', type: 'date' },
          ]}
          onSubmit={(values) => {
            setInvoices((current) => [
              {
                id: `INV-${String(current.length + 1).padStart(4, '0')}`,
                client: values.client,
                amount: values.amount,
                status: values.status,
                due: values.due,
                issued: new Date().toISOString().slice(0, 10),
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
