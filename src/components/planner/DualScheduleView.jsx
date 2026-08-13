import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { base44 } from '@/api/base44Client';
import { HOURS, fmtHour, dayKey, blocksKey, catMeta } from '@/lib/plannerStore';
import { Users } from 'lucide-react';

const HOUR_H = 44;
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const topFor = (t) => ((toMin(t) - 300) / 60) * HOUR_H;

export default function DualScheduleView({ date }) {
  const [blocks] = useLocalStorage(blocksKey(date), []);
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    let on = true;
    base44.entities.PartnerShift.filter({ shift_date: dayKey(date) })
      .then((s) => on && setShifts(s))
      .catch(() => {});
    return () => { on = false; };
  }, [dayKey(date)]);

  const renderCol = (title, items, kind) => (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium mb-2 text-center">{title}</p>
      <div className="relative rounded-2xl border bg-background/40 p-2" style={{ height: HOURS.length * HOUR_H }}>
        {HOURS.map((h, i) => (
          <div key={h} className="absolute left-0 right-0 flex" style={{ top: i * HOUR_H, height: HOUR_H }}>
            <span className="w-10 shrink-0 text-[9px] text-muted-foreground">{fmtHour(h)}</span>
            <div className="flex-1 border-t border-border/40" />
          </div>
        ))}
        {items.map((it) => {
          const start = kind === 'shift' ? it.start_time : it.start;
          const end = kind === 'shift' ? it.end_time : it.end;
          const top = topFor(start);
          const h = Math.max(20, ((toMin(end) - toMin(start)) / 60) * HOUR_H - 4);
          const m = kind === 'shift' ? { h: 340, s: 75, l: 65, label: 'Shift' } : catMeta(it.category);
          return (
            <div
              key={it.id}
              className="absolute left-10 right-2 rounded-xl px-2 py-1 overflow-hidden"
              style={{ top: top + 2, height: h, background: `hsla(${m.h}, ${m.s}%, ${m.l}%, 0.2)`, borderLeft: `3px solid hsl(${m.h}, ${m.s}%, ${m.l}%)` }}
            >
              <p className="text-[11px] font-medium truncate">{kind === 'shift' ? (it.label || 'Shift') : it.title}</p>
              <p className="text-[9px] text-muted-foreground">{start}–{end}</p>
            </div>
          );
        })}
        {items.length === 0 && <p className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/60">Nothing scheduled</p>}
      </div>
    </div>
  );

  return (
    <div className="rounded-3xl border bg-card p-3 shadow-sm">
      <h3 className="font-heading text-base flex items-center gap-1.5 mb-2"><Users className="w-4 h-4" /> Dual Schedule</h3>
      <div className="flex gap-2">
        {renderCol('My Schedule', blocks, 'block')}
        {renderCol('Partner Shift', shifts, 'shift')}
      </div>
    </div>
  );
}