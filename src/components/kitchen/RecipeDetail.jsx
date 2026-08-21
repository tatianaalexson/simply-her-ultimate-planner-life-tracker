import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Heart, Clock, Users, ShoppingCart, CalendarDays, ChefHat, Copy, Pencil, Check, Repeat, NotebookPen, Star, Utensils, Salad } from 'lucide-react';
import { useAppSettings } from '@/lib/AppSettings';
import { todayStr } from '@/components/kitchen/kitchenConstants';
import { useCookingNotes } from '@/hooks/useKitchen';
import CookingMode from '@/components/kitchen/CookingMode';
import LogFoodSheet from '@/components/kitchen/nutrition/LogFoodSheet';
import RecipeNutritionSheet from '@/components/kitchen/nutrition/RecipeNutritionSheet';
import { recipePerServing, fmtNut } from '@/lib/nutrition';

const parseQty = (q) => { if (typeof q === 'number') return q; if (!q) return 0; const s = String(q).trim(); const f = s.match(/^(\d+)\s*\/\s*(\d+)$/); if (f) return parseInt(f[1]) / parseInt(f[2]); const m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/); if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]); const n = parseFloat(s.replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
const fmtQty = (n) => { if (!n) return '0'; if (Number.isInteger(n)) return String(n); const ds = [2, 3, 4, 8, 16]; for (const d of ds) { const w = Math.floor(n); const r = n - w; const num = Math.round(r * d); if (Math.abs(num / d - r) < 0.01 && num > 0) return w > 0 ? `${w} ${num}/${d}` : `${num}/${d}`; } return String(Math.round(n * 100) / 100); };

const SCALES = [{ k: 0.5, label: '½×' }, { k: 1, label: '1×' }, { k: 1.5, label: '1.5×' }, { k: 2, label: '2×' }];

export default function RecipeDetail({ recipe, onBack, onEdit, onOpenGroceryReview, onDuplicate, onUpdate }) {
  const { isFeatureEnabled } = useAppSettings();
  const [scale, setScale] = useState(1);
  const [customServings, setCustomServings] = useState('');
  const [cooking, setCooking] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [showLeftover, setShowLeftover] = useState(false);
  const [leftoverParts, setLeftoverParts] = useState(1);
  const [leftoverLoc, setLeftoverLoc] = useState('Fridge');
  const [logFood, setLogFood] = useState({ open: false, prefill: null });
  const [nutOpen, setNutOpen] = useState(false);

  const defaultServ = recipe.default_servings || 1;
  const targetServ = customServings ? parseInt(customServings) : Math.round(defaultServ * scale);
  const factor = targetServ / defaultServ;

  const sections = {};
  (recipe.ingredients || []).forEach((ing) => {
    const sec = ing.section || 'Ingredients';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(ing);
  });

  const markCooked = async () => {
    try {
      await base44.entities.Recipe.update(recipe.id, { last_cooked: todayStr(), cooked_count: (recipe.cooked_count || 0) + 1 });
    } catch { /* ignore */ }
    setShowLeftover(true);
  };

  const saveLeftover = async () => {
    try {
      await base44.entities.Leftover.create({
        name: recipe.name, source_recipe_id: recipe.id, date_made: todayStr(),
        portions: leftoverParts, storage_location: leftoverLoc, use_by: '', notes: '', status: 'available',
      });
    } catch { /* ignore */ }
    setShowLeftover(false);
  };

  const addToMealPlan = async () => {
    try {
      await base44.entities.MealPlanEntry.create({
        date: todayStr(), meal_slot: 'dinner', meal_type: 'recipe',
        recipe_id: recipe.id, custom_name: recipe.name, servings: targetServ,
      });
    } catch { /* ignore */ }
  };

  if (cooking) {
    return <CookingMode recipe={recipe} stepIdx={stepIdx} setStepIdx={setStepIdx} onExit={() => setCooking(false)} />;
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onEdit}><Pencil className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => onDuplicate(recipe)}><Copy className="w-4 h-4" /></Button>
      </div>

      {recipe.photo_url && <img src={recipe.photo_url} alt={recipe.name} className="w-full h-48 object-cover rounded-3xl" />}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl font-semibold flex-1">{recipe.name}</h1>
          {recipe.favourite && <Heart className="w-5 h-5 fill-current text-primary" />}
        </div>
        {recipe.description && <p className="text-sm text-muted-foreground">{recipe.description}</p>}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          <Badge variant="secondary" className="capitalize">{recipe.category}</Badge>
          {(recipe.total_time || recipe.cook_time) > 0 && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.total_time || recipe.cook_time}m</span>}
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {defaultServ} servings</span>
          {recipe.difficulty && <span className="text-xs text-muted-foreground capitalize">{recipe.difficulty}</span>}
        </div>
      </div>

      <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
        <p className="text-sm font-medium">Servings</p>
        <div className="flex gap-1.5 flex-wrap">
          {SCALES.map((s) => (
            <Button key={s.k} size="sm" variant={scale === s.k && !customServings ? 'default' : 'outline'} className="rounded-full" onClick={() => { setScale(s.k); setCustomServings(''); }}>{s.label}</Button>
          ))}
          <Input type="number" value={customServings} onChange={(e) => setCustomServings(e.target.value)} placeholder="Custom" className="rounded-2xl w-24 h-8 text-sm" />
        </div>
        <p className="text-xs text-muted-foreground">Cooking for {targetServ}</p>
      </CardContent></Card>

      {isFeatureEnabled('kit.recipeNutrition') && recipePerServing(recipe) && (() => { const pn = recipePerServing(recipe); return (
        <Card className="rounded-3xl"><CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Per serving</p>
            <p className="font-heading text-base font-semibold">{fmtNut(pn.calories)} cal</p>
            {isFeatureEnabled('kit.macros') && <p className="text-xs text-muted-foreground">P {fmtNut(pn.protein,'g')} · C {fmtNut(pn.carbs,'g')} · F {fmtNut(pn.fat,'g')}</p>}
          </div>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setNutOpen(true)}><Salad className="w-4 h-4 mr-1" /> Nutrition</Button>
        </CardContent></Card>
      ); })()}

      {Object.entries(sections).map(([sec, ings]) => (
        <Card key={sec} className="rounded-3xl"><CardContent className="p-4 space-y-1.5">
          <p className="font-heading text-sm font-medium">{sec}</p>
          {ings.map((ing, i) => {
            const scaled = parseQty(ing.qty) * factor;
            return (
              <div key={i} className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground w-20 shrink-0">{fmtQty(scaled)} {ing.unit}</span>
                <span className="flex-1">{ing.name}{ing.prep ? `, ${ing.prep}` : ''}</span>
                {ing.optional && <span className="text-[10px] text-muted-foreground">optional</span>}
              </div>
            );
          })}
        </CardContent></Card>
      ))}

      {(recipe.instructions || []).filter((s) => s.text).length > 0 && (
        <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
          <p className="font-heading text-sm font-medium">Instructions</p>
          {(recipe.instructions || []).filter((s) => s.text).map((st, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-xs font-medium w-5 shrink-0 mt-0.5">{i + 1}.</span>
              <div className="flex-1">
                {st.title && <p className="text-sm font-medium">{st.title}</p>}
                <p className="text-sm text-muted-foreground">{st.text}</p>
                {st.duration > 0 && <p className="text-xs text-muted-foreground mt-0.5">⏱ {st.duration} min</p>}
              </div>
            </div>
          ))}
        </CardContent></Card>
      )}

      {isFeatureEnabled('kit.substitutions') && (recipe.substitutions || []).filter((s) => s.original || s.substitute).length > 0 && (
        <Card className="rounded-3xl"><CardContent className="p-4 space-y-2">
          <p className="font-heading text-sm font-medium flex items-center gap-1.5"><Repeat className="w-4 h-4" /> Substitutions</p>
          {(recipe.substitutions || []).filter((s) => s.original || s.substitute).map((s, i) => (
            <div key={i} className="border-t border-border pt-2 first:border-0 first:pt-0">
              <p className="text-sm"><span className="text-muted-foreground">{s.original}</span> → <span className="font-medium">{s.substitute}</span></p>
              {s.ratio && <p className="text-[11px] text-muted-foreground">Ratio: {s.ratio}</p>}
              {s.instructions && <p className="text-[11px] text-muted-foreground">{s.instructions}</p>}
            </div>
          ))}
        </CardContent></Card>
      )}

      {isFeatureEnabled('kit.cookingNotes') && <CookingNotesSection recipe={recipe} />}

      <div className="grid grid-cols-2 gap-2">
        {isFeatureEnabled('kit.groceryGen') && (
          <Button className="rounded-full col-span-2" onClick={() => onOpenGroceryReview([{ recipe, plannedServings: targetServ }])}>
            <ShoppingCart className="w-4 h-4 mr-1" /> Add ingredients to groceries
          </Button>
        )}
        {isFeatureEnabled('kit.mealplan') && (
          <Button variant="outline" className="rounded-full" onClick={addToMealPlan}><CalendarDays className="w-4 h-4 mr-1" /> Add to meal plan</Button>
        )}
        {isFeatureEnabled('kit.mealprep') && (
          <Button variant="outline" className="rounded-full" onClick={() => onOpenGroceryReview([{ recipe, plannedServings: targetServ, prep: { id: null } }])}><ChefHat className="w-4 h-4 mr-1" /> Add to prep</Button>
        )}
        <Button variant="outline" className="rounded-full" onClick={markCooked}><Check className="w-4 h-4 mr-1" /> Mark as cooked</Button>
        {isFeatureEnabled('kit.foodDiary') && (() => { const pn = recipePerServing(recipe); return (
          <Button variant="outline" className="rounded-full" onClick={() => setLogFood({ open: true, prefill: pn ? { name: recipe.name, perServingNut: pn, servings: 1, source_type: 'recipe', recipe_id: recipe.id } : null })}><Utensils className="w-4 h-4 mr-1" /> Log this meal</Button>
        ); })()}
        {isFeatureEnabled('kit.recipeNutrition') && (
          <Button variant="outline" className="rounded-full" onClick={() => setNutOpen(true)}><Salad className="w-4 h-4 mr-1" /> Edit nutrition</Button>
        )}
        {isFeatureEnabled('kit.cookingMode') && (recipe.instructions || []).some((s) => s.text) && (
          <Button variant="outline" className="rounded-full col-span-2" onClick={() => { setStepIdx(0); setCooking(true); }}>Start cooking mode</Button>
        )}
      </div>

      {showLeftover && (
        <Card className="rounded-3xl border-primary"><CardContent className="p-4 space-y-2">
          <p className="font-heading text-sm font-medium">Any leftovers?</p>
          <div className="flex gap-2 items-center">
            <Input type="number" value={leftoverParts} onChange={(e) => setLeftoverParts(parseInt(e.target.value) || 0)} className="rounded-2xl w-20" />
            <span className="text-sm">portions</span>
            <select value={leftoverLoc} onChange={(e) => setLeftoverLoc(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm flex-1">
              <option>Fridge</option><option>Freezer</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full flex-1" onClick={() => setShowLeftover(false)}>No leftovers</Button>
            <Button className="rounded-full flex-1" onClick={saveLeftover}>Save leftover</Button>
          </div>
        </CardContent></Card>
      )}

      {isFeatureEnabled('kit.foodDiary') && (
        <LogFoodSheet open={!!logFood.open} onOpenChange={(o) => setLogFood((p) => ({ ...p, open: o }))} prefill={logFood.prefill} />
      )}
      {isFeatureEnabled('kit.recipeNutrition') && nutOpen && (
        <RecipeNutritionSheet recipe={recipe} onSave={async (data) => { await onUpdate?.(data); setNutOpen(false); }} onClose={() => setNutOpen(false)} />
      )}
    </div>
  );
}

