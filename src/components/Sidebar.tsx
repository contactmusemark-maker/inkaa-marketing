'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import RoleBadge from '@/components/ui/RoleBadge';
import { getAllowedRolesForPath, normalizeRole, type AppRole } from '@/lib/rbacCore';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  badge?: number;
  group: 'main' | 'management' | 'settings';
  roles?: AppRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'HomeIcon', href: '/dashboard', group: 'main' },
  { label: 'Clients', icon: 'UserGroupIcon', href: '/client-management', group: 'main' },
  { label: 'CRM', icon: 'FunnelIcon', href: '/crm', group: 'main' },
  { label: 'Projects', icon: 'FolderIcon', href: '/projects', group: 'main' },
  { label: 'Pricing Estimator', icon: 'CalculatorIcon', href: '/pricing-estimator', group: 'main' },
  { label: 'Quotations', icon: 'DocumentTextIcon', href: '/quotations', group: 'main' },
  { label: 'Invoices', icon: 'ReceiptRefundIcon', href: '/invoices', group: 'main' },
  { label: 'Payments', icon: 'CreditCardIcon', href: '/payments', group: 'main' },
  { label: 'Campaigns', icon: 'MegaphoneIcon', href: '/campaigns', group: 'main' },
  { label: 'Analytics', icon: 'ChartBarIcon', href: '/analytics', group: 'main' },
  { label: 'AI Tools', icon: 'SparklesIcon', href: '/ai-tools', group: 'main' },
  { label: 'Reports', icon: 'DocumentChartBarIcon', href: '/reports', group: 'main' },
  { label: 'Team', icon: 'UsersIcon', href: '/team', group: 'management' },
  { label: 'Tasks', icon: 'ClipboardDocumentListIcon', href: '/tasks', group: 'management' },
  { label: 'Calendar', icon: 'CalendarIcon', href: '/calendar', group: 'management' },
  { label: 'Documents', icon: 'PaperClipIcon', href: '/documents', group: 'management' },
  {
    label: 'Super Admin',
    icon: 'ShieldCheckIcon',
    href: '/super-admin',
    group: 'settings',
    roles: ['super_admin'],
  },
  { label: 'Settings', icon: 'Cog6ToothIcon', href: '/settings', group: 'settings' },
  { label: 'Billing & Plans', icon: 'BuildingStorefrontIcon', href: '/billing', group: 'settings' },
  { label: 'Integrations', icon: 'PuzzlePieceIcon', href: '/integrations', group: 'settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = React.useState<AppRole>('member');
  const [userName, setUserName] = React.useState('User');

  React.useEffect(() => {
    let ignore = false;

    async function loadAccount() {
      const response = await fetch('/api/auth/me');
      if (!response.ok) return;
      const data = await response.json();
      if (ignore) return;
      setRole(normalizeRole(data.user?.role));
      setUserName(data.user?.name || data.user?.email || 'User');
    }

    loadAccount();
    return () => {
      ignore = true;
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  const renderGroup = (group: 'main' | 'management' | 'settings', label: string) => {
    const items = navItems.filter((i) => {
      if (i.group !== group) return false;
      const allowedRoles = i.roles ?? getAllowedRolesForPath(i.href);
      return !allowedRoles || allowedRoles.includes(role);
    });
    if (!items.length) return null;
    return (
      <div className="mb-2">
        {!collapsed && (
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
        )}
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer mb-0.5 ${
                active
                  ? 'bg-accent text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon
                name={item.icon as Parameters<typeof Icon>[0]['name']}
                size={18}
                className={
                  active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                }
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1.5">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {collapsed && item.badge !== undefined && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
              )}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 shadow-dropdown">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <aside
      className={`flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out flex-shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      style={{ minHeight: '100vh' }}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-border flex-shrink-0 ${collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4 gap-2'}`}
      >
        <AppLogo src="/assets/images/app_logo_clean.png" size={32} />
        {!collapsed && (
          <div>
            <span className="font-extrabold text-base text-foreground tracking-tight">Inkaa.</span>
            <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Digital Marketing
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        {renderGroup('main', 'Main')}
        {renderGroup('management', 'Management')}
        {renderGroup('settings', 'Settings')}
      </nav>

      {/* User footer */}
      <div
        className={`border-t border-border px-2 py-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
          U
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
            <RoleBadge role={role} />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Collapse sidebar"
          >
            <Icon name="ChevronLeftIcon" size={14} className="text-muted-foreground" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Expand sidebar"
          >
            <Icon name="ChevronRightIcon" size={14} className="text-muted-foreground" />
          </button>
        )}
      </div>
    </aside>
  );
}
