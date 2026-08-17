import React from 'react';
import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, subtitle, className }) {
  return (
    <div className={cn('py-12 text-center px-6', className)}>
      {Icon && <Icon className="w-10 h-10 mx-auto text-muted-foreground mb-3" strokeWidth={1.5} />}
      <p className="font-medium text-sm">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}