import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Trash2, Utensils, CalendarDays, MoreHorizontal, Move, Pencil, Flame, ChevronRight,
} from 'lucide-react';
import KitchenEmptyState from '@/components/kitchen/ui/KitchenEmptyState';
import KitchenSection from '@/components/kitchen/ui/KitchenSection';
import RecipePhoto from '@/components/kitchen/ui/RecipePhoto';
import StatusChip from '@/components/kitchen/ui/StatusChip';
import { useLeftovers, useRecipes } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { EMPTY, todayStr, fmtDate, useEnabledMealSlots } from '@/components/kitchen/kitchenConstants';
import { recipePerServing } from '@/lib/nutrition';
import { useKitchenSectionTheme } from '@/lib/kitchenTheme';
import { cn } from '@/lib/utils';

export default function LeftoversView({ onBack, onLogFood }) {
  const { settings } = useAppSettings();
  const useSoonDays = settings.kitchenUseSoonDays ?? 4;
  const { items: allLeftovers, add, update, remove } = useLeftovers();
  const { items: recipes } = useRecipes();
  const slots = useEnabledMealSlots();
  const [tab, setTab] = useState('available');
  const [showAdd, setShowAdd] = useState(false);
  const [planLeftover, setPlanLeftover] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [moveItem, setMoveItem] = useState(null);

  const recipeName = (l) => l.source_recipe_id ? (recipes.find((r) => r.id === l.source_recipe_id)?.name) : null;

  const isUseSoon = (l) => {
    if (!l.use_by) return false;
    const d = new Date(l.use_by + 'T00:00:00');
    const diff = (d - new Date()) / 86400000;
    return diff >= 0 && diff <= useSoonDays;
  };

  const available = allLeftovers.filter((l) => l.status === 'available');
  const useSoonItems = available.filter(isUseSoon);
  const history = allLeftovers.filter((l) => l.status !== 'available');

  const shown = tab === 'available' ? available.filter((l) => !isUseSoon(l)) : tab === 'use-soon' ? useSoonItems : history;

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold flex-1">Leftovers</h2>
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-full">
        {[
          { id: 'available', label: 'Available', count: available.length },
          { id: 'use-soon', label: 'Use Soon', count: useSoonItems.length },
          { id: 'history', label: 'History', count: history.length },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex-1 text-xs py-1.5 rounded-full transition', tab === t.id ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground')}>
            {t.label}{t.count > 0 ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {/* Use Soon section (when on Available tab) */}
      {tab === 'available' && useSoonItems.length > 0 && (
        <KitchenSection eyebrow="Use soon">
          <div className="space-y-2">
            {useSoonItems.map((l) => (
              <LeftoverCard key={l.id} leftover={l} recipeName={recipeName(l)} isUseSoon
                onPlan={() => setPlanLeftover(l)} onLogFood={onLogFood} recipes={recipes}
                onMove={() => setMoveItem(l)} onEdit={() => setEditItem(l)} onDiscard={() => update(l.id, { status: 'discarded' })}
                onUsePortion={() => { const next = Math.max(0, (l.portions || 0) - 1); update(l.id, next === 0 ? { portions: 0, status: 'used_up' } : { portions: next }); }} />
            ))}
          </div>
        </KitchenSection>
      )}

      {/* Main list */}
      {shown.length === 0 ? (
        <KitchenEmptyState
          icon={Utensils}
          title={tab === 'history' ? 'No history yet.' : 'Nothing waiting for later.'}
          subtitle={tab === 'history' ? 'Used and discarded leftovers will appear here.' : 'Leftovers will show up here when added.'}
          actionLabel={tab !== 'history' ? 'Add Leftover' : null}
          onAction={tab !== 'history' ? () => setShowAdd(true) : null}
        />
      ) : (
        <div className="space-y-2">
          {shown.map((l) => (
            <LeftoverCard key={l.id} leftover={l} recipeName={recipeName(l)} isUseSoon={isUseSoon(l)}
              onPlan={() => setPlanLeftover(l)} onLogFood={onLogFood} recipes={recipes}
              onMove={() => setMoveItem(l)} onEdit={() => setEditItem(l)} onDiscard={() => update(l.id, { status: 'discarded' })}
              onUsePortion={() => { const next = Math.max(0, (l.portions || 0) - 1); update(l.id, next === 0 ? { portions: 0, status: 'used_up' } : { portions: next }); }} />
          ))}
        </div>
      )}

      <AddLeftoverSheet open={showAdd} onOpenChange={setShowAdd} onAdd={add} />
      <PlanLeftoverSheet leftover={planLeftover} slots={slots} onClose={() => setPlanLeftover(null)} onPlan={async (date, slot, portions) => {
        try {
          await base44.entities.MealPlanEntry.create({ date, meal_slot: slot, meal_type: 'leftover', leftover_id: planLeftover.id, custom_name: planLeftover.name, servings: portions });
        } catch { /* ignore */ }
        setPlanLeftover(null);
      }} />
      <EditLeftoverSheet leftover={editItem} onClose={() => setEditItem(null)} onSave={(data) => { update(editItem.id, data); setEditItem(null); }} />
      <MoveLeftoverSheet leftover={moveItem} onClose={() => setMoveItem(null)} onMove={(loc) => { update(moveItem.id, { storage_location: loc }); setMoveItem(null); }} />
    </div>
  );
}

