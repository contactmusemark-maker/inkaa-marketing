'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import { MegaphoneIcon, PlusIcon } from '@heroicons/react/24/outline';

type Campaign = {
  id: string;
  name: string;
  client: string;
  type: string;
  budget: string;
  status: string;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const totalBudget = campaigns.reduce((sum, campaign) => sum + Number(campaign.budget || 0), 0);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <MegaphoneIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
              <p className="text-sm text-muted-foreground">Track live marketing campaigns</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5">
            <PlusIcon className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Campaigns', value: campaigns.length.toString() },
            {
              label: 'Active',
              value: campaigns.filter((c) => c.status === 'Active').length.toString(),
            },
            { label: 'Total Budget', value: `₹${totalBudget.toLocaleString('en-IN')}` },
            { label: 'Total Spent', value: '₹0' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm"
            >
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {campaigns.length === 0 ? (
            <EmptyState
              icon="MegaphoneIcon"
              title="No campaigns yet"
              description="Campaign performance will appear here after campaigns are created or synced."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-xl border border-border p-4">
                  <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {campaign.client} · {campaign.type}
                  </p>
                  <p className="text-sm text-foreground mt-3">
                    ₹{Number(campaign.budget || 0).toLocaleString('en-IN')} · {campaign.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateRecordModal
          title="New Campaign"
          submitLabel="Create Campaign"
          onClose={() => setShowCreate(false)}
          fields={[
            { name: 'name', label: 'Campaign Name', required: true },
            { name: 'client', label: 'Client', required: true },
            {
              name: 'type',
              label: 'Type',
              type: 'select',
              options: ['Meta Ads', 'Google Ads', 'SEO', 'Email'],
            },
            { name: 'budget', label: 'Budget', type: 'number' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Active', 'Paused', 'Completed'],
            },
          ]}
          onSubmit={(values) => {
            setCampaigns((current) => [
              { id: crypto.randomUUID(), ...values } as Campaign,
              ...current,
            ]);
            setShowCreate(false);
          }}
        />
      )}
    </AppLayout>
  );
}
