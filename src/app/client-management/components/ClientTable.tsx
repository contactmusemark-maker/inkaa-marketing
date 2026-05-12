'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import type { Client } from './ClientManagementScreen';

const statusBadge: Record<Client['status'], string> = {
  Active: 'badge-green',
  Inactive: 'badge-slate',
  Trial: 'badge-amber',
  Churned: 'badge-red',
};

const planBadge: Record<Client['plan'], string> = {
  Starter: 'badge-slate',
  Pro: 'badge-blue',
  Agency: 'badge-purple',
};

const statuses: Client['status'][] = ['Active', 'Inactive', 'Trial', 'Churned'];

interface ClientTableProps {
  clients: Client[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onSort: (key: keyof Client) => void;
  sortKey: keyof Client;
  sortDir: 'asc' | 'desc';
  onStatusChange: (id: string, status: Client['status']) => void;
  onDelete: (id: string) => void;
  allSelected: boolean;
}

const columns: { key: keyof Client; label: string; sortable?: boolean }[] = [
  { key: 'company', label: 'Client / Company', sortable: true },
  { key: 'industry', label: 'Industry', sortable: true },
  { key: 'manager', label: 'Manager', sortable: true },
  { key: 'mrr', label: 'MRR', sortable: true },
  { key: 'projects', label: 'Projects', sortable: true },
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastContact', label: 'Last Contact', sortable: true },
  { key: 'city', label: 'City' },
];

export default function ClientTable({
  clients,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onSort,
  sortKey,
  sortDir,
  onStatusChange,
  onDelete,
  allSelected,
}: ClientTableProps) {
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Icon name="UserGroupIcon" size={24} className="text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground">No clients found</h3>
        <p className="text-sm text-muted-foreground text-center mt-1 max-w-xs">
          No clients match your current filters. Try adjusting your search or add a new client.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin relative">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-muted/40 border-b border-border">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                aria-label="Select all clients"
              />
            </th>
            {columns.map((col) => (
              <th
                key={`th-${col.key}`}
                className={`px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-foreground transition-colors select-none' : ''}`}
                onClick={() => col.sortable && onSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span
                      className={`transition-colors ${sortKey === col.key ? 'text-primary' : 'text-border'}`}
                    >
                      <Icon
                        name={
                          sortKey === col.key && sortDir === 'desc'
                            ? 'ChevronDownIcon'
                            : 'ChevronUpIcon'
                        }
                        size={12}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr
              key={client.id}
              className={`border-b border-border/50 hover:bg-muted/30 transition-colors group ${
                selectedIds.includes(client.id) ? 'bg-accent/20' : ''
              }`}
            >
              <td className="px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(client.id)}
                  onChange={(e) => onSelectOne(client.id, e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  aria-label={`Select ${client.company}`}
                />
              </td>

              {/* Client / Company */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">
                      {client.company.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">
                      {client.company}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{client.name}</p>
                  </div>
                </div>
              </td>

              {/* Industry */}
              <td className="px-4 py-3.5">
                <span className="text-sm text-foreground">{client.industry}</span>
              </td>

              {/* Manager */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[8px] text-white font-bold flex-shrink-0">
                    {client.manager
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <span className="text-sm text-foreground whitespace-nowrap">
                    {client.manager}
                  </span>
                </div>
              </td>

              {/* MRR */}
              <td className="px-4 py-3.5">
                <span
                  className={`text-sm font-semibold font-tabular ${client.mrr === 0 ? 'text-muted-foreground' : 'text-foreground'}`}
                >
                  {client.mrr === 0 ? '—' : `₹${client.mrr.toLocaleString('en-IN')}`}
                </span>
              </td>

              {/* Projects */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Icon name="FolderIcon" size={13} className="text-muted-foreground" />
                  <span className="text-sm text-foreground font-tabular">{client.projects}</span>
                </div>
              </td>

              {/* Plan */}
              <td className="px-4 py-3.5">
                <span className={`badge ${planBadge[client.plan]}`}>{client.plan}</span>
              </td>

              {/* Status — inline dropdown */}
              <td className="px-4 py-3.5 relative">
                <button
                  onClick={() => setStatusDropdown(statusDropdown === client.id ? null : client.id)}
                  className={`badge ${statusBadge[client.status]} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
                >
                  {client.status}
                  <Icon name="ChevronDownIcon" size={10} />
                </button>
                {statusDropdown === client.id && (
                  <div className="absolute left-4 top-full mt-1 w-36 bg-card rounded-xl border border-border shadow-dropdown animate-slide-up z-20">
                    {statuses.map((s) => (
                      <button
                        key={`status-opt-${client.id}-${s.toLowerCase()}`}
                        onClick={() => {
                          onStatusChange(client.id, s);
                          setStatusDropdown(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors first:rounded-t-xl last:rounded-b-xl flex items-center gap-2 ${
                          client.status === s
                            ? 'bg-accent text-primary font-medium'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            s === 'Active'
                              ? 'bg-green-500'
                              : s === 'Trial'
                                ? 'bg-amber-500'
                                : s === 'Churned'
                                  ? 'bg-red-500'
                                  : 'bg-slate-400'
                          }`}
                        />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </td>

              {/* Last Contact */}
              <td className="px-4 py-3.5">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {client.lastContact}
                </span>
              </td>

              {/* City */}
              <td className="px-4 py-3.5">
                <span className="text-sm text-foreground">{client.city}</span>
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5 relative">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    title="View client profile"
                    disabled
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    aria-label="View client"
                  >
                    <Icon name="EyeIcon" size={14} className="text-muted-foreground" />
                  </button>
                  <button
                    title="Edit client"
                    disabled
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    aria-label="Edit client"
                  >
                    <Icon name="PencilSquareIcon" size={14} className="text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => setRowMenu(rowMenu === client.id ? null : client.id)}
                    title="More actions"
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
                    aria-label="More actions"
                  >
                    <Icon name="EllipsisVerticalIcon" size={14} className="text-muted-foreground" />
                  </button>
                </div>

                {rowMenu === client.id && (
                  <div className="absolute right-4 top-full mt-1 w-44 bg-card rounded-xl border border-border shadow-dropdown animate-slide-up z-20">
                    {[
                      { label: 'View Profile', icon: 'EyeIcon' },
                      { label: 'Edit Details', icon: 'PencilSquareIcon' },
                      { label: 'Create Invoice', icon: 'DocumentTextIcon' },
                      { label: 'New Quotation', icon: 'ReceiptRefundIcon' },
                      { label: 'Send Email', icon: 'EnvelopeIcon' },
                      { label: 'Delete Client', icon: 'TrashIcon', danger: true },
                    ].map((action) => (
                      <button
                        key={`rowmenu-${client.id}-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                        disabled={action.label !== 'Delete Client'}
                        onClick={() => {
                          if (action.label === 'Delete Client') {
                            setDeleteConfirm(client.id);
                          }
                          setRowMenu(null);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors first:rounded-t-xl last:rounded-b-xl disabled:cursor-not-allowed disabled:opacity-50 ${
                          action.danger
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon
                          name={action.icon as Parameters<typeof Icon>[0]['name']}
                          size={13}
                          className={action.danger ? 'text-red-500' : 'text-muted-foreground'}
                        />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-card rounded-2xl border border-border shadow-modal p-6 w-full max-w-sm animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="TrashIcon" size={22} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-foreground text-center">Delete Client</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Are you sure you want to delete this client? This action cannot be undone and will
              remove all associated data.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 active:scale-95 transition-all duration-150"
              >
                <Icon name="TrashIcon" size={14} />
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for dropdowns */}
      {(statusDropdown || rowMenu) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setStatusDropdown(null);
            setRowMenu(null);
          }}
        />
      )}
    </div>
  );
}
