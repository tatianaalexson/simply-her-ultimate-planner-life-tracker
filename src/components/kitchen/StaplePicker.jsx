import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Check, Plus } from 'lucide-react';
import { normalizeName } from '@/lib/kitchenGrocery';

const DEFAULT_STAPLES = ['Milk', 'Eggs', 'Bread', 'Butter', 'Coffee', 'Cheese', 'Yogurt', 'Bananas', 'Onions', 'Garlic', 'Pasta', 'Rice', 'Olive oil', 'Salt', 'Sugar', 'Flour'];

// Multi-select staple/frequent picker. Adds selected items to a grocery list,
// skipping any whose normalized name already exists on the target list.
// Pulls in previously-marked frequent/staple GroceryItems too.
export default function StaplePicker({ open, onOpenChange, listName, existingItems, onAdded }) {
  const [selected, setSelected] = useState({});
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);

  const existingNames = useMemo(() => new Set((existingItems || []).map((i) => i.normalized_name || normalizeName(i.name))), [existingItems]);

  // frequent/staple items previously saved across any list
  const [frequent, setFrequent] = useState([]);
  React.useEffect(() => {
    if (!open) return;
    base44.entities.GroceryItem.filter({ recurring: 'staple' }, '-created_date', 100)
      .then((items) => setFrequent((items || []).filter((i) => i.name).map((i) => i.name)))
      .catch(() => setFrequent([]));
  }, [open]);

  const options = useMemo(() => {
    const set = new Set([...DEFAULT_STAPLES, ...frequent]);
    return Array.from(set);
  }, [frequent]);

  const toggle = (name) => setSelected((p) => ({ ...p, [name]: !p[name] }));
  const addCustom = () => { const n = custom.trim(); if (!n) return; setSelected((p) => ({ ...p, [n]: true })); setCustom(''); };

  const confirm = async () => {
    const picks = Object.keys(selected).filter((k) => selected[k]);
    if (picks.length === 0) { onOpenChange(false); return; }
    setBusy(true);
    const toCreate = picks
      .filter((n) => !existingNames.has(normalizeName(n)))
      .map((n) => ({ list_name: listName, name: n, normalized_name: normalizeName(n), category: 'Other', checked: false, recurring: 'staple' }));
    try { if (toCreate.length) await base44.entities.GroceryItem.bulkCreate(toCreate); } catch { /* ignore */ }
    setBusy(false);
    setSelected({}); setCustom('');
    onAdded && onAdded();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => onOpenChange(o)}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add staples</SheetTitle></SheetHeader>
        <p className="text-xs text-muted-foreground text-center mb-3">Tap the items you need. Already on your list are skipped.</p>
        <div className="flex gap-2 mb-3">
          <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add your own staple" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && addCustom()} />
          <Button variant="outline" className="rounded-full shrink-0" onClick={addCustom}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="space-y-1">
          {options.map((name) => {
            const already = existingNames.has(normalizeName(name));
            return (
              <label key={name} className={`flex items-center gap-3 rounded-2xl border bg-card px-3 py-2.5 ${already ? 'opacity-50' : ''}`}>
                <Checkbox checked={!!selected[name] || already} disabled={already} onCheckedChange={() => !already && toggle(name)} />
                <span className="text-sm flex-1">{name}</span>
                {already && <span className="text-[10px] text-muted-foreground">on list</span>}
              </label>
            );
          })}
        </div>
        <Button className="rounded-full w-full mt-4" onClick={confirm} disabled={busy}>
          <Check className="w-4 h-4 mr-1" /> Add to {listName}
        </Button>
      </SheetContent>
    </Sheet>
  );
}