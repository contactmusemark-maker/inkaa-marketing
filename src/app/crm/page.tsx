'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import { FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';

type Lead = { id: string; name: string; stage: string; value: string; manager: string };

const stages = ['New', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FunnelIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">CRM Pipeline</h1>
              <p className="text-sm text-muted-foreground">Track and manage live leads</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5">
            <PlusIcon className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map((stage) => (
            <div
              key={stage}
              className="bg-card border border-border rounded-2xl p-4 text-center shadow-sm"
            >
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 bg-muted text-muted-foreground">
                {stage}
              </span>
              <p className="text-2xl font-bold text-foreground">
                {leads.filter((lead) => lead.stage === stage).length}
              </p>
              <p className="text-xs text-muted-foreground">leads</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">All Leads</h2>
          </div>
          {leads.length === 0 ? (
            <EmptyState
              icon="FunnelIcon"
              title="No CRM leads yet"
              description="New leads will appear here after they are captured or added."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    {['Lead', 'Stage', 'Value', 'Manager'].map((heading) => (
                      <th key={heading} className="px-6 py-3 text-left text-muted-foreground">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-border">
                      <td className="px-6 py-3 font-medium text-foreground">{lead.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{lead.stage}</td>
                      <td className="px-6 py-3 text-foreground">{lead.value}</td>
                      <td className="px-6 py-3 text-muted-foreground">{lead.manager}</td>
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
          title="Add Lead"
          submitLabel="Add Lead"
          onClose={() => setShowCreate(false)}
          fields={[
            { name: 'name', label: 'Lead Name', required: true },
            { name: 'stage', label: 'Stage', type: 'select', options: stages, required: true },
            { name: 'value', label: 'Estimated Value', placeholder: '₹0' },
            { name: 'manager', label: 'Manager', placeholder: 'Unassigned' },
          ]}
          onSubmit={(values) => {
            setLeads((current) => [
              {
                id: crypto.randomUUID(),
                name: values.name,
                stage: values.stage,
                value: values.value || '₹0',
                manager: values.manager || 'Unassigned',
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
