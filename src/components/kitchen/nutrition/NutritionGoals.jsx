import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNutritionGoals } from '@/hooks/useNutrition';
import { MACRO_FIELDS } from '@/lib/nutrition';

// Shared goals editor — writes to the SAME FitnessSetting singleton that the
// Fitness studio reads. One source of truth for calorie/macro targets.
export default function NutritionGoals() {
  const { record, save } = useNutritionGoals();
  const [f, setF] = useState(null);
  const [saved, setSaved] = useState(false);

  const goals = f || {
    calorie_goal: record?.calorie_goal ?? 2000,
    protein_goal: record?.protein_goal ?? 120,
    carbs_goal: record?.carbs_goal ?? 200,
    fat_goal: record?.fat_goal ?? 65,
  };
  const set = (k, v) => { setF((p) => ({ ...(p || goals), [k]: v })); setSaved(false); };

  const saveGoals = async () => {
    await save({
      calorie_goal: +goals.calorie_goal || 0,
      protein_goal: +goals.protein_goal || 0,
      carbs_goal: +goals.carbs_goal || 0,
      fat_goal: +goals.fat_goal || 0,
    });
    setF(null);
    setSaved(true);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Your daily targets. Shared with Fitness.</p>
      <div className="space-y-2">
        <div>
          <label className="text-[11px] text-muted-foreground">Daily calories</label>
          <Input type="number" value={goals.calorie_goal} onChange={(e) => set('calorie_goal', e.target.value)} className="rounded-2xl" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MACRO_FIELDS.map((m) => (
            <div key={m.key}>
              <label className="text-[11px] text-muted-foreground">{m.label} ({m.unit})</label>
              <Input type="number" value={goals[`${m.key}_goal`]} onChange={(e) => set(`${m.key}_goal`, e.target.value)} className="rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
      <Button className="rounded-full" onClick={saveGoals}>Save goals</Button>
      {saved && <p className="text-xs text-emerald-600">Goals saved.</p>}
    </div>
  );
}