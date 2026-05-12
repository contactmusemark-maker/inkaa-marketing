'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import EmptyState from '@/components/ui/EmptyState';
import { UserCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

type ProfileUser = {
  id: string;
  email?: string;
  name?: string;
  agencyName?: string | null;
  role?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Unable to load profile');
        if (!ignore) setUser(data.user);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Unable to load profile');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const initials = useMemo(() => {
    const name = user?.name || user?.email || 'User';
    return name
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user]);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserCircleIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your personal information</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {isLoading && <p className="text-sm text-muted-foreground">Loading profile...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!isLoading && !error && !user && (
            <EmptyState
              icon="UserCircleIcon"
              title="No profile found"
              description="Your profile will appear here after authentication is complete."
            />
          )}
          {user && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mb-3">
                  {initials || 'U'}
                </div>
                <h2 className="text-lg font-bold text-foreground text-center">
                  {user.name || user.email}
                </h2>
                <p className="text-xs text-muted-foreground">{user.role || 'Owner'}</p>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-base font-semibold text-foreground">Account Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Full Name</label>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {user.name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      Email Address
                    </label>
                    <div className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground">
                      <EnvelopeIcon className="w-4 h-4 text-muted-foreground" />
                      {user.email || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Agency</label>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {user.agencyName || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Role</label>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {user.role || 'Owner'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
