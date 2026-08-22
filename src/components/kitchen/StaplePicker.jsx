import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Check, Plus, Search, Package } from 'lucide-react';
import { normalizeName } from '@/lib/kitchenGrocery';

const DEFAULT_STAPLES = ['Milk', 'Eggs', 'Bread', 'Butter', 'Coffee', 'Cheese', 'Yogurt', 'Bananas', 'Onions', 'Garlic', 'Pasta', 'Rice', 'Olive oil', 'Salt', 'Sugar', 'Flour'];

// Polished multi-select staple/frequent picker.
// Groups by Frequent, Staples, and Recently Purchased.
// Supports Select All / Clear / Add Selected. Deduplicates against the
// destination list by normalized name.
export default function StaplePicker({ open, onOpenChange, listName, existingItems, onAdded }) {
  const [selected, setSelected] = useState({});
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');

  const existingNames = useMemo(
    () => new Set((existingItems || []).map((i) => i.normalized_name || normalizeName(i.name))),
    [existingItems]
  );

  // Frequent/staple items previously saved across any list.
  const [frequent, setFrequent] = useState([]);
  React.useEffect(() => {
    if (!open) return;
    base44.entities.GroceryItem.filter({ recurring: 'staple' }, '-created_date', 100)
      .then((items) => setFrequent((items || []).filter((i) => i.name).map((i) => i.name)))
      .catch(() => setFrequent([]));
  }, [open]);

  const staples = useMemo(() => DEFAULT_STAPLES, []);
  const recent = useMemo(() => frequent.slice(0, 8), [frequent]);

  const allOptions = useMemo(() => {
    const set = new Set([...staples, ...frequent]);
    return Array.from(set).filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  }, [staples, frequent, q]);

  const filteredStaples = allOptions.filter((n) => staples.includes(n) && !recent.includes(n));

  const toggle = (name) => setSelected((p) => ({ ...p, [name]: !p[name] }));
  const addCustom = () => {
    const n = custom.trim();
    if (!n) return;
    setSelected((p) => ({ ...p, [n]: true }));
    setCustom('');
  };

  const selectAll = () => {
    const next = {};
    allOptions.forEach((n) => { if (!existingNames.has(normalizeName(n))) next[n] = true; });
    setSelected(next);
  };
  const clearAll = () => setSelected({});

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const confirm = async () => {
    const picks = Object.keys(selected).filter((k) => selected[k]);
    if (picks.length === 0) { onOpenChange(false); return; }
    setBusy(true);
    const toCreate = picks
      .filter((n) => !existingNames.has(normalizeName(n)))
      .map((n) => ({ list_name: listName, name: n, normalized_name: normalizeName(n), category: 'Other', checked: false, recurring: 'staple' }));
    try { if (toCreate.length) await base44.entities.GroceryItem.bulkCreate(toCreate); } catch { /* ignore */ }
    setBusy(false);
    setSelected({});
    setCustom('');
    setQ('');
    onAdded?.();
    onOpenChange(false);
  };

  const renderRow = (name) => {
    const already = existingNames.has(normalizeName(name));
    const checked = !!selected[name] || already;
    return (
      <label
        key={name}
        className={`flex items-center gap-3 rounded-2xl border bg-card px-3 py-2.5 ${already ? 'opacity-50' : 'hover:bg-secondary/50 cursor-pointer'}`}
      >
        <Checkbox checked={checked} disabled={already} onCheckedChange={() => !already && toggle(name)} id={`staple-${name}`} />
        <span className="text-sm flex-1">{name}</span>
        {already && <span className="text-[10px] text-muted-foreground">on list</span>}
      </label>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(o) => onOpenChange(o)}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center">
          <SheetTitle className="font-heading">Add staples</SheetTitle>
        </SheetHeader>
        <p className="text-xs text-muted-foreground text-center mb-3">Tap the items you need. Already on your list are skipped.</p>

        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staples" className="rounded-2xl pl-9" />
        </div>

        <div className="flex gap-2 mb-3">
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && addCustom()} />
          <Button variant="outline" className="rounded-full shrink-0" onClick={addCustom}><Plus className="w-4 h-4" /></Button>
        </div>

        <div className="flex gap-1.5 mb-3">
          <Button variant="outline" size="sm" className="rounded-full text-xs flex-1" onClick={selectAll}>Select all</Button>
          <Button variant="outline" size="sm" className="rounded-full text-xs flex-1" onClick={clearAll}>Clear</Button>
        </div>

        {q && (
          <div className="space-y-1 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1 mb-1">Results</p>
            {allOptions.map(renderRow)}
          </div>
        )}

        {!q && recent.length > 0 && (
          <div className="space-y-1 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1 mb-1">Recently purchased</p>
            {recent.map(renderRow)}
          </div>
        )}

        {!q && (
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-1 mb-1">Staples</p>
            {filteredStaples.map(renderRow)}
            {filteredStaples.length === 0 && recent.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No staples to show.</p>
            )}
          </div>
        )}

        <Button className="rounded-full w-full mt-4" onClick={confirm} disabled={busy || selectedCount === 0}>
          <Check className="w-4 h-4 mr-1" /> Add {selectedCount > 0 ? `${selectedCount} ` : ''}to {listName}
        </Button>
      </SheetContent>
    </Sheet>
  );
}