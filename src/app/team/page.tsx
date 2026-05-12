'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import { UsersIcon, PlusIcon } from '@heroicons/react/24/outline';

type Member = { id: string; name: string; role: string; email: string; projects: number };

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <UsersIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Team</h1>
              <p className="text-sm text-muted-foreground">Manage your team members</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5">
            <PlusIcon className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm">
          {members.length === 0 ? (
            <EmptyState
              icon="UsersIcon"
              title="No team members yet"
              description="Invited teammates and their access roles will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {members.map((member) => (
                <div key={member.id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                  <p className="text-sm text-primary mt-2">{member.role}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <CreateRecordModal
          title="Invite Member"
          submitLabel="Send Invite"
          onClose={() => setShowCreate(false)}
          fields={[
            { name: 'name', label: 'Full Name', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
            {
              name: 'role',
              label: 'Role',
              type: 'select',
              options: ['Admin', 'Manager', 'Team Member'],
            },
          ]}
          onSubmit={(values) => {
            setMembers((current) => [
              {
                id: crypto.randomUUID(),
                name: values.name,
                email: values.email,
                role: values.role,
                projects: 0,
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