function LeftoverCard({ leftover, recipeName, isUseSoon, onPlan, onLogFood, recipes, onMove, onEdit, onDiscard, onUsePortion }) {
  const { sectionMotif } = useKitchenSectionTheme('leftovers');
  const rec = leftover.source_recipe_id ? recipes.find((r) => r.id === leftover.source_recipe_id) : null;
  const canLog = onLogFood && rec;
  const pn = rec ? recipePerServing(rec) : null;

  return (
    <div className="rounded-3xl border border-border/60 bg-card overflow-hidden">
      <div className="flex gap-3 p-3">
        {/* Photo or theme placeholder */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
          {rec ? (
            <RecipePhoto recipe={rec} height="h-16" className="rounded-2xl" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-secondary/60 to-accent/40 flex items-center justify-center">
              <span className="text-lg" aria-hidden>{sectionMotif}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold truncate">{leftover.name}</p>
          <p className="text-[11px] text-muted-foreground">{leftover.portions} portion{leftover.portions !== 1 ? 's' : ''} · {leftover.storage_location}</p>
          {leftover.use_by && (
            <p className="text-[11px] text-muted-foreground">Use by {fmtDate(leftover.use_by)}</p>
          )}
          {recipeName && <p className="text-[10px] text-muted-foreground italic">Made from: {recipeName}</p>}
          {leftover.date_made && <p className="text-[10px] text-muted-foreground">Cooked {fmtDate(leftover.date_made)}</p>}
          {isUseSoon && <div className="mt-1"><StatusChip variant="warm">Use soon</StatusChip></div>}
          {leftover.portions <= 1 && leftover.status === 'available' && <div className="mt-1"><StatusChip variant="outline">Last portion</StatusChip></div>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label={`Actions for ${leftover.name}`}><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onMove}><Move className="w-4 h-4 mr-2" /> Move</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDiscard} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Discard</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Actions */}
      <div className="flex gap-1.5 px-3 pb-3 flex-wrap">
        <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={onPlan}><CalendarDays className="w-3 h-3 mr-1" /> Plan Meal</Button>
        <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={onUsePortion}><Utensils className="w-3 h-3 mr-1" /> Use Portion</Button>
        {canLog && (
          <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => onLogFood(pn ? { name: leftover.name, perServingNut: pn, servings: 1, source_type: 'leftover', leftover_id: leftover.id } : { name: leftover.name, source_type: 'leftover', leftover_id: leftover.id })}>
            <Utensils className="w-3 h-3 mr-1" /> Log as Eaten
          </Button>
        )}
      </div>
    </div>
  );
}

