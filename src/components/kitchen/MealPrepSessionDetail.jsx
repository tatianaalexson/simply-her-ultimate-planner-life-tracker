import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  ArrowLeft, Plus, Trash2, ShoppingCart, ChefHat, Save, Utensils, Clock, Pencil, ChevronRight, CheckCircle, PauseCircle, PackageCheck,
} from 'lucide-react';
import { useAppSettings } from '@/lib/AppSettings';
import { PREP_TASK_TYPES, todayStr, fmtDate } from '@/components/kitchen/kitchenConstants';
import { recipePerServing } from '@/lib/nutrition';
import RecipePhoto from '@/components/kitchen/ui/RecipePhoto';
import StatusChip from '@/components/kitchen/ui/StatusChip';
import PrepOutputReviewSheet from '@/components/kitchen/PrepOutputReviewSheet';
import { cn } from '@/lib/utils';

const TASK_ICONS = {
  wash: '🚿', chop: '🔪', peel: '🥔', marinate: '🫙', mix: '🥣', cook: '🔥', bake: '🍞',
  portion: '🍽️', assemble: '🧩', cool: '❄️', refrigerate: '🧊', freeze: '🧊', label: '🏷️', cleanup: '🧹', custom: '✓',
};

const STATUS_LABELS = { planned: 'Planned', in_progress: 'In progress', completed: 'Completed' };

