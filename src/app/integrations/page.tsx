'use client';

import AppLayout from '@/components/AppLayout';
import UnavailableAction from '@/components/ui/UnavailableAction';
import {
  BarChart3,
  Bot,
  Cloud,
  CreditCard,
  Mail,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Plug,
  type LucideIcon,
} from 'lucide-react';

type Integration = {
  name: string;
  description: string;
  status: 'Connected' | 'Not Connected';
  Icon: LucideIcon;
  iconClassName: string;
  iconBackgroundClassName: string;
};

const integrations: Integration[] = [
  {
    name: 'Razorpay',
    description: 'Payment gateway for invoices and subscriptions',
    status: 'Connected',
    Icon: CreditCard,
    iconClassName: 'text-emerald-600',
    iconBackgroundClassName: 'bg-emerald-50',
  },
  {
    name: 'OpenAI',
    description: 'AI-powered tools and content generation',
    status: 'Not Connected',
    Icon: Bot,
    iconClassName: 'text-slate-700',
    iconBackgroundClassName: 'bg-slate-100',
  },
  {
    name: 'Google Analytics',
    description: 'Website and campaign analytics tracking',
    status: 'Not Connected',
    Icon: BarChart3,
    iconClassName: 'text-blue-600',
    iconBackgroundClassName: 'bg-blue-50',
  },
  {
    name: 'Cloudinary',
    description: 'Cloud storage for images and documents',
    status: 'Not Connected',
    Icon: Cloud,
    iconClassName: 'text-sky-600',
    iconBackgroundClassName: 'bg-sky-50',
  },
  {
    name: 'Resend',
    description: 'Transactional email delivery service',
    status: 'Not Connected',
    Icon: Mail,
    iconClassName: 'text-indigo-600',
    iconBackgroundClassName: 'bg-indigo-50',
  },
  {
    name: 'Slack',
    description: 'Team notifications and alerts',
    status: 'Not Connected',
    Icon: MessageCircle,
    iconClassName: 'text-violet-600',
    iconBackgroundClassName: 'bg-violet-50',
  },
  {
    name: 'Google Ads',
    description: 'Manage and track Google Ads campaigns',
    status: 'Not Connected',
    Icon: MousePointerClick,
    iconClassName: 'text-amber-600',
    iconBackgroundClassName: 'bg-amber-50',
  },
  {
    name: 'Meta Ads',
    description: 'Facebook and Instagram ad management',
    status: 'Not Connected',
    Icon: Megaphone,
    iconClassName: 'text-fuchsia-600',
    iconBackgroundClassName: 'bg-fuchsia-50',
  },
];

export default function IntegrationsPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Plug className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground">Connect your favourite tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations?.map((intg, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-start gap-4"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${intg.iconBackgroundClassName}`}
              >
                <intg.Icon className={`w-5 h-5 ${intg.iconClassName}`} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{intg?.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${intg?.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {intg?.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{intg?.description}</p>
                <UnavailableAction className="mt-3 px-2 py-1 text-xs">
                  {intg?.status === 'Connected' ? 'Disconnect' : 'Connect'}
                </UnavailableAction>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
