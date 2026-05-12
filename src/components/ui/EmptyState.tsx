import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface EmptyStateProps {
  icon?: Parameters<typeof Icon>[0]['name'];
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({
  icon = 'InboxIcon',
  title,
  description,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Icon name={icon} size={22} className="text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
