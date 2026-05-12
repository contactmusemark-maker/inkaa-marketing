'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import ProfileDropdown from '@/components/ProfileDropdown';
import EmptyState from '@/components/ui/EmptyState';

interface TopbarProps {
  title?: string;
  subtitle?: string;
  onOpenSidebar?: () => void;
}

type Notification = {
  id: string;
  text: string;
  time: string;
  read: boolean;
  type: 'payment' | 'lead' | 'deadline' | 'quotation';
};

const notifications: Notification[] = [];

const createActions = [
  { label: 'Client', href: '/client-management', icon: 'UserPlusIcon' },
  { label: 'Project', href: '/projects', icon: 'FolderPlusIcon' },
  { label: 'Task', href: '/tasks', icon: 'ClipboardDocumentCheckIcon' },
  { label: 'Invoice', href: '/invoices', icon: 'ReceiptRefundIcon' },
  { label: 'Quotation', href: '/quotations', icon: 'DocumentTextIcon' },
];

export default function Topbar({ onOpenSidebar }: TopbarProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const closeMenus = () => {
    setShowCreateMenu(false);
    setShowNotifications(false);
  };

  return (
    <header className="h-16 flex items-center gap-4 bg-card border-b border-border px-6 flex-shrink-0 relative z-30">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
        aria-label="Open navigation"
      >
        <Icon name="Bars3Icon" size={20} className="text-muted-foreground" />
      </button>
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-xl border border-transparent hover:border-border focus-within:border-primary focus-within:bg-white transition-all duration-150">
          <Icon
            name="MagnifyingGlassIcon"
            size={16}
            className="text-muted-foreground flex-shrink-0"
          />
          <input
            type="text"
            placeholder="Search clients, projects, invoices..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-border rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        {/* Create New */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowCreateMenu((isOpen) => !isOpen);
              setShowNotifications(false);
            }}
            className="btn-primary gap-1.5 text-xs px-3 py-2"
            aria-label="Create new"
            aria-expanded={showCreateMenu}
            aria-haspopup="menu"
          >
            <Icon name="PlusIcon" size={14} />
            <span className="hidden sm:inline">Create New</span>
          </button>

          {showCreateMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-2xl border border-border shadow-dropdown animate-slide-up z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Create new</p>
              </div>
              <div className="py-1">
                {createActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    onClick={closeMenus}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/70 transition-colors"
                    role="menuitem"
                  >
                    <Icon name={action.icon} size={16} className="text-muted-foreground" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((isOpen) => !isOpen);
              setShowCreateMenu(false);
            }}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-haspopup="dialog"
          >
            <Icon name="BellIcon" size={18} className="text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl border border-border shadow-dropdown animate-slide-up z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <span className="badge bg-primary/10 text-primary text-[10px]">
                  {unreadCount} new
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <EmptyState
                    icon="BellIcon"
                    title="No notifications"
                    description="Live alerts will appear here when customer activity starts."
                    className="py-10"
                  />
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${!n.read ? 'bg-accent/30' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          n.type === 'payment'
                            ? 'bg-green-100'
                            : n.type === 'lead'
                              ? 'bg-blue-100'
                              : n.type === 'deadline'
                                ? 'bg-amber-100'
                                : 'bg-purple-100'
                        }`}
                      >
                        <Icon
                          name={
                            n.type === 'payment'
                              ? 'CreditCardIcon'
                              : n.type === 'lead'
                                ? 'UserPlusIcon'
                                : n.type === 'deadline'
                                  ? 'ClockIcon'
                                  : 'DocumentTextIcon'
                          }
                          size={14}
                          className={
                            n.type === 'payment'
                              ? 'text-green-600'
                              : n.type === 'lead'
                                ? 'text-blue-600'
                                : n.type === 'deadline'
                                  ? 'text-amber-600'
                                  : 'text-purple-600'
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-snug">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-3 border-t border-border">
                <Link
                  href="/tasks"
                  onClick={closeMenus}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Calendar */}
        <Link
          href="/calendar"
          onClick={closeMenus}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          aria-label="Calendar"
        >
          <Icon name="CalendarIcon" size={18} className="text-muted-foreground" />
        </Link>

        {/* User Profile Dropdown */}
        <ProfileDropdown />
      </div>

      {/* Backdrop for open header menus */}
      {(showNotifications || showCreateMenu) && (
        <div className="fixed inset-0 z-40" onClick={closeMenus} />
      )}
    </header>
  );
}
