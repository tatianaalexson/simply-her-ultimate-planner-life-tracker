import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, Check, Sunrise, Sun, Moon } from 'lucide-react';
import { ROUTINES_KEY, DEFAULT_ROUTINES, routineDoneKey } from '@/lib/plannerStore';

const SECTIONS = [
  { key: 'morning', label: 'Morning Reset', icon: Sunrise },
  { key: 'afternoon', label: 'Afternoon / Transition', icon: Sun },
  { key: 'evening', label: 'Evening Wind-Down', icon: Moon }
];

export default function RoutineAnchors({ date }) {
  const [routines, setRoutines] = useLocalStorage(ROUTINES_KEY, DEFAULT_ROUTINES);
  const [done, setDone] = useLocalStorage(routineDoneKey(date), {});
  const [newItem, setNewItem] = useState({});

  const add = (key) => {
    const txt = (newItem[key] || '').trim();
    if (!txt) return;
    setRoutines((r) => ({ ...r, [key]: [...r[key], txt] }));
    setNewItem((n) => ({ ...n, [key]: '' }));
  };
  const remove = (key, i) => setRoutines((r) => ({ ...r, [key]: r[key].filter((_, j) => j !== i) }));
  const toggle = (key, i) => setDone((d) => ({ ...d, [`${key}-${i}`]: !d[`${key}-${i}`] }));
  const prog = (key) => (routines[key].length ? Math.round(routines[key].filter((_, i) => done[`${key}-${i}`]).length / routines[key].length * 100) : 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {SECTIONS.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.key} className="rounded-3xl border bg-card p-3 shadow-sm space-y-2">
            <h4 className="font-heading text-sm flex items-center gap-1.5"><Icon className="w-4 h-4" /> {s.label}</h4>
            <Progress value={prog(s.key)} className="h-1.5" />
            {routines[s.key].map((item, i) => {
              const k = `${s.key}-${i}`;
              const on = !!done[k];
              return (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={() => toggle(s.key, i)} className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-primary border-primary' : 'border-border'}`}>
                    {on && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                  </button>
                  <span className={`text-xs flex-1 ${on ? 'line-through text-muted-foreground' : ''}`}>{item}</span>
                  <button onClick={() => remove(s.key, i)} className="text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
                </div>
              );
            })}
            <div className="flex gap-1">
              <Input value={newItem[s.key] || ''} onChange={(e) => setNewItem((n) => ({ ...n, [s.key]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && add(s.key)} placeholder="Add step" className="rounded-full h-8 text-xs" />
              <Button size="sm" variant="outline" className="rounded-full h-8 px-2" onClick={() => add(s.key)}><Plus className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}