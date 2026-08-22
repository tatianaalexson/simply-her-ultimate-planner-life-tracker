import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useNutritionRange } from '@/hooks/useNutrition';
import { useAppSettings } from '@/lib/AppSettings';
import { sumEntries, fmtNut, MACRO_FIELDS } from '@/lib/nutrition';
import { todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

const shortDate = (s) => s ? new Date(s + 'T00:00:00').toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) : '';

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

export default function NutritionHistory() {
  const { isFeatureEnabled } = useAppSettings();
  const showMacros = isFeatureEnabled('kit.macros');
  const [range, setRange] = useState('twoWeeks');
  const [chartMetric, setChartMetric] = useState('calories');
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

  // Chart data (ascending for left-to-right)
  const chartData = [...dayList].reverse().map((d) => {
    const totals = sumEntries(byDay[d] || []);
    return { date: d, shortDate: shortDate(d), calories: Math.round(totals.calories), protein: Math.round(totals.protein) };
  });

  const metrics = showMacros
    ? [{ key: 'calories', label: 'Calories' }, { key: 'protein', label: 'Protein' }]
    : [{ key: 'calories', label: 'Calories' }];

  return (
    <div className="space-y-4">
      {/* Range selector */}
      <div className="flex gap-1.5">
        {RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)}
            className={cn('text-xs px-3 py-1.5 rounded-full transition',
              range === r.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
          <p className="font-heading text-xl font-semibold">{avgCal}</p>
          <p className="text-[11px] text-muted-foreground">avg cal/day</p>
        </div>
        {showMacros && (
          <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
            <p className="font-heading text-xl font-semibold">{fmtNut(avgProtein, 'g')}</p>
            <p className="text-[11px] text-muted-foreground">avg protein</p>
          </div>
        )}
        <div className="rounded-2xl border border-border/60 bg-card p-3 text-center">
          <p className="font-heading text-xl font-semibold">{daysWithEntries}<span className="text-sm text-muted-foreground">/{days}</span></p>
          <p className="text-[11px] text-muted-foreground">days logged</p>
        </div>
      </div>

      {/* Chart */}
      {daysWithEntries > 0 && (
        <div className="rounded-3xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Daily {chartMetric === 'calories' ? 'calories' : 'protein'}</p>
            {showMacros && (
              <div className="flex gap-1">
                {metrics.map((m) => (
                  <button key={m.key} onClick={() => setChartMetric(m.key)}
                    className={cn('text-[10px] px-2 py-0.5 rounded-full transition',
                      chartMetric === m.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <XAxis dataKey="shortDate" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={Math.max(0, Math.floor(days / 7) - 1)} />
              <Bar dataKey={chartMetric} radius={[3, 3, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry[chartMetric] > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                ))}
              </Bar>
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))' }}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12, color: 'hsl(var(--foreground))' }}
                formatter={(v) => [chartMetric === 'calories' ? `${v} cal` : `${v} g`, '']}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily list */}
      <div className="space-y-1.5">
        {dayList.map((d) => {
          const totals = sumEntries(byDay[d] || []);
          const logged = (byDay[d] || []).length > 0;
          return (
            <div key={d} className="flex items-center justify-between rounded-2xl border border-border/40 bg-card px-3 py-2">
              <span className="text-sm text-muted-foreground">{fmtDate(d)}</span>
              <span className="text-sm font-medium">{logged ? `${fmtNut(totals.calories)} cal${showMacros ? ` · ${fmtNut(totals.protein, 'g')} P` : ''}` : '—'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}