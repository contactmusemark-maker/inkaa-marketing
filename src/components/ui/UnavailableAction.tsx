import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface UnavailableActionProps {
  children: React.ReactNode;
  icon?: Parameters<typeof Icon>[0]['name'];
  className?: string;
  fullWidth?: boolean;
  reason?: string;
}

export default function UnavailableAction({
  children,
  icon,
  className = '',
  fullWidth = false,
  reason = 'This action needs a backend integration before it can be enabled.',
}: UnavailableActionProps) {
  return (
    <button
      type="button"
      disabled
      title={reason}
      aria-disabled="true"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground opacity-80 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}
