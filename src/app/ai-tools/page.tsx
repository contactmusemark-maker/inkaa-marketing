'use client';

import AppLayout from '@/components/AppLayout';
import {
  Bot,
  Captions,
  Check,
  Copy,
  Download,
  Lightbulb,
  Mail,
  Megaphone,
  RefreshCw,
  Save,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type AITool = {
  id: 'proposal' | 'captions' | 'campaign' | 'pricing' | 'email';
  label: string;
  endpoint: string;
  description: string;
  Icon: LucideIcon;
  placeholder: string;
};

type AIResult = {
  text: string;
  provider: string;
  model: string;
  usage?: { totalTokens: number };
  planUsage?: AIUsage;
};

type AIUsage = {
  plan: 'Starter' | 'Pro' | 'Agency';
  status: string;
  billingCycle: 'monthly' | 'annual';
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string;
  upgradeRequired: boolean;
};

const tools: AITool[] = [
  {
    id: 'proposal',
    label: 'AI Proposal Generator',
    endpoint: '/api/ai/proposal',
    description: 'Client proposals, SEO plans, ads strategy, and website scopes',
    Icon: Bot,
    placeholder:
      'Example: Create a 3-month SEO and Meta Ads proposal for a real estate client in Pune with a ₹75,000/month budget.',
  },
  {
    id: 'captions',
    label: 'AI Caption Generator',
    endpoint: '/api/ai/captions',
    description: 'Instagram captions, ads copy, Google headlines, LinkedIn posts',
    Icon: Captions,
    placeholder:
      'Example: Write 5 Instagram captions for a premium skincare brand launching a summer offer.',
  },
  {
    id: 'campaign',
    label: 'AI Campaign Planner',
    endpoint: '/api/ai/campaign',
    description: 'Campaign roadmaps, content calendars, and launch plans',
    Icon: Megaphone,
    placeholder:
      'Example: Plan a 30-day lead generation campaign for a B2B SaaS product targeting Indian founders.',
  },
  {
    id: 'pricing',
    label: 'AI Pricing Suggestions',
    endpoint: '/api/ai/pricing',
    description: 'Package pricing, service estimates, and margin-safe recommendations',
    Icon: Lightbulb,
    placeholder:
      'Example: Suggest pricing for SEO, website maintenance, and Meta Ads management for a local clinic.',
  },
  {
    id: 'email',
    label: 'AI Email Writer',
    endpoint: '/api/ai/email',
    description: 'Outreach, follow-up, proposal, and client update emails',
    Icon: Mail,
    placeholder:
      'Example: Write a polite follow-up email after sending a website redesign proposal last week.',
  },
];

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState<AITool>(tools[0]);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AIResult | null>(null);
  const [visibleText, setVisibleText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadUsage() {
      const response = await fetch('/api/ai/usage');
      if (!response.ok) return;
      const data = await response.json();
      if (!ignore) setUsage(data.usage);
    }

    loadUsage();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!result?.text) {
      setVisibleText('');
      return;
    }

    setVisibleText('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 24;
      setVisibleText(result.text.slice(0, index));
      if (index >= result.text.length) window.clearInterval(timer);
    }, 16);

    return () => window.clearInterval(timer);
  }, [result]);

  const generate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);
    setCopied(false);

    try {
      const response = await fetch(activeTool.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.usage) {
          setUsage(data.usage);
          setUpgradeRequired(Boolean(data.upgradeRequired));
        }
        throw new Error(data.error || 'Unable to generate content.');
      }
      setResult(data);
      setUpgradeRequired(false);
      if (data.planUsage) setUsage(data.planUsage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate content.');
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!result?.text) return;
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const saveOutput = () => {
    if (!result?.text) return;
    const savedItems = JSON.parse(window.localStorage.getItem('inkaa_ai_outputs') || '[]');
    window.localStorage.setItem(
      'inkaa_ai_outputs',
      JSON.stringify([
        {
          tool: activeTool.id,
          prompt,
          response: result.text,
          provider: result.provider,
          model: result.model,
          createdAt: new Date().toISOString(),
        },
        ...savedItems,
      ])
    );
    setSaved(true);
  };

  const exportOutput = () => {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTool.id}-ai-output.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const usagePercent =
    usage?.limit === null ? 0 : usage?.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const nextReset = usage?.resetAt
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(usage.resetAt))
    : null;

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Tools</h1>
              <p className="text-sm text-muted-foreground">
                Generate agency-ready marketing assets with Gemini, OpenRouter, or Groq.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
            Server-side keys only · Plan limits enforced · Usage logged
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Monthly AI Usage</p>
              <p className="text-xs text-muted-foreground">
                {usage
                  ? usage.limit === null
                    ? `${usage.used} generations used this month · ${usage.plan} plan fair usage`
                    : `${usage.used}/${usage.limit} AI generations used this month · ${usage.plan} plan`
                  : 'Loading AI usage...'}
              </p>
              {nextReset && (
                <p className="mt-1 text-xs text-muted-foreground">Next reset: {nextReset}</p>
              )}
            </div>
            {usage?.limit !== null && (
              <Link href="/billing" className="btn-secondary text-xs">
                Upgrade Plan
              </Link>
            )}
          </div>
          {usage?.limit !== null && (
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>

        {upgradeRequired && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-red-700">AI limit reached</p>
                <p className="mt-1 text-sm text-red-600">
                  Upgrade your plan to continue generating marketing content.
                </p>
              </div>
              <Link href="/billing" className="btn-primary">
                Upgrade Plan
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                setActiveTool(tool);
                setPrompt('');
                setResult(null);
                setError('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                activeTool.id === tool.id
                  ? 'border-primary bg-red-50'
                  : 'border-border bg-card hover:bg-muted/30'
              }`}
            >
              <tool.Icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground mt-3">{tool.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">{activeTool.label}</h2>
              <p className="text-xs text-muted-foreground mt-1">{activeTool.description}</p>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTool.placeholder}
              rows={10}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
                {upgradeRequired && (
                  <Link href="/billing" className="ml-2 font-semibold underline">
                    Upgrade plan
                  </Link>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={generate}
                disabled={loading || prompt.trim().length < 10}
                className="btn-primary rounded-xl"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                )}
                {loading ? 'Generating...' : 'Generate'}
              </button>
              <button
                type="button"
                onClick={generate}
                disabled={loading || !result}
                className="btn-secondary"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Regenerate
              </button>
            </div>
          </div>

          <div className="xl:col-span-3 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Output</h2>
                <p className="text-xs text-muted-foreground">
                  {result
                    ? `${result.provider} · ${result.model} · ${result.usage?.totalTokens ?? 0} tokens`
                    : 'Your generated content will stream here.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyOutput}
                  disabled={!result}
                  className="btn-secondary text-xs"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={saveOutput}
                  disabled={!result}
                  className="btn-secondary text-xs"
                >
                  {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? 'Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={exportOutput}
                  disabled={!result}
                  className="btn-secondary text-xs"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
            <div className="min-h-[420px] p-6">
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="h-4 rounded-full bg-muted animate-pulse" />
                  ))}
                </div>
              )}
              {!loading && !result && (
                <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                  <Sparkles className="mb-3 h-9 w-9 text-primary" aria-hidden="true" />
                  <p className="font-semibold text-foreground">Ready when you are</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Add a short brief and generate a polished, agency-ready first draft.
                  </p>
                </div>
              )}
              {result && (
                <article className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                  {visibleText}
                </article>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
