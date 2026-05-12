'use client';

import AppLayout from '@/components/AppLayout';
import UnavailableAction from '@/components/ui/UnavailableAction';
import {
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

const helpCategories = [
  {
    title: 'Getting Started',
    icon: 'DocumentTextIcon',
    items: [
      'How to set up your first project',
      'Adding clients to your CRM',
      'Creating invoices and quotations',
      'Setting up team members',
    ],
  },
  {
    title: 'Account & Billing',
    icon: 'CreditCardIcon',
    items: [
      'How to manage your subscription',
      'Billing information and invoices',
      'Payment methods',
      'Canceling your subscription',
    ],
  },
  {
    title: 'Features & Functionality',
    icon: 'ChatBubbleLeftIcon',
    items: [
      'Understanding the CRM pipeline',
      'Using AI tools for content',
      'Campaign management',
      'Analytics and reporting',
    ],
  },
];

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
            <p className="text-sm text-muted-foreground">Get answers to your questions</p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 px-4 py-3 bg-card rounded-xl border border-border focus-within:border-primary focus-within:bg-white transition-all duration-150">
            <svg
              className="w-5 h-5 text-muted-foreground flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search help articles..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helpCategories.map((category) => (
            <div
              key={category.title}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-colors"
            >
              <h3 className="text-base font-semibold text-foreground mb-4">{category.title}</h3>
              <ul className="space-y-3">
                {category.items.map((item) => (
                  <li key={item}>
                    <UnavailableAction className="px-0 py-0 text-left text-sm">
                      {item}
                    </UnavailableAction>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-primary/10 to-purple-50 border border-primary/20 rounded-2xl p-8">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Email Support</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Can&apos;t find what you&apos;re looking for? Contact our support team at{' '}
                  <a
                    href="mailto:support@inkaa.in"
                    className="text-primary hover:underline font-medium"
                  >
                    support@inkaa.in
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-4 border-t border-primary/20">
              <ChatBubbleLeftIcon className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground">Live Chat</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Monday–Friday, 9 AM–6 PM IST. Click the chat icon at the bottom right to get
                  started.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
