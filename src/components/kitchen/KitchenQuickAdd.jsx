import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, CalendarDays, ShoppingCart, Box, Refrigerator, Snowflake, ChefHat, Utensils, Soup, ArrowRight, PartyPopper } from 'lucide-react';
import { GROCERY_CATEGORIES, todayStr } from '@/components/kitchen/kitchenConstants';

// Quick Add — simple actions are created inline; complex ones (full recipe,
// meal prep session, equipment detail) navigate to the full creation screen.
export default function KitchenQuickAdd({ open, onOpenChange, onNavigate, onLogFood }) {
  const { isFeatureEnabled } = useAppSettings();
  const [inline, setInline] = useState(null); // 'grocery' | 'meal' | 'pantry' | 'fridge' | 'freezer' | 'leftover'

  const close = () => { setInline(null); onOpenChange(false); };

  const complex = [
    { id: 'recipes', label: 'Add Recipe', icon: BookOpen, view: 'recipes', enabled: isFeatureEnabled('kit.recipes') },
    { id: 'mealprep', label: 'Start Meal Prep', icon: ChefHat, view: 'mealprep', enabled: isFeatureEnabled('kit.mealprep') },
    { id: 'equipment', label: 'Add Kitchen Item', icon: Soup, view: 'equipment', enabled: isFeatureEnabled('kit.equipment') },
    { id: 'occasions', label: 'Plan an Occasion', icon: PartyPopper, view: 'occasions', enabled: isFeatureEnabled('kit.occasionPlan') },
    { id: 'logfood', label: 'Log Food', icon: Utensils, view: null, onLog: true, enabled: isFeatureEnabled('kit.foodDiary') },
  ].filter((a) => a.enabled);

  const simple = [
    { id: 'grocery', label: 'Add Grocery', icon: ShoppingCart, enabled: isFeatureEnabled('kit.grocery') },
    { id: 'meal', label: 'Plan a Meal', icon: CalendarDays, enabled: isFeatureEnabled('kit.mealplan') },
    { id: 'pantry', label: 'Add Pantry', icon: Box, enabled: isFeatureEnabled('kit.pantry') },
    { id: 'fridge', label: 'Add Fridge', icon: Refrigerator, enabled: isFeatureEnabled('kit.fridge') },
    { id: 'freezer', label: 'Add Freezer', icon: Snowflake, enabled: isFeatureEnabled('kit.freezer') },
    { id: 'leftover', label: 'Add Leftover', icon: Utensils, enabled: isFeatureEnabled('kit.leftovers') },
  ].filter((a) => a.enabled);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) setInline(null); onOpenChange(o); }}>
      <SheetContent side="bottom" className="rounded-t-3xl pt-4 pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Quick Add</SheetTitle></SheetHeader>
        {!inline ? (
          <div className="mt-4 space-y-3">
            {simple.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {simple.map((a) => (
                  <button key={a.id} onClick={() => setInline(a.id)} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 active:scale-95 transition">
                    <a.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                    <span className="text-xs text-center">{a.label}</span>
                  </button>
                ))}
              </div>
            )}
            {complex.length > 0 && (
              <>
                <p className="text-[11px] text-muted-foreground px-1">Full creation</p>
                <div className="space-y-2">
                  {complex.map((a) => (
                    <button key={a.id} onClick={() => { onOpenChange(false); if (a.onLog) { onLogFood?.(); } else { onNavigate(a.view); } }} className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 active:scale-[0.98] transition">
                      <a.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      <span className="text-sm flex-1 text-left">{a.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <InlineForm kind={inline} onClose={() => setInline(null)} onDone={close} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function InlineForm({ kind, onClose, onDone }) {
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const cfg = {
    grocery: { title: 'Add grocery item', create: async () => base44.entities.GroceryItem.create({ list_name: f.list_name || 'Weekly Groceries', name: f.name, normalized_name: f.name?.toLowerCase(), category: f.category || 'Other', qty: f.qty || '1', unit: f.unit || '', checked: false }) },
    meal: { title: 'Plan a meal', create: async () => base44.entities.MealPlanEntry.create({ date: f.date || todayStr(), meal_slot: f.slot || 'dinner', meal_type: 'custom', custom_name: f.name, servings: parseInt(f.servings) || 1 }) },
    pantry: { title: 'Add pantry item', create: async () => base44.entities.FoodInventoryItem.create({ name: f.name, normalized_name: f.name?.toLowerCase(), zone: 'pantry', qty: f.qty || '1', unit: f.unit || '', status: 'available', date_purchased: todayStr() }) },
    fridge: { title: 'Add fridge item', create: async () => base44.entities.FoodInventoryItem.create({ name: f.name, normalized_name: f.name?.toLowerCase(), zone: 'fridge', qty: f.qty || '1', unit: f.unit || '', status: 'available', date_purchased: todayStr() }) },
    freezer: { title: 'Add freezer item', create: async () => base44.entities.FoodInventoryItem.create({ name: f.name, normalized_name: f.name?.toLowerCase(), zone: 'freezer', qty: f.qty || '1', unit: f.unit || '', status: 'available', date_purchased: todayStr() }) },
    leftover: { title: 'Add leftover', create: async () => base44.entities.Leftover.create({ name: f.name, date_made: todayStr(), portions: parseInt(f.portions) || 1, storage_location: f.storage || 'Fridge', use_by: f.use_by || '', status: 'available' }) },
  }[kind];

  const submit = async () => {
    if (!f.name?.trim()) return;
    setBusy(true);
    try { await cfg.create(); } catch { /* ignore */ }
    setBusy(false);
    onDone();
  };

  return (
    <div className="mt-4 space-y-3">
      <p className="font-heading text-sm font-medium text-center">{cfg.title}</p>
      <Input autoFocus value={f.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="Name" className="rounded-2xl" />
      {kind === 'grocery' && (
        <div className="grid grid-cols-3 gap-2">
          <Input value={f.qty || ''} onChange={(e) => set('qty', e.target.value)} placeholder="Qty" className="rounded-2xl" />
          <Input value={f.unit || ''} onChange={(e) => set('unit', e.target.value)} placeholder="Unit" className="rounded-2xl" />
          <select value={f.category || 'Other'} onChange={(e) => set('category', e.target.value)} className="rounded-2xl border bg-card px-2 text-sm">
            {GROCERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}
      {(kind === 'pantry' || kind === 'fridge' || kind === 'freezer') && (
        <div className="grid grid-cols-2 gap-2">
          <Input value={f.qty || ''} onChange={(e) => set('qty', e.target.value)} placeholder="Qty" className="rounded-2xl" />
          <Input value={f.unit || ''} onChange={(e) => set('unit', e.target.value)} placeholder="Unit" className="rounded-2xl" />
        </div>
      )}
      {kind === 'meal' && (
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={f.date || todayStr()} onChange={(e) => set('date', e.target.value)} className="rounded-2xl" />
          <select value={f.slot || 'dinner'} onChange={(e) => set('slot', e.target.value)} className="rounded-2xl border bg-card px-2 text-sm">
            <option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option>
          </select>
        </div>
      )}
      {kind === 'leftover' && (
        <div className="grid grid-cols-3 gap-2">
          <Input type="number" value={f.portions || 1} onChange={(e) => set('portions', e.target.value)} placeholder="Portions" className="rounded-2xl" />
          <Input value={f.storage || 'Fridge'} onChange={(e) => set('storage', e.target.value)} placeholder="Storage" className="rounded-2xl" />
          <Input type="date" value={f.use_by || ''} onChange={(e) => set('use_by', e.target.value)} className="rounded-2xl" />
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-full flex-1" onClick={onClose}>Cancel</Button>
        <Button className="rounded-full flex-1" onClick={submit} disabled={busy || !f.name?.trim()}>Add</Button>
      </div>
    </div>
  );
}