import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Plus, ShoppingCart, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useMealPlan, useRecipes } from '@/hooks/useKitchen';
import { useEnabledMealSlots, startOfWeek, weekDates, todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';

export default function MealPlanView({ onBack, onOpenGroceryReview }) {
  const slots = useEnabledMealSlots();
  const { items: meals, add, update, remove } = useMealPlan();
  const { items: recipes } = useRecipes();
  const [weekStart, setWeekStart] = useState(startOfWeek());
  const [adding, setAdding] = useState(null); // { date, slot }
  const [view, setView] = useState('week'); // week | day

  const days = weekDates(weekStart);
  const today = todayStr();

  const shiftWeek = (dir) => {
    const d = new Date(weekStart); d.setDate(d.getDate() + dir * 7); setWeekStart(d);
  };

  const mealFor = (date, slot) => meals.find((m) => m.date === date && (m.meal_slot === slot || (slot === 'custom' && m.meal_slot === 'custom')));

  const generateWeekGroceries = () => {
    const sources = meals
      .filter((m) => days.includes(m.date) && m.meal_type === 'recipe' && m.recipe_id)
      .map((m) => ({ recipe: recipes.find((r) => r.id === m.recipe_id), plannedServings: m.servings || 1, meal: m }))
      .filter((s) => s.recipe);
    if (sources.length === 0) return;
    onOpenGroceryReview(sources);
  };

  const dayMeals = useMemo(() => meals.filter((m) => m.date === today), [meals, today]);

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Meal Plan</h2>
        <Button size="sm" className="rounded-full" onClick={generateWeekGroceries}><ShoppingCart className="w-4 h-4 mr-1" /> Groceries</Button>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftWeek(-1)}><ChevronLeft className="w-4 h-4" /></Button>
        <p className="text-sm font-medium">{fmtDate(days[0])} – {fmtDate(days[6])}</p>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftWeek(1)}><ChevronRight className="w-4 h-4" /></Button>
      </div>

      {slots.length === 0 ? (
        <EmptyState title="No meal slots enabled" subtitle="Enable meal slots in Settings." />
      ) : (
        <div className="space-y-3">
          {days.map((date) => (
            <Card key={date} className={`rounded-3xl ${date === today ? 'border-primary' : ''}`}>
              <CardContent className="p-3">
                <p className="text-xs font-medium mb-2">{fmtDate(date)}</p>
                <div className="space-y-1.5">
                  {slots.map((s) => {
                    const m = mealFor(date, s.id);
                    return (
                      <div key={s.id} className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground w-16 shrink-0">{s.label}</span>
                        {m ? (
                          <div className="flex-1 flex items-center gap-1">
                            <button onClick={() => setAdding({ date, slot: s.id, existing: m })} className="flex-1 text-left text-sm truncate">
                              {m.custom_name || (m.recipe_id ? recipes.find((r) => r.id === m.recipe_id)?.name : 'Planned meal')}
                              {m.servings ? <span className="text-[10px] text-muted-foreground"> · {m.servings}</span> : null}
                            </button>
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(m.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                          </div>
                        ) : (
                          <button onClick={() => setAdding({ date, slot: s.id })} className="flex-1 text-left text-xs text-muted-foreground italic flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddMealSheet open={!!adding} onOpenChange={setAdding} recipes={recipes}
        onSave={async (data) => {
          if (adding?.existing) { await update(adding.existing.id, data); }
          else { await add({ ...data, date: adding.date, meal_slot: adding.slot }); }
          setAdding(null);
        }}
        onClear={adding?.existing ? async () => { await remove(adding.existing.id); setAdding(null); } : null}
      />
    </div>
  );
}

function AddMealSheet({ open, onOpenChange, recipes, onSave, onClear }) {
  const [mealType, setMealType] = useState('recipe');
  const [recipeId, setRecipeId] = useState('');
  const [customName, setCustomName] = useState('');
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState('');

  const reset = () => { setMealType('recipe'); setRecipeId(''); setCustomName(''); setServings(1); setNotes(''); };

  const save = () => {
    const data = {
      meal_type: mealType,
      recipe_id: mealType === 'recipe' ? recipeId : '',
      custom_name: mealType === 'recipe' ? (recipes.find((r) => r.id === recipeId)?.name || '') : (mealType === 'leftover' ? 'Leftovers' : customName || 'Meal'),
      servings,
      notes,
    };
    onSave(data); reset();
  };

  return (
    <Sheet open={!!open} onOpenChange={(o) => { if (!o) reset(); onOpenChange && onOpenChange(o ? open : null); }}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Plan a meal</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <div className="flex gap-1.5 flex-wrap">
            {['recipe', 'custom', 'restaurant', 'leftover', 'mealprep'].map((t) => (
              <button key={t} onClick={() => setMealType(t)} className={`text-xs px-3 py-1.5 rounded-full capitalize ${mealType === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>{t === 'mealprep' ? 'meal prep' : t}</button>
            ))}
          </div>
          {mealType === 'recipe' && (
            <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
              <option value="">Choose a recipe</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
          {mealType === 'custom' && <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Meal name" className="rounded-2xl" />}
          <div className="flex items-center gap-2">
            <span className="text-sm w-20">Servings</span>
            <Input type="number" value={servings} onChange={(e) => setServings(parseInt(e.target.value) || 1)} className="rounded-2xl w-24" />
          </div>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" className="rounded-2xl" />
          <div className="flex gap-2">
            {onClear && <Button variant="ghost" className="rounded-full" onClick={onClear}>Clear slot</Button>}
            <Button className="rounded-full flex-1" onClick={save} disabled={mealType === 'recipe' && !recipeId}>Save meal</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}