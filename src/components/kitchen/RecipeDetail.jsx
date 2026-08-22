import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft, Heart, Clock, Users, ShoppingCart, CalendarDays, ChefHat, Copy,
  Pencil, Repeat, NotebookPen, Star, Utensils, Flame, Hourglass,
  Timer, MoreHorizontal, Plus, Trash2,
} from 'lucide-react';
import { useAppSettings } from '@/lib/AppSettings';
import { todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { useCookingNotes } from '@/hooks/useKitchen';
import CookingMode from '@/components/kitchen/CookingMode';
import LogFoodSheet from '@/components/kitchen/nutrition/LogFoodSheet';
import RecipeNutritionSheet from '@/components/kitchen/nutrition/RecipeNutritionSheet';
import RecipePhoto from '@/components/kitchen/ui/RecipePhoto';
import { recipePerServing, fmtNut } from '@/lib/nutrition';
import { cn } from '@/lib/utils';

function parseQty(q) {
  if (typeof q === 'number') return q;
  if (!q) return 0;
  const s = String(q).trim();
  const f = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (f) return parseInt(f[1]) / parseInt(f[2]);
  const m = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (m) return parseInt(m[1]) + parseInt(m[2]) / parseInt(m[3]);
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function fmtQty(n) {
  if (!n) return '0';
  if (Number.isInteger(n)) return String(n);
  const ds = [2, 3, 4, 8, 16];
  for (const d of ds) {
    const w = Math.floor(n);
    const r = n - w;
    const num = Math.round(r * d);
    if (Math.abs(num / d - r) < 0.01 && num > 0) {
      return w > 0 ? `${w} ${num}/${d}` : `${num}/${d}`;
    }
  }
  return String(Math.round(n * 100) / 100);
}

const SCALES = [
  { k: 0.5, label: '½×' },
  { k: 1, label: '1×' },
  { k: 1.5, label: '1.5×' },
  { k: 2, label: '2×' },
];

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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [noteForm, setNoteForm] = useState(false);

  const defaultServ = recipe.default_servings || 1;
  const targetServ = customServings ? parseInt(customServings) : Math.round(defaultServ * scale);
  const factor = targetServ / defaultServ;

  const sections = {};
  (recipe.ingredients || []).forEach((ing) => {
    const sec = ing.section || 'Ingredients';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(ing);
  });

  const pn = recipePerServing(recipe);
  const showMacros = isFeatureEnabled('kit.macros');
  const steps = (recipe.instructions || []).filter((s) => s.text);
  const hasSubs = isFeatureEnabled('kit.substitutions') && (recipe.substitutions || []).filter((s) => s.original || s.substitute).length > 0;

  const markCooked = async () => {
    try {
      await base44.entities.Recipe.update(recipe.id, { last_cooked: todayStr(), cooked_count: (recipe.cooked_count || 0) + 1 });
      onUpdate?.({ last_cooked: todayStr(), cooked_count: (recipe.cooked_count || 0) + 1 });
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

  const prep = recipe.prep_time || 0;
  const cook = recipe.cook_time || 0;
  const rest = recipe.rest_time || 0;
  const total = recipe.total_time || (prep + cook + rest);

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="More actions">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(recipe)}>
              <Copy className="w-4 h-4 mr-2" /> Duplicate
            </DropdownMenuItem>
            {isFeatureEnabled('kit.cookingNotes') ? (
              <DropdownMenuItem onClick={() => setNoteForm(true)}>
                <NotebookPen className="w-4 h-4 mr-2" /> Add cooking note
              </DropdownMenuItem>
            ) : null}
            {isFeatureEnabled('kit.cookingNotes') ? (
              <DropdownMenuItem onClick={() => setHistoryOpen(true)}>
                <Clock className="w-4 h-4 mr-2" /> Cooking history
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Hero image */}
      <div className="rounded-3xl overflow-hidden">
        <RecipePhoto recipe={recipe} height="h-56 sm:h-64 lg:h-72" className="rounded-3xl" />
      </div>

      {/* Title + description */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold flex-1 leading-tight">{recipe.name}</h1>
          {recipe.favourite ? <Heart className="w-5 h-5 fill-current text-primary shrink-0 mt-1" /> : null}
        </div>
        {recipe.description ? <p className="text-sm text-muted-foreground leading-relaxed">{recipe.description}</p> : null}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        {prep > 0 ? <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Prep {prep}m</span> : null}
        {cook > 0 ? <span className="inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> Cook {cook}m</span> : null}
        {rest > 0 ? <span className="inline-flex items-center gap-1"><Hourglass className="w-3.5 h-3.5" /> Rest {rest}m</span> : null}
        {total > 0 ? <span className="font-medium text-foreground">{total}m total</span> : null}
        <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {defaultServ} servings</span>
        {recipe.difficulty && recipe.difficulty !== 'custom' ? <span className="capitalize">{recipe.difficulty}</span> : null}
        {(recipe.tags || []).slice(0, 3).map((t) => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary">{t}</span>
        ))}
      </div>

      {/* Serving scaler */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Servings</p>
          <p className="text-xs text-muted-foreground">Cooking for {targetServ}</p>
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {SCALES.map((s) => (
            <button
              key={s.k}
              onClick={() => { setScale(s.k); setCustomServings(''); }}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-sm transition',
                scale === s.k && !customServings ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
          <Input
            type="number"
            value={customServings}
            onChange={(e) => setCustomServings(e.target.value)}
            placeholder="Custom"
            className="rounded-full w-24 h-8 text-sm"
          />
        </div>
      </div>

      {/* Nutrition per serving (compact) */}
      {isFeatureEnabled('kit.recipeNutrition') && pn ? (
        <div className="rounded-2xl bg-secondary/30 p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nutrition per serving</p>
          <div className="flex items-baseline gap-4 mt-1 flex-wrap">
            <p className="font-heading text-xl font-semibold">
              {fmtNut(pn.calories)} <span className="text-xs font-normal text-muted-foreground">cal</span>
            </p>
            {showMacros ? (
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>{fmtNut(pn.protein, 'g')} protein</span>
                <span>{fmtNut(pn.carbs, 'g')} carbs</span>
                <span>{fmtNut(pn.fat, 'g')} fat</span>
              </div>
            ) : null}
          </div>
          <button className="text-[11px] text-primary mt-1.5" onClick={() => setNutOpen(true)}>More nutrition</button>
        </div>
      ) : null}

      {/* Action hierarchy */}
      <div className="space-y-2">
        {isFeatureEnabled('kit.cookingMode') && steps.length > 0 ? (
          <Button className="rounded-full w-full" size="lg" onClick={() => { setStepIdx(0); setCooking(true); }}>
            <ChefHat className="w-5 h-5 mr-2" /> Start Cooking
          </Button>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          {isFeatureEnabled('kit.mealplan') ? (
            <Button variant="outline" className="rounded-full" onClick={addToMealPlan}>
              <CalendarDays className="w-4 h-4 mr-1.5" /> Add to Plan
            </Button>
          ) : null}
          {isFeatureEnabled('kit.groceryGen') ? (
            <Button variant="outline" className="rounded-full" onClick={() => onOpenGroceryReview([{ recipe, plannedServings: targetServ }])}>
              <ShoppingCart className="w-4 h-4 mr-1.5" /> Add Ingredients
            </Button>
          ) : null}
          {isFeatureEnabled('kit.mealprep') ? (
            <Button variant="outline" className="rounded-full" onClick={() => onOpenGroceryReview([{ recipe, plannedServings: targetServ, prep: { id: null } }])}>
              <ChefHat className="w-4 h-4 mr-1.5" /> Add to Prep
            </Button>
          ) : null}
          {isFeatureEnabled('kit.foodDiary') ? (
            <Button variant="outline" className="rounded-full" onClick={() => setLogFood({ open: true, prefill: pn ? { name: recipe.name, perServingNut: pn, servings: 1, source_type: 'recipe', recipe_id: recipe.id } : null })}>
              <Utensils className="w-4 h-4 mr-1.5" /> Log This Meal
            </Button>
          ) : null}
        </div>
      </div>

      {/* Editorial layout: ingredients + instructions */}
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* Ingredients (left column) */}
        <div className="space-y-4">
          <p className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ingredients</p>
          {Object.entries(sections).map(([sec, ings]) => (
            <div key={sec}>
              {sec !== 'Ingredients' ? (
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2 mt-3 first:mt-0">{sec}</p>
              ) : null}
              <div className="space-y-1">
                {ings.map((ing, i) => {
                  const scaled = parseQty(ing.qty) * factor;
                  return (
                    <div key={i} className="flex items-baseline gap-2 text-sm py-1">
                      <span className="text-muted-foreground w-16 shrink-0 text-right tabular-nums">{fmtQty(scaled)} {ing.unit}</span>
                      <span className={cn('flex-1', ing.optional && 'text-muted-foreground')}>
                        {ing.name}{ing.prep ? `, ${ing.prep}` : ''}
                      </span>
                      {ing.optional ? <span className="text-[10px] text-muted-foreground/60 italic">opt</span> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions (right column) */}
        {steps.length > 0 ? (
          <div className="space-y-1 mt-6 lg:mt-0">
            <p className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Instructions</p>
            {steps.map((st, i) => (
              <div key={i} className="flex gap-3 py-3 border-b border-border/30 last:border-0">
                <span className="font-heading text-2xl font-semibold text-primary/25 shrink-0 w-10 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  {st.title ? <p className="font-heading text-sm font-semibold mb-1">{st.title}</p> : null}
                  <p className="text-sm text-muted-foreground leading-relaxed">{st.text}</p>
                  {st.duration > 0 ? (
                    <button className="inline-flex items-center gap-1.5 text-xs text-primary mt-2.5 px-3 py-1.5 rounded-full bg-primary/5">
                      <Timer className="w-3.5 h-3.5" /> Start {st.duration}-minute timer
                    </button>
                  ) : null}
                  {st.notes ? <p className="text-[11px] text-muted-foreground italic mt-2">{st.notes}</p> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Substitutions */}
      {hasSubs ? (
        <div className="space-y-2">
          <p className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Repeat className="w-4 h-4" /> Substitutions
          </p>
          <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2.5">
            {(recipe.substitutions || []).filter((s) => s.original || s.substitute).map((s, i) => (
              <div key={i} className="py-2 border-b border-border/30 last:border-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">{s.original}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-sm font-medium">{s.substitute}</span>
                </div>
                {s.ratio ? <p className="text-[11px] text-muted-foreground mt-1">Ratio: {s.ratio}</p> : null}
                {s.instructions ? <p className="text-[11px] text-muted-foreground mt-0.5">{s.instructions}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Cooking notes */}
      {isFeatureEnabled('kit.cookingNotes') ? (
        <CookingNotesSection recipe={recipe} onAddNote={() => setNoteForm(true)} historyOpen={() => setHistoryOpen(true)} />
      ) : null}

      {/* Recipe history summary */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
        {recipe.last_cooked ? <span>Last cooked {fmtDate(recipe.last_cooked)}</span> : null}
        {(recipe.cooked_count || 0) > 0 ? <span>· Cooked {recipe.cooked_count}×</span> : null}
        {recipe.rating > 0 ? <span>· {recipe.rating}★</span> : null}
        {recipe.source ? <span>· From {recipe.source}</span> : null}
      </div>

      {/* Leftover sheet */}
      <Sheet open={showLeftover} onOpenChange={setShowLeftover}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8">
          <SheetHeader className="text-center">
            <SheetTitle className="font-heading">Any leftovers?</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground text-center">Save them for easy meal planning later.</p>
            <div className="flex gap-2 items-center">
              <Input type="number" value={leftoverParts} onChange={(e) => setLeftoverParts(parseInt(e.target.value) || 0)} className="rounded-2xl w-20" />
              <span className="text-sm">portions</span>
              <select value={leftoverLoc} onChange={(e) => setLeftoverLoc(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm flex-1">
                <option>Fridge</option>
                <option>Freezer</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="rounded-full flex-1" onClick={() => setShowLeftover(false)}>No leftovers</Button>
              <Button className="rounded-full flex-1" onClick={saveLeftover}>Save leftover</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Other sheets */}
      {isFeatureEnabled('kit.foodDiary') ? (
        <LogFoodSheet open={!!logFood.open} onOpenChange={(o) => setLogFood((p) => ({ ...p, open: o }))} prefill={logFood.prefill} />
      ) : null}
      {isFeatureEnabled('kit.recipeNutrition') && nutOpen ? (
        <RecipeNutritionSheet recipe={recipe} onSave={async (data) => { await onUpdate?.(data); setNutOpen(false); }} onClose={() => setNutOpen(false)} />
      ) : null}
      {isFeatureEnabled('kit.cookingNotes') && noteForm ? (
        <CookingNoteForm recipeId={recipe.id} onSave={() => setNoteForm(false)} onCancel={() => setNoteForm(false)} />
      ) : null}
      {isFeatureEnabled('kit.cookingNotes') && historyOpen ? (
        <RecipeHistorySheet recipe={recipe} onClose={() => setHistoryOpen(false)} />
      ) : null}
    </div>
  );
}

function CookingNotesSection({ recipe, onAddNote, historyOpen }) {
  const { items: notes } = useCookingNotes(recipe.id);
  const sorted = [...(notes || [])].sort((a, b) => (b.note_date || '').localeCompare(a.note_date || ''));
  const nextTime = sorted.find((n) => n.next_time)?.next_time;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <NotebookPen className="w-4 h-4" /> Cooking Notes
        </p>
        <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={onAddNote}>
          <Plus className="w-3 h-3 mr-0.5" /> Add
        </Button>
      </div>

      {nextTime ? (
        <div className="rounded-2xl bg-accent/40 p-4 border-l-2 border-primary/30">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Next time</p>
          <p className="text-sm italic">"{nextTime}"</p>
        </div>
      ) : null}

      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.slice(0, 2).map((n) => (
            <div key={n.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">{fmtDate(n.note_date)}</p>
                {n.rating > 0 ? (
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={cn('w-3 h-3', i < n.rating ? 'fill-current text-amber-400' : 'text-muted-foreground/30')} />
                    ))}
                  </div>
                ) : null}
              </div>
              {n.feedback ? <p className="text-sm italic">"{n.feedback}"</p> : null}
              {n.what_changed ? <p className="text-[11px] text-muted-foreground">Changed: {n.what_changed}</p> : null}
            </div>
          ))}
          {sorted.length > 2 ? (
            <button className="text-xs text-primary" onClick={historyOpen}>View cooking history ({sorted.length})</button>
          ) : null}
        </div>
      ) : !nextTime ? (
        <p className="text-xs text-muted-foreground">No notes yet — add one after cooking to remember what worked.</p>
      ) : null}
    </div>
  );
}

function CookingNoteForm({ recipeId, onSave, onCancel }) {
  const [f, setF] = useState({ note_date: todayStr(), rating: 0, what_worked: '', what_changed: '', next_time: '', feedback: '', notes: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const save = async () => {
    try {
      await base44.entities.RecipeCookingNote.create({ ...f, recipe_id: recipeId });
    } catch { /* ignore */ }
    onSave();
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onCancel()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center">
          <SheetTitle className="font-heading">Cooking note</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 mt-4">
          <Input type="date" value={f.note_date} onChange={(e) => set('note_date', e.target.value)} className="rounded-2xl" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground mr-2">Rating</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => set('rating', i)}>
                <Star className={cn('w-5 h-5', i <= f.rating ? 'fill-current text-amber-400' : 'text-muted-foreground/30')} />
              </button>
            ))}
          </div>
          <Textarea value={f.what_worked} onChange={(e) => set('what_worked', e.target.value)} placeholder="What worked" className="rounded-2xl" />
          <Textarea value={f.what_changed} onChange={(e) => set('what_changed', e.target.value)} placeholder="What I changed" className="rounded-2xl" />
          <Textarea value={f.next_time} onChange={(e) => set('next_time', e.target.value)} placeholder="What I'd change next time" className="rounded-2xl" />
          <Textarea value={f.feedback} onChange={(e) => set('feedback', e.target.value)} placeholder="Household / family feedback" className="rounded-2xl" />
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={save}>Save note</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function RecipeHistorySheet({ recipe, onClose }) {
  const { items: notes, remove } = useCookingNotes(recipe.id);
  const sorted = [...(notes || [])].sort((a, b) => (b.note_date || '').localeCompare(a.note_date || ''));

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center">
          <SheetTitle className="font-heading">Cooking history</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center">
            {recipe.last_cooked ? <span>Last cooked {fmtDate(recipe.last_cooked)}</span> : null}
            {(recipe.cooked_count || 0) > 0 ? <span>· Cooked {recipe.cooked_count}×</span> : null}
          </div>
          {sorted.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No cooking notes yet.</p>
          ) : (
            <div className="space-y-3">
              {sorted.map((n) => (
                <div key={n.id} className="rounded-2xl border border-border/40 bg-card p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium">{fmtDate(n.note_date)}</p>
                    {n.rating > 0 ? (
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={cn('w-3 h-3', i < n.rating ? 'fill-current text-amber-400' : 'text-muted-foreground/30')} />
                        ))}
                      </div>
                    ) : null}
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(n.id)}>
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                  {n.what_worked ? <p className="text-xs text-muted-foreground">Worked: {n.what_worked}</p> : null}
                  {n.what_changed ? <p className="text-xs text-muted-foreground">Changed: {n.what_changed}</p> : null}
                  {n.next_time ? <p className="text-xs text-muted-foreground">Next time: {n.next_time}</p> : null}
                  {n.feedback ? <p className="text-sm italic mt-1">"{n.feedback}"</p> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}