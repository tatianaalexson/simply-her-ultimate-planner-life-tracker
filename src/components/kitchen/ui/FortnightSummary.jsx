import React from 'react';
import { startOfWeek, weekDates, fmtDate } from '@/components/kitchen/kitchenConstants';

// Reusable compact two-week Kitchen summary.
// Shows dinners planned, prep sessions, and grocery items remaining
// across the current 14-day planning cycle. Optionally surfaces open dinners
// without guilt language. Used on Kitchen Home and Meal Prep landing.
export default function FortnightSummary({
  dinners = 0,
  preps = 0,
  groceries = 0,
  openDinners = 0,
  showOpenDinners = false,
  onNavigate,
  className,
}) {
  const fortStart = startOfWeek();
  const w1 = weekDates(fortStart);
  const w2 = weekDates(new Date(fortStart.getTime() + 7 * 86400000));
  const range = `${fmtDate(w1[0])} – ${fmtDate(w2[6])}`;

  const stats = [
    { value: dinners, label: 'dinners planned', view: 'mealplan' },
    { value: preps, label: 'prep sessions', view: 'mealprep' },
    { value: groceries, label: 'groceries left', view: 'groceries' },
  ];

  return (
    <div className={`rounded-3xl border border-border/60 bg-card p-4 space-y-3 ${className || ''}`}>
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80 font-medium">
          Next 2 weeks
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{range}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <button
            key={s.view}
            onClick={() => onNavigate?.(s.view)}
            className="text-center active:scale-[0.98] transition rounded-2xl hover:bg-secondary/50 py-1"
          >
            <p className="font-heading text-xl font-semibold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">{s.label}</p>
          </button>
        ))}
      </div>
      {showOpenDinners && openDinners > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {openDinners} dinner{openDinners !== 1 ? 's' : ''} still open — no pressure.
        </p>
      )}
    </div>
  );
}