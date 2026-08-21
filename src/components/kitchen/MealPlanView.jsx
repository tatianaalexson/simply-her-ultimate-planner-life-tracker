import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Plus, ShoppingCart, Trash2, ChevronLeft, ChevronRight, Calendar, Copy, Move, Eraser } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useMealPlan, useRecipes } from '@/hooks/useKitchen';
import { useEnabledMealSlots, startOfWeek, weekDates, todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';

export default function MealPlanView({ onBack, onOpenGroceryReview }) {
  const slots = useEnabledMealSlots();
  const { items: meals, add, update, remove } = useMealPlan();
  const { items: recipes } = useRecipes();
  const [view, setView] = useState('week'); // week | day | month
  const [weekStart, setWeekStart] = useState(startOfWeek());
  const [dayDate, setDayDate] = useState(todayStr());
  const [monthRef, setMonthRef] = useState(new Date());
  const [adding, setAdding] = useState(null);
  const [moving, setMoving] = useState(null);

  const days = weekDates(weekStart);
  const today = todayStr();

  const shiftWeek = (dir) => { const d = new Date(weekStart); d.setDate(d.getDate() + dir * 7); setWeekStart(d); };
  const shiftDay = (dir) => { const d = new Date(dayDate + 'T00:00:00'); d.setDate(d.getDate() + dir); setDayDate(d.toISOString().slice(0, 10)); };

  const mealFor = (date, slot) => meals.find((m) => m.date === date && (m.meal_slot === slot || (slot === 'custom' && m.meal_slot === 'custom')));
  const mealsForDate = (date) => meals.filter((m) => m.date === date);

  const generateWeekGroceries = () => {
    const sources = meals.filter((m) => days.includes(m.date) && m.meal_type === 'recipe' && m.recipe_id)
      .map((m) => ({ recipe: recipes.find((r) => r.id === m.recipe_id), plannedServings: m.servings || 1, meal: m }))
      .filter((s) => s.recipe);
    if (sources.length === 0) return;
    onOpenGroceryReview(sources);
  };

  const recipeName = (m) => m.custom_name || (m.recipe_id ? recipes.find((r) => r.id === m.recipe_id)?.name : 'Planned meal');
  const recipePhoto = (m) => m.recipe_id ? recipes.find((r) => r.id === m.recipe_id)?.photo_url : null;

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Meal Plan</h2>
        {view === 'week' && <Button size="sm" className="rounded-full" onClick={generateWeekGroceries}><ShoppingCart className="w-4 h-4 mr-1" /> Groceries</Button>}
      </div>

      <div className="flex gap-1 p-1 bg-secondary rounded-full">
        {['day', 'week', 'month'].map((v) => (
          <button key={v} onClick={() => setView(v)} className={`flex-1 text-xs py-1.5 rounded-full capitalize ${view === v ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>{v}</button>
        ))}
      </div>

      {view === 'week' && (
        <WeekView days={days} today={today} slots={slots} mealFor={mealFor} recipeName={recipeName} shiftWeek={shiftWeek} onJumpToday={() => setWeekStart(startOfWeek())} weekStart={weekStart} onAdd={setAdding} onRemove={remove} onOpenDay={(d) => { setDayDate(d); setView('day'); }} meals={meals} />
      )}

      {view === 'day' && (
        <DayView date={dayDate} slots={slots} meals={mealsForDate(dayDate)} recipeName={recipeName} recipePhoto={recipePhoto} shiftDay={shiftDay} isToday={dayDate === today}
          onAdd={(slot) => setAdding({ date: dayDate, slot })}
          onEdit={(m) => setAdding({ date: dayDate, slot: m.meal_slot, existing: m })}
          onMove={(m) => setMoving(m)} onRemove={remove} />
      )}

      {view === 'month' && (
        <MonthView monthRef={monthRef} setMonthRef={setMonthRef} meals={meals} today={today} onPick={(d) => { setDayDate(d); setView('day'); }} />
      )}

      <AddMealSheet open={!!adding} onOpenChange={setAdding} recipes={recipes}
        onSave={async (data) => {
          if (adding?.existing) { await update(adding.existing.id, data); }
          else { await add({ ...data, date: adding.date, meal_slot: adding.slot }); }
          setAdding(null);
        }}
        onClear={adding?.existing ? async () => { await remove(adding.existing.id); setAdding(null); } : null}
      />

      <MoveMealSheet open={!!moving} onOpenChange={setMoving} slots={slots}
        onMove={async (date, slot) => { await update(moving.id, { date, meal_slot: slot }); setMoving(null); }}
        onDuplicate={async (date, slot) => { const { id, created_date, updated_date, ...rest } = moving; await add({ ...rest, date, meal_slot: slot }); setMoving(null); }} />
    </div>
  );
}

function WeekView({ days, today, slots, mealFor, recipeName, shiftWeek, onJumpToday, weekStart, onAdd, onRemove, onOpenDay, meals }) {
  const isThisWeek = weekStart.toISOString().slice(0, 10) === startOfWeek().toISOString().slice(0, 10);
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftWeek(-1)}><ChevronLeft className="w-4 h-4" /></Button>
        <div className="text-center">
          <p className="text-sm font-medium">{fmtDate(days[0])} – {fmtDate(days[6])}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftWeek(1)}><ChevronRight className="w-4 h-4" /></Button>
      </div>
      {!isThisWeek && (
        <div className="text-center"><Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={onJumpToday}><Calendar className="w-3 h-3 mr-1" /> Jump to this week</Button></div>
      )}
      {slots.length === 0 ? (
        <EmptyState title="No meal slots enabled" subtitle="Enable meal slots in Settings." />
      ) : (
        <div className="space-y-2">
          {days.map((date) => {
            const dayMeals = meals.filter((m) => m.date === date);
            return (
              <Card key={date} className={`rounded-3xl ${date === today ? 'border-primary' : ''}`}>
                <CardContent className="p-3">
                  <button onClick={() => onOpenDay(date)} className="w-full text-left">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium">{fmtDate(date)}</p>
                      {dayMeals.some((m) => m.meal_type === 'mealprep') && <Badge variant="secondary" className="text-[9px]">prep</Badge>}
                    </div>
                  </button>
                  <div className="space-y-1.5">
                    {slots.map((s) => {
                      const m = mealFor(date, s.id);
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground w-16 shrink-0">{s.label}</span>
                          {m ? (
                            <div className="flex-1 flex items-center gap-1">
                              <button onClick={() => onAdd({ date, slot: s.id, existing: m })} className="flex-1 text-left text-sm truncate">{recipeName(m)}</button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onRemove(m.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                            </div>
                          ) : (
                            <button onClick={() => onAdd({ date, slot: s.id })} className="flex-1 text-left text-xs text-muted-foreground italic flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function DayView({ date, slots, meals, recipeName, recipePhoto, shiftDay, isToday, onAdd, onEdit, onMove, onRemove }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftDay(-1)}><ChevronLeft className="w-4 h-4" /></Button>
        <p className="text-sm font-medium">{fmtDate(date)}{isToday ? ' · Today' : ''}</p>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftDay(1)}><ChevronRight className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-3">
        {slots.map((s) => {
          const m = meals.find((x) => x.meal_slot === s.id || (s.id === 'custom' && x.meal_slot === 'custom'));
          return (
            <Card key={s.id} className="rounded-3xl">
              <CardContent className="p-3">
                <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
                {m ? (
                  <div>
                    <div className="flex gap-3">
                      {recipePhoto(m) && <img src={recipePhoto(m)} alt="" className="w-16 h-16 rounded-2xl object-cover" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{recipeName(m)}</p>
                        {m.servings ? <p className="text-[11px] text-muted-foreground">{m.servings} servings</p> : null}
                        {m.notes ? <p className="text-[11px] text-muted-foreground italic truncate">{m.notes}</p> : null}
                        {m.grocery_status && m.grocery_status !== 'none' && <Badge variant="secondary" className="text-[9px] capitalize mt-1">{m.grocery_status}</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onEdit(m)}>Edit</Button>
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onMove(m)}><Move className="w-3 h-3 mr-1" /> Move</Button>
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onMove(m)}><Copy className="w-3 h-3 mr-1" /> Save for another day</Button>
                      <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => onRemove(m.id)}><Eraser className="w-3 h-3 mr-1" /> Clear</Button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => onAdd(s.id)} className="w-full text-left text-xs text-muted-foreground italic flex items-center gap-1"><Plus className="w-3 h-3" /> Add {s.label.toLowerCase()}</button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function MonthView({ monthRef, setMonthRef, meals, today, onPick }) {
  const y = monthRef.getFullYear(); const mo = monthRef.getMonth();
  const first = new Date(y, mo, 1);
  const startPad = (first.getDay() + 6) % 7; // Monday-based
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, mo, d).toISOString().slice(0, 10));
  while (cells.length % 7 !== 0) cells.push(null);

  const indicators = (date) => {
    const dm = meals.filter((m) => m.date === date);
    if (dm.length === 0) return null;
    const set = new Set();
    dm.forEach((m) => set.add(m.meal_type));
    return set;
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMonthRef(new Date(y, mo - 1, 1))}><ChevronLeft className="w-4 h-4" /></Button>
        <p className="text-sm font-medium">{monthRef.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setMonthRef(new Date(y, mo + 1, 1))}><ChevronRight className="w-4 h-4" /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <p key={i} className="text-[10px] text-muted-foreground py-1">{d}</p>)}
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const inds = indicators(date);
          return (
            <button key={i} onClick={() => onPick(date)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 ${date === today ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
              <span className={`text-xs ${date === today ? '' : 'text-foreground'}`}>{parseInt(date.slice(8))}</span>
              {inds && (
                <div className="flex gap-0.5">
                  {inds.has('recipe') && <span className={`w-1 h-1 rounded-full ${date === today ? 'bg-primary-foreground' : 'bg-primary'}`} />}
                  {inds.has('mealprep') && <span className={`w-1 h-1 rounded-full ${date === today ? 'bg-primary-foreground' : 'bg-chart-2'}`} />}
                  {inds.has('restaurant') && <span className={`w-1 h-1 rounded-full ${date === today ? 'bg-primary-foreground' : 'bg-chart-5'}`} />}
                  {inds.has('leftover') && <span className={`w-1 h-1 rounded-full ${date === today ? 'bg-primary-foreground' : 'bg-chart-4'}`} />}
                  {inds.has('custom') && !inds.has('recipe') && <span className={`w-1 h-1 rounded-full ${date === today ? 'bg-primary-foreground' : 'bg-muted-foreground'}`} />}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Dinner planned</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-chart-2" /> Meal prep</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-chart-5" /> Restaurant</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-chart-4" /> Leftover</span>
      </div>
    </>
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
      servings, notes,
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
          <div className="flex items-center gap-2"><span className="text-sm w-20">Servings</span><Input type="number" value={servings} onChange={(e) => setServings(parseInt(e.target.value) || 1)} className="rounded-2xl w-24" /></div>
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

function MoveMealSheet({ open, onOpenChange, slots, onMove, onDuplicate }) {
  const [date, setDate] = useState(todayStr());
  const [slot, setSlot] = useState('dinner');
  React.useEffect(() => { if (open) { setDate(todayStr()); setSlot(slots[0]?.id || 'dinner'); } }, [open, slots]);
  return (
    <Sheet open={!!open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Move / save for another day</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl" />
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
            {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={() => onMove(date, slot)}><Move className="w-4 h-4 mr-1" /> Move here</Button>
            <Button className="rounded-full flex-1" onClick={() => onDuplicate(date, slot)}><Copy className="w-4 h-4 mr-1" /> Copy here</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}