function CookingNotesSection({ recipe }) {
  const { items: notes, add, remove } = useCookingNotes(recipe.id);
  const [open, setOpen] = useState(false);
  const sorted = [...(notes || [])].sort((a, b) => (b.note_date || '').localeCompare(a.note_date || ''));
  const last = sorted[0];
  const nextTime = sorted.find((n) => n.next_time)?.next_time;

  return (
    <Card className="rounded-3xl"><CardContent className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm font-medium flex items-center gap-1.5"><NotebookPen className="w-4 h-4" /> Cooking notes</p>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setOpen(true)}>Add note</Button>
      </div>
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        {recipe.last_cooked && <span>Last cooked {recipe.last_cooked}</span>}
        {(recipe.cooked_count || 0) > 0 && <span>· Cooked {recipe.cooked_count}×</span>}
      </div>
      {nextTime && (
        <div className="rounded-2xl bg-accent/50 p-3">
          <p className="text-[11px] text-muted-foreground mb-0.5">Next time</p>
          <p className="text-sm">{nextTime}</p>
        </div>
      )}
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.slice(0, 3).map((n) => (
            <div key={n.id} className="border-t border-border pt-2 first:border-0 first:pt-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium flex-1">{n.note_date}</p>
                {n.rating > 0 && <div className="flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < n.rating ? 'fill-current text-amber-400' : 'text-muted-foreground'}`} />)}</div>}
                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => remove(n.id)}><Pencil className="w-2.5 h-2.5 text-muted-foreground" /></Button>
              </div>
              {n.what_worked && <p className="text-xs text-muted-foreground mt-0.5">Worked: {n.what_worked}</p>}
              {n.what_changed && <p className="text-xs text-muted-foreground">Changed: {n.what_changed}</p>}
              {n.feedback && <p className="text-xs text-muted-foreground italic">{n.feedback}</p>}
            </div>
          ))}
        </div>
      )}
      {open && <CookingNoteForm recipeId={recipe.id} onSave={async (data) => { await add(data); setOpen(false); }} onCancel={() => setOpen(false)} />}
    </CardContent></Card>
  );
}

