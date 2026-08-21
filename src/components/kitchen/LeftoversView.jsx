import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Utensils, CalendarDays, Minus, Move, Flame } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useLeftovers, useRecipes } from '@/hooks/useKitchen';
import { EMPTY, todayStr } from '@/components/kitchen/kitchenConstants';
import { recipePerServing } from '@/lib/nutrition';

export default function LeftoversView({ onBack, onLogFood }) {
  const { items, add, update, remove } = useLeftovers({ status: 'available' });
  const { items: recipes } = useRecipes();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', portions: 1, storage_location: 'Fridge', use_by: '', notes: '' });
  const [reheatEdit, setReheatEdit] = useState(null);
  const [moveItem, setMoveItem] = useState(null);

  const save = () => {
    if (!form.name.trim()) return;
    add({ ...form, date_made: todayStr(), status: 'available' });
    setForm({ name: '', portions: 1, storage_location: 'Fridge', use_by: '', notes: '' });
    setShowAdd(false);
  };

  const takePortion = (l) => {
    const next = Math.max(0, (l.portions || 0) - 1);
    if (next === 0) { update(l.id, { portions: 0, status: 'used_up' }); }
    else { update(l.id, { portions: next }); }
  };

  const planLeftover = async (l, offset = 0) => {
    const d = new Date(); d.setDate(d.getDate() + offset);
    try {
      await base44.entities.MealPlanEntry.create({
        date: d.toISOString().slice(0, 10), meal_slot: 'lunch', meal_type: 'leftover', leftover_id: l.id, custom_name: l.name, servings: 1,
      });
    } catch { /* ignore */ }
  };

  const recipeName = (l) => l.source_recipe_id ? (recipes.find((r) => r.id === l.source_recipe_id)?.name) : null;

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold flex-1">Leftovers</h2>
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd((s) => !s)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      {showAdd && (
        <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Leftover name" className="rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            <Input type="number" value={form.portions} onChange={(e) => setForm((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} placeholder="Portions" className="rounded-2xl" />
            <select value={form.storage_location} onChange={(e) => setForm((p) => ({ ...p, storage_location: e.target.value }))} className="rounded-2xl border bg-card px-2 text-sm">
              <option>Fridge</option><option>Freezer</option><option>Pantry</option>
            </select>
            <Input type="date" value={form.use_by} onChange={(e) => setForm((p) => ({ ...p, use_by: e.target.value }))} className="rounded-2xl" />
          </div>
          <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Reheat notes (optional)" className="rounded-2xl" />
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={save}>Save</Button>
          </div>
        </CardContent></Card>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Utensils} title={EMPTY.leftovers.title} subtitle={EMPTY.leftovers.subtitle} />
      ) : (
        <div className="space-y-2">
          {items.map((l) => (
            <Card key={l.id} className="rounded-3xl">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-[11px] text-muted-foreground">{l.portions} portions · {l.storage_location}{l.use_by ? ` · use by ${l.use_by}` : ''}</p>
                    {recipeName(l) && <p className="text-[10px] text-muted-foreground">from {recipeName(l)}</p>}
                    {l.notes && <p className="text-[10px] text-muted-foreground italic truncate"><Flame className="w-2.5 h-2.5 inline mr-0.5" />{l.notes}</p>}
                  </div>
                  {l.portions <= 1 && <Badge variant="secondary" className="text-[9px]">last portion</Badge>}
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => takePortion(l)}><Minus className="w-3 h-3 mr-1" /> Use portion</Button>
                  {onLogFood && (() => { const rec = l.source_recipe_id ? recipes.find((r) => r.id === l.source_recipe_id) : null; const pn = rec ? recipePerServing(rec) : null; return (
                    <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => onLogFood(pn ? { name: l.name, perServingNut: pn, servings: 1, source_type: 'leftover', leftover_id: l.id } : { name: l.name, source_type: 'leftover', leftover_id: l.id })}><Utensils className="w-3 h-3 mr-1" /> Log as Eaten</Button>
                  ); })()}
                  <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => planLeftover(l, 0)}><CalendarDays className="w-3 h-3 mr-1" /> Today</Button>
                  <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => planLeftover(l, 1)}>Tomorrow</Button>
                  <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setMoveItem(l)}><Move className="w-3 h-3 mr-1" /> Move</Button>
                  <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setReheatEdit(l)}><Flame className="w-3 h-3 mr-1" /> Reheat</Button>
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => update(l.id, { status: 'used_up' })}>Used up</Button>
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => remove(l.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reheatEdit && (
        <Card className="rounded-3xl border-primary"><CardContent className="p-3 space-y-2">
          <p className="font-heading text-sm font-medium">Reheat notes — {reheatEdit.name}</p>
          <Textarea value={reheatEdit.notes || ''} onChange={(e) => setReheatEdit((p) => ({ ...p, notes: e.target.value }))} placeholder="e.g. Microwave 2 min, stir halfway" className="rounded-2xl" />
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full flex-1" onClick={() => setReheatEdit(null)}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={() => { update(reheatEdit.id, { notes: reheatEdit.notes }); setReheatEdit(null); }}>Save</Button>
          </div>
        </CardContent></Card>
      )}

      {moveItem && (
        <Card className="rounded-3xl border-primary"><CardContent className="p-3 space-y-2">
          <p className="font-heading text-sm font-medium">Move — {moveItem.name}</p>
          <select value={moveItem.storage_location} onChange={(e) => setMoveItem((p) => ({ ...p, storage_location: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
            <option>Fridge</option><option>Freezer</option><option>Pantry</option>
          </select>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full flex-1" onClick={() => setMoveItem(null)}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={() => { update(moveItem.id, { storage_location: moveItem.storage_location }); setMoveItem(null); }}>Move</Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
}