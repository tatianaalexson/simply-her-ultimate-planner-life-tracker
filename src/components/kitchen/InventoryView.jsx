import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Trash2, Search, Minus, Move, MoreHorizontal, Box, Refrigerator, Snowflake, Pencil, History,
} from 'lucide-react';
import KitchenEmptyState from '@/components/kitchen/ui/KitchenEmptyState';
import KitchenSection from '@/components/kitchen/ui/KitchenSection';
import StatusChip from '@/components/kitchen/ui/StatusChip';
import InventoryHistorySheet from '@/components/kitchen/InventoryHistorySheet';
import { useInventory } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { logInventoryEvent, classifyQtyChange } from '@/lib/inventoryHistory';
import { GROCERY_CATEGORIES, EMPTY, todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

const ZONES = [
  { id: 'pantry', label: 'Pantry', icon: Box, feat: 'kit.pantry' },
  { id: 'fridge', label: 'Fridge', icon: Refrigerator, feat: 'kit.fridge' },
  { id: 'freezer', label: 'Freezer', icon: Snowflake, feat: 'kit.freezer' },
];

const ZONE_EMPTY = { pantry: EMPTY.pantry, fridge: EMPTY.fridge, freezer: EMPTY.freezer };

export default function InventoryView({ zone, onBack, onNavigate }) {
  const { isFeatureEnabled, settings } = useAppSettings();
  const useSoonDays = settings.kitchenUseSoonDays ?? 4;
  const { items, add, update, remove } = useInventory(zone);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [moveItem, setMoveItem] = useState(null);
  const [adjustItem, setAdjustItem] = useState(null);
  const [historyItem, setHistoryItem] = useState(null);

  const isUseSoon = (i) => {
    if (!i.best_before && !i.expiration) return false;
    const d = new Date((i.best_before || i.expiration) + 'T00:00:00');
    const diff = (d - new Date()) / 86400000;
    return diff >= 0 && diff <= useSoonDays;
  };
  const isLow = (i) => i.low_threshold > 0 && (i.amount || 0) <= i.low_threshold;

  const filtered = useMemo(() => items.filter((i) => {
    if (q && !i.name?.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'use-soon' && !isUseSoon(i)) return false;
    if (filter === 'low' && !isLow(i)) return false;
    return true;
  }), [items, q, filter]);

  const useSoonItems = filtered.filter(isUseSoon);
  const otherItems = filtered.filter((i) => !isUseSoon(i));
  const lowCount = items.filter(isLow).length;
  const useSoonCount = items.filter(isUseSoon).length;

  const adjustQty = (i, delta) => {
    const cur = i.amount || parseFloat(i.qty) || 0;
    const next = Math.max(0, cur + delta);
    update(i.id, { amount: next, qty: String(next) });
    if (delta !== 0) {
      logInventoryEvent(i.id, delta > 0 ? 'qty_increased' : 'qty_decreased', { fromAmount: cur, toAmount: next, unit: i.unit, itemName: i.name });
    }
  };

  const addWithHistory = async (data) => {
    const rec = await add(data);
    if (rec?.id) {
      logInventoryEvent(rec.id, 'added', { toAmount: data.amount, unit: data.unit, itemName: data.name, toZone: data.zone });
    }
    return rec;
  };

  const availableZones = ZONES.filter((z) => isFeatureEnabled(z.feat));

  return (
    <div className="space-y-4 pb-8">
      {/* Zone tabs */}
      {availableZones.length > 1 && (
        <div className="flex gap-1 p-1 bg-secondary rounded-full">
          {availableZones.map((z) => {
            const Icon = z.icon;
            const active = zone === z.id;
            return (
              <button key={z.id} onClick={() => onNavigate?.(z.id)} className={cn('flex-1 flex items-center justify-center gap-1.5 text-sm py-1.5 rounded-full transition', active ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground')}>
                <Icon className="w-4 h-4" strokeWidth={1.5} /> {z.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 className="font-heading text-xl font-semibold capitalize">{zone}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}{useSoonCount > 0 ? ` · ${useSoonCount} use soon` : ''}{lowCount > 0 ? ` · ${lowCount} low` : ''}</p>
        </div>
        <Button size="sm" className="rounded-full" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-1" /> Add</Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${zone}`} className="rounded-2xl pl-9" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5">
        {['all', 'use-soon', 'low'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn('text-xs px-3 py-1.5 rounded-full capitalize transition', filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
            {f === 'use-soon' ? 'Use Soon' : f === 'low' ? 'Low' : 'All'}
          </button>
        ))}
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <KitchenEmptyState
          icon={ZONES.find((z) => z.id === zone)?.icon || Box}
          title={ZONE_EMPTY[zone]?.title || 'Nothing here yet'}
          subtitle={ZONE_EMPTY[zone]?.subtitle || 'Add items as you like.'}
          actionLabel={`Add ${zone === 'fridge' ? 'Fridge' : zone === 'freezer' ? 'Freezer' : 'Pantry'} Item`}
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <div className="space-y-4">
          {/* Use Soon section */}
          {useSoonItems.length > 0 && filter === 'all' && (
            <KitchenSection eyebrow="Use soon">
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                {useSoonItems.map((i) => (
                  <InventoryRow key={i.id} item={i} isUseSoon={isUseSoon(i)} isLow={isLow(i)}
                    onAdjust={(d) => adjustQty(i, d)} onMenu={() => {}} onMove={() => setMoveItem(i)}
                    onAdjustSheet={() => { setAdjustItem(i); }} onUsedUp={() => update(i.id, { status: 'used_up' })}
                    onRestore={() => update(i.id, { status: 'available' })}
                    onRemove={() => remove(i.id)} />
                ))}
              </div>
            </KitchenSection>
          )}

          {/* All items */}
          {(filter !== 'all' || otherItems.length > 0) && (
            <div>
              {filter === 'all' && useSoonItems.length > 0 && <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1 px-1">All items</p>}
              <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                {(filter === 'all' ? otherItems : filtered).map((i) => (
                  <InventoryRow key={i.id} item={i} isUseSoon={isUseSoon(i)} isLow={isLow(i)}
                    onAdjust={(d) => adjustQty(i, d)} onMenu={() => {}}
                    onMove={() => setMoveItem(i)} onAdjustSheet={() => setAdjustItem(i)}
                    onUsedUp={() => { update(i.id, { status: 'used_up' }); logInventoryEvent(i.id, 'used_up', { itemName: i.name }); }}
                    onRestore={() => { update(i.id, { status: 'available' }); logInventoryEvent(i.id, 'restored', { itemName: i.name }); }}
                    onRemove={() => remove(i.id)}
                    showHistory={isFeatureEnabled('kit.foodHistory')} onHistory={() => setHistoryItem(i)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <AddItemSheet open={showAdd} onOpenChange={setShowAdd} zone={zone} onAdd={addWithHistory} />
      <MoveSheet item={moveItem} zone={zone} onClose={() => setMoveItem(null)} onMove={(z, loc) => {
        const fromZone = moveItem.zone;
        update(moveItem.id, { zone: z, storage_location: loc || moveItem.storage_location });
        if (fromZone !== z) {
          logInventoryEvent(moveItem.id, 'moved', { fromZone, toZone: z, itemName: moveItem.name });
        } else if (loc !== moveItem.storage_location) {
          logInventoryEvent(moveItem.id, 'storage_changed', { storageLocation: loc, itemName: moveItem.name });
        }
        setMoveItem(null);
      }} />
      <AdjustSheet item={adjustItem} onClose={() => setAdjustItem(null)} onSave={(v) => {
        const old = adjustItem.amount || parseFloat(adjustItem.qty) || 0;
        update(adjustItem.id, { amount: v, qty: String(v) });
        logInventoryEvent(adjustItem.id, classifyQtyChange(old, v), { fromAmount: old, toAmount: v, unit: adjustItem.unit, itemName: adjustItem.name });
        setAdjustItem(null);
      }} />
      <InventoryHistorySheet open={!!historyItem} onOpenChange={(o) => !o && setHistoryItem(null)} itemId={historyItem?.id} itemName={historyItem?.name} />
    </div>
  );
}

function InventoryRow({ item, isUseSoon, isLow, onAdjust, onMove, onAdjustSheet, onUsedUp, onRestore, onRemove, showHistory, onHistory }) {
  return (
    <div className={cn('flex items-center gap-3 px-3 py-2.5 border-b border-border/30 last:border-0', item.status !== 'available' && 'opacity-50')}>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', item.status !== 'available' && 'line-through text-muted-foreground')}>{item.name}</p>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          <span className="text-[11px] text-muted-foreground">{item.amount || item.qty}{item.unit ? ` ${item.unit}` : ''}</span>
          {item.storage_location && <span className="text-[11px] text-muted-foreground">· {item.storage_location}</span>}
          {isUseSoon && <StatusChip variant="warm">Use soon</StatusChip>}
          {isLow && <StatusChip variant="outline">Low</StatusChip>}
          {item.staple && <StatusChip variant="neutral">Staple</StatusChip>}
        </div>
      </div>
      {/* Quick quantity controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAdjust(-1)} aria-label={`Decrease ${item.name} quantity`}><Minus className="w-3 h-3" /></Button>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAdjust(1)} aria-label={`Increase ${item.name} quantity`}><Plus className="w-3 h-3" /></Button>
      </div>
      {/* Contextual menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" aria-label={`Actions for ${item.name}`}><MoreHorizontal className="w-4 h-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onAdjustSheet}><Pencil className="w-4 h-4 mr-2" /> Set amount</DropdownMenuItem>
          <DropdownMenuItem onClick={onMove}><Move className="w-4 h-4 mr-2" /> Move</DropdownMenuItem>
          {showHistory && <DropdownMenuItem onClick={onHistory}><History className="w-4 h-4 mr-2" /> View History</DropdownMenuItem>}
          {item.status === 'available' ? (
            <DropdownMenuItem onClick={onUsedUp}>Mark used up</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onRestore}>Restore</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onRemove} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AddItemSheet({ open, onOpenChange, zone, onAdd }) {
  const [form, setForm] = useState({ name: '', qty: '1', unit: '', category: '', storage_location: '', best_before: '', low_threshold: 0, staple: false });
  const save = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, amount: parseFloat(form.qty) || 1, normalized_name: form.name.toLowerCase().trim(), zone, status: 'available', date_purchased: todayStr() });
    setForm({ name: '', qty: '1', unit: '', category: '', storage_location: '', best_before: '', low_threshold: 0, staple: false });
    onOpenChange(false);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading capitalize">Add {zone} item</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item name" className="rounded-2xl" autoFocus />
          <div className="grid grid-cols-3 gap-2">
            <Input value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} placeholder="Qty" className="rounded-2xl" />
            <Input value={form.unit} onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))} placeholder="Unit" className="rounded-2xl" />
            <Input value={form.storage_location} onChange={(e) => setForm((p) => ({ ...p, storage_location: e.target.value }))} placeholder="Location" className="rounded-2xl" />
          </div>
          <Input type="date" value={form.best_before} onChange={(e) => setForm((p) => ({ ...p, best_before: e.target.value }))} className="rounded-2xl" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.staple} onChange={(e) => setForm((p) => ({ ...p, staple: e.target.checked }))} className="w-4 h-4" />
            Staple
          </label>
          <Button className="rounded-full w-full" onClick={save} disabled={!form.name.trim()}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MoveSheet({ item, zone, onClose, onMove }) {
  const [target, setTarget] = useState(zone);
  const [loc, setLoc] = useState(item?.storage_location || '');
  React.useEffect(() => { if (item) { setTarget(zone); setLoc(item.storage_location || ''); } }, [item, zone]);
  if (!item) return null;
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Move — {item.name}</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <p className="text-xs text-muted-foreground text-center">Currently in {zone}</p>
          <p className="text-xs font-medium">Move to:</p>
          <div className="flex gap-2">
            {ZONES.map((z) => (
              <button key={z.id} onClick={() => setTarget(z.id)} className={cn('flex-1 text-sm py-2.5 rounded-2xl border capitalize transition', target === z.id ? 'border-primary bg-primary/5' : 'border-border')}>{z.id}</button>
            ))}
          </div>
          <Input value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Storage location (optional)" className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => onMove(target, loc)}>Move to {target}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AdjustSheet({ item, onClose, onSave }) {
  const [val, setVal] = useState('');
  React.useEffect(() => { if (item) setVal(String(item.amount || item.qty || '')); }, [item]);
  if (!item) return null;
  return (
    <Sheet open={!!item} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Set amount — {item.name}</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <div className="flex gap-2 items-center">
            <Input type="number" value={val} onChange={(e) => setVal(e.target.value)} className="rounded-2xl flex-1" autoFocus />
            <span className="text-sm text-muted-foreground">{item.unit}</span>
          </div>
          <Button className="rounded-full w-full" onClick={() => { const v = parseFloat(val); if (!isNaN(v)) onSave(Math.max(0, v)); }}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}