function AddLeftoverSheet({ open, onOpenChange, onAdd }) {
  const [form, setForm] = useState({ name: '', portions: 1, storage_location: 'Fridge', use_by: '', notes: '' });
  const save = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, date_made: todayStr(), status: 'available' });
    setForm({ name: '', portions: 1, storage_location: 'Fridge', use_by: '', notes: '' });
    onOpenChange(false);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add leftover</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Leftover name" className="rounded-2xl" autoFocus />
          <div className="grid grid-cols-3 gap-2">
            <Input type="number" value={form.portions} onChange={(e) => setForm((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} placeholder="Portions" className="rounded-2xl" />
            <select value={form.storage_location} onChange={(e) => setForm((p) => ({ ...p, storage_location: e.target.value }))} className="rounded-2xl border bg-card px-2 text-sm">
              <option>Fridge</option><option>Freezer</option><option>Pantry</option>
            </select>
            <Input type="date" value={form.use_by} onChange={(e) => setForm((p) => ({ ...p, use_by: e.target.value }))} className="rounded-2xl" />
          </div>
          <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Reheat notes (optional)" className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={save} disabled={!form.name.trim()}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function PlanLeftoverSheet({ leftover, slots, onClose, onPlan }) {
  const [date, setDate] = useState(todayStr());
  const [slot, setSlot] = useState('lunch');
  const [portions, setPortions] = useState(1);
  React.useEffect(() => { if (leftover) { setDate(todayStr()); setSlot(slots[0]?.id || 'lunch'); setPortions(1); } }, [leftover, slots]);
  if (!leftover) return null;
  return (
    <Sheet open={!!leftover} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Plan leftover</SheetTitle></SheetHeader>
        <p className="text-xs text-muted-foreground text-center mt-1">{leftover.name}</p>
        <div className="space-y-3 mt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date</p>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Meal</p>
            <select value={slot} onChange={(e) => setSlot(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
              {slots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Portions</p>
            <Input type="number" value={portions} onChange={(e) => setPortions(parseInt(e.target.value) || 1)} className="rounded-2xl w-24" />
          </div>
          <Button className="rounded-full w-full" onClick={() => onPlan(date, slot, portions)}>Confirm</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EditLeftoverSheet({ leftover, onClose, onSave }) {
  const [form, setForm] = useState({});
  React.useEffect(() => { if (leftover) setForm({ name: leftover.name, portions: leftover.portions, storage_location: leftover.storage_location, use_by: leftover.use_by || '', notes: leftover.notes || '' }); }, [leftover]);
  if (!leftover) return null;
  return (
    <Sheet open={!!leftover} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Edit leftover</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={form.name || ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" className="rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            <Input type="number" value={form.portions || 1} onChange={(e) => setForm((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} className="rounded-2xl" />
            <select value={form.storage_location || 'Fridge'} onChange={(e) => setForm((p) => ({ ...p, storage_location: e.target.value }))} className="rounded-2xl border bg-card px-2 text-sm">
              <option>Fridge</option><option>Freezer</option><option>Pantry</option>
            </select>
            <Input type="date" value={form.use_by || ''} onChange={(e) => setForm((p) => ({ ...p, use_by: e.target.value }))} className="rounded-2xl" />
          </div>
          <Textarea value={form.notes || ''} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Reheat notes" className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => onSave(form)}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MoveLeftoverSheet({ leftover, onClose, onMove }) {
  const [loc, setLoc] = useState('');
  React.useEffect(() => { if (leftover) setLoc(leftover.storage_location || ''); }, [leftover]);
  if (!leftover) return null;
  return (
    <Sheet open={!!leftover} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Move — {leftover.name}</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <select value={loc} onChange={(e) => setLoc(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
            <option>Fridge</option><option>Freezer</option><option>Pantry</option>
          </select>
          <Button className="rounded-full w-full" onClick={() => onMove(loc)}>Move</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}