// Meal prep session detail — a real prep workspace, not a checklist demo.
// Sections: OVERVIEW, WHAT I'M MAKING, GROCERY NEEDS, PREP TASKS, OUTPUTS.
export default function MealPrepSessionDetail({ session, recipes, onBack, onUpdate, onOpenGroceryReview, onLogFood, canLog, canGen, canTasks, canStorage, canTemplates }) {
  const [editing, setEditing] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddOutput, setShowAddOutput] = useState(false);
  const [saveTpl, setSaveTpl] = useState(false);
  const [showPrepReview, setShowPrepReview] = useState(false);

  const items = session.items || [];
  const tasks = session.tasks || [];
  const outputs = session.outputs || [];
  const totalDuration = tasks.reduce((s, t) => s + (t.duration || 0), 0);
  const completedTasks = tasks.filter((t) => t.done).length;
  const recipeItems = items.filter((it) => it.recipe_id);
  const totalPortions = items.reduce((s, it) => s + (it.portions || 0), 0);

  const genGroceries = () => {
    const sources = recipeItems
      .map((it) => ({ recipe: recipes.find((r) => r.id === it.recipe_id), plannedServings: it.servings || it.portions || 1, prep: { id: session.id } }))
      .filter((s) => s.recipe);
    if (sources.length === 0) return;
    onOpenGroceryReview(sources);
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full" aria-label="Back to meal prep"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1 truncate">{session.name}</h2>
      </div>

      {/* OVERVIEW */}
      <div className="rounded-3xl border border-border/60 bg-card p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-base font-semibold">{session.name}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {session.date && <span className="text-xs text-muted-foreground">{fmtDate(session.date)}</span>}
              {totalDuration > 0 && <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5"><Clock className="w-3 h-3" />~{Math.floor(totalDuration / 60) || totalDuration} min</span>}
              <StatusChip variant={session.status === 'completed' ? 'primary' : session.status === 'in_progress' ? 'warm' : 'neutral'}>
                {STATUS_LABELS[session.status] || session.status}
              </StatusChip>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => setEditing(true)} aria-label="Edit session"><Pencil className="w-4 h-4" /></Button>
        </div>
        {session.notes && <p className="text-xs text-muted-foreground">{session.notes}</p>}
        <div className="flex gap-2 pt-1 flex-wrap">
          {canGen && recipeItems.length > 0 && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={genGroceries}><ShoppingCart className="w-3.5 h-3.5 mr-1" /> Generate Groceries</Button>
          )}
          {canTemplates && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setSaveTpl(true)}><Save className="w-3.5 h-3.5 mr-1" /> Save as Template</Button>
          )}
        </div>
        {/* Completion controls — never require all tasks to be done */}
        {session.status !== 'completed' && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="rounded-full" onClick={() => onUpdate({ status: 'completed' })}>
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> {completedTasks < tasks.length ? 'Partially Complete' : 'Complete'}
            </Button>
            {session.status === 'planned' && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => onUpdate({ status: 'in_progress' })}>
                <PauseCircle className="w-3.5 h-3.5 mr-1" /> Continue Later
              </Button>
            )}
          </div>
        )}
        {session.status === 'completed' && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => onUpdate({ status: 'in_progress' })}>
              <Pencil className="w-3.5 h-3.5 mr-1" /> Reopen session
            </Button>
          </div>
        )}
      </div>

      {/* WHAT I'M MAKING */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-2 px-1">What I'm making</p>
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground px-1">No items yet. Add recipes or custom prep items.</p>
        ) : (
          <div className="space-y-2">
            {items.map((it, i) => {
              const rec = it.recipe_id ? recipes.find((r) => r.id === it.recipe_id) : null;
              const pn = rec ? recipePerServing(rec) : null;
              return (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <RecipePhoto recipe={rec || { category: 'other' }} height="h-12" className="rounded-xl" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.custom_name}</p>
                    <p className="text-[11px] text-muted-foreground">{it.portions || 1} portion{(it.portions || 1) !== 1 ? 's' : ''}</p>
                  </div>
                  {canLog && pn && (
                    <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs shrink-0" onClick={() => onLogFood({ name: it.custom_name, perServingNut: pn, servings: 1, source_type: 'meal_prep', prep_session_id: session.id })}>
                      <Utensils className="w-3 h-3 mr-0.5" /> Log
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => onUpdate({ items: items.filter((_, j) => j !== i) })} aria-label={`Remove ${it.custom_name}`}>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        <Button size="sm" variant="outline" className="rounded-full mt-2" onClick={() => setShowAddItem(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Add item</Button>
      </div>

      {/* PREP TASKS */}
      {canTasks && (
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">Prep tasks</p>
            {tasks.length > 0 && <span className="text-[11px] text-muted-foreground">{completedTasks} / {tasks.length} complete</span>}
          </div>
          {tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1">No tasks yet.</p>
          ) : (
            <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
              {tasks.map((t) => (
                <label key={t.id} className={cn('flex items-center gap-3 px-3 py-2.5 border-b border-border/30 last:border-0 cursor-pointer', t.done && 'opacity-60')}>
                  <Checkbox checked={!!t.done} onCheckedChange={() => onUpdate({ tasks: tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)) })} aria-label={`Mark ${t.text} as ${t.done ? 'not done' : 'done'}`} />
                  <span className="text-base shrink-0" aria-hidden>{TASK_ICONS[t.type] || '✓'}</span>
                  <span className={cn('text-sm flex-1', t.done && 'line-through text-muted-foreground')}>{t.text}</span>
                  {t.duration > 0 && <span className="text-[10px] text-muted-foreground">~{t.duration} min</span>}
                  <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => onUpdate({ tasks: tasks.filter((x) => x.id !== t.id) })} aria-label={`Remove ${t.text}`}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                </label>
              ))}
            </div>
          )}
          <Button size="sm" variant="outline" className="rounded-full mt-2" onClick={() => setShowAddTask(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Add task</Button>
        </div>
      )}

      {/* OUTPUTS */}
      {canStorage && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-2 px-1">Ready to store</p>
          {outputs.length === 0 ? (
            <p className="text-xs text-muted-foreground px-1">No outputs yet. Add what you'll store after prepping.</p>
          ) : (
            <div className="space-y-3">
              {['fridge', 'freezer', 'pantry'].map((zone) => {
                const zoneOutputs = outputs.filter((o) => o.zone === zone);
                if (zoneOutputs.length === 0) return null;
                return (
                  <div key={zone}>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1 px-1">{zone}</p>
                    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                      {zoneOutputs.map((o, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30 last:border-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{o.name}</p>
                            <p className="text-[10px] text-muted-foreground">{o.portions} portion{o.portions !== 1 ? 's' : ''}{o.use_by ? ` · use by ${fmtDate(o.use_by)}` : ''}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => onUpdate({ outputs: outputs.filter((_, j) => outputs.indexOf(o) !== j) })} aria-label={`Remove ${o.name}`}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Button size="sm" variant="outline" className="rounded-full mt-2" onClick={() => setShowAddOutput(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Add output</Button>
          {outputs.length > 0 && (
            <Button size="sm" className="rounded-full mt-2 ml-1" onClick={() => setShowPrepReview(true)}>
              <PackageCheck className="w-3.5 h-3.5 mr-1" /> Review prepared food
            </Button>
          )}
        </div>
      )}

      {editing && <EditSessionSheet session={session} onUpdate={onUpdate} onClose={() => setEditing(false)} />}
      {showAddItem && <AddItemSheet recipes={recipes} onSave={(item) => { onUpdate({ items: [...items, item] }); setShowAddItem(false); }} onClose={() => setShowAddItem(false)} />}
      {showAddTask && <AddTaskSheet onSave={(task) => { onUpdate({ tasks: [...tasks, { ...task, id: String(Date.now()), done: false, order: tasks.length }] }); setShowAddTask(false); }} onClose={() => setShowAddTask(false)} />}
      {showAddOutput && <AddOutputSheet onSave={(out) => { onUpdate({ outputs: [...outputs, { ...out, date_prepared: todayStr() }] }); setShowAddOutput(false); }} onClose={() => setShowAddOutput(false)} />}
      {saveTpl && <SavePrepTemplateSheet session={session} onClose={() => setSaveTpl(false)} />}
      <PrepOutputReviewSheet open={showPrepReview} onOpenChange={setShowPrepReview} session={session} recipes={recipes} />
    </div>
  );
}

function EditSessionSheet({ session, onUpdate, onClose }) {
  const [form, setForm] = useState({ name: session.name || '', date: session.date || '', status: session.status || 'planned', notes: session.notes || '' });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Edit session</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Session name" className="rounded-2xl" />
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
            {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => { onUpdate(form); onClose(); }}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddItemSheet({ recipes, onSave, onClose }) {
  const [form, setForm] = useState({ recipe_id: '', custom_name: '', portions: 1, servings: 1 });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add item</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <select value={form.recipe_id} onChange={(e) => setForm((p) => ({ ...p, recipe_id: e.target.value, custom_name: e.target.value ? recipes.find((r) => r.id === e.target.value)?.name : p.custom_name }))} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
            <option value="">Custom item</option>
            {recipes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {!form.recipe_id && <Input value={form.custom_name} onChange={(e) => setForm((p) => ({ ...p, custom_name: e.target.value }))} placeholder="Item name" className="rounded-2xl" />}
          <Input type="number" value={form.portions} onChange={(e) => setForm((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} placeholder="Portions" className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => { if (form.recipe_id || form.custom_name.trim()) onSave(form); }} disabled={!form.recipe_id && !form.custom_name.trim()}>Add item</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddTaskSheet({ onSave, onClose }) {
  const [form, setForm] = useState({ text: '', type: 'chop', duration: 0 });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add task</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} placeholder="Task" className="rounded-2xl" autoFocus />
          <div className="flex gap-2">
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm flex-1">
              {PREP_TASK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Input type="number" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: parseInt(e.target.value) || 0 }))} placeholder="Min" className="rounded-2xl w-20" />
          </div>
          <Button className="rounded-full w-full" onClick={() => { if (form.text.trim()) onSave(form); }} disabled={!form.text.trim()}>Add task</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AddOutputSheet({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', portions: 1, zone: 'fridge', use_by: '' });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Add output</SheetTitle></SheetHeader>
        <div className="space-y-2 mt-4">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Output name" className="rounded-2xl" autoFocus />
          <div className="flex gap-2">
            <Input type="number" value={form.portions} onChange={(e) => setForm((p) => ({ ...p, portions: parseInt(e.target.value) || 1 }))} placeholder="Portions" className="rounded-2xl flex-1" />
            <select value={form.zone} onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))} className="rounded-2xl border bg-card px-3 py-2 text-sm">
              <option value="fridge">Fridge</option><option value="freezer">Freezer</option><option value="pantry">Pantry</option>
            </select>
          </div>
          <Input type="date" value={form.use_by} onChange={(e) => setForm((p) => ({ ...p, use_by: e.target.value }))} className="rounded-2xl" />
          <Button className="rounded-full w-full" onClick={() => { if (form.name.trim()) onSave(form); }} disabled={!form.name.trim()}>Add output</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SavePrepTemplateSheet({ session, onClose }) {
  const { isFeatureEnabled } = useAppSettings();
  const [name, setName] = useState(`${session.name} template`);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      await base44.entities.KitchenTemplate.create({
        kind: 'meal-prep', name, description: '',
        items: [], meals: [],
        prep_items: (session.items || []).map((it) => ({ recipe_id: it.recipe_id || '', custom_name: it.custom_name || '', portions: it.portions || 1, servings: it.servings || 1 })),
        prep_tasks: (session.tasks || []).map((t) => ({ text: t.text, type: t.type || 'custom', duration: t.duration || 0 })),
        prep_default_portions: 4, notes: session.notes || '',
      });
    } catch { /* ignore */ }
    setBusy(false); onClose();
  };
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Save prep template</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="rounded-2xl" autoFocus />
          <p className="text-[11px] text-muted-foreground">Task completion state and prepared dates are not included.</p>
          <Button className="rounded-full w-full" onClick={save} disabled={busy}>Save template</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}