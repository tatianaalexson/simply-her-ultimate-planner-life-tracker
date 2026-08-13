import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, ChevronDown, Check, ListTodo } from 'lucide-react';
import { tasksKey, CATEGORIES, catMeta } from '@/lib/plannerStore';

const PRIORITIES = [
  { id: 'high', label: 'High', cls: 'bg-rose-100 text-rose-700' },
  { id: 'medium', label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  { id: 'low', label: 'Low', cls: 'bg-sky-100 text-sky-700' }
];
const ESTIMATES = [15, 30, 45, 60, 90, 120];
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'must', label: 'Must Do' },
  { id: 'quick', label: 'Quick Wins <15m' },
  { id: 'done', label: 'Completed' }
];

export default function TaskEngine({ date }) {
  const [tasks, setTasks] = useLocalStorage(tasksKey(date), []);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'personal', priority: 'medium', estimate: 30, start: '' });
  const [subText, setSubText] = useState({});

  const add = () => {
    if (!form.title.trim()) return;
    setTasks((t) => [...t, { id: Date.now(), title: form.title.trim(), category: form.category, priority: form.priority, estimate: form.estimate, start: form.start, subtasks: [], done: false }]);
    setForm((f) => ({ ...f, title: '', start: '' }));
  };
  const toggleDone = (id) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const del = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));
  const addSub = (id) => {
    const txt = (subText[id] || '').trim();
    if (!txt) return;
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, subtasks: [...t.subtasks, { id: Date.now(), text: txt, done: false }] } : t)));
    setSubText((s) => ({ ...s, [id]: '' }));
  };
  const toggleSub = (tid, sid) => setTasks((ts) => ts.map((t) => (t.id === tid ? { ...t, subtasks: t.subtasks.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)) } : t)));
  const delSub = (tid, sid) => setTasks((ts) => ts.map((t) => (t.id === tid ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== sid) } : t)));

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return !t.done;
    if (filter === 'must') return !t.done && t.priority === 'high';
    if (filter === 'quick') return !t.done && t.estimate <= 15;
    if (filter === 'done') return t.done;
    return true;
  });
  const subProgress = (t) => (t.subtasks.length ? Math.round((t.subtasks.filter((s) => s.done).length / t.subtasks.length) * 100) : 0);

  return (
    <div className="rounded-3xl border bg-card p-3 shadow-sm space-y-3">
      <h3 className="font-heading text-base flex items-center gap-1.5"><ListTodo className="w-4 h-4" /> Tasks & Subtasks</h3>

      <div className="flex gap-1 rounded-full bg-accent p-1">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`flex-1 text-xs py-1 rounded-full ${filter === f.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>{f.label}</button>
        ))}
      </div>

      <div className="space-y-2">
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a task…" className="rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger className="rounded-full w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
            <SelectTrigger className="rounded-full w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(form.estimate)} onValueChange={(v) => setForm((f) => ({ ...f, estimate: +v }))}>
            <SelectTrigger className="rounded-full w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{ESTIMATES.map((e) => <SelectItem key={e} value={String(e)}>{e}m</SelectItem>)}</SelectContent>
          </Select>
          <Input type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} className="rounded-full w-28 h-8 text-xs" />
          <Button size="sm" className="rounded-full h-8" onClick={add}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No tasks here.</p>}
        {filtered.map((t) => {
          const m = catMeta(t.category);
          const pr = PRIORITIES.find((p) => p.id === t.priority);
          const open = openId === t.id;
          return (
            <div key={t.id} className="rounded-2xl border bg-background/60">
              <div className="flex items-center gap-2 p-2">
                <button onClick={() => toggleDone(t.id)} className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${t.done ? 'bg-primary border-primary' : 'border-border'}`}>
                  {t.done && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `hsla(${m.h}, ${m.s}%, ${m.l}%, 0.2)`, color: `hsl(${m.h}, ${m.s}%, ${Math.max(20, m.l - 25)}%)` }}>{m.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pr.cls}`}>{pr.label}</span>
                    <span className="text-[10px] text-muted-foreground">{t.estimate}m</span>
                    {t.start && <span className="text-[10px] text-muted-foreground">{t.start}</span>}
                    {t.subtasks.length > 0 && <span className="text-[10px] text-muted-foreground">{t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}</span>}
                  </div>
                </div>
                {t.subtasks.length > 0 && <button onClick={() => setOpenId(open ? null : t.id)} className="text-muted-foreground"><ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} /></button>}
                <button onClick={() => del(t.id)} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {open && (
                <div className="px-3 pb-3 space-y-2">
                  <Progress value={subProgress(t)} className="h-1.5" />
                  {t.subtasks.map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <button onClick={() => toggleSub(t.id, s.id)} className={`w-4 h-4 rounded border flex items-center justify-center ${s.done ? 'bg-primary border-primary' : 'border-border'}`}>
                        {s.done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </button>
                      <span className={`text-xs flex-1 ${s.done ? 'line-through text-muted-foreground' : ''}`}>{s.text}</span>
                      <button onClick={() => delSub(t.id, s.id)} className="text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="flex gap-1">
                    <Input value={subText[t.id] || ''} onChange={(e) => setSubText((s) => ({ ...s, [t.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addSub(t.id)} placeholder="Add subtask" className="rounded-full h-8 text-xs" />
                    <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => addSub(t.id)}><Plus className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}