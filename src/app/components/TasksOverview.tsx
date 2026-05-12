'use client';

import React from 'react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';

type Task = {
  id: string;
  text: string;
  priority: 'High' | 'Medium' | 'Low';
  due: string;
  done: boolean;
};

const tasks: Task[] = [];

export default function TasksOverview() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Tasks Overview</h2>
        <Link href="/tasks" className="text-xs font-medium text-primary hover:underline">
          View All
        </Link>
      </div>
      {tasks.length === 0 && (
        <EmptyState
          icon="ClipboardDocumentCheckIcon"
          title="No tasks yet"
          description="Assigned work and follow-ups will show here once your team starts using tasks."
          className="py-10"
        />
      )}
    </div>
  );
}
