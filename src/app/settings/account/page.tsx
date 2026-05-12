'use client';

import AppLayout from '@/components/AppLayout';
import UnavailableAction from '@/components/ui/UnavailableAction';
import { UserIcon, LockClosedIcon, ShieldCheckIcon, BellIcon } from '@heroicons/react/24/outline';

export default function AccountSettingsPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account security and preferences
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email & Password */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <LockClosedIcon className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="text-base font-semibold text-foreground">Security</h2>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Email Address</label>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">rajan@inkaa.in</p>
                <UnavailableAction className="px-2 py-1 text-xs">Change</UnavailableAction>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">••••••••••</p>
                <UnavailableAction className="px-2 py-1 text-xs">Update</UnavailableAction>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Two-Factor Authentication
              </label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                <span className="text-sm text-foreground">Not enabled</span>
                <UnavailableAction className="px-2 py-1 text-xs">Enable</UnavailableAction>
              </div>
            </div>
          </div>

          {/* Privacy & Permissions */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <ShieldCheckIcon className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="text-base font-semibold text-foreground">Privacy & Permissions</h2>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Profile visibility', description: 'Control who can see your profile' },
                { label: 'Data sharing', description: 'Allow anonymous usage analytics' },
                { label: 'Marketing emails', description: 'Receive updates about new features' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <BellIcon className="w-5 h-5 text-primary flex-shrink-0" />
              <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Email notifications',
                  description: 'Get notified about important updates',
                },
                { label: 'Invoice alerts', description: 'Notify when invoice is paid' },
                { label: 'Team activity', description: 'Notify about team member actions' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border" />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-red-900">Danger Zone</h2>
            <UnavailableAction fullWidth className="border-red-300 bg-red-50 text-red-600">
              Delete Account
            </UnavailableAction>
            <p className="text-xs text-red-700">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
