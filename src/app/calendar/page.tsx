'use client';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import { CalendarIcon } from '@heroicons/react/24/outline';

const events: Array<{ title: string; time: string; date: string; type: string }> = [];

export default function CalendarPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-sm text-muted-foreground">Upcoming meetings and deadlines</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm">
          {events.length === 0 && (
            <EmptyState
              icon="CalendarIcon"
              title="No calendar events"
              description="Meetings, deadlines, and scheduled reminders will appear here."
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
