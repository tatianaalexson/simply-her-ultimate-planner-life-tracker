import React from 'react';
import { Button } from '@/components/ui/button';
import { useKitchenTheme } from '@/lib/kitchenTheme';
import { cn } from '@/lib/utils';

// Theme-aware empty state with a subtle motif accent and an optional primary
// action, so empty Kitchen screens still feel finished and inviting.
export default function KitchenEmptyState({
  icon: Icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  secondary,
  className,
}) {
  const { motif } = useKitchenTheme();
  return (
    <div
      className={cn(
        'rounded-3xl border border-dashed border-border/70 bg-secondary/20 px-6 py-10 text-center',
        className
      )}
    >
      <div className="relative mx-auto w-fit">
        {Icon && <Icon className="w-9 h-9 text-primary/40" strokeWidth={1.25} />}
        <span
          className="absolute -top-2 -right-3 text-sm opacity-50 select-none"
          aria-hidden
        >
          {motif}
        </span>
      </div>
      <p className="font-heading text-sm font-medium mt-3">{title}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{subtitle}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" className="rounded-full mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {secondary && <div className="mt-3">{secondary}</div>}
    </div>
  );
}