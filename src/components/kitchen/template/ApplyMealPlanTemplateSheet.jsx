import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, AlertTriangle } from 'lucide-react';
import { useMealPlan } from '@/hooks/useKitchen';
import { startOfWeek, fmtDate } from '@/components/kitchen/kitchenConstants';

const shiftDays = (dateStr, n) => {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};
const fortnightDates = (start) => Array.from({ length: 14 }, (_, i) => shiftDays(start, i));

// Apply a meal-plan template to a 14-day target range.
//
// Template format (backward compatible):
//   day_of_week 0–6  → Week 1 (Mon–Sun)
//   day_of_week 7–13 → Week 2 (Mon–Sun)
//
// A 7-day template (values 0–6 only) applies to BOTH weeks by default;
// the user can restrict to Week 1 or Week 2 via the mode selector.
//
// Modes:
//   fill-empty       – Add template meals only where no meal of the same slot exists.
//   replace-selected – Delete existing meals on user-selected days, then add template meals.
//   replace-week1    – Delete and recreate all of Week 1.
//   replace-week2    – Delete and recreate all of Week 2.
//   replace-full     – Delete and recreate the entire 2-week range.
//
// Never overwrites existing meals silently — fill-empty is the default.
export default function ApplyMealPlanTemplateSheet({ template, recipes, recipeName, onClose }) {
  const [fortStart, setFortStart] = useState(startOfWeek().toISOString().slice(0, 10));
  const [mode, setMode] = useState('fill-empty');
  const [selectedDays, setSelectedDays] = useState({});
  const { items: meals } = useMealPlan();

  if (!template) return null;

  const days = fortnightDates(fortStart);
  const tMeals = template.meals || [];
  const isFortnight = tMeals.some((m) => (m.day_of_week ?? 0) >= 7);

  // Build 14-day preview rows.
  const preview = days.map((date, i) => {
    const dow = i;
    let planned;
    if (isFortnight) {
      // 14-day template: day_of_week maps directly to day index 0–13.
      planned = tMeals.filter((m) => (m.day_of_week ?? 0) === dow);
    } else {
      // 7-day template: each weekday's meals apply to the same weekday in both weeks.
      planned = tMeals.filter((m) => (m.day_of_week ?? 0) === dow % 7);
    }
    const existing = meals.filter((m) => m.date === date);
    return { date, dow, weekIndex: Math.floor(i / 7), planned, existing };
  });

  const missingRecipes = tMeals.filter(
    (m) => m.meal_type === 'recipe' && m.recipe_id && !recipes.find((r) => r.id === m.recipe_id)
  );

  const modes = [
    { id: 'fill-empty', label: 'Fill empty slots only' },
    { id: 'replace-selected', label: 'Replace selected days' },
    { id: 'replace-week1', label: 'Replace Week 1' },
    { id: 'replace-week2', label: 'Replace Week 2' },
    { id: 'replace-full', label: 'Replace entire 2 weeks' },
  ];

  const toggleDay = (date) =>
    setSelectedDays((p) => ({ ...p, [date]: !p[date] }));

  const apply = async () => {
    const week1Days = days.slice(0, 7);
    const week2Days = days.slice(7, 14);
    const toCreate = [];

    // Determine which days to delete existing meals on.
    const daysToDelete = new Set();
    if (mode === 'replace-week1') week1Days.forEach((d) => daysToDelete.add(d));
    if (mode === 'replace-week2') week2Days.forEach((d) => daysToDelete.add(d));
    if (mode === 'replace-full') days.forEach((d) => daysToDelete.add(d));
    if (mode === 'replace-selected') {
      days.forEach((d) => { if (selectedDays[d]) daysToDelete.add(d); });
    }

    // Delete existing meals on target days.
    for (const m of meals.filter((m) => daysToDelete.has(m.date))) {
      try { await base44.entities.MealPlanEntry.delete(m.id); } catch { /* ignore */ }
    }

    // Create template meals.
    for (const row of preview) {
      if (mode === 'replace-selected' && !selectedDays[row.date]) continue;

      for (const m of row.planned) {
        const hasExisting = row.existing.some((e) => e.meal_slot === m.meal_slot);
        if (mode === 'fill-empty' && hasExisting) continue;

        toCreate.push({
          date: row.date,
          meal_slot: m.meal_slot,
          meal_type: m.meal_type || 'custom',
          recipe_id: m.recipe_id || '',
          custom_name: m.custom_name || (m.recipe_id ? recipeName(m.recipe_id) : 'Meal'),
          servings: m.servings || 1,
          notes: m.notes || '',
        });
      }
    }

    if (toCreate.length) await base44.entities.MealPlanEntry.bulkCreate(toCreate);
    onClose();
  };

  return (
    <Sheet open={!!template} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center">
          <SheetTitle className="font-heading">Apply meal plan template</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            {template.name} · {isFortnight ? '14-day template' : '7-day template (applies to both weeks)'}
          </p>

          <div className="flex gap-2 items-center">
            <span className="text-sm w-20 shrink-0">Starting</span>
            <Input
              type="date"
              value={fortStart}
              onChange={(e) => setFortStart(e.target.value)}
              className="rounded-2xl flex-1"
            />
          </div>

          {/* Mode selector */}
          <div className="flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`text-xs px-3 py-2 rounded-full transition ${mode === m.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {missingRecipes.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-2 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                {missingRecipes.length} recipe reference(s) no longer exist. Those meals will be kept but flagged.
              </p>
            </div>
          )}

          {/* 14-day preview */}
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {[
              { label: 'WEEK 1', rows: preview.slice(0, 7) },
              { label: 'WEEK 2', rows: preview.slice(7, 14) },
            ].map((section) => (
              <div key={section.label}>
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-1.5">
                  {section.label}
                </p>
                <div className="space-y-1.5">
                  {section.rows.map((row) => {
                    const isSel = selectedDays[row.date];
                    return (
                      <div
                        key={row.date}
                        className={`rounded-2xl border p-2 ${mode === 'replace-selected' ? 'cursor-pointer' : ''} ${mode === 'replace-selected' && isSel ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                        onClick={() => mode === 'replace-selected' && toggleDay(row.date)}
                      >
                        <div className="flex items-center gap-1.5">
                          {mode === 'replace-selected' && (
                            <input
                              type="checkbox"
                              checked={!!isSel}
                              onChange={() => toggleDay(row.date)}
                              className="w-3.5 h-3.5 shrink-0"
                              aria-label={`Select ${fmtDate(row.date)}`}
                            />
                          )}
                          <p className="text-xs font-medium">{fmtDate(row.date)}</p>
                        </div>
                        {row.planned.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground pl-1">—</p>
                        ) : (
                          row.planned.map((m, i) => {
                            const missing = m.meal_type === 'recipe' && m.recipe_id && !recipes.find((r) => r.id === m.recipe_id);
                            return (
                              <p key={i} className={`text-[11px] ${missing ? 'text-amber-600' : ''}`}>
                                {m.meal_slot}: {m.custom_name || (m.recipe_id ? recipeName(m.recipe_id) : 'Meal')}
                                {missing ? ' (recipe missing)' : ''}
                              </p>
                            );
                          })
                        )}
                        {mode === 'fill-empty' && row.existing.length > 0 && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{row.existing.length} existing meal(s) kept</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <Button className="rounded-full w-full" onClick={apply}>
            <CalendarDays className="w-4 h-4 mr-1" /> Apply to 2 weeks
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}