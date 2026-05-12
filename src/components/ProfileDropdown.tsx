'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import RoleBadge from '@/components/ui/RoleBadge';

interface ProfileDropdownProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  isLoading?: boolean;
}

const menuItems = [
  { label: 'My Profile', icon: 'UserCircleIcon', href: '/profile' },
  { label: 'Account Settings', icon: 'Cog6ToothIcon', href: '/settings/account' },
  { label: 'Billing & Plans', icon: 'CreditCardIcon', href: '/billing' },
  { label: 'Help & Support', icon: 'QuestionMarkCircleIcon', href: '/help' },
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return 'U';
}

export default function ProfileDropdown({ user, isLoading = false }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [accountUser, setAccountUser] = useState<ProfileDropdownProps['user'] | null>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const displayUser = {
    name: 'User',
    email: '',
    role: 'Owner',
    ...(accountUser || {}),
    ...(user || {}),
  };

  const isSessionLoading = isAccountLoading || isLoading;

  useEffect(() => {
    let ignore = false;

    async function loadAccount() {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) return;
        const data = await response.json();
        if (!ignore) setAccountUser(data.user);
      } finally {
        if (!ignore) setIsAccountLoading(false);
      }
    }

    loadAccount();
    return () => {
      ignore = true;
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setIsOpen(true);
          setHoveredIndex(0);
        }
        return;
      }

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setHoveredIndex((prev) => (prev === null ? 0 : Math.min(prev + 1, menuItems.length - 1)));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setHoveredIndex((prev) => (prev === null ? menuItems.length - 1 : Math.max(prev - 1, 0)));
          break;
        case 'Enter':
          event.preventDefault();
          if (hoveredIndex !== null) {
            router.push(menuItems[hoveredIndex].href);
            setIsOpen(false);
          }
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hoveredIndex, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/sign-up-login';
    } catch {
      setIsSigningOut(false);
    }
  };

  const handleMenuItemClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="relative ml-1">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 group"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        disabled={isSessionLoading}
      >
        {isSessionLoading ? (
          <>
            <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
            <Icon
              name="ChevronDownIcon"
              size={14}
              className="text-muted-foreground group-hover:text-foreground transition-colors"
            />
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {getInitials(displayUser.name, displayUser.email)}
            </div>
            <Icon
              name="ChevronDownIcon"
              size={14}
              className={`text-muted-foreground group-hover:text-foreground transition-all duration-300 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-56 bg-card rounded-2xl border border-border shadow-lg backdrop-blur-sm bg-opacity-95 animate-slide-up z-50 overflow-hidden"
          role="menu"
          aria-label="Profile menu"
        >
          {/* User Info Section */}
          <div className="px-4 py-4 border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {getInitials(displayUser.name, displayUser.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {displayUser.name || displayUser.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{displayUser.email}</p>
              </div>
            </div>
            {displayUser.role && <RoleBadge role={displayUser.role} />}
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            {menuItems.map((item, index) => {
              const active = isActive(item.href);
              return (
                <button
                  key={`${item.label}-${item.href}`}
                  onClick={() => handleMenuItemClick(item.href)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-inset ${
                    hoveredIndex === index
                      ? 'bg-primary/10 text-primary'
                      : active
                        ? 'bg-primary/5 text-primary font-medium'
                        : 'text-foreground hover:bg-muted/50'
                  }`}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    name={item.icon as Parameters<typeof Icon>[0]['name']}
                    size={16}
                    className={`flex-shrink-0 transition-colors duration-150 ${
                      hoveredIndex === index || active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-border/50" />

          {/* Sign Out Button */}
          <div className="py-1.5 px-2">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all duration-150 text-left focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-inset ${
                isSigningOut
                  ? 'bg-red-50 text-red-600 opacity-50 cursor-not-allowed'
                  : 'text-red-600 hover:bg-red-50 active:bg-red-100'
              }`}
              role="menuitem"
              aria-label="Sign out"
            >
              <Icon
                name={isSigningOut ? 'SpinnerIcon' : 'ArrowRightOnRectangleIcon'}
                size={16}
                className={`flex-shrink-0 ${isSigningOut ? 'animate-spin' : ''}`}
              />
              <span className="flex-1 font-medium">
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border/50 bg-muted/30 text-center">
            <p className="text-[11px] text-muted-foreground">App Version 1.0.0</p>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
