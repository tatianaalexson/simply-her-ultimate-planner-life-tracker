import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CalendarDays, AlertTriangle } from 'lucide-react';
import { useMealPlan } from '@/hooks/useKitchen';
import { startOfWeek, weekDates, fmtDate } from '@/components/kitchen/kitchenConstants';

// Apply a meal-plan template to a target week.
// Modes: fill-empty | replace-selected | replace-full
export default function ApplyMealPlanTemplateSheet({ template, recipes, recipeName, onClose }) {
  const [weekStart, setWeekStart] = useState(startOfWeek());
  const [mode, setMode] = useState('fill-empty'); // fill-empty | replace-full
  const { items: meals } = useMealPlan();

  if (!template) return null;
  const days = weekDates(weekStart);

  const preview = () => {
    const tMeals = template.meals || [];
    return days.map((date, i) => {
      const dow = i; // Monday=0
      const planned = tMeals.filter((m) => (m.day_of_week ?? 0) === dow);
      const existing = meals.filter((m) => m.date === date);
      return { date, dow, planned, existing };
    });
  };

  const missingRecipes = (template.meals || []).filter((m) => m.meal_type === 'recipe' && m.recipe_id && !recipes.find((r) => r.id === m.recipe_id));

  const apply = async () => {
    const rows = preview();
    const toCreate = [];
    for (const row of rows) {
      for (const m of row.planned) {
        const hasExisting = row.existing.some((e) => e.meal_slot === m.meal_slot);
        if (mode === 'fill-empty' && hasExisting) continue;
        toCreate.push({
          date: row.date, meal_slot: m.meal_slot, meal_type: m.meal_type || 'custom',
          recipe_id: m.recipe_id || '', custom_name: m.custom_name || (m.recipe_id ? recipeName(m.recipe_id) : 'Meal'),
          servings: m.servings || 1, notes: m.notes || '',
        });
      }
    }
    // For replace-full, delete existing week meals first
    if (mode === 'replace-full') {
      const toDelete = meals.filter((m) => days.includes(m.date));
      for (const m of toDelete) { try { await base44.entities.MealPlanEntry.delete(m.id); } catch { /* ignore */ } }
    }
    if (toCreate.length) await base44.entities.MealPlanEntry.bulkCreate(toCreate);
    onClose();
  };

  return (
    <Sheet open={!!template} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Apply meal plan template</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground text-center">{template.name}</p>
          <div className="flex gap-2 items-center">
            <span className="text-sm w-20">Week of</span>
            <Input type="date" value={weekStart.toISOString().slice(0, 10)} onChange={(e) => { const d = new Date(e.target.value + 'T00:00:00'); setWeekStart(d); }} className="rounded-2xl flex-1" />
          </div>
          <div className="flex gap-1.5">
            {[['fill-empty', 'Fill empty slots'], ['replace-full', 'Replace whole week']].map(([v, l]) => (
              <button key={v} onClick={() => setMode(v)} className={`flex-1 text-xs px-3 py-2 rounded-full ${mode === v ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{l}</button>
            ))}
          </div>

          {missingRecipes.length > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-2 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800">{missingRecipes.length} recipe reference(s) no longer exist. Those meals will be kept but flagged.</p>
            </div>
          )}

          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {preview().map((row) => (
              <div key={row.date} className="rounded-2xl border bg-card p-2">
                <p className="text-xs font-medium">{fmtDate(row.date)}</p>
                {row.planned.length === 0 ? <p className="text-[11px] text-muted-foreground">—</p> : row.planned.map((m, i) => {
                  const missing = m.meal_type === 'recipe' && m.recipe_id && !recipes.find((r) => r.id === m.recipe_id);
                  return <p key={i} className={`text-[11px] ${missing ? 'text-amber-600' : ''}`}>{m.meal_slot}: {m.custom_name || (m.recipe_id ? recipeName(m.recipe_id) : 'Meal')}{missing ? ' (recipe missing)' : ''}</p>;
                })}
                {mode === 'fill-empty' && row.existing.length > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">{row.existing.length} existing meal(s) kept</p>}
              </div>
            ))}
          </div>

          <Button className="rounded-full w-full" onClick={apply}><CalendarDays className="w-4 h-4 mr-1" /> Apply to week</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}