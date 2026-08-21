import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Search, Minus, Move, Pencil } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useInventory } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { GROCERY_CATEGORIES, EMPTY, todayStr } from '@/components/kitchen/kitchenConstants';

const ZONE_EMPTY = { pantry: EMPTY.pantry, fridge: EMPTY.fridge, freezer: EMPTY.freezer };
const ZONES = ['pantry', 'fridge', 'freezer'];

export default function InventoryView({ zone, onBack }) {
  const { settings } = useAppSettings();
  const useSoonDays = settings.kitchenUseSoonDays ?? 4;
  const { items, add, update, remove } = useInventory(zone);
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', qty: '1', unit: '', category: '', storage_location: '', best_before: '', low_threshold: 0, staple: false });
  const [moveItem, setMoveItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [adjustVal, setAdjustVal] = useState('');

  const filtered = useMemo(() => items.filter((i) => {
    if (q && !i.name?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q]);

  const isUseSoon = (i) => {
    if (!i.best_before && !i.expiration) return false;
    const d = new Date(i.best_before || i.expiration);
    const diff = (d - new Date()) / 86400000;
    return diff >= 0 && diff <= useSoonDays;
  };

  const adjustQty = (i, delta) => {
    const cur = i.amount || parseFloat(i.qty) || 0;
    const next = Math.max(0, cur + delta);
    update(i.id, { amount: next, qty: String(next) });
  };

  const setAmount = (i) => {
    const v = parseFloat(adjustVal);
    if (isNaN(v)) return;
    const next = Math.max(0, v);
    update(i.id, { amount: next, qty: String(next) });
    setAdjustItem(null); setAdjustVal('');
  };

  const saveItem = () => {
    if (!form.name.trim()) return;
    add({ ...form, amount: parseFloat(form.qty) || 1, zone, status: 'available', date_purchased: todayStr() });
    setForm({ name: '', qty: '1', unit: '', category: '', storage_location: '', best_before: '', low_threshold: 0, staple: false });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1 capitalize">{zone}</h2>
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd((s) => !s)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${zone}`} className="rounded-2xl pl-9" />
      </div>

      {showAdd && (
        <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item name" className="rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            <Input value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} placeholder="Qty" className="rounded-2xl" />
            <Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit" className="rounded-2xl" />
            <Input value={form.storage_location} onChange={(e) => setForm((p) => ({ ...p, storage_location: e.target.value }))} placeholder="Location" className="rounded-2xl" />
          </div>
          <Input type="date" value={form.best_before} onChange={(e) => setForm((p) => ({ ...p, best_before: e.target.value }))} className="rounded-2xl" />
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={saveItem}>Save</Button>
          </div>
        </CardContent></Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={ZONE_EMPTY[zone]?.title || 'Nothing here yet'} subtitle={ZONE_EMPTY[zone]?.subtitle} />
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <Card key={i.id} className="rounded-2xl">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${i.status !== 'available' ? 'line-through text-muted-foreground' : ''}`}>{i.name}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-muted-foreground">{i.amount || i.qty} {i.unit}</span>
                      {i.storage_location && <span className="text-[11px] text-muted-foreground">· {i.storage_location}</span>}
                      {isUseSoon(i) && <Badge variant="secondary" className="text-[10px]">Use soon</Badge>}
                      {i.amount <= i.low_threshold && i.low_threshold > 0 && <Badge variant="outline" className="text-[10px]">Low</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => adjustQty(i, -1)}><Minus className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => adjustQty(i, 1)}><Plus className="w-3 h-3" /></Button>
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => { setAdjustItem(i); setAdjustVal(String(i.amount || i.qty || '')); }}><Pencil className="w-3 h-3 mr-1" /> Set</Button>
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => setMoveItem(i)}><Move className="w-3 h-3 mr-1" /> Move</Button>
                  {i.status === 'available' ? (
                    <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => update(i.id, { status: 'used_up' })}>Used up</Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => update(i.id, { status: 'available' })}>Restore</Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => remove(i.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {adjustItem && (
        <Card className="rounded-3xl border-primary"><CardContent className="p-3 space-y-2">
          <p className="font-heading text-sm font-medium">Set amount — {adjustItem.name}</p>
          <div className="flex gap-2 items-center">
            <Input type="number" value={adjustVal} onChange={(e) => setAdjustVal(e.target.value)} className="rounded-2xl w-28" autoFocus />
            <span className="text-sm text-muted-foreground">{adjustItem.unit}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="rounded-full flex-1" onClick={() => setAdjustItem(null)}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={() => setAmount(adjustItem)}>Save</Button>
          </div>
        </CardContent></Card>
      )}

      {moveItem && (
        <Card className="rounded-3xl border-primary"><CardContent className="p-3 space-y-2">
          <p className="font-heading text-sm font-medium">Move — {moveItem.name}</p>
          <p className="text-[11px] text-muted-foreground">Currently in {zone}</p>
          <div className="flex gap-2">
            {ZONES.filter((z) => z !== zone).map((z) => (
              <Button key={z} variant="outline" className="rounded-full flex-1 capitalize" onClick={() => { update(moveItem.id, { zone: z }); setMoveItem(null); }}>{z}</Button>
            ))}
          </div>
          <Button variant="ghost" className="rounded-full w-full" onClick={() => setMoveItem(null)}>Cancel</Button>
        </CardContent></Card>
      )}
    </div>
  );
}