import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Search, Soup } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useKitchenItems } from '@/hooks/useKitchen';
import { KITCHEN_ITEM_CATEGORIES, EMPTY } from '@/components/kitchen/kitchenConstants';

export default function EquipmentView({ onBack }) {
  const { items, add, update, remove } = useKitchenItems();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'tool', brand: '', model: '', storage_location: '', purchase_date: '', purchase_price: 0, warranty_expiration: '', notes: '' });

  const filtered = useMemo(() => items.filter((i) => {
    if (cat !== 'all' && i.category !== cat) return false;
    if (q && !i.name?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, cat]);

  const save = () => {
    if (!form.name.trim()) return;
    add({ ...form, status: 'active' });
    setForm({ name: '', category: 'tool', brand: '', model: '', storage_location: '', purchase_date: '', purchase_price: 0, warranty_expiration: '', notes: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Equipment</h2>
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd((s) => !s)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search equipment" className="rounded-2xl pl-9" />
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setCat('all')} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${cat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>All</button>
        {KITCHEN_ITEM_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCat(c.value)} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${cat === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{c.label}</button>
        ))}
      </div>

      {showAdd && (
        <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item name" className="rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              {KITCHEN_ITEM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <Input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} placeholder="Brand" className="rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={form.storage_location} onChange={(e) => setForm((p) => ({ ...p, storage_location: e.target.value }))} placeholder="Location" className="rounded-2xl" />
            <Input type="date" value={form.purchase_date} onChange={(e) => setForm((p) => ({ ...p, purchase_date: e.target.value }))} className="rounded-2xl" />
          </div>
          <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="rounded-2xl" />
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={save}>Save</Button>
          </div>
        </CardContent></Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={Soup} title={EMPTY.equipment.title} subtitle={EMPTY.equipment.subtitle} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {filtered.map((i) => (
            <Card key={i.id} className="rounded-3xl"><CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{i.name}</p>
                  {i.brand && <p className="text-[11px] text-muted-foreground">{i.brand}{i.model ? ` · ${i.model}` : ''}</p>}
                  {i.storage_location && <p className="text-[11px] text-muted-foreground">{i.storage_location}</p>}
                  {i.warranty_expiration && <p className="text-[11px] text-muted-foreground">Warranty: {i.warranty_expiration}</p>}
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => remove(i.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}