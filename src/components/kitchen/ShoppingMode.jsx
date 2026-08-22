import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { X, ChevronDown, ChevronUp, Check, MapPin, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Full-screen in-store shopping experience.
// Prioritises one-handed use: large checkboxes, readable quantities,
// category headers, remaining count, optional price. Completed items
// collapse to a subtle Completed section. No gamification.
export default function ShoppingMode({
  items,
  listName,
  showPrices,
  grouping,
  onToggle,
  onExit,
  onFinish,
}) {
  const [showCompleted, setShowCompleted] = useState(false);

  const active = useMemo(() => items.filter((i) => !i.checked), [items]);
  const completed = useMemo(() => items.filter((i) => i.checked), [items]);

  const groupKey = (i) => {
    if (grouping === 'store') return i.store || 'No store';
    return i.category || 'Other';
  };

  const grouped = useMemo(() => {
    const g = {};
    active.forEach((i) => { const c = groupKey(i); (g[c] = g[c] || []).push(i); });
    return g;
  }, [active, grouping]);

  const estRemaining = useMemo(
    () => active.reduce((sum, i) => sum + (Number(i.est_price) || 0), 0),
    [active]
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-base font-semibold truncate">{listName}</h2>
            <p className="text-xs text-muted-foreground">
              {active.length} remaining{showPrices && estRemaining > 0 ? ` · $${estRemaining.toFixed(2)} est` : ''}
            </p>
          </div>
          {onFinish && completed.length > 0 && (
            <Button size="sm" className="rounded-full shrink-0" onClick={onFinish}>
              <CheckCircle className="w-4 h-4 mr-1" /> Finish
            </Button>
          )}
          <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={onExit} aria-label="Exit shopping mode">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {active.length === 0 && completed.length > 0 && (
          <div className="py-12 text-center">
            <Check className="w-10 h-10 text-primary/40 mx-auto" strokeWidth={1.25} />
            <p className="font-heading text-sm font-medium mt-3">All done!</p>
            <p className="text-xs text-muted-foreground mt-1">Your list is complete.</p>
          </div>
        )}

        {Object.entries(grouped).map(([cat, list]) => (
          <div key={cat} className="mb-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1 px-1">
              {cat}
            </p>
            {list.map((i) => (
              <ShoppingRow key={i.id} item={i} showPrices={showPrices} onToggle={(v) => onToggle(i.id, v)} />
            ))}
          </div>
        ))}

        {/* Completed section */}
        {completed.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowCompleted((s) => !s)}
              className="flex items-center gap-1 text-xs text-muted-foreground mb-1 px-1"
            >
              {showCompleted ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {completed.length} completed
            </button>
            {showCompleted && completed.map((i) => (
              <ShoppingRow key={i.id} item={i} showPrices={showPrices} onToggle={(v) => onToggle(i.id, v)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ShoppingRow({ item, showPrices, onToggle }) {
  const paid = showPrices && item.actual_price > 0;
  return (
    <label
      className={cn(
        'flex items-center gap-4 py-3.5 border-b border-border/30 cursor-pointer',
        item.checked && 'opacity-50'
      )}
    >
      <Checkbox
        checked={item.checked}
        onCheckedChange={onToggle}
        className="w-6 h-6 rounded-md shrink-0"
        id={`shop-${item.id}`}
        aria-label={`Mark ${item.name} as ${item.checked ? 'not bought' : 'bought'}`}
      />
      <div className="flex-1 min-w-0">
        <p className={cn('text-base font-medium', item.checked && 'line-through')}>{item.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {item.qty}{item.unit ? ` ${item.unit}` : ''}
          </span>
          {item.store && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />{item.store}
            </span>
          )}
          {paid && <span className="text-[11px] text-muted-foreground">${item.actual_price.toFixed(2)}</span>}
        </div>
      </div>
    </label>
  );
}