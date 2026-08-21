import React from 'react';
import { cn } from '@/lib/utils';

// A labelled section block with eyebrow + heading + optional trailing action.
// Gives Kitchen pages consistent rhythm and hierarchy without heavy cards.
export default function KitchenSection({ eyebrow, title, action, children, className }) {
  return (
    <section className={cn('space-y-2.5', className)}>
      {(title || eyebrow || action) && (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 font-medium">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="font-heading text-lg font-semibold leading-tight truncate">
                {title}
              </h2>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}