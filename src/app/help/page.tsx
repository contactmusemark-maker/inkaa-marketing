'use client';

import AppLayout from '@/components/AppLayout';
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  PaperClipIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import {
  SUPPORT_EMAIL,
  feedbackCategories,
  getWhatsAppSupportUrl,
  ticketPriorities,
} from '@/lib/support';
import { useEffect, useState } from 'react';

const faqs = [
  {
    q: 'How fast does Inkaa support respond?',
    a: 'Billing and login issues are prioritised first. Most platform questions receive a response within one business day.',
  },
  {
    q: 'Can I report AI output issues?',
    a: 'Yes. Choose AI Issue and include the prompt, tool name, and expected output so the team can reproduce it.',
  },
  {
    q: 'Where do I ask billing questions?',
    a: 'Use Billing Issue for subscription, invoice, Razorpay, or plan upgrade questions.',
  },
  {
    q: 'Can I suggest product improvements?',
    a: 'Yes. Feature requests are reviewed for Indian agency workflows, impact, and feasibility.',
  },
];

type Mode = 'feedback' | 'bug';

export default function HelpPage() {
  const [mode, setMode] = useState<Mode>('feedback');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageUrl, setPageUrl] = useState('');
  const [browserInfo, setBrowserInfo] = useState('');
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);
    setBrowserInfo(navigator.userAgent);
    setDeviceInfo(`${window.innerWidth}x${window.innerHeight} · ${navigator.platform}`);
  }, []);

  async function submit(formData: FormData) {
    setLoading(true);
    setError('');
    setSuccess('');
    formData.set('pageUrl', pageUrl);
    formData.set('browserInfo', browserInfo);
    formData.set('deviceInfo', deviceInfo);

    try {
      const response = await fetch(
        mode === 'bug' ? '/api/support/tickets' : '/api/support/feedback',
        {
          method: 'POST',
          body: formData,
        }
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Unable to submit request.');

      setSuccess(
        mode === 'bug' ? 'Bug report created successfully.' : 'Feedback sent successfully.'
      );
      const form = document.getElementById('support-form') as HTMLFormElement | null;
      form?.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to submit request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <QuestionMarkCircleIcon className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
            <p className="text-sm text-muted-foreground">
              Share feedback, report bugs, or contact the Inkaa team.
            </p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircleIcon className="h-5 w-5" />
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex rounded-xl border border-border bg-muted p-1">
              {(['feedback', 'bug'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                    mode === item ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  {item === 'bug' ? 'Bug Report' : 'Send Feedback'}
                </button>
              ))}
            </div>

            <form id="support-form" action={submit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  Name
                  <input name="name" className="input-field" required />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Email
                  <input name="email" type="email" className="input-field" required />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  Category
                  <select
                    name="category"
                    className="input-field"
                    defaultValue={mode === 'bug' ? 'Bug Report' : 'General Feedback'}
                  >
                    {feedbackCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                {mode === 'bug' && (
                  <label className="space-y-1 text-sm font-medium">
                    Priority
                    <select name="priority" className="input-field" defaultValue="Medium">
                      {ticketPriorities.map((priority) => (
                        <option key={priority}>{priority}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              {mode === 'bug' && (
                <label className="space-y-1 text-sm font-medium">
                  Subject
                  <input
                    name="subject"
                    className="input-field"
                    placeholder="Example: Invoice page crashes after saving"
                    required
                  />
                </label>
              )}
              <label className="space-y-1 text-sm font-medium">
                Message
                <textarea
                  name="message"
                  rows={6}
                  className="input-field resize-none"
                  placeholder={
                    mode === 'bug'
                      ? 'Describe what happened, what you expected, and steps to reproduce.'
                      : 'Tell us what would make Inkaa better for your agency workflow.'
                  }
                  required
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <PaperClipIcon className="h-5 w-5" />
                  Optional screenshot
                </span>
                <input
                  name="screenshot"
                  type="file"
                  accept="image/*"
                  className="max-w-48 text-xs"
                />
              </label>
              {mode === 'bug' && (
                <div className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                  Captured automatically: {pageUrl || 'current page'}, browser, device, and
                  viewport.
                </div>
              )}
              <button className="btn-primary w-full py-3" disabled={loading}>
                {loading ? 'Submitting...' : mode === 'bug' ? 'Submit Bug Report' : 'Send Feedback'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold text-foreground">Contact options</h2>
              <div className="mt-4 space-y-4 text-sm">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex gap-3 rounded-xl bg-muted p-4 hover:bg-red-50"
                >
                  <EnvelopeIcon className="h-5 w-5 text-primary" />
                  <span>
                    <span className="block font-semibold">Email support</span>
                    <span className="text-muted-foreground">{SUPPORT_EMAIL}</span>
                  </span>
                </a>
                <a
                  href={getWhatsAppSupportUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 rounded-xl bg-muted p-4 hover:bg-red-50"
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary" />
                  <span>
                    <span className="block font-semibold">WhatsApp support</span>
                    <span className="text-muted-foreground">
                      Best for quick onboarding questions.
                    </span>
                  </span>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-base font-semibold text-foreground">FAQ</h2>
              <div className="mt-4 space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.q}>
                    <p className="text-sm font-semibold text-foreground">{faq.q}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
