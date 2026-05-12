'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function AIPromoCard() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 w-72 bg-card rounded-2xl border border-border shadow-modal p-4 animate-slide-up z-40">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss AI promo"
      >
        <Icon name="XMarkIcon" size={14} className="text-muted-foreground" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Icon name="SparklesIcon" size={18} className="text-white" />
        </div>
        <div className="flex-1 pr-4">
          <p className="text-sm font-semibold text-foreground">AI Proposal Generator</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create professional proposals in seconds
          </p>
        </div>
      </div>

      <Link href="/ai-tools" className="mt-3 w-full btn-primary text-xs py-2.5 justify-center">
        Generate Now
      </Link>
    </div>
  );
}
