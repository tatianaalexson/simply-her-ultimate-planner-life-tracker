import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, ShoppingCart, Trash2, ChevronLeft, ChevronRight, Calendar, Copy, Move, Eraser, Repeat, Save } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useMealPlan, useRecipes, useKitchenTemplates } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { expandRecurring, describeRule, isSeries, isVirtual, isException, newSeriesId, RRULE_FREQS, WEEKDAYS } from '@/lib/kitchenRecurrence';
import { useEnabledMealSlots, startOfWeek, weekDates, todayStr, fmtDate, DAY_OF_WEEK } from '@/components/kitchen/kitchenConstants';

export default function MealPlanView({ onBack, onOpenGroceryReview }) {
  const { isFeatureEnabled } = useAppSettings();
  const slots = useEnabledMealSlots();
  const { items: meals, add, update, remove } = useMealPlan();
  const { items: recipes } = useRecipes();
  const { add: addTemplate } = useKitchenTemplates('meal-plan');
  const [view, setView] = useState('week');
  const [weekStart, setWeekStart] = useState(startOfWeek());
  const [dayDate, setDayDate] = useState(todayStr());
  const [monthRef, setMonthRef] = useState(new Date());
  const [adding, setAdding] = useState(null);
  const [moving, setMoving] = useState(null);
  const [recAction, setRecAction] = useState(null); // { meal, action: 'edit'|'delete' }
  const [saveTpl, setSaveTpl] = useState(false);

  const days = weekDates(weekStart);
  const today = todayStr();

  // Expand recurring meals for the visible range.
  const visibleMeals = useMemo(() => {
    let from = days[0], to = days[6];
    if (view === 'day') { from = dayDate; to = dayDate; }
    if (view === 'month') {
      const y = monthRef.getFullYear(), mo = monthRef.getMonth();
      from = new Date(y, mo, 1).toISOString().slice(0, 10);
      to = new Date(y, mo + 1, 0).toISOString().slice(0, 10);
    }
    return expandRecurring(meals, from, to);
  }, [meals, days, view, dayDate, monthRef]);

  const shiftWeek = (dir) => { const d = new Date(weekStart); d.setDate(d.getDate() + dir * 7); setWeekStart(d); };
  const shiftDay = (dir) => { const d = new Date(dayDate + 'T00:00:00'); d.setDate(d.getDate() + dir); setDayDate(d.toISOString().slice(0, 10)); };

  const mealFor = (date, slot) => visibleMeals.find((m) => m.date === date && (m.meal_slot === slot || (slot === 'custom' && m.meal_slot === 'custom')));
  const mealsForDate = (date) => visibleMeals.filter((m) => m.date === date);

  const generateWeekGroceries = () => {
    const sources = visibleMeals.filter((m) => days.includes(m.date) && m.meal_type === 'recipe' && m.recipe_id)
      .map((m) => ({ recipe: recipes.find((r) => r.id === m.recipe_id), plannedServings: m.servings || 1, meal: m }))
      .filter((s) => s.recipe);
    if (sources.length === 0) return;
    onOpenGroceryReview(sources);
  };

  const recipeName = (m) => m.custom_name || (m.recipe_id ? recipes.find((r) => r.id === m.recipe_id)?.name : 'Planned meal');
  const recipePhoto = (m) => m.recipe_id ? recipes.find((r) => r.id === m.recipe_id)?.photo_url : null;

  // Recurring delete/edit handlers
  const handleEditMeal = (m) => {
    if (isVirtual(m) || isSeries(m)) { setRecAction({ meal: m, action: 'edit' }); return; }
    setAdding({ date: m.date, slot: m.meal_slot, existing: m });
  };
  const handleRemoveMeal = (m) => {
    if (isVirtual(m)) { setRecAction({ meal: m, action: 'delete' }); return; }
    if (isSeries(m)) { setRecAction({ meal: m, action: 'delete' }); return; }
    remove(m.id);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Meal Plan</h2>
        {isFeatureEnabled('kit.mealTemplates') && view === 'week' && <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setSaveTpl(true)}><Save className="w-4 h-4 mr-1" /> Save week</Button>}
        {view === 'week' && <Button size="sm" className="rounded-full" onClick={generateWeekGroceries}><ShoppingCart className="w-4 h-4 mr-1" /> Groceries</Button>}
      </div>

      <div className="flex gap-1 p-1 bg-secondary rounded-full">
        {['day', 'week', 'month'].map((v) => (
          <button key={v} onClick={() => setView(v)} className={`flex-1 text-xs py-1.5 rounded-full capitalize ${view === v ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>{v}</button>
        ))}
      </div>

      {view === 'week' && (
        <WeekView days={days} today={today} slots={slots} mealFor={mealFor} recipeName={recipeName} shiftWeek={shiftWeek} onJumpToday={() => setWeekStart(startOfWeek())} weekStart={weekStart} onAdd={setAdding} onRemove={handleRemoveMeal} onEdit={handleEditMeal} onOpenDay={(d) => { setDayDate(d); setView('day'); }} meals={visibleMeals} />
      )}

      {view === 'day' && (
        <DayView date={dayDate} slots={slots} meals={mealsForDate(dayDate)} recipeName={recipeName} recipePhoto={recipePhoto} shiftDay={shiftDay} isToday={dayDate === today}
          onAdd={(slot) => setAdding({ date: dayDate, slot })}
          onEdit={handleEditMeal}
          onMove={(m) => setMoving(m)} onRemove={handleRemoveMeal} />
      )}

      {view === 'month' && (
        <MonthView monthRef={monthRef} setMonthRef={setMonthRef} meals={visibleMeals} today={today} onPick={(d) => { setDayDate(d); setView('day'); }} />
      )}

      <AddMealSheet open={!!adding} onOpenChange={setAdding} recipes={recipes} allowRecurring={isFeatureEnabled('kit.recurringMeals')}
        onSave={async (data, recurrence) => {
          if (adding?.existing) {
            await update(adding.existing.id, data);
          } else {
            const payload = { ...data, date: adding.date, meal_slot: adding.slot };
            if (recurrence && recurrence.freq !== 'none') {
              payload.series_id = newSeriesId();
              payload.rrule_freq = recurrence.freq;
              payload.rrule_interval = recurrence.interval || 1;
              payload.rrule_days = recurrence.days || [];
            }
            await add(payload);
          }
          setAdding(null);
        }}
        onClear={adding?.existing ? async () => { await remove(adding.existing.id); setAdding(null); } : null}
      />

      <MoveMealSheet open={!!moving} onOpenChange={setMoving} slots={slots}
        onMove={async (date, slot) => { await update(moving.id, { date, meal_slot: slot }); setMoving(null); }}
        onDuplicate={async (date, slot) => { const { id, created_date, updated_date, ...rest } = moving; await add({ ...rest, date, meal_slot: slot, series_id: '', rrule_freq: 'none' }); setMoving(null); }} />

      {recAction && (
        <RecurrenceActionSheet meal={recAction.meal} action={recAction.action} recipes={recipes} onCancel={() => setRecAction(null)}
          onResolve={async (scope, newData) => {
            const m = recAction.meal;
            await resolveRecurrence(m, recAction.action, scope, newData, { update, add, remove, meals });
            setRecAction(null);
          }} />
      )}

      {saveTpl && <SaveWeekTemplateSheet meals={visibleMeals.filter((m) => days.includes(m.date) && !m._virtual && !isSeries(m))} recipes={recipes} onSave={async (name, desc) => { await addTemplate({ kind: 'meal-plan', name, description: desc, meals: visibleMeals.filter((m) => days.includes(m.date) && !m._virtual).map((m) => ({ day_of_week: (new Date(m.date + 'T00:00:00').getDay() + 6) % 7, meal_slot: m.meal_slot, meal_type: m.meal_type, recipe_id: m.recipe_id || '', custom_name: m.custom_name || '', servings: m.servings || 1, notes: m.notes || '' })) }); setSaveTpl(false); }} onCancel={() => setSaveTpl(false)} />}
    </div>
  );
}

// Resolve a recurring-meal edit/delete by scope.
async function resolveRecurrence(m, action, scope, newData, ops) {
  const { update, add, remove, meals } = ops;
  const seriesRecord = meals.find((x) => x.id === m._series_record_id || (x.series_id === m.series_id && !x.is_exception));
  const seriesId = m.series_id || m.series_id;

  if (action === 'delete') {
    if (scope === 'this') {
      // exclude this date on the series
      if (seriesRecord) {
        const ex = new Set(seriesRecord.excluded_dates || []);
        ex.add(m.date);
        await update(seriesRecord.id, { excluded_dates: Array.from(ex) });
      }
    } else if (scope === 'future') {
      if (seriesRecord) {
        const before = new Date(m.date + 'T00:00:00'); before.setDate(before.getDate() - 1);
        await update(seriesRecord.id, { rrule_until: before.toISOString().slice(0, 10) });
      }
    } else if (scope === 'all') {
      // delete series + any exceptions
      const toDel = meals.filter((x) => x.series_id === seriesId || x.exception_of === seriesId);
      for (const x of toDel) { try { await remove(x.id); } catch { /* ignore */ } }
    }
    return;
  }

  // action === 'edit'
  if (scope === 'this') {
    // create an exception override for this date
    await add({ ...newData, date: m.date, meal_slot: m.meal_slot, is_exception: true, exception_of: seriesId, series_id: '', rrule_freq: 'none', excluded_dates: [] });
  } else if (scope === 'future') {
    if (seriesRecord) {
      const before = new Date(m.date + 'T00:00:00'); before.setDate(before.getDate() - 1);
      await update(seriesRecord.id, { rrule_until: before.toISOString().slice(0, 10) });
    }
    await add({ ...newData, date: m.date, meal_slot: m.meal_slot, series_id: newSeriesId(), rrule_freq: seriesRecord?.rrule_freq || 'weekly', rrule_interval: seriesRecord?.rrule_interval || 1, rrule_days: seriesRecord?.rrule_days || [] });
  } else if (scope === 'all') {
    if (seriesRecord) { await update(seriesRecord.id, newData); }
  }
}

function WeekView({ days, today, slots, mealFor, recipeName, shiftWeek, onJumpToday, weekStart, onAdd, onRemove, onEdit, onOpenDay, meals }) {
  const isThisWeek = weekStart.toISOString().slice(0, 10) === startOfWeek().toISOString().slice(0, 10);
  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftWeek(-1)}><ChevronLeft className="w-4 h-4" /></Button>
        <div className="text-center"><p className="text-sm font-medium">{fmtDate(days[0])} – {fmtDate(days[6])}</p></div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => shiftWeek(1)}><ChevronRight className="w-4 h-4" /></Button>
      </div>
      {!isThisWeek && (<div className="text-center"><Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={onJumpToday}><Calendar className="w-3 h-3 mr-1" /> Jump to this week</Button></div>)}
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
                              <button onClick={() => onEdit(m)} className="flex-1 text-left text-sm truncate flex items-center gap-1">
                                {(isSeries(m) || isVirtual(m) || isException(m)) && <Repeat className="w-3 h-3 text-muted-foreground shrink-0" />}
                                {recipeName(m)}
                              </button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onRemove(m)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
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
                        <p className="text-sm font-medium flex items-center gap-1">{(isSeries(m) || isVirtual(m) || isException(m)) && <Repeat className="w-3 h-3 text-muted-foreground" />}{recipeName(m)}</p>
                        {m.servings ? <p className="text-[11px] text-muted-foreground">{m.servings} servings</p> : null}
                        {m.notes ? <p className="text-[11px] text-muted-foreground italic truncate">{m.notes}</p> : null}
                        {m.grocery_status && m.grocery_status !== 'none' && <Badge variant="secondary" className="text-[9px] capitalize mt-1">{m.grocery_status}</Badge>}
                        {(isSeries(m) || isVirtual(m)) && <p className="text-[10px] text-muted-foreground mt-0.5">{describeRule(m)}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onEdit(m)}>Edit</Button>
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onMove(m)}><Move className="w-3 h-3 mr-1" /> Move</Button>
                      <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onMove(m)}><Copy className="w-3 h-3 mr-1" /> Save for another day</Button>
                      <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => onRemove(m)}><Eraser className="w-3 h-3 mr-1" /> Clear</Button>
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
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, mo, d).toISOString().slice(0, 10));
  while (cells.length % 7 !== 0) cells.push(null);

  const indicators = (date) => {
    const dm = meals.filter((m) => m.date === date);
    if (dm.length === 0) return null;
    const set = new Set(); dm.forEach((m) => set.add(m.meal_type));
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

function AddMealSheet({ open, onOpenChange, recipes, onSave, onClear, allowRecurring }) {
  const [mealType, setMealType] = useState('recipe');
  const [recipeId, setRecipeId] = useState('');
  const [customName, setCustomName] = useState('');
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState('');
  const [rec, setRec] = useState({ freq: 'none', interval: 1, days: [] });
  const reset = () => { setMealType('recipe'); setRecipeId(''); setCustomName(''); setServings(1); setNotes(''); setRec({ freq: 'none', interval: 1, days: [] }); };
  const save = () => {
    const data = {
      meal_type: mealType,
      recipe_id: mealType === 'recipe' ? recipeId : '',
      custom_name: mealType === 'recipe' ? (recipes.find((r) => r.id === recipeId)?.name || '') : (mealType === 'leftover' ? 'Leftovers' : customName || 'Meal'),
      servings, notes,
    };
    onSave(data, rec); reset();
  };
  return (
    <Sheet open={!!open} onOpenChange={(o) => { if (!o) reset(); onOpenChange && onOpenChange(o ? open : null); }}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
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

          {allowRecurring && (
            <div className="rounded-2xl border bg-card p-3 space-y-2">
              <div className="flex items-center gap-2"><Repeat className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">Repeats</span></div>
              <select value={rec.freq} onChange={(e) => setRec((p) => ({ ...p, freq: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
                {RRULE_FREQS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              {rec.freq === 'custom' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs">Every</span>
                  <Input type="number" value={rec.interval} onChange={(e) => setRec((p) => ({ ...p, interval: parseInt(e.target.value) || 1 }))} className="rounded-2xl w-16" />
                  <span className="text-xs">weeks</span>
                </div>
              )}
              {(rec.freq === 'weekly' || rec.freq === 'biweekly' || rec.freq === 'custom') && (
                <div className="flex gap-1 flex-wrap">
                  {WEEKDAYS.map((d, i) => {
                    const on = rec.days.includes(i);
                    return <button key={i} onClick={() => setRec((p) => ({ ...p, days: on ? p.days.filter((x) => x !== i) : [...p.days, i] }))} className={`text-[11px] w-8 h-8 rounded-full ${on ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{d[0]}</button>;
                  })}
                </div>
              )}
            </div>
          )}

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

