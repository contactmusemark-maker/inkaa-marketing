import React from 'react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';

type Activity = {
  id: string;
  text: string;
  sub: string;
  time: string;
};

const activities: Activity[] = [];

export default function RecentActivity() {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-header">Recent Activity</h2>
        <Link href="/tasks" className="text-xs font-medium text-primary hover:underline">
          View All
        </Link>
      </div>
      {activities.length === 0 && (
        <EmptyState
          icon="ClockIcon"
          title="No recent activity"
          description="Client, project, invoice, and task events will appear here."
          className="py-10"
        />
      )}
    </div>
  );
}
