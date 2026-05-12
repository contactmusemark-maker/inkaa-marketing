'use client';

import AppLayout from '@/components/AppLayout';
import UnavailableAction from '@/components/ui/UnavailableAction';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const tabs = [
  'General',
  'Branding',
  'SMTP',
  'Razorpay',
  'AI Settings',
  'Theme',
  'Pricing Rules',
  'User Management',
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('General');
  const [aiSettings, setAiSettings] = useState<{
    enabled: boolean;
    defaultProvider: string;
    activeProvider: string | null;
    activeModel: string | null;
    fallbackProvider: string | null;
    fallbackModel: string | null;
    priority: string[];
    hourlyLimit: number;
    providers: {
      name: string;
      priority: number;
      active: boolean;
      fallback: boolean;
      configured: boolean;
      defaultModel: string;
    }[];
  } | null>(null);

  useEffect(() => {
    if (activeTab !== 'AI Settings') return;

    let ignore = false;
    async function loadAISettings() {
      const response = await fetch('/api/ai/settings');
      if (!response.ok) return;
      const data = await response.json();
      if (!ignore) setAiSettings(data);
    }

    loadAISettings();
    return () => {
      ignore = true;
    };
  }, [activeTab]);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Cog6ToothIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Configure your application</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs?.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:bg-muted/30'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
          {activeTab === 'General' && (
            <>
              <h2 className="text-base font-semibold text-foreground">General Settings</h2>
              {[
                { label: 'Company Name', value: 'Inkaa Digital Marketing' },
                { label: 'GST Number', value: '27AABCI1234A1Z5' },
                { label: 'Website', value: 'https://inkaa.in' },
                { label: 'Address', value: 'Mumbai, Maharashtra, India' },
              ]?.map((f) => (
                <div key={f?.label}>
                  <label className="text-xs text-muted-foreground font-medium">{f?.label}</label>
                  <input
                    defaultValue={f?.value}
                    className="mt-1 w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </>
          )}
          {activeTab === 'Branding' && (
            <>
              <h2 className="text-base font-semibold text-foreground">Branding Settings</h2>
              <p className="text-sm text-muted-foreground">
                Upload your logo, favicon, and configure brand colors.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border border-border flex items-center justify-center bg-muted/30">
                  <span className="text-xs text-muted-foreground">Logo</span>
                </div>
                <UnavailableAction>Upload Logo</UnavailableAction>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium">Primary Color</label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    defaultValue="#FF2B2B"
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    defaultValue="#FF2B2B"
                    className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-32"
                  />
                </div>
              </div>
            </>
          )}
          {activeTab === 'SMTP' && (
            <>
              <h2 className="text-base font-semibold text-foreground">SMTP Configuration</h2>
              {[
                { label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
                { label: 'Port', placeholder: '587' },
                { label: 'Email', placeholder: 'hello@inkaa.in' },
                { label: 'Password', placeholder: '••••••••' },
              ]?.map((f) => (
                <div key={f?.label}>
                  <label className="text-xs text-muted-foreground font-medium">{f?.label}</label>
                  <input
                    type={f?.label === 'Password' ? 'password' : 'text'}
                    placeholder={f?.placeholder}
                    className="mt-1 w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
              <UnavailableAction className="border-0 bg-primary text-white opacity-60">
                Send Test Email
              </UnavailableAction>
            </>
          )}
          {activeTab === 'Razorpay' && (
            <>
              <h2 className="text-base font-semibold text-foreground">Razorpay Integration</h2>
              {[
                { label: 'Key ID', placeholder: 'rzp_live_...' },
                { label: 'Key Secret', placeholder: '••••••••••••••••' },
                { label: 'Webhook Secret', placeholder: 'whsec_...' },
              ]?.map((f) => (
                <div key={f?.label}>
                  <label className="text-xs text-muted-foreground font-medium">{f?.label}</label>
                  <input
                    type={f?.label?.includes('Secret') ? 'password' : 'text'}
                    placeholder={f?.placeholder}
                    className="mt-1 w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
            </>
          )}
          {activeTab === 'AI Settings' && (
            <>
              <h2 className="text-base font-semibold text-foreground">AI Configuration</h2>
              <p className="text-sm text-muted-foreground">
                API keys are read server-side from environment variables and are never exposed to
                the browser. Configure <code>GEMINI_API_KEY</code>, <code>OPENROUTER_API_KEY</code>,
                or <code>GROQ_API_KEY</code> in your deployment environment.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">AI Tools</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {aiSettings?.enabled === false ? 'Disabled' : 'Enabled'}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Active Provider</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {aiSettings?.activeProvider || 'Not configured'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {aiSettings?.activeModel || 'Add an API key to enable AI'}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Fallback Provider</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {aiSettings?.fallbackProvider || 'Not configured'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {aiSettings?.fallbackModel || 'Configure another provider'}
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Usage Limit</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {aiSettings?.hourlyLimit ?? 25} requests/hour/tool
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4 md:col-span-2">
                  <p className="text-xs text-muted-foreground">Provider Priority</p>
                  <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                    {(aiSettings?.priority || ['gemini', 'openrouter', 'groq']).join(' -> ')}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {(aiSettings?.providers || []).map((provider) => (
                  <div
                    key={provider.name}
                    className="flex items-center justify-between rounded-xl border border-border p-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium capitalize text-foreground">
                          {provider.priority}. {provider.name}
                        </p>
                        {provider.active && <span className="badge badge-green">Active</span>}
                        {provider.fallback && <span className="badge badge-slate">Fallback</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{provider.defaultModel}</p>
                    </div>
                    <span
                      className={`badge ${provider.configured ? 'badge-green' : 'badge-slate'}`}
                    >
                      {provider.configured ? 'Configured' : 'Missing key'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === 'Theme' && (
            <>
              <h2 className="text-base font-semibold text-foreground">Theme</h2>
              <p className="text-sm text-muted-foreground">
                Theme settings require a persisted workspace preferences table.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {['Light', 'Dark'].map((theme) => (
                  <div key={theme} className="p-4 border border-border rounded-xl">
                    <p className="text-sm font-medium text-foreground">{theme}</p>
                    <p className="text-xs text-muted-foreground mt-1">Not configured</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeTab === 'Pricing Rules' && (
            <>
              <h2 className="text-base font-semibold text-foreground">Pricing Rules</h2>
              <p className="text-sm text-muted-foreground">
                Service pricing rules should be stored in Supabase before this section is enabled.
              </p>
            </>
          )}
          {activeTab === 'User Management' && (
            <>
              <h2 className="text-base font-semibold text-foreground">Team & Role Management</h2>
              <p className="text-sm text-muted-foreground">
                Manage team member roles and permissions from the Team section.
              </p>
              <div className="space-y-2">
                {['Owner', 'Admin', 'Manager', 'Team Member', 'Client']?.map((role) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 border border-border rounded-xl"
                  >
                    <span className="text-sm font-medium text-foreground">{role}</span>
                    <UnavailableAction className="px-2 py-1 text-xs">
                      Edit Permissions
                    </UnavailableAction>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="pt-2">
            <UnavailableAction className="border-0 bg-primary text-white opacity-60">
              Save Changes
            </UnavailableAction>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
