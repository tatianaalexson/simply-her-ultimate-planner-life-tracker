import React from 'react';
import { cn } from '@/lib/utils';

// Compact, calm status chip. Deliberately avoids alarm-red styling.
const VARIANTS = {
  neutral: 'bg-secondary text-secondary-foreground',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent text-accent-foreground',
  outline: 'border border-border text-muted-foreground',
  warm: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  cool: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
};

export default function StatusChip({ children, variant = 'neutral', icon: Icon, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none capitalize',
        VARIANTS[variant] || VARIANTS.neutral,
        className
      )}
    >
      {Icon && <Icon className="w-3 h-3" strokeWidth={2} />}
      {children}
    </span>
  );
}