function CookingNoteForm({ recipeId, onSave, onCancel }) {
  const [f, setF] = useState({ note_date: todayStr(), rating: 0, what_worked: '', what_changed: '', next_time: '', feedback: '', notes: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Sheet open onOpenChange={(o) => !o && onCancel()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Cooking note</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input type="date" value={f.note_date} onChange={(e) => set('note_date', e.target.value)} className="rounded-2xl" />
          <div className="flex items-center gap-1">
            <span className="text-sm w-16">Rating</span>
            {[1, 2, 3, 4, 5].map((i) => <button key={i} onClick={() => set('rating', i)}><Star className={`w-5 h-5 ${i <= f.rating ? 'fill-current text-amber-400' : 'text-muted-foreground'}`} /></button>)}
          </div>
          <Textarea value={f.what_worked} onChange={(e) => set('what_worked', e.target.value)} placeholder="What worked" className="rounded-2xl" />
          <Textarea value={f.what_changed} onChange={(e) => set('what_changed', e.target.value)} placeholder="What I changed" className="rounded-2xl" />
          <Textarea value={f.next_time} onChange={(e) => set('next_time', e.target.value)} placeholder="What I'd change next time" className="rounded-2xl" />
          <Textarea value={f.feedback} onChange={(e) => set('feedback', e.target.value)} placeholder="Household / family feedback" className="rounded-2xl" />
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={() => onSave({ ...f, recipe_id: recipeId })}>Save note</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}