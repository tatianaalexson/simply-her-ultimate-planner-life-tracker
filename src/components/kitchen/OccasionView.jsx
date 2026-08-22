import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft, Plus, Trash2, ShoppingCart, ChevronRight, CalendarDays, PartyPopper,
  Clock, Pencil, MoreHorizontal, Users, Utensils,
} from 'lucide-react';
import KitchenEmptyState from '@/components/kitchen/ui/KitchenEmptyState';
import KitchenSection from '@/components/kitchen/ui/KitchenSection';
import StatusChip from '@/components/kitchen/ui/StatusChip';
import RecipePhoto from '@/components/kitchen/ui/RecipePhoto';
import { useOccasionPlans, useRecipes } from '@/hooks/useKitchen';
import { OCCASION_TYPES, MENU_SECTIONS, EMPTY_OCCASIONS, todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { cn } from '@/lib/utils';

const OFFSET_BUCKETS = [
  { min: 72, label: '3+ days before' },
  { min: 48, label: '2 days before' },
  { min: 24, label: '1 day before' },
  { min: 6, label: 'Hours before' },
  { min: 0, label: 'Day of' },
];
const bucketFor = (h) => OFFSET_BUCKETS.find((b) => h >= b.min) || OFFSET_BUCKETS[OFFSET_BUCKETS.length - 1];

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

  const today = todayStr();
  const upcoming = occasions.filter((o) => !o.date || o.date >= today).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const past = occasions.filter((o) => o.date && o.date < today).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const occasionStats = (o) => {
    const dishes = (o.menu || []).length;
    const tasks = (o.prep_tasks || []).length;
    return `${o.guest_count || 0} guests${dishes > 0 ? ` · ${dishes} dishes` : ''}${tasks > 0 ? ` · ${tasks} prep tasks` : ''}`;
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg font-semibold flex-1">Occasions</h2>
        <Button size="sm" className="rounded-full" onClick={() => add({ name: 'New occasion', occasion_type: 'custom', date: todayStr(), guest_count: 4, menu: [], prep_tasks: [], grocery_status: 'none' }).then((o) => setOpenId(o.id))}>
          <Plus className="w-4 h-4 mr-1" /> Plan Occasion
        </Button>
      </div>

      {upcoming.length === 0 && past.length === 0 ? (
        <KitchenEmptyState icon={PartyPopper} title={EMPTY_OCCASIONS.title} subtitle={EMPTY_OCCASIONS.subtitle}
          actionLabel="Plan an Occasion" onAction={() => add({ name: 'New occasion', occasion_type: 'custom', date: todayStr(), guest_count: 4, menu: [], prep_tasks: [], grocery_status: 'none' }).then((o) => setOpenId(o.id))} />
      ) : (
        <div className="space-y-4">
          {upcoming.length > 0 && (
            <KitchenSection eyebrow="Upcoming">
              <div className="space-y-2">
                {upcoming.map((o) => (
                  <OccasionCard key={o.id} occasion={o} stats={occasionStats(o)} onOpen={() => setOpenId(o.id)} />
                ))}
              </div>
            </KitchenSection>
          )}
          {past.length > 0 && (
            <KitchenSection eyebrow="Past">
              <div className="space-y-2">
                {past.map((o) => (
                  <OccasionCard key={o.id} occasion={o} stats={occasionStats(o)} onOpen={() => setOpenId(o.id)} past />
                ))}
              </div>
            </KitchenSection>
          )}
        </div>
      )}
    </div>
  );
}

