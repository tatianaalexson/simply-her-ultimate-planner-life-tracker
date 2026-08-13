import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { HOURS, fmtHour, dayKey, blocksKey, CATEGORIES, catMeta } from '@/lib/plannerStore';

const HOUR_H = 56;
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fromMin = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
const topFor = (t) => ((toMin(t) - 5 * 60) / 60) * HOUR_H;

export default function TimelineView({ date }) {
  const [blocks, setBlocks] = useLocalStorage(blocksKey(date), []);
  const [now, setNow] = useState(new Date());
  const [form, setForm] = useState({ open: false, id: null, title: '', category: 'personal', start: '09:00', end: '10:00' });

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(i);
  }, []);

  const isToday = dayKey(date) === dayKey(new Date());
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sorted = [...blocks].sort((a, b) => toMin(a.start) - toMin(b.start));

  const overlaps = (a, b) => toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);
  const blockOverlaps = (id) => {
    const me = blocks.find((x) => x.id === id);
    return blocks.some((b) => b.id !== id && overlaps(b, me));
  };

  const openAdd = (start = '09:00') => setForm({ open: true, id: null, title: '', category: 'personal', start, end: fromMin(toMin(start) + 60) });
  const openEdit = (b) => setForm({ open: true, id: b.id, title: b.title, category: b.category, start: b.start, end: b.end });

  const save = () => {
    if (!form.title.trim()) return;
    if (form.id) {
      setBlocks((bs) => bs.map((b) => (b.id === form.id ? { ...b, title: form.title, category: form.category, start: form.start, end: form.end } : b)));
    } else {
      setBlocks((bs) => [...bs, { id: Date.now(), title: form.title.trim(), category: form.category, start: form.start, end: form.end }]);
    }
    setForm((f) => ({ ...f, open: false }));
  };
  const del = (id) => setBlocks((bs) => bs.filter((b) => b.id !== id));

  return (
    <div className="rounded-3xl border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading text-base flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time-Blocked Timeline</h3>
        <Button size="sm" className="rounded-full" onClick={() => openAdd()}><Plus className="w-4 h-4 mr-1" /> Block</Button>
      </div>

      <div className="relative" style={{ height: HOURS.length * HOUR_H }}>
        {HOURS.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 flex" style={{ top: i * HOUR_H, height: HOUR_H }}>
            <span className="w-12 shrink-0 text-[10px] text-muted-foreground pt-1">{fmtHour(h)}</span>
            <div className="flex-1 border-t border-border/50 cursor-pointer hover:bg-accent/30" onClick={() => openAdd(fromMin(h * 60))} />
          </div>
        ))}

        {/* buffer indicators */}
        {sorted.map((b, i) => {
          const next = sorted[i + 1];
          if (!next) return null;
          const gap = toMin(next.start) - toMin(b.end);
          if (gap <= 0) return null;
          return (
            <div
              key={`buf-${b.id}`}
              className="absolute left-12 right-2 text-[9px] text-muted-foreground/70 flex items-center"
              style={{ top: topFor(b.end) + 2, height: Math.min((gap / 60) * HOUR_H, 16) }}
            >
              <span className="truncate">· buffer {gap}m</span>
            </div>
          );
        })}

        {/* blocks */}
        {sorted.map((b) => {
          const top = topFor(b.start);
          const h = Math.max(24, ((toMin(b.end) - toMin(b.start)) / 60) * HOUR_H - 4);
          const m = catMeta(b.category);
          const ov = blockOverlaps(b.id);
          return (
            <div
              key={b.id}
              onClick={() => openEdit(b)}
              className="absolute left-12 right-2 rounded-2xl px-3 py-1.5 shadow-sm cursor-pointer overflow-hidden"
              style={{ top: top + 2, height: h, background: `hsla(${m.h}, ${m.s}%, ${m.l}%, 0.18)`, borderLeft: `3px solid hsl(${m.h}, ${m.s}%, ${m.l}%)` }}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-medium truncate">{b.title}</p>
                {ov && <AlertTriangle className="w-3 h-3 text-destructive shrink-0" />}
              </div>
              <p className="text-[10px] text-muted-foreground">{b.start}–{b.end} · {m.label}</p>
            </div>
          );
        })}

        {/* current time line */}
        {isToday && nowMin >= 5 * 60 && nowMin <= 23 * 60 && (
          <div className="absolute left-10 right-0 z-10 flex items-center" style={{ top: topFor(fromMin(nowMin)) }}>
            <span className="w-2 h-2 rounded-full bg-destructive -ml-1" />
            <div className="flex-1 h-px bg-destructive" />
          </div>
        )}
      </div>

      {form.open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setForm((f) => ({ ...f, open: false }))}>
          <div className="bg-card w-full rounded-t-3xl p-4 space-y-3 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-base">{form.id ? 'Edit Block' : 'New Block'}</h3>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Block title" className="rounded-2xl" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Start</label>
                <Input type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} className="rounded-2xl" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">End</label>
                <Input type="time" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} className="rounded-2xl" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {form.id && (
                <Button variant="outline" className="rounded-full" onClick={() => { del(form.id); setForm((f) => ({ ...f, open: false })); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button className="rounded-full flex-1" onClick={save}>{form.id ? 'Save' : 'Add Block'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}