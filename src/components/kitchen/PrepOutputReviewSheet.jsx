import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Box, Refrigerator, Snowflake, ChevronDown, ChevronUp } from 'lucide-react';
import { logInventoryEvent } from '@/lib/inventoryHistory';
import { todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

// Review prepared food from a MealPrepSession and store outputs into inventory.
// Supports splitting one output between Fridge and Freezer.
// Only creates FoodInventoryItem records after explicit confirmation.
export default function PrepOutputReviewSheet({ open, onOpenChange, session, recipes, onDone }) {
  const [saving, setSaving] = useState(false);
  const [reviewState, setReviewState] = useState({});

  const outputs = session?.outputs || [];

  // Build review items from session outputs
  const reviewItems = useMemo(() => {
    return outputs.map((out, idx) => {
      const key = idx;
      const existing = reviewState[key];
      const totalPortions = out.portions || 1;
      const recipe = out.source_recipe_id ? recipes?.find((r) => r.id === out.source_recipe_id) : null;

      return {
        key,
        output: out,
        recipe,
        totalPortions,
        review: {
          track: existing?.track ?? true,
          fridgePortions: existing?.fridgePortions ?? (out.zone === 'fridge' ? totalPortions : (out.zone === 'freezer' ? 0 : totalPortions)),
          freezerPortions: existing?.freezerPortions ?? (out.zone === 'freezer' ? totalPortions : 0),
          storageLocation: existing?.storageLocation ?? (out.storage_location || ''),
          useBy: existing?.useBy ?? (out.use_by || ''),
          reheatNotes: existing?.reheatNotes ?? (out.reheat_notes || ''),
          preparedDate: existing?.preparedDate ?? (out.date_prepared || todayStr()),
        },
      };
    });
  }, [outputs, reviewState, recipes]);

  const setItem = (key, field, value) => {
    setReviewState((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };

  const trackableItems = reviewItems.filter((ri) => ri.review.track);

  const confirm = async () => {
    setSaving(true);
    const creates = [];

    for (const ri of reviewItems) {
      const { track, fridgePortions, freezerPortions, storageLocation, useBy, reheatNotes, preparedDate } = ri.review;
      if (!track) continue;

      const out = ri.output;
      const name = out.name;
      const nn = name.toLowerCase().trim();
      const recipeId = out.source_recipe_id || null;

      // Fridge portion
      const fp = parseInt(fridgePortions) || 0;
      if (fp > 0) {
        creates.push({
          data: {
            name,
            normalized_name: nn,
            zone: 'fridge',
            storage_location: storageLocation,
            category: 'Other',
            amount: fp,
            qty: String(fp),
            unit: 'portions',
            date_purchased: preparedDate || todayStr(),
            best_before: useBy || '',
            staple: false,
            status: 'available',
            source_recipe_id: recipeId,
            source_prep_id: session?.id,
            notes: reheatNotes ? `Reheat: ${reheatNotes}` : '',
          },
          amount: fp, unit: 'portions', itemName: name, zone: 'fridge',
        });
      }

      // Freezer portion
      const fzp = parseInt(freezerPortions) || 0;
      if (fzp > 0) {
        creates.push({
          data: {
            name,
            normalized_name: nn,
            zone: 'freezer',
            storage_location: storageLocation,
            category: 'Other',
            amount: fzp,
            qty: String(fzp),
            unit: 'portions',
            date_purchased: preparedDate || todayStr(),
            best_before: useBy || '',
            staple: false,
            status: 'available',
            source_recipe_id: recipeId,
            source_prep_id: session?.id,
            notes: reheatNotes ? `Reheat: ${reheatNotes}` : '',
          },
          amount: fzp, unit: 'portions', itemName: name, zone: 'freezer',
        });
      }

      // If no split and output was pantry
      if (fp === 0 && fzp === 0 && out.zone === 'pantry') {
        creates.push({
          data: {
            name,
            normalized_name: nn,
            zone: 'pantry',
            storage_location: storageLocation,
            category: 'Other',
            amount: ri.totalPortions,
            qty: String(ri.totalPortions),
            unit: 'portions',
            date_purchased: preparedDate || todayStr(),
            best_before: useBy || '',
            staple: false,
            status: 'available',
            source_recipe_id: recipeId,
            source_prep_id: session?.id,
            notes: reheatNotes ? `Reheat: ${reheatNotes}` : '',
          },
          amount: ri.totalPortions, unit: 'portions', itemName: name, zone: 'pantry',
        });
      }
    }

    if (creates.length) {
      try {
        const created = await base44.entities.FoodInventoryItem.bulkCreate(creates.map((c) => c.data));
        const arr = Array.isArray(created) ? created : [created];
        for (let i = 0; i < arr.length && i < creates.length; i++) {
          logInventoryEvent(arr[i].id, 'added', {
            toAmount: creates[i].amount,
            unit: creates[i].unit,
            itemName: creates[i].itemName,
            toZone: creates[i].zone,
          });
        }
      } catch { /* ignore */ }
    }

    setSaving(false);
    onOpenChange(false);
    onDone?.();
  };

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[92vh] flex flex-col">
        <SheetHeader className="text-center shrink-0">
          <SheetTitle className="font-heading">Review prepared food</SheetTitle>
          <SheetDescription>
            {session?.name} · {outputs.length} output{outputs.length !== 1 ? 's' : ''}
          </SheetDescription>
        </SheetHeader>

        {outputs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No outputs to review. Add outputs to this session first.</p>
        ) : (
          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-3 pr-1">
              {reviewItems.map((ri) => (
                <OutputReviewCard key={ri.key} ri={ri} onSet={(field, val) => setItem(ri.key, field, val)} />
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex gap-2 pt-3 shrink-0 border-t border-border/40">
          <Button variant="ghost" className="rounded-full flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="rounded-full flex-1" onClick={confirm} disabled={saving || trackableItems.length === 0}>
            {saving ? 'Storing…' : `Store ${trackableItems.length} item${trackableItems.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function OutputReviewCard({ ri, onSet }) {
  const { output: out, recipe, totalPortions, review } = ri;
  const [showDetails, setShowDetails] = useState(false);
  const fp = parseInt(review.fridgePortions) || 0;
  const fzp = parseInt(review.freezerPortions) || 0;
  const split = fp > 0 && fzp > 0;

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{out.name}</p>
          <p className="text-xs text-muted-foreground">
            {totalPortions} portion{totalPortions !== 1 ? 's' : ''}
            {recipe ? ` · ${recipe.name}` : ''}
          </p>
        </div>
        <button
          onClick={() => onSet('track', !review.track)}
          className={cn(
            'inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition shrink-0',
            review.track ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          )}
        >
          {review.track ? 'Track' : "Don't track"}
        </button>
      </div>

      {review.track && (
        <>
          {/* Split between Fridge / Freezer */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-border/40 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <Refrigerator className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">Fridge</span>
              </div>
              <Input type="number" value={review.fridgePortions} onChange={(e) => onSet('fridgePortions', e.target.value)} className="rounded-lg h-8 text-sm" />
            </div>
            <div className="rounded-xl border border-border/40 p-2.5 space-y-1">
              <div className="flex items-center gap-1.5">
                <Snowflake className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium">Freezer</span>
              </div>
              <Input type="number" value={review.freezerPortions} onChange={(e) => onSet('freezerPortions', e.target.value)} className="rounded-lg h-8 text-sm" />
            </div>
          </div>
          {split && (
            <p className="text-[11px] text-muted-foreground">
              Split: {fp} fridge + {fzp} freezer = {fp + fzp} total
            </p>
          )}

          {/* Details */}
          <button onClick={() => setShowDetails((s) => !s)} className="text-[11px] text-primary flex items-center gap-0.5">
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Details
          </button>
          {showDetails && (
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Prepared date</label>
                  <Input type="date" value={review.preparedDate} onChange={(e) => onSet('preparedDate', e.target.value)} className="rounded-xl h-8 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Use by (optional)</label>
                  <Input type="date" value={review.useBy} onChange={(e) => onSet('useBy', e.target.value)} className="rounded-xl h-8 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Storage location</label>
                <Input value={review.storageLocation} onChange={(e) => onSet('storageLocation', e.target.value)} placeholder="e.g. Top shelf" className="rounded-xl h-8 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Reheat notes</label>
                <Textarea value={review.reheatNotes} onChange={(e) => onSet('reheatNotes', e.target.value)} placeholder="e.g. Microwave 2 min, stir halfway" className="rounded-xl text-sm min-h-[50px]" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}