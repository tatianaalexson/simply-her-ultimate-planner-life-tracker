import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Box, Refrigerator, Snowflake, Ban, Plus, Replace, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { normalizeName, unitsCompatible, sumAmounts } from '@/lib/kitchenGrocery';
import { logInventoryEvent } from '@/lib/inventoryHistory';
import { todayStr } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

const ZONES = [
  { id: 'pantry', label: 'Pantry', icon: Box },
  { id: 'fridge', label: 'Fridge', icon: Refrigerator },
  { id: 'freezer', label: 'Freezer', icon: Snowflake },
];

const MATCH_ACTIONS = [
  { id: 'add', label: 'Add to existing', icon: Plus },
  { id: 'replace', label: 'Replace quantity', icon: Replace },
  { id: 'separate', label: 'Create separate', icon: Layers },
  { id: 'skip', label: "Don't track", icon: Ban },
];

function parseQty(q) {
  if (typeof q === 'number') return q;
  if (!q) return 0;
  const n = parseFloat(String(q).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function fmtQty(n) {
  if (Number.isInteger(n)) return String(n);
  return String(Math.round(n * 100) / 100);
}

export default function PostShoppingSheet({ open, onOpenChange, listName, items, onDone }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Per-item review state: { [itemKey]: { action, zone, qty, unit, storage, purchaseDate, bestBefore } }
  const [reviewState, setReviewState] = useState({});

  useEffect(() => {
    if (!open || !items?.length) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const inv = await base44.entities.FoodInventoryItem.filter({ status: 'available' }, 'name');
        if (!cancelled) setInventory(inv);
      } catch {
        if (!cancelled) setInventory([]);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [open, items]);

  // Build review items with matches
  const reviewItems = useMemo(() => {
    if (!items?.length) return [];
    return items.map((gi, idx) => {
      const nn = gi.normalized_name || normalizeName(gi.name);
      const matches = inventory.filter((inv) => (inv.normalized_name || normalizeName(inv.name)) === nn && inv.status === 'available');
      const bestMatch = matches[0] || null;
      const purchasedQty = parseQty(gi.qty) || parseQty(gi.amount) || 1;
      const unit = gi.unit || (bestMatch?.unit) || '';

      const key = gi.id || `idx-${idx}`;
      const existing = reviewState[key];

      // Default action
      let defaultAction = 'skip';
      let defaultZone = bestMatch?.zone || 'pantry';

      if (bestMatch) {
        defaultAction = existing?.action || 'add';
      } else {
        defaultAction = existing?.action || 'pantry';
      }

      return {
        key,
        groceryItem: gi,
        normalized_name: nn,
        bestMatch,
        allMatches: matches,
        purchasedQty,
        unit,
        review: {
          action: existing?.action ?? defaultAction,
          zone: existing?.zone ?? defaultZone,
          qty: existing?.qty ?? purchasedQty,
          unit: existing?.unit ?? unit,
          storage: existing?.storage ?? (bestMatch?.storage_location || ''),
          purchaseDate: existing?.purchaseDate ?? todayStr(),
          bestBefore: existing?.bestBefore ?? '',
        },
      };
    });
  }, [items, inventory, reviewState]);

  const setItem = (key, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };

  const trackableItems = reviewItems.filter((ri) => {
    const action = ri.review.action;
    return action !== 'skip';
  });

  const confirm = async () => {
    setSaving(true);
    const updates = [];
    const creates = [];

    for (const ri of reviewItems) {
      const { action, zone, qty, unit, storage, purchaseDate, bestBefore } = ri.review;
      if (action === 'skip') continue;

      const amount = parseQty(qty) || 1;
      const itemName = ri.groceryItem.name;
      const nn = ri.normalized_name;

      if (action === 'add' && ri.bestMatch) {
        // Add to existing quantity
        const oldAmount = ri.bestMatch.amount || parseQty(ri.bestMatch.qty) || 0;
        const compatible = unitsCompatible(unit, ri.bestMatch.unit);
        let newAmount;
        if (compatible) {
          const summed = sumAmounts(oldAmount, ri.bestMatch.unit, amount, unit);
          newAmount = summed !== null ? summed : oldAmount + amount;
        } else {
          newAmount = oldAmount + amount; // fallback: direct add (may lose unit precision)
        }
        updates.push({
          id: ri.bestMatch.id,
          data: { amount: newAmount, qty: fmtQty(newAmount), date_purchased: purchaseDate || ri.bestMatch.date_purchased },
          oldAmount, newAmount, unit: ri.bestMatch.unit, itemName, zone: ri.bestMatch.zone,
        });
      } else if (action === 'replace' && ri.bestMatch) {
        // Replace quantity
        updates.push({
          id: ri.bestMatch.id,
          data: { amount, qty: fmtQty(amount), unit, date_purchased: purchaseDate || ri.bestMatch.date_purchased, best_before: bestBefore || ri.bestMatch.best_before },
          oldAmount: ri.bestMatch.amount || parseQty(ri.bestMatch.qty) || 0,
          newAmount: amount, unit, itemName, zone: ri.bestMatch.zone,
        });
      } else if (action === 'separate' || action === 'pantry' || action === 'fridge' || action === 'freezer') {
        const targetZone = action === 'separate' ? zone : action;
        creates.push({
          data: {
            name: itemName,
            normalized_name: nn,
            zone: targetZone,
            storage_location: storage,
            category: ri.groceryItem.category || 'Other',
            amount,
            qty: fmtQty(amount),
            unit,
            date_purchased: purchaseDate || todayStr(),
            best_before: bestBefore || '',
            staple: false,
            status: 'available',
            source_recipe_ids: ri.groceryItem.source_recipe_ids || [],
          },
          amount, unit, itemName, zone: targetZone,
        });
      }
    }

    // Execute creates
    if (creates.length) {
      try {
        const created = await base44.entities.FoodInventoryItem.bulkCreate(creates.map((c) => c.data));
        const arr = Array.isArray(created) ? created : [created];
        for (let i = 0; i < arr.length && i < creates.length; i++) {
          logInventoryEvent(arr[i].id, 'added', { toAmount: creates[i].amount, unit: creates[i].unit, itemName: creates[i].itemName, toZone: creates[i].zone });
        }
      } catch { /* ignore */ }
    }

    // Execute updates
    for (const u of updates) {
      try {
        await base44.entities.FoodInventoryItem.update(u.id, u.data);
        const evtType = u.newAmount > u.oldAmount ? 'qty_increased' : (u.newAmount < u.oldAmount ? 'qty_decreased' : 'qty_set');
        logInventoryEvent(u.id, evtType, { fromAmount: u.oldAmount, toAmount: u.newAmount, unit: u.unit, itemName: u.itemName });
      } catch { /* ignore */ }
    }

    setSaving(false);
    onOpenChange(false);
    onDone?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[92vh] flex flex-col">
        <SheetHeader className="text-center shrink-0">
          <SheetTitle className="font-heading">Add purchased items to inventory?</SheetTitle>
          <SheetDescription>
            From <span className="font-medium text-foreground">{listName}</span> · {items?.length || 0} purchased item{(items?.length || 0) !== 1 ? 's' : ''}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading inventory…</p>
        ) : (
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-3 pr-1">
              {reviewItems.map((ri) => (
                <ReviewItemCard key={ri.key} ri={ri} onSet={(field, val) => setItem(ri.key, field, val)} />
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex gap-2 pt-3 shrink-0 border-t border-border/40">
          <Button variant="ghost" className="rounded-full flex-1" onClick={() => { onOpenChange(false); onDone?.(); }}>Not Now</Button>
          <Button className="rounded-full flex-1" onClick={confirm} disabled={saving || trackableItems.length === 0}>
            {saving ? 'Saving…' : `Track ${trackableItems.length} item${trackableItems.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ReviewItemCard({ ri, onSet }) {
  const { groceryItem: gi, bestMatch, purchasedQty, unit, review } = ri;
  const hasMatch = !!bestMatch;
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-3 space-y-2.5">
      {/* Item header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{gi.name}</p>
          <p className="text-xs text-muted-foreground">
            Purchased: {fmtQty(purchasedQty)} {unit}
          </p>
        </div>
        {hasMatch && (
          <Badge variant="secondary" className="shrink-0 text-[10px]">In inventory</Badge>
        )}
      </div>

      {/* Existing match info */}
      {hasMatch && (
        <div className="rounded-xl bg-secondary/40 px-3 py-2 space-y-0.5">
          <p className="text-[11px] text-muted-foreground">Currently tracked:</p>
          <p className="text-xs font-medium">
            {bestMatch.amount || bestMatch.qty} {bestMatch.unit} · {bestMatch.zone}
            {bestMatch.storage_location ? ` · ${bestMatch.storage_location}` : ''}
          </p>
        </div>
      )}

      {/* Action selector */}
      <div className="flex flex-wrap gap-1.5">
        {hasMatch ? (
          MATCH_ACTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => onSet('action', a.id)}
              className={cn(
                'inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition',
                review.action === a.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              )}
            >
              <a.icon className="w-3 h-3" /> {a.label}
            </button>
          ))
        ) : (
          <>
            {ZONES.map((z) => (
              <button
                key={z.id}
                onClick={() => onSet('action', z.id)}
                className={cn(
                  'inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition',
                  review.action === z.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                )}
              >
                <z.icon className="w-3 h-3" /> {z.label}
              </button>
            ))}
            <button
              onClick={() => onSet('action', 'skip')}
              className={cn(
                'inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition',
                review.action === 'skip' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              )}
            >
              <Ban className="w-3 h-3" /> Don't Track
            </button>
          </>
        )}
      </div>

      {/* Details (collapsible) */}
      {review.action !== 'skip' && (
        <>
          <button onClick={() => setShowDetails((s) => !s)} className="text-[11px] text-primary flex items-center gap-0.5">
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Details
          </button>
          {showDetails && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Quantity</label>
                  <Input type="number" value={review.qty} onChange={(e) => onSet('qty', e.target.value)} className="rounded-xl h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Unit</label>
                  <Input value={review.unit} onChange={(e) => onSet('unit', e.target.value)} className="rounded-xl h-8 text-sm" />
                </div>
              </div>
              {(review.action === 'separate' || !hasMatch) && (
                <div>
                  <label className="text-[10px] text-muted-foreground">Storage location</label>
                  <Input value={review.storage} onChange={(e) => onSet('storage', e.target.value)} placeholder="e.g. Top shelf" className="rounded-xl h-8 text-sm" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Purchase date</label>
                  <Input type="date" value={review.purchaseDate} onChange={(e) => onSet('purchaseDate', e.target.value)} className="rounded-xl h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Best before (optional)</label>
                  <Input type="date" value={review.bestBefore} onChange={(e) => onSet('bestBefore', e.target.value)} className="rounded-xl h-8 text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Preview for add/replace */}
          {hasMatch && review.action === 'add' && (
            <p className="text-[11px] text-muted-foreground">
              → Total: {fmtQty((bestMatch.amount || parseQty(bestMatch.qty) || 0) + purchasedQty)} {review.unit || bestMatch.unit}
            </p>
          )}
          {hasMatch && review.action === 'replace' && (
            <p className="text-[11px] text-muted-foreground">
              → Total: {fmtQty(purchasedQty)} {review.unit}
            </p>
          )}
        </>
      )}
    </div>
  );
}