import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, ShoppingCart, ChefHat, ChevronRight } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useMealPrepSessions, useRecipes } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { PREP_TASK_TYPES, EMPTY, todayStr } from '@/components/kitchen/kitchenConstants';

export default function MealPrepView({ onBack, onOpenGroceryReview }) {
  const { isFeatureEnabled } = useAppSettings();
  const { items: sessions, add, update, remove } = useMealPrepSessions();
  const { items: recipes } = useRecipes();
  const [openId, setOpenId] = useState(null);

  const open = sessions.find((s) => s.id === openId);

  const generateGroceries = (session) => {
    const sources = (session.items || [])
      .filter((it) => it.recipe_id)
      .map((it) => ({ recipe: recipes.find((r) => r.id === it.recipe_id), plannedServings: it.servings || it.portions || 1, prep: { id: session.id } }))
      .filter((s) => s.recipe);
    if (sources.length === 0) return;
    onOpenGroceryReview(sources);
  };

  if (open) {
    return <SessionDetail session={open} recipes={recipes} onBack={() => setOpenId(null)} onUpdate={(data) => update(open.id, data)} onOpenGroceryReview={() => generateGroceries(open)} canGen={isFeatureEnabled('kit.prepGen')} canTasks={isFeatureEnabled('kit.prepTasks')} canStorage={isFeatureEnabled('kit.prepStorage')} />;
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Meal Prep</h2>
        <Button size="sm" className="rounded-full" onClick={() => add({ name: 'New prep session', date: todayStr(), status: 'planned', items: [], tasks: [], outputs: [] }).then((s) => setOpenId(s.id))}><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={ChefHat} title={EMPTY.mealprep.title} subtitle={EMPTY.mealprep.subtitle} />
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <Card key={s.id} className="rounded-3xl cursor-pointer active:scale-[0.98] transition" onClick={() => setOpenId(s.id)}>
              <CardContent className="p-3 flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{(s.items || []).length} item(s) · {s.status}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SessionDetail({ session, recipes, onBack, onUpdate, onOpenGroceryReview, canGen, canTasks, canStorage }) {
  const [newItem, setNewItem] = useState({ recipe_id: '', custom_name: '', portions: 1, servings: 1 });
  const [task, setTask] = useState({ text: '', type: 'chop', duration: 0 });
  const [output, setOutput] = useState({ name: '', portions: 1, zone: 'fridge', use_by: '' });

  const items = session.items || [];
  const tasks = session.tasks || [];
  const outputs = session.outputs || [];

  const addItem = () => {
    const name = newItem.recipe_id ? recipes.find((r) => r.id === newItem.recipe_id)?.name : newItem.custom_name;
    if (!name) return;
    onUpdate({ items: [...items, { ...newItem, custom_name: name }] });
    setNewItem({ recipe_id: '', custom_name: '', portions: 1, servings: 1 });
  };
  const addTask = () => {
    if (!task.text.trim()) return;
    onUpdate({ tasks: [...tasks, { ...task, id: String(Date.now()), done: false, order: tasks.length }] });
    setTask({ text: '', type: 'chop', duration: 0 });
  };
  const toggleTask = (id) => onUpdate({ tasks: tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  const addOutput = () => {
    if (!output.name.trim()) return;
    onUpdate({ outputs: [...outputs, { ...output, date_prepared: todayStr() }] });
    setOutput({ name: '', portions: 1, zone: 'fridge', use_by: '' });
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <Input value={session.name} onChange={(e) => onUpdate({ name: e.target.value })} className="rounded-2xl flex-1 font-heading" />
      </div>

      <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
        <div className="flex gap-2">
          <Input type="date" value={session.date || ''} onChange={(e) => onUpdate({ date: e.target.value })} className="rounded-2xl" />
          <select value={session.status} onChange={(e) => onUpdate({ status: e.target.value })} className="rounded-2xl border bg-card px-3 py-2 text-sm">
            {['planned', 'in_progress', 'completed'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <Textarea value={session.notes || ''} onChange={(e) => onUpdate({ notes: e.target.value })} placeholder="Notes" className="rounded-2xl" />
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
        <p className="text-sm font-medium">Items</p>
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{it.custom_name}</span>
            <span className="text-xs text-muted-foreground">{it.portions} portions</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate({ items: items.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
          </div>
        ))}
        <div className="flex gap-2">
          <select value={newItem.recipe_id} onChange={(e) => setNewItem((p) => ({ ...p, recipe_id: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm flex-1">
            <option value="">Recipe (or custom)</option>
            {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {!newItem.recipe_id && <Input value={newItem.custom_name} onChange={(e) => setNewItem((p) => ({ ...p, custom_name: e.target.value }))} placeholder="Custom" className="rounded-2xl flex-1" />}
        </div>
        <div className="flex gap-2">
          <Input type="number" value={newItem.portions} onChange={(e) => setNewItem((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} className="rounded-2xl w-24" />
          <Button className="rounded-full flex-1" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Add item</Button>
        </div>
      </CardContent></Card>

      {canGen && (
        <Button className="rounded-full w-full" onClick={onOpenGroceryReview} disabled={!items.some((i) => i.recipe_id)}>
          <ShoppingCart className="w-4 h-4 mr-1" /> Generate grocery list
        </Button>
      )}

      {canTasks && (
        <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
          <p className="text-sm font-medium">Prep tasks</p>
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
              <Checkbox checked={!!t.done} onCheckedChange={() => toggleTask(t.id)} />
              <span className={`flex-1 ${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.text}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{t.type}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate({ tasks: tasks.filter((x) => x.id !== t.id) })}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={task.text} onChange={(e) => setTask((p) => ({ ...p, text: e.target.value }))} placeholder="Task" className="rounded-2xl flex-1" />
            <select value={task.type} onChange={(e) => setTask((p) => ({ ...p, type: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              {PREP_TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Button size="icon" className="rounded-2xl" onClick={addTask}><Plus className="w-4 h-4" /></Button>
          </div>
        </CardContent></Card>
      )}

      {canStorage && (
        <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
          <p className="text-sm font-medium">Outputs</p>
          {outputs.map((o, i) => (
            <div key={i} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
              <span className="flex-1">{o.name}</span>
              <span className="text-xs text-muted-foreground">{o.portions} · {o.zone}</span>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate({ outputs: outputs.filter((_, j) => j !== i) })}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input value={output.name} onChange={(e) => setOutput((p) => ({ ...p, name: e.target.value }))} placeholder="Output name" className="rounded-2xl flex-1" />
            <Input type="number" value={output.portions} onChange={(e) => setOutput((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} className="rounded-2xl w-20" />
            <select value={output.zone} onChange={(e) => setOutput((p) => ({ ...p, zone: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              {['fridge', 'freezer', 'pantry'].map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <Input type="date" value={output.use_by} onChange={(e) => setOutput((p) => ({ ...p, use_by: e.target.value }))} className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={addOutput}><Plus className="w-4 h-4 mr-1" /> Add output</Button>
        </CardContent></Card>
      )}
    </div>
  );
}