function RecurrenceActionSheet({ meal, action, onCancel, onResolve }) {
  const choices = action === 'delete'
    ? [['this', 'This occurrence only'], ['future', 'This and future occurrences'], ['all', 'Entire series']]
    : [['this', 'This meal only'], ['future', 'This and future meals'], ['all', 'Entire series']];
  return (
    <Sheet open onOpenChange={(o) => !o && onCancel()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">{action === 'delete' ? 'Delete recurring meal' : 'Edit recurring meal'}</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <p className="text-xs text-muted-foreground text-center">{describeRule(meal)} · {fmtDate(meal.date)}</p>
          {choices.map(([v, l]) => (
            <Button key={v} variant="outline" className="rounded-full w-full" onClick={() => onResolve(v, { meal_type: meal.meal_type, recipe_id: meal.recipe_id, custom_name: meal.custom_name, servings: meal.servings, notes: meal.notes })}>{l}</Button>
          ))}
          <Button variant="ghost" className="rounded-full w-full" onClick={onCancel}>Cancel</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SaveWeekTemplateSheet({ meals, recipes, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  return (
    <Sheet open onOpenChange={(o) => !o && onCancel()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Save week as template</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name (e.g. Easy Week)" className="rounded-2xl" autoFocus />
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description (optional)" className="rounded-2xl" />
          <p className="text-[11px] text-muted-foreground">{meals.length} meal(s) will be saved. Temporary leftovers are not included.</p>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={() => onSave(name, desc)} disabled={!name.trim()}>Save template</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}