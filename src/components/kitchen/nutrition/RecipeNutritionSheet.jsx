import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { useAppSettings } from '@/lib/AppSettings';
import { MACRO_FIELDS, OPTIONAL_NUTRIENTS } from '@/lib/nutrition';
import { cn } from '@/lib/utils';

// Edit a recipe's nutrition. Basis controls whether stored values are
// per-serving or for the whole recipe; the opposite is derived live.
export default function RecipeNutritionSheet({ recipe, onSave, onClose }) {
  const { isFeatureEnabled } = useAppSettings();
  const moreNutrients = isFeatureEnabled('kit.moreNutrients');
  const [basis, setBasis] = useState(recipe?.nutrition_basis || 'none');
  const [f, setF] = useState({
    calories: recipe?.calories ?? '',
    protein: recipe?.protein ?? '',
    carbs: recipe?.carbs ?? '',
    fat: recipe?.fat ?? '',
    fibre: recipe?.fibre ?? '',
    sugar: recipe?.sugar ?? '',
    sodium: recipe?.sodium ?? '',
    saturated_fat: recipe?.saturated_fat ?? '',
  });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const servings = Math.max(1, recipe?.default_servings || 1);
  const perServing = basis === 'total'
    ? Object.fromEntries(Object.entries(f).map(([k, v]) => [k, (+v || 0) / servings]))
    : f;
  const total = basis === 'per_serving'
    ? Object.fromEntries(Object.entries(f).map(([k, v]) => [k, (+v || 0) * servings]))
    : f;

  const save = async () => {
    await onSave({
      nutrition_basis: basis,
      calories: +f.calories || 0,
      protein: +f.protein || 0,
      carbs: +f.carbs || 0,
      fat: +f.fat || 0,
      ...(moreNutrients ? {
        fibre: +f.fibre || 0,
        sugar: +f.sugar || 0,
        sodium: +f.sodium || 0,
        saturated_fat: +f.saturated_fat || 0,
      } : {}),
    });
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pt-4 pb-8 max-h-[92vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Recipe nutrition</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <div>
            <label className="text-[11px] text-muted-foreground">Enter as</label>
            <Select value={basis} onValueChange={setBasis}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No nutrition</SelectItem>
                <SelectItem value="per_serving">Per serving</SelectItem>
                <SelectItem value="total">Whole recipe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {basis !== 'none' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground">Calories</label>
                  <Input type="number" value={f.calories} onChange={(e) => set('calories', e.target.value)} className="rounded-2xl" />
                </div>
                {MACRO_FIELDS.map((m) => (
                  <div key={m.key}>
                    <label className="text-[11px] text-muted-foreground">{m.label} ({m.unit})</label>
                    <Input type="number" value={f[m.key]} onChange={(e) => set(m.key, e.target.value)} className="rounded-2xl" />
                  </div>
                ))}
              </div>

              {moreNutrients && (
                <div className="grid grid-cols-2 gap-2">
                  {OPTIONAL_NUTRIENTS.slice(0, 4).map((n) => (
                    <div key={n.key}>
                      <label className="text-[11px] text-muted-foreground">{n.label} ({n.unit})</label>
                      <Input type="number" value={f[n.key]} onChange={(e) => set(n.key, e.target.value)} className="rounded-2xl" />
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl bg-secondary/40 p-3 text-xs text-muted-foreground space-y-0.5">
                <p>Per serving (serves {servings}): {Math.round(perServing.calories || 0)} cal · P {Math.round(perServing.protein || 0)}g · C {Math.round(perServing.carbs || 0)}g · F {Math.round(perServing.fat || 0)}g</p>
                <p>Whole recipe: {Math.round(total.calories || 0)} cal</p>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={onClose}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={save}>Save</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}