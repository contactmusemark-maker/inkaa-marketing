'use client';

import React from 'react';
import EmptyState from '@/components/ui/EmptyState';

type ProjectStatus = {
  id: string;
  label: string;
  count: number;
  color: string;
};

const projectData: ProjectStatus[] = [];

export default function ProjectStatusChart() {
  const total = projectData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="card p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Projects Status</h2>
        <span className="badge badge-slate">{total} Total</span>
      </div>

      <EmptyState
        icon="FolderOpenIcon"
        title="No projects available"
        description="Project status reporting will appear after projects are created."
        className="min-h-[230px]"
      />
    </div>
  );
}
