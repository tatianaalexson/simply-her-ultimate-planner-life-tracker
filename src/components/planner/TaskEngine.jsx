import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, ChevronDown, Check, ListTodo, CalendarClock, MapPin, Repeat } from 'lucide-react';
import { generateRecurringInstances } from '@/lib/recurringTasks';

const CAT_META = {
  home: { label: 'Home', h: 43, s: 74, l: 55 },
  reflection: { label: 'Reflection', h: 265, s: 60, l: 60 },
  wellness: { label: 'Wellness', h: 160, s: 60, l: 45 },
  errands: { label: 'Errands', h: 200, s: 70, l: 55 },
  work: { label: 'Work', h: 220, s: 15, l: 45 }
};
const CATS = Object.entries(CAT_META).map(([id, m]) => ({ id, ...m }));

const PRIORITIES = [
  { id: 'high', label: 'High', cls: 'bg-rose-100 text-rose-700' },
  { id: 'medium', label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  { id: 'low', label: 'Low', cls: 'bg-sky-100 text-sky-700' }
];

const RECURRENCE = [
  { id: 'none', label: 'Once' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'weekdays', label: 'Weekdays' }
];

const FILTERS = [
  { id: 'all', label: 'Active' },
  { id: 'must', label: 'Must Do' },
  { id: 'done', label: 'Completed' }
];

const isoOf = (d) => d.toISOString().slice(0, 10);

const emptyForm = () => ({ title: '', category: 'home', priority: 'medium', start_time: '', end_time: '', recurrence: 'none', notes: '', location: '' });

export default function TaskEngine({ date }) {
  const iso = isoOf(date);
  const [tasks, setTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [subText, setSubText] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      await generateRecurringInstances(iso);
      const todays = await base44.entities.Task.filter({ task_date: iso }, 'start_time');
      setTasks(todays || []);
      const recent = await base44.entities.Task.list('-task_date', 150);
      setOverdue((recent || []).filter((t) => t.task_date < iso && !t.completed && !t.recurring_parent).slice(0, 8));
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [iso]);

  const add = async () => {
    if (!form.title.trim()) return;
    try {
      await base44.entities.Task.create({ ...form, title: form.title.trim(), task_date: iso, completed: false, subtasks: [] });
      setForm(emptyForm());
      await load();
    } catch {}
  };

  const toggleDone = async (t) => {
    setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    try { await base44.entities.Task.update(t.id, { completed: !t.completed }); } catch { load(); }
  };

  const del = async (t) => {
    setTasks((p) => p.filter((x) => x.id !== t.id));
    try { await base44.entities.Task.delete(t.id); } catch { load(); }
  };

  const patch = async (t, data) => {
    setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, ...data } : x)));
    try { await base44.entities.Task.update(t.id, data); } catch { load(); }
  };

  const reschedule = async (t, newIso) => {
    if (!newIso) return;
    await patch(t, { task_date: newIso });
    setTasks((p) => p.filter((x) => x.id !== t.id));
    setOverdue((p) => p.filter((x) => x.id !== t.id));
  };

  const addSub = async (t) => {
    const txt = (subText[t.id] || '').trim();
    if (!txt) return;
    const subs = [...(t.subtasks || []), { id: String(Date.now()), text: txt, done: false }];
    await patch(t, { subtasks: subs });
    setSubText((s) => ({ ...s, [t.id]: '' }));
  };
  const toggleSub = async (t, sid) => {
    const subs = (t.subtasks || []).map((s) => (s.id === sid ? { ...s, done: !s.done } : s));
    await patch(t, { subtasks: subs });
  };
  const delSub = async (t, sid) => {
    const subs = (t.subtasks || []).filter((s) => s.id !== sid);
    await patch(t, { subtasks: subs });
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'all') return !t.completed;
    if (filter === 'must') return !t.completed && t.priority === 'high';
    if (filter === 'done') return t.completed;
    return true;
  });
  const subProgress = (t) => (t.subtasks && t.subtasks.length ? Math.round((t.subtasks.filter((s) => s.done).length / t.subtasks.length) * 100) : 0);

  const chip = (m) => ({ background: `hsla(${m.h}, ${m.s}%, ${m.l}%, 0.2)`, color: `hsl(${m.h}, ${m.s}%, ${Math.max(20, m.l - 25)}%)` });

  return (
    <div className="rounded-3xl border bg-card p-3 shadow-sm space-y-3">
      <h3 className="font-heading text-base flex items-center gap-1.5"><ListTodo className="w-4 h-4" /> Tasks & Events</h3>

      {overdue.length > 0 && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-2.5 space-y-1.5">
          <p className="text-xs font-medium text-rose-700 flex items-center gap-1.5"><CalendarClock className="w-3.5 h-3.5" /> {overdue.length} overdue — gently reschedule or complete</p>
          {overdue.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <button onClick={() => toggleDone(t)} className="w-4 h-4 rounded-full border border-rose-300 shrink-0" />
              <span className="text-xs flex-1 truncate">{t.title}</span>
              <input type="date" value={t.task_date} onChange={(e) => reschedule(t, e.target.value)} className="text-[10px] border rounded-full px-1.5 py-0.5 bg-white" />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 rounded-full bg-accent p-1">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`flex-1 text-xs py-1 rounded-full ${filter === f.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}>{f.label}</button>
        ))}
      </div>

      <div className="space-y-2">
        <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="Add a task or event…" className="rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
            <SelectTrigger className="rounded-full w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{CATS.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
            <SelectTrigger className="rounded-full w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.recurrence} onValueChange={(v) => setForm((f) => ({ ...f, recurrence: v }))}>
            <SelectTrigger className="rounded-full w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{RECURRENCE.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="time" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} className="rounded-full w-28 h-8 text-xs" />
          <Input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className="rounded-full w-28 h-8 text-xs" />
          <Button size="sm" className="rounded-full h-8" onClick={add}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="space-y-2">
        {loading && <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>}
        {!loading && filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No tasks here — a fresh start.</p>}
        {filtered.map((t) => {
          const m = CAT_META[t.category] || CAT_META.home;
          const pr = PRIORITIES.find((p) => p.id === t.priority) || PRIORITIES[1];
          const open = openId === t.id;
          return (
            <div key={t.id} className="rounded-2xl border bg-background/60">
              <div className="flex items-center gap-2 p-2">
                <button onClick={() => toggleDone(t)} className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${t.completed ? 'bg-primary border-primary' : 'border-border'}`}>
                  {t.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.completed ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={chip(m)}>{m.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${pr.cls}`}>{pr.label}</span>
                    {t.start_time && <span className="text-[10px] text-muted-foreground">{t.start_time}{t.end_time ? `–${t.end_time}` : ''}</span>}
                    {t.location && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{t.location}</span>}
                    {t.recurrence && t.recurrence !== 'none' && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Repeat className="w-2.5 h-2.5" />{RECURRENCE.find((r) => r.id === t.recurrence)?.label}</span>}
                    {t.subtasks && t.subtasks.length > 0 && <span className="text-[10px] text-muted-foreground">{t.subtasks.filter((s) => s.done).length}/{t.subtasks.length}</span>}
                  </div>
                </div>
                <button onClick={() => setOpenId(open ? null : t.id)} className="text-muted-foreground"><ChevronDown className={`w-4 h-4 transition ${open ? 'rotate-180' : ''}`} /></button>
                <button onClick={() => del(t)} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              {open && (
                <div className="px-3 pb-3 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Start</label>
                      <Input type="time" value={t.start_time || ''} onChange={(e) => patch(t, { start_time: e.target.value })} className="rounded-full h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">End</label>
                      <Input type="time" value={t.end_time || ''} onChange={(e) => patch(t, { end_time: e.target.value })} className="rounded-full h-8 text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />Location</label>
                      <Input value={t.location || ''} onChange={(e) => patch(t, { location: e.target.value })} placeholder="Where" className="rounded-full h-8 text-xs" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground flex items-center gap-1"><CalendarClock className="w-2.5 h-2.5" />Move to</label>
                      <Input type="date" value={t.task_date} onChange={(e) => reschedule(t, e.target.value)} className="rounded-full h-8 text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Notes</label>
                    <Textarea value={t.notes || ''} onChange={(e) => patch(t, { notes: e.target.value })} placeholder="Add details…" rows={2} className="rounded-2xl text-xs resize-none" />
                  </div>

                  {t.subtasks && t.subtasks.length > 0 && <Progress value={subProgress(t)} className="h-1.5" />}
                  {(t.subtasks || []).map((s) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <button onClick={() => toggleSub(t, s.id)} className={`w-4 h-4 rounded border flex items-center justify-center ${s.done ? 'bg-primary border-primary' : 'border-border'}`}>
                        {s.done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </button>
                      <span className={`text-xs flex-1 ${s.done ? 'line-through text-muted-foreground' : ''}`}>{s.text}</span>
                      <button onClick={() => delSub(t, s.id)} className="text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                  <div className="flex gap-1">
                    <Input value={subText[t.id] || ''} onChange={(e) => setSubText((s) => ({ ...s, [t.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addSub(t)} placeholder="Add subtask" className="rounded-full h-8 text-xs" />
                    <Button size="sm" variant="outline" className="rounded-full h-8" onClick={() => addSub(t)}><Plus className="w-3.5 h-3.5" /></Button>
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