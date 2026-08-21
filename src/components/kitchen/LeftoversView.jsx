import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, Utensils, CalendarDays, Minus } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useLeftovers } from '@/hooks/useKitchen';
import { EMPTY, todayStr } from '@/components/kitchen/kitchenConstants';

export default function LeftoversView({ onBack }) {
  const { items, add, update, remove } = useLeftovers({ status: 'available' });
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', portions: 1, storage_location: 'Fridge', use_by: '' });

  const save = () => {
    if (!form.name.trim()) return;
    add({ ...form, date_made: todayStr(), status: 'available' });
    setForm({ name: '', portions: 1, storage_location: 'Fridge', use_by: '' });
    setShowAdd(false);
  };

  const planLeftover = async (l) => {
    try {
      await base44.entities.MealPlanEntry.create({
        date: todayStr(), meal_slot: 'lunch', meal_type: 'leftover', leftover_id: l.id, custom_name: l.name, servings: 1,
      });
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Leftovers</h2>
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd((s) => !s)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      {showAdd && (
        <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Leftover name" className="rounded-2xl" />
          <div className="flex gap-2">
            <Input type="number" value={form.portions} onChange={(e) => setForm((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} placeholder="Portions" className="rounded-2xl w-24" />
            <Input value={form.storage_location} onChange={(e) => setForm((p) => ({ ...p, storage_location: e.target.value }))} placeholder="Location" className="rounded-2xl flex-1" />
          </div>
          <Input type="date" value={form.use_by} onChange={(e) => setForm((p) => ({ ...p, use_by: e.target.value }))} className="rounded-2xl" />
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
                  <Utensils className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{l.name}</p>
                    <p className="text-[11px] text-muted-foreground">{l.portions} portions · {l.storage_location}{l.use_by ? ` · use by ${l.use_by}` : ''}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => update(l.id, { portions: Math.max(0, (l.portions || 0) - 1) })}><Minus className="w-3 h-3 mr-1" /> Portion</Button>
                  <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => planLeftover(l)}><CalendarDays className="w-3 h-3 mr-1" /> Add to plan</Button>
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => update(l.id, { status: 'used_up' })}>Used up</Button>
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => remove(l.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}