function OccasionCard({ occasion, stats, onOpen, past }) {
  return (
    <button onClick={onOpen} className={cn('block w-full text-left rounded-3xl border border-border/60 bg-card p-3 active:scale-[0.99] hover:shadow-sm transition', past && 'opacity-70')}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <PartyPopper className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm font-semibold truncate">{occasion.name}</p>
          <p className="text-[11px] text-muted-foreground">{occasion.date ? fmtDate(occasion.date) : 'No date'} · {stats}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}

function OccasionDetail({ occasion, recipes, onBack, onUpdate, onGenerate }) {
  const [editOpen, setEditOpen] = useState(false);
  const [menuItem, setMenuItem] = useState(null);
  const [taskForm, setTaskForm] = useState(false);

  const menu = occasion.menu || [];
  const tasks = (occasion.prep_tasks || []).slice().sort((a, b) => (b.due_offset_hours || 0) - (a.due_offset_hours || 0));
  const groupedMenu = MENU_SECTIONS.map((s) => ({ ...s, items: menu.filter((m) => m.section === s.value) })).filter((s) => s.items.length > 0);

  // Group tasks by timeline bucket
  const taskBuckets = OFFSET_BUCKETS.map((b) => ({ ...b, tasks: tasks.filter((t) => bucketFor(t.due_offset_hours || 0).min === b.min) })).filter((b) => b.tasks.length > 0);

  const toggleTask = (id) => onUpdate({ prep_tasks: (occasion.prep_tasks || []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  const delTask = (id) => onUpdate({ prep_tasks: (occasion.prep_tasks || []).filter((x) => x.id !== id) });
  const delMenuItem = (id) => onUpdate({ menu: menu.filter((x) => x.id !== id) });

  const canGenerate = menu.some((m) => m.item_type === 'recipe' && m.recipe_id);

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1 truncate">{occasion.name}</h2>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setEditOpen(true)} aria-label="Edit occasion"><Pencil className="w-4 h-4" /></Button>
      </div>

      {/* Overview */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 space-y-2">
        <p className="font-heading text-base font-semibold">{occasion.name}</p>
        <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
          {occasion.date && <span className="inline-flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {fmtDate(occasion.date)}</span>}
          {occasion.time && <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {occasion.time}</span>}
          <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {occasion.guest_count || 0} guests</span>
          <StatusChip variant="neutral" className="capitalize">{occasion.occasion_type?.replace('_', ' ')}</StatusChip>
        </div>
        {occasion.notes && <p className="text-xs text-muted-foreground pt-1">{occasion.notes}</p>}
      </div>

      {/* Menu */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Menu</p>
          <Button size="sm" variant="ghost" className="rounded-full text-xs h-7" onClick={() => setMenuItem({ section: 'main', item_type: 'recipe', recipe_id: '', name: '', servings: occasion.guest_count || 4 })}>
            <Plus className="w-3 h-3 mr-0.5" /> Add
          </Button>
        </div>
        {groupedMenu.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No menu items yet.</p>
        ) : (
          <div className="space-y-3">
            {groupedMenu.map((sec) => (
              <div key={sec.value}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{sec.label}</p>
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                  {sec.items.map((mi) => {
                    const rec = mi.recipe_id ? recipes.find((r) => r.id === mi.recipe_id) : null;
                    return (
                      <div key={mi.id} className="flex items-center gap-2 px-3 py-2 border-b border-border/30 last:border-0">
                        {rec && <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0"><RecipePhoto recipe={rec} height="h-8" className="rounded-lg" /></div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{mi.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {mi.item_type === 'recipe' ? 'Recipe' : mi.item_type === 'store_bought' ? 'Store-bought' : 'Custom'} · {mi.servings} servings
                          </p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => delMenuItem(mi.id)} aria-label={`Remove ${mi.name}`}>
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Groceries */}
      {canGenerate && (
        <Button variant="outline" className="rounded-full w-full" onClick={onGenerate}>
          <ShoppingCart className="w-4 h-4 mr-2" /> Generate Occasion Groceries
        </Button>
      )}

      {/* Prep schedule */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prep schedule</p>
          <Button size="sm" variant="ghost" className="rounded-full text-xs h-7" onClick={() => setTaskForm(true)}>
            <Plus className="w-3 h-3 mr-0.5" /> Add task
          </Button>
        </div>
        {taskBuckets.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No prep tasks yet.</p>
        ) : (
          <div className="space-y-3">
            {taskBuckets.map((b) => (
              <div key={b.min}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{b.label}</p>
                <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                  {b.tasks.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 px-3 py-2 border-b border-border/30 last:border-0">
                      <Checkbox checked={!!t.done} onCheckedChange={() => toggleTask(t.id)} aria-label={`Mark ${t.text} as done`} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm', t.done && 'line-through text-muted-foreground')}>{t.text}</p>
                        {t.due_time && <p className="text-[10px] text-muted-foreground">{t.due_time}</p>}
                      </div>
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => delTask(t.id)} aria-label={`Remove ${t.text}`}>
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sheets */}
      {editOpen && <EditOccasionSheet occasion={occasion} onUpdate={onUpdate} onClose={() => setEditOpen(false)} />}
      {menuItem && <AddMenuItemSheet form={menuItem} recipes={recipes} onSave={(item) => { onUpdate({ menu: [...menu, { ...item, id: String(Date.now()) }] }); setMenuItem(null); }} onClose={() => setMenuItem(null)} />}
      {taskForm && <AddPrepTaskSheet occasionDate={occasion.date} onSave={(task) => { onUpdate({ prep_tasks: [...(occasion.prep_tasks || []), { ...task, id: String(Date.now()), done: false }] }); setTaskForm(false); }} onClose={() => setTaskForm(false)} />}
    </div>
  );
}

function EditOccasionSheet({ occasion, onUpdate, onClose }) {
  const [f, setF] = useState({ name: occasion.name || '', occasion_type: occasion.occasion_type || 'custom', date: occasion.date || '', time: occasion.time || '', guest_count: occasion.guest_count || 4, notes: occasion.notes || '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Edit occasion</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Occasion name" className="rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            <select value={f.occasion_type} onChange={(e) => set('occasion_type', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              {OCCASION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <Input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} className="rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="time" value={f.time} onChange={(e) => set('time', e.target.value)} className="rounded-2xl" />
            <div className="flex items-center gap-2">
              <Input type="number" value={f.guest_count} onChange={(e) => set('guest_count', parseInt(e.target.value) || 0)} className="rounded-2xl flex-1" />
              <span className="text-sm text-muted-foreground">guests</span>
            </div>
          </div>
          <Textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Notes" className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => { onUpdate(f); onClose(); }}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddMenuItemSheet({ form, recipes, onSave, onClose }) {
  const [f, setF] = useState(form);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const name = f.item_type === 'recipe' ? (recipes.find((r) => r.id === f.recipe_id)?.name || '') : f.name;
  const valid = f.item_type === 'recipe' ? !!f.recipe_id : !!f.name?.trim();
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add to menu</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <select value={f.section} onChange={(e) => set('section', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              {MENU_SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={f.item_type} onChange={(e) => set('item_type', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              <option value="recipe">Recipe</option><option value="custom">Custom dish</option><option value="store_bought">Store-bought</option>
            </select>
          </div>
          {f.item_type === 'recipe' ? (
            <select value={f.recipe_id} onChange={(e) => set('recipe_id', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
              <option value="">Choose recipe</option>
              {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          ) : (
            <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Dish name" className="rounded-2xl" autoFocus />
          )}
          <div className="flex items-center gap-2">
            <Input type="number" value={f.servings} onChange={(e) => set('servings', parseInt(e.target.value) || 1)} className="rounded-2xl w-24" />
            <span className="text-sm text-muted-foreground">servings</span>
          </div>
          <Button className="rounded-full w-full" onClick={() => valid && onSave({ ...f, name })} disabled={!valid}>Add to menu</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddPrepTaskSheet({ occasionDate, onSave, onClose }) {
  const [f, setF] = useState({ text: '', due_offset_hours: 24, due_time: '', notes: '' });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const presets = [
    { label: '3+ days', val: 72 }, { label: '2 days', val: 48 }, { label: '1 day', val: 24 },
    { label: 'Hours', val: 6 }, { label: 'Day of', val: 0 },
  ];
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add prep task</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={f.text} onChange={(e) => set('text', e.target.value)} placeholder="Task (e.g. Chop vegetables)" className="rounded-2xl" autoFocus />
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">When</p>
            <div className="flex gap-1.5 flex-wrap">
              {presets.map((p) => (
                <button key={p.val} onClick={() => set('due_offset_hours', p.val)}
                  className={cn('text-xs px-3 py-1.5 rounded-full transition',
                    f.due_offset_hours === p.val ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Input type="time" value={f.due_time} onChange={(e) => set('due_time', e.target.value)} className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => f.text.trim() && onSave({ ...f, due_date: occasionDate || todayStr() })} disabled={!f.text.trim()}>Add task</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}