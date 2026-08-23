import React, { useState } from 'react';
import { useEntityList } from '@/hooks/useEntityList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  MOVEMENT_CATEGORIES, MOVEMENT_PATTERNS, MEASUREMENT_MODES,
  EQUIPMENT_OPTIONS, POSITION_OPTIONS, SIDE_OPTIONS, ADAPTATION_TYPES
} from '@/lib/fitnessConstants';

export default function ExerciseForm({ exercise, onSave, onClose }) {
  const { add } = useEntityList('Exercise', {});
  const [form, setForm] = useState(exercise || {
    name: '', category: 'strength', movement_pattern: 'Custom',
    measurement_mode: 'reps', muscle_groups: '', body_areas: '',
    equipment: [], positions: [], laterality: 'bilateral',
    instructions: '', cues: '', notes: '', favourite: false, avoid: false, avoid_note: '',
    tags: ''
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleArr = (k, val) => setForm((p) => ({
    ...p, [k]: p[k]?.includes(val) ? p[k].filter((x) => x !== val) : [...(p[k] || []), val]
  }));

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = {
      ...form,
      muscle_groups: typeof form.muscle_groups === 'string' ? form.muscle_groups.split(',').map((s) => s.trim()).filter(Boolean) : form.muscle_groups,
      body_areas: typeof form.body_areas === 'string' ? form.body_areas.split(',').map((s) => s.trim()).filter(Boolean) : form.body_areas,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map((s) => s.trim()).filter(Boolean) : form.tags,
      custom: true, source: 'user'
    };
    if (exercise) {
      onSave?.(exercise.id, payload);
    } else {
      await add(payload);
    }
    onClose?.();
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">{exercise ? 'Edit Exercise' : 'New Exercise'}</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Goblet Squat" className="rounded-2xl mt-1" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full mt-1">
                {MOVEMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Measurement</Label>
              <select value={form.measurement_mode} onChange={(e) => set('measurement_mode', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full mt-1">
                {MEASUREMENT_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Movement Pattern</Label>
              <select value={form.movement_pattern} onChange={(e) => set('movement_pattern', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full mt-1">
                {MOVEMENT_PATTERNS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Laterality</Label>
              <select value={form.laterality} onChange={(e) => set('laterality', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full mt-1">
                {SIDE_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Muscle Groups (comma-separated)</Label>
            <Input value={Array.isArray(form.muscle_groups) ? form.muscle_groups.join(', ') : form.muscle_groups} onChange={(e) => set('muscle_groups', e.target.value)} placeholder="Quads, Glutes" className="rounded-2xl mt-1" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Equipment</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {EQUIPMENT_OPTIONS.slice(0, 12).map((eq) => (
                <button key={eq} onClick={() => toggleArr('equipment', eq)} className={`rounded-full px-2.5 py-1 text-xs border transition ${form.equipment?.includes(eq) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>
                  {eq}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Positions</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {POSITION_OPTIONS.map((pos) => (
                <button key={pos} onClick={() => toggleArr('positions', pos)} className={`rounded-full px-2.5 py-1 text-xs border transition ${form.positions?.includes(pos) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Instructions</Label>
            <Textarea value={form.instructions} onChange={(e) => set('instructions', e.target.value)} placeholder="How to perform" className="rounded-2xl mt-1 min-h-[60px]" />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Cues</Label>
            <Input value={form.cues} onChange={(e) => set('cues', e.target.value)} placeholder="Helpful form cues" className="rounded-2xl mt-1" />
          </div>

          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.favourite} onCheckedChange={(v) => set('favourite', v)} /> Favourite
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.avoid} onCheckedChange={(v) => set('avoid', v)} /> Not For Me
            </label>
          </div>
          {form.avoid && (
            <Input value={form.avoid_note} onChange={(e) => set('avoid_note', e.target.value)} placeholder="Why it doesn't work (optional)" className="rounded-2xl" />
          )}

          <Button className="rounded-full w-full" onClick={save} disabled={!form.name.trim()}>Save Exercise</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}