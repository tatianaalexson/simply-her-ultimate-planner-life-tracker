import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Trash2, Copy, Sparkles, Save, Pencil } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useKitchenTemplates, useRecipes } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { GROCERY_CATEGORIES, MEAL_SLOTS, DAY_OF_WEEK, EMPTY_TEMPLATES } from '@/components/kitchen/kitchenConstants';
import ApplyGroceryTemplateSheet from '@/components/kitchen/template/ApplyGroceryTemplateSheet';
import ApplyMealPlanTemplateSheet from '@/components/kitchen/template/ApplyMealPlanTemplateSheet';

const KINDS = [
  { value: 'meal-plan', label: 'Meal Plans', feat: 'kit.mealTemplates' },
  { value: 'grocery', label: 'Grocery Lists', feat: 'kit.groceryTemplates' },
  { value: 'meal-prep', label: 'Meal Prep', feat: 'kit.prepTemplates' },
];

export default function TemplatesView({ onBack }) {
  const { isFeatureEnabled } = useAppSettings();
  const kinds = KINDS.filter((k) => isFeatureEnabled(k.feat));
  const [kind, setKind] = useState(kinds[0]?.value || 'meal-plan');
  const [editing, setEditing] = useState(null); // {record} | 'new'
  const [applyGrocery, setApplyGrocery] = useState(null);
  const [applyMealPlan, setApplyMealPlan] = useState(null);
  const { items, add, update, remove } = useKitchenTemplates(kind);
  const { items: recipes } = useRecipes();

  const recipeName = (id) => recipes.find((r) => r.id === id)?.name || '';

  const startNew = () => setEditing({ record: { kind, name: '', description: '', items: [], meals: [], prep_items: [], prep_tasks: [], prep_default_portions: 4, notes: '' } });
  const save = async (data) => {
    if (data.id) { await update(data.id, data); } else { await add(data); }
    setEditing(null);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full">←</Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Templates</h2>
        <Button size="sm" className="rounded-full" onClick={startNew}><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>

      <div className="flex gap-1 p-1 bg-secondary rounded-full">
        {kinds.map((k) => (
          <button key={k.value} onClick={() => setKind(k.value)} className={`flex-1 text-xs py-1.5 rounded-full ${kind === k.value ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>{k.label}</button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Sparkles} title={EMPTY_TEMPLATES[kind]?.title} subtitle={EMPTY_TEMPLATES[kind]?.subtitle} />
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <div key={t.id} className="rounded-3xl border bg-card p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {kind === 'grocery' ? `${(t.items || []).length} items` : kind === 'meal-plan' ? `${(t.meals || []).length} meals` : `${(t.prep_items || []).length} items`}
                    {t.description ? ` · ${t.description}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {kind === 'grocery' && <Button size="sm" className="rounded-full h-7 text-xs" onClick={() => setApplyGrocery(t)}>Apply</Button>}
                {kind === 'meal-plan' && <Button size="sm" className="rounded-full h-7 text-xs" onClick={() => setApplyMealPlan(t)}>Apply</Button>}
                {kind === 'meal-prep' && <Button size="sm" className="rounded-full h-7 text-xs" onClick={() => applyMealPrep(t)}>Use</Button>}
                <Button size="sm" variant="outline" className="rounded-full h-7 text-xs" onClick={() => setEditing({ record: t })}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => add({ ...stripIds(t), name: `${t.name} (copy)` })}><Copy className="w-3 h-3 mr-1" /> Duplicate</Button>
                <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => remove(t.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <TemplateEditor template={editing.record} recipes={recipes} recipeName={recipeName} onSave={save} onCancel={() => setEditing(null)} />
      )}
      <ApplyGroceryTemplateSheet template={applyGrocery} onClose={() => setApplyGrocery(null)} />
      <ApplyMealPlanTemplateSheet template={applyMealPlan} recipes={recipes} recipeName={recipeName} onClose={() => setApplyMealPlan(null)} />
    </div>
  );
}

function stripIds(t) { const { id, created_date, updated_date, ...rest } = t; return rest; }

async function applyMealPrep(template) {
  const { base44 } = await import('@/api/base44Client');
  const { todayStr } = await import('@/components/kitchen/kitchenConstants');
  await base44.entities.MealPrepSession.create({
    name: `${template.name}`, date: todayStr(), status: 'planned',
    items: (template.prep_items || []).map((it) => ({ ...it })),
    tasks: (template.prep_tasks || []).map((t, i) => ({ ...t, id: String(Date.now() + i), done: false, order: i })),
    outputs: [], notes: template.notes || '',
  });
}

function TemplateEditor({ template, recipes, recipeName, onSave, onCancel }) {
  const [t, setT] = useState({ ...template });
  const set = (k, v) => setT((p) => ({ ...p, [k]: v }));
  const kind = t.kind;
  const recipeOpt = (val) => <option value="">—</option> || null;

  return (
    <Sheet open onOpenChange={(o) => !o && onCancel()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">{t.id ? 'Edit template' : 'New template'}</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={t.name} onChange={(e) => set('name', e.target.value)} placeholder="Template name" className="rounded-2xl" />
          <Input value={t.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Description (optional)" className="rounded-2xl" />

          {kind === 'grocery' && <GroceryTemplateEditor t={t} set={set} />}
          {kind === 'meal-plan' && <MealPlanTemplateEditor t={t} set={set} recipes={recipes} />}
          {kind === 'meal-prep' && <MealPrepTemplateEditor t={t} set={set} recipes={recipes} />}

          <Textarea value={t.notes || ''} onChange={(e) => set('notes', e.target.value)} placeholder="Notes (optional)" className="rounded-2xl" />
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full flex-1" onClick={onCancel}>Cancel</Button>
            <Button className="rounded-full flex-1" onClick={() => onSave(t)} disabled={!t.name?.trim()}><Save className="w-4 h-4 mr-1" /> Save template</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function GroceryTemplateEditor({ t, set }) {
  const items = t.items || [];
  const upd = (i, k, v) => set('items', items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const addRow = () => set('items', [...items, { name: '', qty: '1', unit: '', category: 'Other', store: '', notes: '' }]);
  const del = (i) => set('items', items.filter((_, j) => j !== i));
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Items</p>
      {items.map((it, i) => (
        <div key={i} className="space-y-1 border-t border-border pt-2 first:border-0 first:pt-0">
          <div className="flex gap-1.5">
            <Input value={it.name} onChange={(e) => upd(i, 'name', e.target.value)} placeholder="Item" className="rounded-2xl flex-1 h-8 text-xs" />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <Input value={it.qty || ''} onChange={(e) => upd(i, 'qty', e.target.value)} placeholder="Qty" className="rounded-2xl h-8 text-xs" />
            <Input value={it.unit || ''} onChange={(e) => upd(i, 'unit', e.target.value)} placeholder="Unit" className="rounded-2xl h-8 text-xs" />
            <select value={it.category || 'Other'} onChange={(e) => upd(i, 'category', e.target.value)} className="rounded-2xl border bg-card px-2 h-8 text-xs">
              {GROCERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Input value={it.store || ''} onChange={(e) => upd(i, 'store', e.target.value)} placeholder="Store" className="rounded-2xl h-8 text-xs" />
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" className="rounded-full" onClick={addRow}><Plus className="w-3 h-3 mr-1" /> Add item</Button>
    </div>
  );
}

function MealPlanTemplateEditor({ t, set, recipes }) {
  const meals = t.meals || [];
  const upd = (i, k, v) => set('meals', meals.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const addRow = () => set('meals', [...meals, { day_of_week: 0, meal_slot: 'dinner', meal_type: 'custom', recipe_id: '', custom_name: '', servings: 1, notes: '' }]);
  const del = (i) => set('meals', meals.filter((_, j) => j !== i));
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Meals</p>
      {meals.map((m, i) => (
        <div key={i} className="space-y-1 border-t border-border pt-2 first:border-0 first:pt-0">
          <div className="grid grid-cols-2 gap-1.5">
            <select value={m.day_of_week ?? 0} onChange={(e) => upd(i, 'day_of_week', parseInt(e.target.value))} className="rounded-2xl border bg-card px-2 h-8 text-xs">
              {DAY_OF_WEEK.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select value={m.meal_slot || 'dinner'} onChange={(e) => upd(i, 'meal_slot', e.target.value)} className="rounded-2xl border bg-card px-2 h-8 text-xs">
              {MEAL_SLOTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-1.5">
            <select value={m.meal_type || 'custom'} onChange={(e) => upd(i, 'meal_type', e.target.value)} className="rounded-2xl border bg-card px-2 h-8 text-xs flex-1">
              {['recipe', 'custom', 'restaurant', 'mealprep', 'open'].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => del(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
          </div>
          {m.meal_type === 'recipe' ? (
            <select value={m.recipe_id || ''} onChange={(e) => upd(i, 'recipe_id', e.target.value)} className="rounded-2xl border bg-card px-2 h-8 text-xs w-full">
              <option value="">Choose recipe</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          ) : (
            <Input value={m.custom_name || ''} onChange={(e) => upd(i, 'custom_name', e.target.value)} placeholder="Meal name" className="rounded-2xl h-8 text-xs" />
          )}
        </div>
      ))}
      <Button size="sm" variant="outline" className="rounded-full" onClick={addRow}><Plus className="w-3 h-3 mr-1" /> Add meal</Button>
    </div>
  );
}

function MealPrepTemplateEditor({ t, set, recipes }) {
  const items = t.prep_items || [];
  const tasks = t.prep_tasks || [];
  const updItem = (i, k, v) => set('prep_items', items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const addItem = () => set('prep_items', [...items, { recipe_id: '', custom_name: '', portions: 1, servings: 1 }]);
  const delItem = (i) => set('prep_items', items.filter((_, j) => j !== i));
  const updTask = (i, k, v) => set('prep_tasks', tasks.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const addTask = () => set('prep_tasks', [...tasks, { text: '', type: 'custom', duration: 0 }]);
  const delTask = (i) => set('prep_tasks', tasks.filter((_, j) => j !== i));
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-sm font-medium">Items</p>
        {items.map((it, i) => (
          <div key={i} className="flex gap-1.5 border-t border-border pt-2 first:border-0 first:pt-0">
            <select value={it.recipe_id || ''} onChange={(e) => updItem(i, 'recipe_id', e.target.value)} className="rounded-2xl border bg-card px-2 h-8 text-xs flex-1">
              <option value="">Custom</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {!it.recipe_id && <Input value={it.custom_name || ''} onChange={(e) => updItem(i, 'custom_name', e.target.value)} placeholder="Name" className="rounded-2xl h-8 text-xs flex-1" />}
            <Input type="number" value={it.portions || 1} onChange={(e) => updItem(i, 'portions', parseInt(e.target.value) || 1)} className="rounded-2xl h-8 text-xs w-16" />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => delItem(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="rounded-full" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add item</Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Standard tasks</p>
        {tasks.map((tk, i) => (
          <div key={i} className="flex gap-1.5 border-t border-border pt-2 first:border-0 first:pt-0">
            <Input value={tk.text} onChange={(e) => updTask(i, 'text', e.target.value)} placeholder="Task" className="rounded-2xl h-8 text-xs flex-1" />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => delTask(i)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
          </div>
        ))}
        <Button size="sm" variant="outline" className="rounded-full" onClick={addTask}><Plus className="w-3 h-3 mr-1" /> Add task</Button>
      </div>
    </div>
  );
}