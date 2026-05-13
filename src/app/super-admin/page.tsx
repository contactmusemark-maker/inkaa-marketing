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

type SupportTicket = {
  id: string;
  name: string | null;
  email: string | null;
  category: string;
  priority: string;
  subject: string;
  message: string;
  status: string;
  page_url: string | null;
  internal_reply: string | null;
  created_at: string;
};

type FeedbackSubmission = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  created_at: string;
};

export default function SuperAdminPage() {
  const [data, setData] = useState<AdminUsage | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [schemaOk, setSchemaOk] = useState<boolean | null>(null);
  const [schemaDetails, setSchemaDetails] = useState<string[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [feedback, setFeedback] = useState<FeedbackSubmission[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      const [usageResponse, schemaResponse] = await Promise.all([
        fetch('/api/admin/ai-usage'),
        fetch('/api/admin/schema-validation'),
      ]);
      const usersResponse = await fetch('/api/admin/users');
      const supportResponse = await fetch('/api/admin/support');

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
        if (supportResponse.ok) {
          const supportData = await supportResponse.json();
          setTickets(supportData.tickets || []);
          setFeedback(supportData.feedback || []);
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

  async function updateTicket(ticketId: string, updates: Record<string, unknown>) {
    const response = await fetch('/api/admin/support', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId, ...updates }),
    });

    if (!response.ok) return;

    setTickets((current) =>
      current.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updates } : ticket))
    );
  }

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
            <h2 className="text-base font-semibold text-foreground">Support Tickets</h2>
            <p className="text-xs text-muted-foreground">
              Customer issues, bug reports, billing requests, and AI problems.
            </p>
          </div>
          {!tickets.length ? (
            <div className="p-8">
              <EmptyState
                title="No support tickets"
                description="Customer support tickets will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3">Issue</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Internal Reply</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border align-top last:border-0">
                      <td className="max-w-sm px-5 py-3">
                        <p className="font-medium text-foreground">{ticket.subject}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {ticket.message}
                        </p>
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          {ticket.category} ·{' '}
                          {new Intl.DateTimeFormat('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(ticket.created_at))}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p>{ticket.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{ticket.email}</p>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          className="input-field min-w-28 py-1 text-xs"
                          value={ticket.priority}
                          onChange={(event) =>
                            updateTicket(ticket.id, { priority: event.target.value })
                          }
                        >
                          {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                            <option key={priority}>{priority}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          className="input-field min-w-32 py-1 text-xs"
                          value={ticket.status}
                          onChange={(event) =>
                            updateTicket(ticket.id, { status: event.target.value })
                          }
                        >
                          {['Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <textarea
                          className="input-field min-w-56 resize-none text-xs"
                          rows={2}
                          defaultValue={ticket.internal_reply || ''}
                          onBlur={(event) =>
                            updateTicket(ticket.id, { internalReply: event.target.value })
                          }
                          placeholder="Internal note or reply"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Feedback Inbox</h2>
            <p className="text-xs text-muted-foreground">
              Product ideas and general feedback from customers.
            </p>
          </div>
          {!feedback.length ? (
            <div className="p-8">
              <EmptyState
                title="No feedback yet"
                description="Customer feedback submissions will appear here."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {feedback.slice(0, 10).map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.category}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.name} · {item.email}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(item.created_at))}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

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
