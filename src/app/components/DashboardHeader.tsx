'use client';

import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const dateRanges = [
  { id: 'range-may', label: 'May 1 – May 31, 2026' },
  { id: 'range-apr', label: 'Apr 1 – Apr 30, 2026' },
  { id: 'range-q1', label: 'Q1 2026' },
  { id: 'range-ytd', label: 'Year to Date' },
];

export default function DashboardHeader() {
  const [selectedRange, setSelectedRange] = useState(dateRanges?.[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your live agency metrics will appear here as data is added.
        </p>
      </div>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/30 transition-all duration-150"
        >
          <Icon name="CalendarIcon" size={16} className="text-muted-foreground" />
          {selectedRange?.label}
          <Icon name="ChevronDownIcon" size={14} className="text-muted-foreground" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-xl border border-border shadow-dropdown animate-slide-up z-20">
            {dateRanges?.map((range) => (
              <button
                key={range?.id}
                onClick={() => {
                  setSelectedRange(range);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  selectedRange?.id === range?.id
                    ? 'bg-accent text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {range?.label}
              </button>
            ))}
          </div>
        )}
        {showDropdown && (
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
        )}
      </div>
    </div>
  );
}
