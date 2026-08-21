import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, ShoppingCart, ChevronRight, CalendarDays } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useOccasionPlans, useRecipes } from '@/hooks/useKitchen';
import { OCCASION_TYPES, MENU_SECTIONS, EMPTY_OCCASIONS, todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';

export default function OccasionView({ onBack, onOpenGroceryReview }) {
  const { items: occasions, add, update, remove } = useOccasionPlans();
  const { items: recipes } = useRecipes();
  const [openId, setOpenId] = useState(null);

  const open = occasions.find((o) => o.id === openId);

  const generateGroceries = (occ) => {
    const sources = (occ.menu || [])
      .filter((mi) => mi.item_type === 'recipe' && mi.recipe_id)
      .map((mi) => ({ recipe: recipes.find((r) => r.id === mi.recipe_id), plannedServings: mi.servings || occ.guest_count || 4, occasion: { id: occ.id } }))
      .filter((s) => s.recipe);
    if (sources.length === 0) return;
    onOpenGroceryReview(sources, `${occ.name} Groceries`);
  };

  if (open) {
    return <OccasionDetail occasion={open} recipes={recipes} onBack={() => setOpenId(null)} onUpdate={(d) => update(open.id, d)} onGenerate={() => generateGroceries(open)} />;
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Occasions</h2>
        <Button size="sm" className="rounded-full" onClick={() => add({ name: 'New occasion', occasion_type: 'custom', date: todayStr(), guest_count: 4, menu: [], prep_tasks: [], grocery_status: 'none' }).then((o) => setOpenId(o.id))}><Plus className="w-4 h-4 mr-1" /> New</Button>
      </div>

      {occasions.length === 0 ? (
        <EmptyState icon={CalendarDays} title={EMPTY_OCCASIONS.title} subtitle={EMPTY_OCCASIONS.subtitle} />
      ) : (
        <div className="space-y-2">
          {occasions.sort((a, b) => (a.date || '').localeCompare(b.date || '')).map((o) => (
            <Card key={o.id} className="rounded-3xl cursor-pointer active:scale-[0.98] transition" onClick={() => setOpenId(o.id)}>
              <CardContent className="p-3 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{o.name}</p>
                  <p className="text-[11px] text-muted-foreground">{fmtDate(o.date)} · {o.guest_count || 0} guests</p>
                </div>
                <Badge variant="secondary" className="capitalize text-[10px]">{o.occasion_type?.replace('_', ' ')}</Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OccasionDetail({ occasion, recipes, onBack, onUpdate, onGenerate }) {
  const [newMenuItem, setNewMenuItem] = useState({ section: 'main', item_type: 'recipe', recipe_id: '', name: '', servings: 1 });
  const [newTask, setNewTask] = useState({ text: '', due_offset_hours: 0, due_time: '', notes: '' });

  const menu = occasion.menu || [];
  const tasks = (occasion.prep_tasks || []).slice().sort((a, b) => (b.due_offset_hours || 0) - (a.due_offset_hours || 0));

  const addMenuItem = () => {
    const name = newMenuItem.item_type === 'recipe' ? (recipes.find((r) => r.id === newMenuItem.recipe_id)?.name || '') : newMenuItem.name;
    if (!name) return;
    onUpdate({ menu: [...menu, { ...newMenuItem, id: String(Date.now()), name, servings: newMenuItem.servings || occasion.guest_count || 4 }] });
    setNewMenuItem({ section: 'main', item_type: 'recipe', recipe_id: '', name: '', servings: 1 });
  };
  const addTask = () => {
    if (!newTask.text.trim()) return;
    const dueDate = occasion.date || todayStr();
    onUpdate({ prep_tasks: [...(occasion.prep_tasks || []), { ...newTask, id: String(Date.now()), due_date: dueDate, done: false }] });
    setNewTask({ text: '', due_offset_hours: 0, due_time: '', notes: '' });
  };
  const toggleTask = (id) => onUpdate({ prep_tasks: (occasion.prep_tasks || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });

  const groupedMenu = MENU_SECTIONS.map((s) => ({ ...s, items: menu.filter((m) => m.section === s.value) })).filter((s) => s.items.length > 0);

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <Input value={occasion.name} onChange={(e) => onUpdate({ name: e.target.value })} className="rounded-2xl flex-1 font-heading" />
      </div>

      <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <select value={occasion.occasion_type || 'custom'} onChange={(e) => onUpdate({ occasion_type: e.target.value })} className="rounded-2xl border bg-card px-3 py-2 text-sm">
            {OCCASION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <Input type="date" value={occasion.date || ''} onChange={(e) => onUpdate({ date: e.target.value })} className="rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input type="time" value={occasion.time || ''} onChange={(e) => onUpdate({ time: e.target.value })} className="rounded-2xl" />
          <div className="flex items-center gap-2">
            <Input type="number" value={occasion.guest_count || 0} onChange={(e) => onUpdate({ guest_count: parseInt(e.target.value) || 0 })} className="rounded-2xl" />
            <span className="text-sm text-muted-foreground">guests</span>
          </div>
        </div>
        <Textarea value={occasion.notes || ''} onChange={(e) => onUpdate({ notes: e.target.value })} placeholder="Notes" className="rounded-2xl" />
      </CardContent></Card>

      <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
        <p className="text-sm font-medium">Menu</p>
        {groupedMenu.map((sec) => (
          <div key={sec.value} className="border-t border-border pt-2 first:border-0 first:pt-0">
            <p className="text-[11px] text-muted-foreground mb-1">{sec.label}</p>
            {sec.items.map((mi) => (
              <div key={mi.id} className="flex items-center gap-2 text-sm py-1">
                <span className="flex-1">{mi.name}</span>
                <span className="text-[10px] text-muted-foreground">{mi.servings} serv</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate({ menu: menu.filter((x) => x.id !== mi.id) })}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
              </div>
            ))}
          </div>
        ))}
        <div className="grid grid-cols-2 gap-2">
          <select value={newMenuItem.section} onChange={(e) => setNewMenuItem((p) => ({ ...p, section: e.target.value }))} className="rounded-2xl border bg-card px-2 py-2 text-sm">
            {MENU_SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={newMenuItem.item_type} onChange={(e) => setNewMenuItem((p) => ({ ...p, item_type: e.target.value }))} className="rounded-2xl border bg-card px-2 py-2 text-sm">
            <option value="recipe">Recipe</option><option value="custom">Custom dish</option><option value="store_bought">Store-bought</option>
          </select>
        </div>
        {newMenuItem.item_type === 'recipe' ? (
          <select value={newMenuItem.recipe_id} onChange={(e) => setNewMenuItem((p) => ({ ...p, recipe_id: e.target.value }))} className="rounded-2xl border bg-card px-2 py-2 text-sm w-full">
            <option value="">Choose recipe</option>
            {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        ) : (
          <Input value={newMenuItem.name} onChange={(e) => setNewMenuItem((p) => ({ ...p, name: e.target.value }))} placeholder="Dish name" className="rounded-2xl" />
        )}
        <div className="flex gap-2">
          <Input type="number" value={newMenuItem.servings} onChange={(e) => setNewMenuItem((p) => ({ ...p, servings: parseInt(e.target.value) || 1 }))} className="rounded-2xl w-24" />
          <Button className="rounded-full flex-1" onClick={addMenuItem}><Plus className="w-4 h-4 mr-1" /> Add to menu</Button>
        </div>
      </CardContent></Card>

      <Button variant="outline" className="rounded-full w-full" onClick={onGenerate} disabled={!menu.some((m) => m.item_type === 'recipe' && m.recipe_id)}>
        <ShoppingCart className="w-4 h-4 mr-1" /> Generate occasion groceries
      </Button>

      <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
        <p className="text-sm font-medium">Prep schedule</p>
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <Checkbox checked={!!t.done} onCheckedChange={() => toggleTask(t.id)} />
            <div className="flex-1 min-w-0">
              <p className={`${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.text}</p>
              {t.due_offset_hours > 0 && <p className="text-[10px] text-muted-foreground">{t.due_offset_hours}h before · {t.due_time || ''}</p>}
            </div>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onUpdate({ prep_tasks: (occasion.prep_tasks || []).filter((x) => x.id !== t.id) })}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
          </div>
        ))}
        <Input value={newTask.text} onChange={(e) => setNewTask((p) => ({ ...p, text: e.target.value }))} placeholder="Task (e.g. Chop vegetables)" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1">
            <Input type="number" value={newTask.due_offset_hours} onChange={(e) => setNewTask((p) => ({ ...p, due_offset_hours: parseInt(e.target.value) || 0 }))} className="rounded-2xl w-20" />
            <span className="text-xs text-muted-foreground">h before</span>
          </div>
          <Input type="time" value={newTask.due_time} onChange={(e) => setNewTask((p) => ({ ...p, due_time: e.target.value }))} className="rounded-2xl" />
        </div>
        <Button className="rounded-full w-full" onClick={addTask}><Plus className="w-4 h-4 mr-1" /> Add task</Button>
      </CardContent></Card>
    </div>
  );
}