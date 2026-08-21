import React, { useState, useMemo } from 'react';
import { useNutritionRange } from '@/hooks/useNutrition';
import { sumEntries, fmtNut, MACRO_FIELDS } from '@/lib/nutrition';
import { todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

const shift = (dateStr, days) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const RANGES = [
  { id: 'week', label: 'Week', days: 7 },
  { id: 'twoWeeks', label: '2 Weeks', days: 14 },
  { id: 'month', label: 'Month', days: 30 },
];

// Neutral nutrition history — averages and per-day calories only. No grades,
// no streaks, no "over/under" language.
export default function NutritionHistory() {
  const [range, setRange] = useState('twoWeeks');
  const end = todayStr();
  const days = RANGES.find((r) => r.id === range).days;
  const start = shift(end, -(days - 1));
  const { items } = useNutritionRange(start, end);

  const byDay = useMemo(() => {
    const map = {};
    (items || []).forEach((e) => {
      const d = e.log_date;
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [items]);

  const dayList = Array.from({ length: days }, (_, i) => shift(start, i)).sort().reverse();
  const daysWithEntries = dayList.filter((d) => (byDay[d] || []).length > 0).length;
  const totalCal = dayList.reduce((acc, d) => acc + sumEntries(byDay[d] || []).calories, 0);
  const totalProtein = dayList.reduce((acc, d) => acc + sumEntries(byDay[d] || []).protein, 0);
  const avgCal = daysWithEntries ? Math.round(totalCal / daysWithEntries) : 0;
  const avgProtein = daysWithEntries ? Math.round(totalProtein / daysWithEntries) : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full transition',
              range === r.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
          <p className="font-heading text-xl font-semibold">{avgCal}</p>
          <p className="text-[11px] text-muted-foreground">avg cal/day</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
          <p className="font-heading text-xl font-semibold">{fmtNut(avgProtein, 'g')}</p>
          <p className="text-[11px] text-muted-foreground">avg protein</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
          <p className="font-heading text-xl font-semibold">{daysWithEntries}</p>
          <p className="text-[11px] text-muted-foreground">days logged</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {dayList.map((d) => {
          const totals = sumEntries(byDay[d] || []);
          const logged = (byDay[d] || []).length > 0;
          return (
            <div key={d} className="flex items-center justify-between rounded-2xl border border-border/40 bg-card px-3 py-2">
              <span className="text-sm text-muted-foreground">{fmtDate(d)}</span>
              <span className="text-sm font-medium">{logged ? `${fmtNut(totals.calories)} cal` : '—'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}