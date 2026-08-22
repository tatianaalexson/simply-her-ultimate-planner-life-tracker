import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { startOfWeek, todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { expandRecurring } from '@/lib/kitchenRecurrence';

const shiftDays = (dateStr, n) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const fortnightDates = (start) => Array.from({ length: 14 }, (_, i) => shiftDays(start, i));

// Two-week grocery generation options.
// Lets the user choose which slice of the 14-day plan to generate groceries for:
// Today, Week 1, Week 2, or Full 2 Weeks. Uses the shared kitchenGrocery engine
// upstream — this sheet only computes sources and hands them to onGenerate.
export default function GenerateGrocerySheet({ open, onOpenChange, meals, recipes, onGenerate }) {
  const fortStart = useMemo(() => startOfWeek().toISOString().slice(0, 10), []);
  const days = useMemo(() => fortnightDates(fortStart), [fortStart]);
  const today = todayStr();
  const [selected, setSelected] = useState('fortnight');

  const ranges = useMemo(() => [
    { id: 'today', label: 'Today', sub: fmtDate(today), dates: [today] },
    { id: 'week1', label: 'Week 1', sub: fmtDate(days[0]), dates: days.slice(0, 7) },
    { id: 'week2', label: 'Week 2', sub: fmtDate(days[7]), dates: days.slice(7, 14) },
    { id: 'fortnight', label: 'Full 2 Weeks', sub: fmtDate(days[0]), dates: days },
  ], [days, today]);

  const countMeals = (dates) => {
    if (!dates?.length) return 0;
    const from = dates[0], to = dates[dates.length - 1];
    const expanded = expandRecurring(meals, from, to);
    return expanded.filter(
      (m) => dates.includes(m.date) && m.meal_type === 'recipe' && m.recipe_id && recipes.find((r) => r.id === m.recipe_id)
    ).length;
  };

  const handleGenerate = () => {
    const range = ranges.find((r) => r.id === selected);
    if (!range) return;
    const from = range.dates[0], to = range.dates[range.dates.length - 1];
    const expanded = expandRecurring(meals, from, to);
    const sources = expanded
      .filter((m) => range.dates.includes(m.date) && m.meal_type === 'recipe' && m.recipe_id)
      .map((m) => ({ recipe: recipes.find((r) => r.id === m.recipe_id), plannedServings: m.servings || 1, meal: m }))
      .filter((s) => s.recipe);
    onGenerate(sources);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center">
          <SheetTitle className="font-heading">Generate groceries</SheetTitle>
        </SheetHeader>
        <p className="text-xs text-muted-foreground text-center mt-1 mb-4">Choose which meals to shop for.</p>
        <div className="space-y-2">
          {ranges.map((r) => {
            const count = countMeals(r.dates);
            const active = selected === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${active ? 'bg-primary/15' : 'bg-secondary'}`}>
                  <ShoppingCart className={`w-4 h-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0">{count} recipe{count !== 1 ? 's' : ''}</span>
              </button>
            );
          })}
        </div>
        <Button
          className="rounded-full w-full mt-4"
          onClick={handleGenerate}
          disabled={countMeals(ranges.find((r) => r.id === selected)?.dates) === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-1" /> Generate
        </Button>
      </SheetContent>
    </Sheet>
  );
}