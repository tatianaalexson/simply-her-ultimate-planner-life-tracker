import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, Trash2, Search, Soup, MoreHorizontal, Pencil, Box } from 'lucide-react';
import KitchenEmptyState from '@/components/kitchen/ui/KitchenEmptyState';
import StatusChip from '@/components/kitchen/ui/StatusChip';
import { useKitchenItems } from '@/hooks/useKitchen';
import { KITCHEN_ITEM_CATEGORIES, EMPTY } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

export default function EquipmentView({ onBack }) {
  const { items, add, update, remove } = useKitchenItems();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const filtered = useMemo(() => items.filter((i) => {
    if (cat !== 'all' && i.category !== cat) return false;
    if (q && !i.name?.toLowerCase().includes(q.toLowerCase()) && !i.brand?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, cat]);

  const startEdit = (i) => { setEditItem(i); setShowAdd(true); };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold flex-1">Equipment</h2>
        <Button size="sm" className="rounded-full" onClick={() => { setEditItem(null); setShowAdd(true); }}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search equipment" className="rounded-2xl pl-9" />
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button onClick={() => setCat('all')} className={cn('text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition', cat === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>All</button>
        {KITCHEN_ITEM_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCat(c.value)} className={cn('text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition', cat === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>{c.label}</button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <KitchenEmptyState icon={Soup} title={EMPTY.equipment.title} subtitle={EMPTY.equipment.subtitle}
          actionLabel="Add Item" onAction={() => { setEditItem(null); setShowAdd(true); }} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {filtered.map((i) => (
            <div key={i.id} className="rounded-2xl border border-border/60 bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{i.name}</p>
                  {i.brand && <p className="text-[11px] text-muted-foreground">{i.brand}{i.model ? ` · ${i.model}` : ''}</p>}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    <StatusChip variant="neutral">{KITCHEN_ITEM_CATEGORIES.find((c) => c.value === i.category)?.label || i.category}</StatusChip>
                    {i.storage_location && <span className="text-[10px] text-muted-foreground">{i.storage_location}</span>}
                    {i.warranty_expiration && <span className="text-[10px] text-muted-foreground">· Warranty until {i.warranty_expiration}</span>}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label={`Actions for ${i.name}`}><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEdit(i)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => remove(i.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <EquipmentForm item={editItem} onSave={async (data) => { if (editItem) await update(editItem.id, data); else await add({ ...data, status: 'active' }); setShowAdd(false); }} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}

function EquipmentForm({ item, onSave, onClose }) {
  const [f, setF] = useState(item || { name: '', category: 'tool', brand: '', model: '', storage_location: '', purchase_date: '', purchase_price: 0, warranty_expiration: '', notes: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">{item ? 'Edit equipment' : 'Add equipment'}</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Item name" className="rounded-2xl" autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <select value={f.category} onChange={(e) => set('category', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              {KITCHEN_ITEM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <Input value={f.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Brand" className="rounded-2xl" />
          </div>
          <Input value={f.model} onChange={(e) => set('model', e.target.value)} placeholder="Model (optional)" className="rounded-2xl" />
          <Input value={f.storage_location} onChange={(e) => set('storage_location', e.target.value)} placeholder="Storage location" className="rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={f.purchase_date} onChange={(e) => set('purchase_date', e.target.value)} className="rounded-2xl" />
            <Input type="date" value={f.warranty_expiration} onChange={(e) => set('warranty_expiration', e.target.value)} placeholder="Warranty until" className="rounded-2xl" />
          </div>
          <Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Notes" className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => f.name?.trim() && onSave(f)} disabled={!f.name?.trim()}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}