'use client';

import Link from 'next/link';

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-card">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The app hit an unexpected error. You can retry or return to the dashboard.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try Again
          </button>
          <Link href="/dashboard" className="btn-secondary">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
