'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import UnavailableAction from '@/components/ui/UnavailableAction';
import ClientTable from './ClientTable';
import AddClientModal from './AddClientModal';
import ClientStatsBar from './ClientStatsBar';

export interface Client {
  id: string;
  name: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  manager: string;
  mrr: number;
  projects: number;
  status: 'Active' | 'Inactive' | 'Trial' | 'Churned';
  plan: 'Starter' | 'Pro' | 'Agency';
  lastContact: string;
  joinedDate: string;
  tags: string[];
  city: string;
}

const industries = [
  'All Industries',
  'E-commerce',
  'SaaS',
  'Healthcare',
  'Fintech',
  'Media',
  'FMCG',
  'IT Services',
  'Retail',
  'Fashion',
  'Automotive',
  'EdTech',
];
const statuses = ['All Statuses', 'Active', 'Inactive', 'Trial', 'Churned'];
const managers = ['All Managers', 'Unassigned'];

export default function ClientManagementScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All Industries');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [managerFilter, setManagerFilter] = useState('All Managers');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortKey, setSortKey] = useState<keyof Client>('company');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  useEffect(() => {
    let ignore = false;

    async function loadClients() {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch('/api/clients');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load clients');
        }

        if (!ignore) setClients(data.clients);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Unable to load clients');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadClients();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let data = clients;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      );
    }
    if (industryFilter !== 'All Industries')
      data = data.filter((c) => c.industry === industryFilter);
    if (statusFilter !== 'All Statuses') data = data.filter((c) => c.status === statusFilter);
    if (managerFilter !== 'All Managers') data = data.filter((c) => c.manager === managerFilter);

    data = [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number')
        return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return data;
  }, [clients, search, industryFilter, statusFilter, managerFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: keyof Client) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? paginated.map((c) => c.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleDeleteSelected = async () => {
    await Promise.all(
      selectedIds.map((id) =>
        fetch(`/api/clients?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      )
    );
    setClients((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
  };

  const handleStatusChange = async (id: string, status: Client['status']) => {
    const previous = clients;
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

    try {
      const response = await fetch('/api/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to update status');
      }
    } catch (err) {
      setClients(previous);
      setError(err instanceof Error ? err.message : 'Unable to update status');
    }
  };

  const handleAddClient = (client: Client) => {
    setClients((prev) => [client, ...prev]);
    setShowAddModal(false);
  };

  const handleDeleteClient = async (id: string) => {
    const previous = clients;
    setClients((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));

    try {
      const response = await fetch(`/api/clients?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Unable to delete client');
      }
    } catch (err) {
      setClients(previous);
      setError(err instanceof Error ? err.message : 'Unable to delete client');
    }
  };

  return (
    <>
      <ClientStatsBar clients={clients} />

      <div className="card overflow-hidden mt-5">
        {error && (
          <div className="flex items-start gap-2.5 px-5 py-3 bg-red-50 border-b border-red-100">
            <Icon
              name="ExclamationCircleIcon"
              size={16}
              className="text-red-500 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-border">
          <div className="relative flex-1 max-w-sm">
            <Icon
              name="MagnifyingGlassIcon"
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search clients, companies, cities..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field text-sm py-2 w-auto min-w-[130px]"
            >
              {industries.map((i) => (
                <option key={`ind-${i.toLowerCase().replace(/\s+/g, '-')}`} value={i}>
                  {i}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field text-sm py-2 w-auto min-w-[120px]"
            >
              {statuses.map((s) => (
                <option key={`stat-${s.toLowerCase().replace(/\s+/g, '-')}`} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={managerFilter}
              onChange={(e) => {
                setManagerFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="input-field text-sm py-2 w-auto min-w-[130px]"
            >
              {managers.map((m) => (
                <option key={`mgr-${m.toLowerCase().replace(/\s+/g, '-')}`} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary text-sm py-2 whitespace-nowrap ml-auto sm:ml-0"
            >
              <Icon name="PlusIcon" size={15} />
              Add Client
            </button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-5 py-3 bg-accent border-b border-primary/10 animate-slide-up">
            <span className="text-sm font-semibold text-primary">
              {selectedIds.length} client{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <UnavailableAction className="text-xs py-1.5 gap-1.5">
                Email Selected
              </UnavailableAction>
              <UnavailableAction className="text-xs py-1.5 gap-1.5">Assign Tag</UnavailableAction>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Icon name="TrashIcon" size={13} />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <Icon name="ArrowPathIcon" size={24} className="text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Loading live client data...</p>
          </div>
        ) : (
          <ClientTable
            clients={paginated}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onSort={handleSort}
            sortKey={sortKey}
            sortDir={sortDir}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteClient}
            allSelected={paginated.length > 0 && paginated.every((c) => selectedIds.includes(c.id))}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * perPage + 1, filtered.length)}–
              {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} clients
            </span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="input-field text-sm py-1.5 w-auto"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={`perpage-${n}`} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <Icon name="ChevronDoubleLeftIcon" size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <Icon name="ChevronLeftIcon" size={14} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <Icon name="ChevronRightIcon" size={14} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <Icon name="ChevronDoubleRightIcon" size={14} />
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} onAdd={handleAddClient} />
      )}
    </>
  );
}
