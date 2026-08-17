import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { base44 } from '@/api/base44Client';
import { blocksKey, catMeta } from '@/lib/plannerStore';
import { ListTodo } from 'lucide-react';

const isoOf = (d) => d.toISOString().slice(0, 10);
const CAT_LABEL = { home: 'Home', reflection: 'Reflection', wellness: 'Wellness', errands: 'Errands', work: 'Work' };

export default function ListView({ date }) {
  const [blocks] = useLocalStorage(blocksKey(date), []);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    let on = true;
    base44.entities.Task.filter({ task_date: isoOf(date) }, 'start_time')
      .then((t) => on && setTasks(t || []))
      .catch(() => on && setTasks([]));
    return () => { on = false; };
    // eslint-disable-next-line
  }, [isoOf(date)]);

  const timed = [
    ...blocks.map((b) => ({ type: 'block', time: b.start, end: b.end, title: b.title, meta: catMeta(b.category).label })),
    ...tasks.filter((t) => t.start_time).map((t) => ({ type: 'task', time: t.start_time, end: t.end_time, title: t.title, meta: CAT_LABEL[t.category] || 'Task' }))
  ].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'));

  const untimed = tasks.filter((t) => !t.start_time);

  return (
    <div className="rounded-3xl border bg-card p-3 shadow-sm">
      <h3 className="font-heading text-base flex items-center gap-1.5 mb-2"><ListTodo className="w-4 h-4" /> Day List</h3>
      <div className="space-y-1">
        {timed.map((it, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
            <span className="text-[10px] text-muted-foreground w-20 shrink-0">{it.time}{it.end ? `–${it.end}` : ''}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent">{it.meta}</span>
            <span className="text-sm flex-1">{it.title}</span>
          </div>
        ))}
        {untimed.map((t, i) => (
          <div key={`u${i}`} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
            <span className="text-[10px] text-muted-foreground w-20 shrink-0">—</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent">{CAT_LABEL[t.category] || 'Task'}</span>
            <span className="text-sm flex-1">{t.title}</span>
          </div>
        ))}
        {timed.length === 0 && untimed.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nothing planned yet.</p>}
      </div>
    </div>
  );
}