import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { buildGroceryReview, resolveAmount, formatQuantity } from '@/lib/kitchenGrocery';

const DECISIONS = ['buy_suggested', 'buy_full', 'skip', 'edit'];

export default function GroceryReviewDialog({ open, onOpenChange, sources = [], listName = 'Weekly Groceries', onAdded }) {
  const [review, setReview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sourcesKey = JSON.stringify(sources.map((s) => ({ id: s.recipe?.id, sv: s.plannedServings, m: s.meal?.id, p: s.prep?.id })));

  useEffect(() => {
    if (!open || sources.length === 0) { setReview([]); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [invRes, existing] = await Promise.all([
          base44.entities.FoodInventoryItem.filter({ status: 'available' }, 'name'),
          base44.entities.GroceryItem.filter({ list_name: listName }, '-created_date'),
        ]);
        let settings = { pantry_aware: true, fridge_aware: true, freezer_aware: true };
        try {
          const ks = await base44.entities.KitchenSetting.filter({ kind: 'kitchen' }, '-created_date', 1);
          if (ks[0]) settings = ks[0];
        } catch { /* defaults */ }
        const invFiltered = invRes.filter((i) => {
          if (i.zone === 'pantry' && settings.pantry_aware === false) return false;
          if (i.zone === 'fridge' && settings.fridge_aware === false) return false;
          if (i.zone === 'freezer' && settings.freezer_aware === false) return false;
          return true;
        });
        const r = buildGroceryReview(sources, invFiltered, existing, settings);
        if (!cancelled) setReview(r);
      } catch {
        if (!cancelled) setReview([]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, sourcesKey, listName]);

  const setDecision = (key, decision) =>
    setReview((p) => p.map((r) => (r.key === key ? { ...r, decision } : r)));
  const setEdit = (key, val) =>
    setReview((p) => p.map((r) => (r.key === key ? { ...r, decision: 'edit', edit_amount: val } : r)));

  const confirm = async () => {
    setSaving(true);
    const toCreate = [];
    for (const r of review) {
      const amt = resolveAmount(r);
      if (amt <= 0) continue;
      toCreate.push({
        list_name: listName,
        name: r.display_name,
        normalized_name: r.normalized_name,
        qty: String(formatQuantity(amt)),
        amount: amt,
        unit: r.unit || '',
        category: 'Other',
        checked: false,
        source_recipe_ids: [...new Set(r.sources.map((s) => s.recipe_id).filter(Boolean))],
        source_meal_ids: [...new Set(r.sources.map((s) => s.meal_id).filter(Boolean))],
        source_prep_id: r.sources.find((s) => s.prep_id)?.prep_id || null,
      });
    }
    try { if (toCreate.length) await base44.entities.GroceryItem.bulkCreate(toCreate); } catch { /* ignore */ }
    setSaving(false);
    onOpenChange(false);
    onAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review groceries</DialogTitle>
          <p className="text-xs text-muted-foreground">Adding to <span className="font-medium">{listName}</span>. Adjust each item before adding.</p>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Gathering ingredients…</p>
        ) : review.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nothing to add. Link a recipe to a meal to generate groceries.</p>
        ) : (
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-3 pr-1">
              {review.map((r) => (
                <div key={r.key} className="rounded-2xl border border-border p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize">{r.display_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Need {r.total_needed_str} {r.unit}
                        {r.has_inventory && <> · On hand {r.on_hand_str} {r.unit}</>}
                      </p>
                    </div>
                    <Badge variant={r.decision === 'skip' ? 'secondary' : 'default'} className="shrink-0">
                      {r.has_inventory ? `Buy ${r.suggested_str}` : `${r.total_needed_str} ${r.unit}`.trim()}
                    </Badge>
                  </div>
                  {r.sources.length > 0 && (
                    <p className="text-[11px] text-muted-foreground">
                      Needed for: {[...new Set(r.sources.map((s) => s.recipe_name).filter(Boolean))].join(', ')}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {DECISIONS.map((d) => {
                      if (d === 'buy_full' && !r.has_inventory) return null;
                      const labels = {
                        buy_suggested: r.has_inventory ? 'Buy suggested' : 'Add',
                        buy_full: 'Buy full',
                        skip: 'Skip',
                        edit: 'Edit',
                      };
                      return (
                        <Button key={d} size="sm" variant={r.decision === d ? 'default' : 'outline'}
                          className="rounded-full h-7 text-xs px-3" onClick={() => setDecision(r.key, d)}>
                          {labels[d]}
                        </Button>
                      );
                    })}
                  </div>
                  {r.decision === 'edit' && (
                    <Input type="number" defaultValue={r.suggested_to_buy || r.total_needed}
                      onBlur={(e) => setEdit(r.key, parseFloat(e.target.value) || 0)} className="rounded-2xl h-8" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirm} disabled={saving || review.length === 0}>
            {saving ? 'Adding…' : `Add ${review.filter((r) => resolveAmount(r) > 0).length} items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}