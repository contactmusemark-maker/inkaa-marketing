'use client';

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import CreateRecordModal from '@/components/ui/CreateRecordModal';
import { ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline';

type Task = {
  id: string;
  title: string;
  project: string;
  assignee: string;
  priority: string;
  status: string;
  due: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
              <p className="text-sm text-muted-foreground">Track and manage all tasks</p>
            </div>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary rounded-full px-5">
            <PlusIcon className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Total', 'In Progress', 'Review', 'Done'].map((label) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">
                {label === 'Total'
                  ? tasks.length
                  : tasks.filter((task) => task.status === label).length}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {tasks.length === 0 ? (
            <EmptyState
              icon="ClipboardDocumentCheckIcon"
              title="No tasks yet"
              description="Create tasks to coordinate work across clients, projects, and team members."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-t border-border">
                      <td className="px-6 py-3 font-medium text-foreground">{task.title}</td>
                      <td className="px-6 py-3 text-muted-foreground">{task.project}</td>
                      <td className="px-6 py-3 text-muted-foreground">{task.assignee}</td>
                      <td className="px-6 py-3 text-muted-foreground">{task.priority}</td>
                      <td className="px-6 py-3 text-muted-foreground">{task.status}</td>
                      <td className="px-6 py-3 text-muted-foreground">{task.due}</td>
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
          title="Add Task"
          submitLabel="Add Task"
          onClose={() => setShowCreate(false)}
          fields={[
            { name: 'title', label: 'Task Title', required: true },
            { name: 'project', label: 'Project' },
            { name: 'assignee', label: 'Assignee' },
            {
              name: 'priority',
              label: 'Priority',
              type: 'select',
              options: ['Low', 'Medium', 'High'],
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: ['Todo', 'In Progress', 'Review', 'Done'],
            },
            { name: 'due', label: 'Due Date', type: 'date' },
          ]}
          onSubmit={(values) => {
            setTasks((current) => [{ id: crypto.randomUUID(), ...values } as Task, ...current]);
            setShowCreate(false);
          }}
        />
      )}
    </AppLayout>
  );
}
