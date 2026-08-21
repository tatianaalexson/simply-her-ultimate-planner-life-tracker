import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart } from 'lucide-react';
import { useGroceryItems } from '@/hooks/useKitchen';
import { normalizeName } from '@/lib/kitchenGrocery';

// Apply a grocery template with a review screen:
// select all / individual, edit qty, choose destination list, skip/merge duplicates.
export default function ApplyGroceryTemplateSheet({ template, onClose }) {
  const [destList, setDestList] = useState('Weekly Groceries');
  const [rows, setRows] = useState(() => (template?.items || []).map((it) => ({
    name: it.name, qty: it.qty || '1', unit: it.unit || '', category: it.category || 'Other', store: it.store || '', selected: true,
  })));
  const [busy, setBusy] = useState(false);
  const { items: existing } = useGroceryItems(destList);

  const dupByName = useMemo(() => {
    const m = new Map();
    (existing || []).forEach((g) => m.set(normalizeName(g.name), g));
    return m;
  }, [existing]);

  const allSelected = rows.every((r) => r.selected);
  const toggleAll = (v) => setRows((p) => p.map((r) => ({ ...r, selected: v })));
  const upd = (i, k, v) => setRows((p) => p.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const apply = async () => {
    setBusy(true);
    const chosen = rows.filter((r) => r.selected && r.name?.trim());
    const toCreate = [];
    for (const r of chosen) {
      const dup = dupByName.get(normalizeName(r.name));
      if (dup) continue; // skip existing duplicates
      toCreate.push({
        list_name: destList, name: r.name, normalized_name: normalizeName(r.name),
        qty: r.qty, unit: r.unit, category: r.category, store: r.store,
        checked: false, recurring: 'none',
      });
    }
    if (toCreate.length) await base44.entities.GroceryItem.bulkCreate(toCreate);
    setBusy(false);
    onClose();
  };

  return (
    <Sheet open={!!template} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Apply grocery template</SheetTitle></SheetHeader>
        {template && (
          <div className="space-y-3 mt-4">
            <p className="text-xs text-muted-foreground text-center">{template.name}</p>
            <div className="flex gap-2 items-center">
              <span className="text-sm w-20">List</span>
              <Input value={destList} onChange={(e) => setDestList(e.target.value)} className="rounded-2xl flex-1" />
            </div>
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(v)} /> Select all
            </label>
            <div className="space-y-2">
              {rows.map((r, i) => {
                const dup = dupByName.get(normalizeName(r.name));
                return (
                  <div key={i} className={`rounded-2xl border p-2 ${dup ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Checkbox checked={r.selected} onCheckedChange={(v) => upd(i, 'selected', v)} disabled={!!dup} />
                      <Input value={r.name} onChange={(e) => upd(i, 'name', e.target.value)} className="rounded-2xl flex-1 h-8 text-xs" />
                      <Input value={r.qty} onChange={(e) => upd(i, 'qty', e.target.value)} className="rounded-2xl w-14 h-8 text-xs" />
                      <Input value={r.unit} onChange={(e) => upd(i, 'unit', e.target.value)} className="rounded-2xl w-14 h-8 text-xs" />
                    </div>
                    {dup && <p className="text-[10px] text-muted-foreground pl-7 mt-1">Already on this list — will be skipped</p>}
                  </div>
                );
              })}
            </div>
            <Button className="rounded-full w-full" onClick={apply} disabled={busy}><ShoppingCart className="w-4 h-4 mr-1" /> Add to list</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}