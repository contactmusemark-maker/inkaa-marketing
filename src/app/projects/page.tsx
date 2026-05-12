'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import { FolderIcon, PlusIcon } from '@heroicons/react/24/outline';

type Project = { id: string; name: string; client: string; status: string; deadline: string };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const active = projects.filter((project) => project.status !== 'Completed').length;
  const completed = projects.filter((project) => project.status === 'Completed').length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="text-sm text-muted-foreground">Manage all client projects</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5">
            <PlusIcon className="w-4 h-4" />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Projects', value: projects.length },
            { label: 'Active', value: active },
            { label: 'Completed', value: completed },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">All Projects</h2>
          </div>
          {projects.length === 0 ? (
            <EmptyState
              icon="FolderOpenIcon"
              title="No projects available"
              description="Create your first project after adding a client."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-t border-border">
                      <td className="px-6 py-3 font-medium text-foreground">{project.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{project.client}</td>
                      <td className="px-6 py-3 text-muted-foreground">{project.status}</td>
                      <td className="px-6 py-3 text-muted-foreground">{project.deadline}</td>
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
          title="New Project"
          submitLabel="Create Project"
          onClose={() => setShowCreate(false)}
          fields={[
            { name: 'name', label: 'Project Name', required: true },
            { name: 'client', label: 'Client', required: true },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Planning', 'Active', 'Review', 'Completed'],
            },
            { name: 'deadline', label: 'Deadline', type: 'date' },
          ]}
          onSubmit={(values) => {
            setProjects((current) => [
              { id: crypto.randomUUID(), ...values } as Project,
              ...current,
            ]);
            setShowCreate(false);
          }}
        />
      )}
    </AppLayout>
  );
}
