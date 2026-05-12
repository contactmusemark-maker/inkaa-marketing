'use client';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import { PaperClipIcon } from '@heroicons/react/24/outline';

const documents: Array<{ name: string; client: string; size: string; type: string; date: string }> =
  [];

export default function DocumentsPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <PaperClipIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Documents</h1>
            <p className="text-sm text-muted-foreground">Client files and project documents</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {documents.length === 0 && (
            <EmptyState
              icon="PaperClipIcon"
              title="No documents found"
              description="Uploaded client files and generated documents will appear here."
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
