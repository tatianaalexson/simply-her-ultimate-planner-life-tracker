import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Clock, Heart, Utensils, ChevronRight, ChefHat, Package } from 'lucide-react';
import { useSavedFoods, useRecentFoods } from '@/hooks/useNutrition';
import { useRecipes, useMealPrepSessions, useLeftovers } from '@/hooks/useKitchen';
import {
  recipePerServing, savedFoodPerServing, scaleNutrition, fmtNut,
  MACRO_FIELDS, OPTIONAL_NUTRIENTS,
} from '@/lib/nutrition';
import { todayStr } from '@/components/kitchen/kitchenConstants';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const SLOTS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snack' },
];

const round1 = (v) => Math.round((+v || 0) * 10) / 10;

function defaultSlot() {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 15) return 'lunch';
  if (h < 17) return 'snack';
  return 'dinner';
}

export default function LogFoodSheet({ open, onOpenChange, prefill }) {
  const { isFeatureEnabled } = useAppSettings();
  const { toast } = useToast();
  const showMacros = isFeatureEnabled('kit.macros');
  const moreNutrients = isFeatureEnabled('kit.moreNutrients');
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (prefill) {
      setConfirm({
        name: prefill.name || 'Food',
        perServingNut: prefill.perServingNut || { calories: 0, protein: 0, carbs: 0, fat: 0 },
        servings: prefill.servings ?? 1,
        slot: prefill.slot || defaultSlot(),
        date: prefill.date || todayStr(),
        source_type: prefill.source_type || 'manual',
        recipe_id: prefill.recipe_id,
        saved_food_id: prefill.saved_food_id,
        prep_session_id: prefill.prep_session_id,
        leftover_id: prefill.leftover_id,
      });
    } else {
      setConfirm(null);
    }
  }, [open, prefill]);

  const log = async () => {
    if (!confirm) return;
    const servings = Math.max(0, parseFloat(confirm.servings) || 0);
    const nut = scaleNutrition(confirm.perServingNut, servings) || {};
    const payload = {
      name: confirm.name || 'Food',
      calories: Math.round(nut.calories || 0),
      protein: round1(nut.protein),
      carbs: round1(nut.carbs),
      fat: round1(nut.fat),
      fibre: round1(nut.fibre),
      sugar: round1(nut.sugar),
      sodium: Math.round(nut.sodium || 0),
      saturated_fat: round1(nut.saturated_fat),
      log_date: confirm.date || todayStr(),
      meal_slot: confirm.slot || 'snack',
      servings,
      source_type: confirm.source_type || 'manual',
    };
    ['recipe_id', 'saved_food_id', 'prep_session_id', 'leftover_id'].forEach((k) => {
      if (confirm[k]) payload[k] = confirm[k];
    });
    setBusy(true);
    try {
      await base44.entities.NutritionEntry.create(payload);
      toast({ title: 'Logged', description: `${payload.name} · ${payload.meal_slot}` });
      onOpenChange(false);
      setConfirm(null);
    } catch {
      toast({ title: 'Could not log', variant: 'destructive' });
    }
    setBusy(false);
  };

  const scaled = confirm ? scaleNutrition(confirm.perServingNut, parseFloat(confirm.servings) || 0) : null;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) setConfirm(null); onOpenChange(o); }}>
      <SheetContent side="bottom" className="rounded-t-3xl pt-4 pb-8 max-h-[92vh] overflow-y-auto">
        <SheetHeader className="text-center">
          <SheetTitle className="font-heading">{confirm ? 'Confirm & log' : 'Log food'}</SheetTitle>
        </SheetHeader>

        {confirm ? (
          <ConfirmForm confirm={confirm} setConfirm={setConfirm} scaled={scaled} showMacros={showMacros} moreNutrients={moreNutrients} busy={busy} onLog={log} onCancel={() => setConfirm(null)} />
        ) : (
          <Picker showMacros={showMacros} onPick={(c) => setConfirm({ ...c, slot: defaultSlot(), date: todayStr() })} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ConfirmForm({ confirm, setConfirm, scaled, showMacros, moreNutrients, busy, onLog, onCancel }) {
  const set = (k, v) => setConfirm((p) => ({ ...p, [k]: v }));
  return (
    <div className="mt-4 space-y-3">
      <Input value={confirm.name} onChange={(e) => set('name', e.target.value)} placeholder="Food name" className="rounded-2xl" />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] text-muted-foreground">Servings</label>
          <Input type="number" step="0.25" value={confirm.servings} onChange={(e) => set('servings', e.target.value)} className="rounded-2xl" />
        </div>
        <div>
          <label className="text-[11px] text-muted-foreground">Date</label>
          <Input type="date" value={confirm.date} onChange={(e) => set('date', e.target.value)} className="rounded-2xl" />
        </div>
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground mb-1.5">Meal</p>
        <div className="flex gap-1.5 flex-wrap">
          {SLOTS.map((s) => (
            <button key={s.id} onClick={() => set('slot', s.id)}
              className={cn('text-xs px-3 py-1.5 rounded-full transition',
                confirm.slot === s.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-secondary/40 p-3 space-y-1">
        <p className="text-[11px] text-muted-foreground">This log</p>
        <p className="font-heading text-lg font-semibold">{fmtNut(scaled?.calories)} <span className="text-xs font-normal text-muted-foreground">cal</span></p>
        {showMacros && (
          <p className="text-xs text-muted-foreground">{MACRO_FIELDS.map((m) => `${m.label} ${fmtNut(scaled?.[m.key], m.unit)}`).join(' · ')}</p>
        )}
        {moreNutrients && (
          <p className="text-[11px] text-muted-foreground">{OPTIONAL_NUTRIENTS.slice(0, 4).map((m) => `${m.label} ${fmtNut(scaled?.[m.key], m.unit)}`).join(' · ')}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="rounded-full flex-1" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button className="rounded-full flex-1" onClick={onLog} disabled={busy}>Add to diary</Button>
      </div>
    </div>
  );
}

function Picker({ showMacros, onPick }) {
  const [tab, setTab] = useState('recent');
  const [q, setQ] = useState('');
  const tabs = [
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'favourites', label: 'Favourites', icon: Heart },
    { id: 'recipes', label: 'Recipes', icon: Utensils },
    { id: 'saved', label: 'Saved Foods', icon: Package },
    { id: 'mealprep', label: 'Meal Prep', icon: ChefHat },
    { id: 'leftovers', label: 'Leftovers', icon: Utensils },
    { id: 'custom', label: 'Custom', icon: Plus },
  ];
  return (
    <div className="mt-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods…" className="rounded-2xl pl-9" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-1 text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition',
              tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'recent' && <RecentList onPick={onPick} showMacros={showMacros} q={q} />}
      {tab === 'favourites' && <FavouritesList onPick={onPick} showMacros={showMacros} q={q} />}
      {tab === 'recipes' && <RecipeList onPick={onPick} q={q} />}
      {tab === 'saved' && <SavedList onPick={onPick} q={q} />}
      {tab === 'mealprep' && <MealPrepList onPick={onPick} q={q} />}
      {tab === 'leftovers' && <LeftoverList onPick={onPick} q={q} />}
      {tab === 'custom' && <CustomEntry onPick={onPick} showMacros={showMacros} />}
    </div>
  );
}

function Row({ name, sub, onPick }) {
  return (
    <button onClick={onPick} className="w-full flex items-center justify-between gap-2 rounded-2xl border border-border/60 bg-card p-3 active:scale-[0.98] transition text-left">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </button>
  );
}

function matchQ(name, q) {
  if (!q) return true;
  return name?.toLowerCase().includes(q.toLowerCase());
}

function RecentList({ onPick, showMacros, q }) {
  const { items } = useRecentFoods();
  const dedup = [];
  const seen = new Set();
  (items || []).forEach((e) => {
    const key = (e.name || '').toLowerCase().trim();
    if (!key || seen.has(key) || !matchQ(e.name, q)) return;
    seen.add(key);
    dedup.push(e);
  });
  const list = dedup.slice(0, 15);
  if (list.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">{q ? 'No matches.' : 'No recent foods yet.'}</p>;
  return (
    <div className="space-y-2">
      {list.map((e) => (
        <Row key={e.id} name={e.name}
          sub={`${fmtNut(e.calories)} cal${showMacros ? ` · P ${fmtNut(e.protein, 'g')} · C ${fmtNut(e.carbs, 'g')} · F ${fmtNut(e.fat, 'g')}` : ''}`}
          onPick={() => onPick({
            name: e.name,
            perServingNut: { calories: e.calories, protein: e.protein, carbs: e.carbs, fat: e.fat, fibre: e.fibre, sugar: e.sugar, sodium: e.sodium, saturated_fat: e.saturated_fat },
            servings: 1, source_type: 'manual',
          })}
        />
      ))}
    </div>
  );
}

function FavouritesList({ onPick, showMacros, q }) {
  const { items: foods } = useSavedFoods();
  const { items: recipes } = useRecipes();
  const favFoods = (foods || []).filter((f) => f.favourite && matchQ(f.name, q));
  const favRecipes = (recipes || []).filter((r) => r.favourite && recipePerServing(r) && matchQ(r.name, q));
  if (favFoods.length === 0 && favRecipes.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">{q ? 'No matches.' : 'No favourites yet — star foods or recipes to pin them here.'}</p>;
  return (
    <div className="space-y-2">
      {favFoods.map((f) => (
        <Row key={f.id} name={f.name} sub={`${fmtNut(f.calories)} cal · ${f.serving_size} ${f.serving_unit || ''}`}
          onPick={() => onPick({ name: f.name, perServingNut: savedFoodPerServing(f), servings: 1, source_type: 'saved_food', saved_food_id: f.id })}
        />
      ))}
      {favRecipes.map((r) => {
        const nut = recipePerServing(r);
        return <Row key={r.id} name={r.name} sub={`${fmtNut(nut.calories)} cal / serving`}
          onPick={() => onPick({ name: r.name, perServingNut: nut, servings: 1, source_type: 'recipe', recipe_id: r.id })}
        />;
      })}
    </div>
  );
}

function SavedList({ onPick, q }) {
  const { items } = useSavedFoods();
  const list = (items || []).filter((f) => matchQ(f.name, q));
  if (list.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">{q ? 'No matches.' : 'No saved foods yet — add one in Foods.'}</p>;
  return (
    <div className="space-y-2">
      {list.map((f) => (
        <Row key={f.id} name={f.name} sub={`${fmtNut(f.calories)} cal · ${f.serving_size} ${f.serving_unit || ''}`}
          onPick={() => onPick({ name: f.name, perServingNut: savedFoodPerServing(f), servings: 1, source_type: 'saved_food', saved_food_id: f.id })}
        />
      ))}
    </div>
  );
}

function RecipeList({ onPick, q }) {
  const { items: recipes } = useRecipes();
  const list = (recipes || []).filter((r) => recipePerServing(r) && matchQ(r.name, q));
  if (list.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">{q ? 'No matches.' : 'No recipes with nutrition yet — add nutrition on a recipe.'}</p>;
  return (
    <div className="space-y-2">
      {list.map((r) => {
        const nut = recipePerServing(r);
        return <Row key={r.id} name={r.name} sub={`${fmtNut(nut.calories)} cal / serving`}
          onPick={() => onPick({ name: r.name, perServingNut: nut, servings: 1, source_type: 'recipe', recipe_id: r.id })}
        />;
      })}
    </div>
  );
}

function MealPrepList({ onPick, q }) {
  const { items: sessions } = useMealPrepSessions();
  const { items: recipes } = useRecipes();
  const active = (sessions || []).filter((s) => s.status !== 'completed' || (s.items || []).some((it) => it.recipe_id));
  const list = active.filter((s) => matchQ(s.name, q) || (s.items || []).some((it) => {
    const r = recipes.find((r) => r.id === it.recipe_id);
    return r && matchQ(r.name, q);
  }));
  if (list.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">{q ? 'No matches.' : 'No meal prep sessions with recipes yet.'}</p>;
  return (
    <div className="space-y-2">
      {list.flatMap((s) =>
        (s.items || []).filter((it) => it.recipe_id).map((it, i) => {
          const r = recipes.find((r) => r.id === it.recipe_id);
          if (!r) return null;
          const nut = recipePerServing(r);
          if (!nut) return null;
          return (
            <Row key={`${s.id}-${i}`} name={r.name} sub={`${fmtNut(nut.calories)} cal / serving · ${s.name}`}
              onPick={() => onPick({ name: r.name, perServingNut: nut, servings: 1, source_type: 'meal_prep', prep_session_id: s.id })}
            />
          );
        }).filter(Boolean)
      )}
    </div>
  );
}

function LeftoverList({ onPick, q }) {
  const { items: leftovers } = useLeftovers();
  const { items: recipes } = useRecipes();
  const list = (leftovers || []).filter((l) => l.status === 'available' && matchQ(l.name, q));
  if (list.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">{q ? 'No matches.' : 'No available leftovers.'}</p>;
  return (
    <div className="space-y-2">
      {list.map((l) => {
        const rec = l.source_recipe_id ? recipes.find((r) => r.id === l.source_recipe_id) : null;
        const nut = rec ? recipePerServing(rec) : null;
        return (
          <Row key={l.id} name={l.name} sub={nut ? `${fmtNut(nut.calories)} cal / serving` : 'Log manually'}
            onPick={() => onPick({
              name: l.name,
              perServingNut: nut || { calories: 0, protein: 0, carbs: 0, fat: 0 },
              servings: 1,
              source_type: 'leftover',
              leftover_id: l.id,
            })}
          />
        );
      })}
    </div>
  );
}

function CustomEntry({ onPick, showMacros }) {
  const [f, setF] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const valid = f.name.trim() && (f.calories || f.protein || f.carbs || f.fat);
  return (
    <div className="space-y-2">
      <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Food name" className="rounded-2xl" autoFocus />
      <div className="grid grid-cols-4 gap-2">
        <Input type="number" value={f.calories} onChange={(e) => set('calories', e.target.value)} placeholder="cal" className="rounded-2xl" />
        {showMacros && <>
          <Input type="number" value={f.protein} onChange={(e) => set('protein', e.target.value)} placeholder="P g" className="rounded-2xl" />
          <Input type="number" value={f.carbs} onChange={(e) => set('carbs', e.target.value)} placeholder="C g" className="rounded-2xl" />
          <Input type="number" value={f.fat} onChange={(e) => set('fat', e.target.value)} placeholder="F g" className="rounded-2xl" />
        </>}
      </div>
      <Button className="rounded-full w-full" disabled={!valid}
        onClick={() => onPick({
          name: f.name,
          perServingNut: { calories: +f.calories || 0, protein: +f.protein || 0, carbs: +f.carbs || 0, fat: +f.fat || 0 },
          servings: 1, source_type: 'custom',
        })}>
        Continue
      </Button>
    </div>
  );
}