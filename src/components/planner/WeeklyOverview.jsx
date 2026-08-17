import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { dayKey, blocksKey } from '@/lib/plannerStore';
import { Target } from 'lucide-react';

const isoOf = (d) => d.toISOString().slice(0, 10);

export default function WeeklyOverview({ date, setDate }) {
  const [goals, setGoals] = useLocalStorage('planner-weekly-goals', ['', '', '']);
  const [counts, setCounts] = useState({});

  const d = new Date(date);
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day - 1));
  const days = Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x;
  });

  useEffect(() => {
    let on = true;
    base44.entities.Task.list('-task_date', 200).then((all) => {
      if (!on) return;
      const c = {};
      days.forEach((dd) => {
        const b = JSON.parse(localStorage.getItem(blocksKey(dd)) || '[]');
        const t = (all || []).filter((x) => x.task_date === isoOf(dd) && !x.completed);
        c[dayKey(dd)] = { blocks: b.length, tasks: t.length };
      });
      setCounts(c);
    }).catch(() => {});
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey(date)]);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardContent className="pt-4 space-y-2">
          <h3 className="font-heading text-base flex items-center gap-1.5"><Target className="w-4 h-4" /> Top Weekly Goals</h3>
          {goals.map((g, i) => (
            <Input key={i} value={g} onChange={(e) => setGoals((gs) => gs.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`Goal ${i + 1}`} className="rounded-full" />
          ))}
        </CardContent>
      </Card>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((dd) => {
          const k = dayKey(dd);
          const c = counts[k] || { blocks: 0, tasks: 0 };
          const isSel = k === dayKey(date);
          return (
            <button key={k} onClick={() => setDate(dd)} className={`rounded-2xl border p-2 text-center min-h-[80px] flex flex-col justify-between ${isSel ? 'border-primary bg-accent' : 'bg-card'}`}>
              <span className="text-[10px] text-muted-foreground">{dd.toLocaleDateString(undefined, { weekday: 'short' })}</span>
              <span className="text-sm font-semibold">{dd.getDate()}</span>
              <span className="text-[10px] text-muted-foreground">{c.blocks}B · {c.tasks}T</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}