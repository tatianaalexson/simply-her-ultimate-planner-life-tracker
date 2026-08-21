import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Pencil, Trash2, Heart } from 'lucide-react';
import { useSavedFoods } from '@/hooks/useNutrition';
import { fmtNut, MACRO_FIELDS, OPTIONAL_NUTRIENTS } from '@/lib/nutrition';
import EmptyState from '@/components/EmptyState';

const EMPTY = { name: '', brand: '', category: 'Other', serving_size: 1, serving_unit: 'serving', calories: '', protein: '', carbs: '', fat: '' };

export default function SavedFoods() {
  const { isFeatureEnabled } = useAppSettings();
  const { items, add, update, remove } = useSavedFoods();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const moreNutrients = isFeatureEnabled('kit.moreNutrients');

  const startNew = () => { setEditing(null); setOpen(true); };
  const startEdit = (f) => { setEditing(f); setOpen(true); };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Reusable foods for quick logging.</p>
        <Button size="sm" className="rounded-full" onClick={startNew}><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Heart} title="No saved foods yet." subtitle="Add your usuals — toast, yogurt, protein shake — for one-tap logging." />
      ) : (
        <div className="space-y-2">
          {items.map((f) => (
            <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {fmtNut(f.calories)} cal · {f.serving_size} {f.serving_unit}
                </p>
              </div>
              {f.favourite && <Heart className="w-3.5 h-3.5 fill-current text-primary" />}
              <button onClick={() => startEdit(f)} className="p-1 text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
              <button onClick={() => remove(f.id)} className="p-1 text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      {open && (
        <SavedFoodForm
          food={editing}
          moreNutrients={moreNutrients}
          onSave={async (data) => {
            if (editing) await update(editing.id, data);
            else await add(data);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function SavedFoodForm({ food, moreNutrients, onSave, onClose }) {
  const [f, setF] = useState({ ...EMPTY, ...food });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const fields = [
    ...MACRO_FIELDS.map((m) => ({ ...m, key: m.key })),
    ...(moreNutrients ? OPTIONAL_NUTRIENTS.slice(0, 4) : []),
  ];

  const submit = async () => {
    if (!f.name?.trim()) return;
    setBusy(true);
    const payload = {
      name: f.name,
      brand: f.brand || '',
      category: f.category || 'Other',
      serving_size: +f.serving_size || 1,
      serving_unit: f.serving_unit || 'serving',
      calories: +f.calories || 0,
      protein: +f.protein || 0,
      carbs: +f.carbs || 0,
      fat: +f.fat || 0,
      favourite: !!f.favourite,
    };
    if (moreNutrients) {
      OPTIONAL_NUTRIENTS.slice(0, 4).forEach((n) => { payload[n.key] = +f[n.key] || 0; });
    }
    await onSave(payload);
    setBusy(false);
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pt-4 pb-8 max-h-[92vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">{food ? 'Edit food' : 'New saved food'}</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Name" className="rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={f.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Brand (optional)" className="rounded-2xl" />
            <Input value={f.category} onChange={(e) => set('category', e.target.value)} placeholder="Category" className="rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={f.serving_size} onChange={(e) => set('serving_size', e.target.value)} placeholder="Serving size" className="rounded-2xl" />
            <Input value={f.serving_unit} onChange={(e) => set('serving_unit', e.target.value)} placeholder="Unit (g, ml, piece)" className="rounded-2xl" />
          </div>
          <Input type="number" value={f.calories} onChange={(e) => set('calories', e.target.value)} placeholder="Calories" className="rounded-2xl" />
          <div className="grid grid-cols-3 gap-2">
            {MACRO_FIELDS.map((m) => (
              <Input key={m.key} type="number" value={f[m.key]} onChange={(e) => set(m.key, e.target.value)} placeholder={`${m.label} ${m.unit}`} className="rounded-2xl" />
            ))}
          </div>
          <button
            onClick={() => set('favourite', !f.favourite)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <Heart className={`w-4 h-4 ${f.favourite ? 'fill-current text-primary' : ''}`} /> Favourite
          </button>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={submit} disabled={busy || !f.name?.trim()}>Save</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}