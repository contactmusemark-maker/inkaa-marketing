'use client';

import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type AdminUsage = {
  totals: {
    totalGenerations: number;
    totalTokens: number;
    activeSubscriptions: number;
  };
  topUsers: {
    user_id: string;
    plan: string;
    status: string;
    ai_limit: number | null;
    ai_used: number | null;
    current_period_end: string | null;
  }[];
  recentUsage: {
    user_id: string;
    provider: string;
    tool: string;
    tokens_used: number;
    created_at: string;
  }[];
  aiToolsEnabled: boolean;
  schemaIssues?: string[];
};

type AdminUser = {
  id: string;
  email: string | null;
  agency_name: string | null;
  full_name: string | null;
  role: string;
  plan: string | null;
  subscription_status: string;
};

type AuditLog = {
  id: string;
  actor_id: string | null;
  actor_role: string;
  action: string;
  target_user_id: string | null;
  created_at: string;
};

export default function SuperAdminPage() {
  const [data, setData] = useState<AdminUsage | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [schemaOk, setSchemaOk] = useState<boolean | null>(null);
  const [schemaDetails, setSchemaDetails] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      const [usageResponse, schemaResponse] = await Promise.all([
        fetch('/api/admin/ai-usage'),
        fetch('/api/admin/schema-validation'),
      ]);
      const usersResponse = await fetch('/api/admin/users');

      if (!ignore) {
        if (usageResponse.ok) {
          const usage = await usageResponse.json();
          setData(usage);
          if (usage.schemaIssues?.length) setSchemaDetails(usage.schemaIssues);
        }
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users || []);
          setAuditLogs(usersData.auditLogs || []);
        }
        if (schemaResponse.ok) {
          const schema = await schemaResponse.json();
          setSchemaOk(Boolean(schema.ok));
          const missing = Array.isArray(schema.missingColumns)
            ? schema.missingColumns.map(
                (item: { missing_table: string; missing_column: string }) =>
                  `${item.missing_table}.${item.missing_column}`
              )
            : [];
          if (schema.error) missing.unshift(schema.error);
          setSchemaDetails((current) => [...new Set([...current, ...missing])]);
        } else {
          setSchemaOk(false);
        }
        if (!usageResponse.ok) setError('Unable to load Super Admin analytics.');
      }
    }

    load().catch(() => {
      if (!ignore) setError('Unable to load Super Admin analytics.');
    });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <AppLayout
      title="Super Admin"
      subtitle="Platform controls for users, subscriptions, AI limits, and system health."
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <ShieldCheckIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Super Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Restricted platform administration for super admins only.
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">Active Subscriptions</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {data?.totals.activeSubscriptions ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">AI Generations</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {data?.totals.totalGenerations ?? 0}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">Tokens Used</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {(data?.totals.totalTokens ?? 0).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">Schema Health</p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {schemaOk === null ? 'Checking...' : schemaOk ? 'Healthy' : 'Needs migration'}
            </p>
          </div>
        </div>

        {schemaDetails.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <p className="font-semibold">Schema migration required</p>
            <p className="mt-1">Run the latest Supabase migration, then refresh this dashboard.</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {schemaDetails.slice(0, 6).map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">User Management</h2>
            <p className="text-xs text-muted-foreground">
              Only Super Admin can modify roles, subscriptions, and AI limits.
            </p>
          </div>
          {!users.length ? (
            <div className="p-8">
              <EmptyState
                title="No users found"
                description="User profiles will appear after accounts are created."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Agency</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">{user.full_name || user.id}</td>
                      <td className="px-5 py-3">{user.email || 'Not stored'}</td>
                      <td className="px-5 py-3">{user.agency_name || 'Not set'}</td>
                      <td className="px-5 py-3">{user.role}</td>
                      <td className="px-5 py-3 capitalize">{user.plan || 'starter'}</td>
                      <td className="px-5 py-3 capitalize">{user.subscription_status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Admin Audit Logs</h2>
            <p className="text-xs text-muted-foreground">
              Sensitive Super Admin actions are recorded for accountability.
            </p>
          </div>
          {!auditLogs.length ? (
            <div className="p-8">
              <EmptyState title="No audit logs yet" description="Admin actions will appear here." />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Actor</th>
                    <th className="px-5 py-3">Target</th>
                    <th className="px-5 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium">{log.action}</td>
                      <td className="px-5 py-3 font-mono text-xs">{log.actor_id || 'system'}</td>
                      <td className="px-5 py-3 font-mono text-xs">
                        {log.target_user_id || 'none'}
                      </td>
                      <td className="px-5 py-3">
                        {new Intl.DateTimeFormat('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(log.created_at))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Top AI Usage</h2>
              <p className="text-xs text-muted-foreground">
                Reset usage or modify limits through the protected admin API.
              </p>
            </div>
            <Link href="/settings" className="btn-secondary text-xs">
              Platform Settings
            </Link>
          </div>
          {!data?.topUsers.length ? (
            <div className="p-8">
              <EmptyState
                title="No usage yet"
                description="AI usage analytics will appear after customers generate content."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">AI Used</th>
                    <th className="px-5 py-3">Limit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topUsers.map((user) => (
                    <tr key={user.user_id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-mono text-xs">{user.user_id}</td>
                      <td className="px-5 py-3 capitalize">{user.plan}</td>
                      <td className="px-5 py-3 capitalize">{user.status}</td>
                      <td className="px-5 py-3">{user.ai_used ?? 0}</td>
                      <td className="px-5 py-3">{user.ai_limit ?? 'Unlimited'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
