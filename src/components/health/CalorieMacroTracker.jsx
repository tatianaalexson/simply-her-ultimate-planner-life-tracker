import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2 } from 'lucide-react';

const todayKey = () => new Date().toISOString().slice(0, 10);

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'hsl(265 60% 65%)', unit: 'g' },
  { key: 'carbs', label: 'Carbs', color: 'hsl(43 74% 55%)', unit: 'g' },
  { key: 'fat', label: 'Fat', color: 'hsl(12 76% 60%)', unit: 'g' }
];

export default function CalorieMacroTracker() {
  const [goals, setGoals] = useLocalStorage('fitness-macro-goals', { calories: 2000, protein: 120, carbs: 200, fat: 65 });
  const [log, setLog] = useLocalStorage('fitness-macro-log', {});
  const [entry, setEntry] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [editGoals, setEditGoals] = useState(false);

  const day = log[todayKey()] || [];
  const totals = day.reduce(
    (acc, e) => ({
      calories: acc.calories + (+e.calories || 0),
      protein: acc.protein + (+e.protein || 0),
      carbs: acc.carbs + (+e.carbs || 0),
      fat: acc.fat + (+e.fat || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const add = () => {
    if (!entry.name.trim() && !entry.calories) return;
    setLog((l) => ({ ...l, [todayKey()]: [{ id: Date.now(), ...entry }, ...(l[todayKey()] || [])] }));
    setEntry({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const calPct = goals.calories ? Math.min(100, (totals.calories / goals.calories) * 100) : 0;
  const remaining = Math.max(0, goals.calories - totals.calories);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
          <CardTitle className="font-heading text-base">Calories & Macros · {new Date().toLocaleDateString()}</CardTitle>
          <Button size="sm" variant="ghost" className="rounded-full h-7 px-2 text-xs" onClick={() => setEditGoals((v) => !v)}>
            {editGoals ? 'Done' : 'Goals'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {editGoals && (
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" value={goals.calories} onChange={(e) => setGoals((g) => ({ ...g, calories: +e.target.value }))} placeholder="Calories" className="rounded-2xl" />
              {MACROS.map((m) => (
                <Input
                  key={m.key}
                  type="number"
                  value={goals[m.key]}
                  onChange={(e) => setGoals((g) => ({ ...g, [m.key]: +e.target.value }))}
                  placeholder={`${m.label} (g)`}
                  className="rounded-2xl"
                />
              ))}
            </div>
          )}
          <div>
            <div className="flex items-baseline justify-between">
              <p className="font-heading text-2xl">{totals.calories}</p>
              <p className="text-xs text-muted-foreground">/ {goals.calories} kcal · {remaining} left</p>
            </div>
            <Progress value={calPct} className="mt-2 h-2" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MACROS.map((m) => {
              const pct = goals[m.key] ? Math.min(100, (totals[m.key] / goals[m.key]) * 100) : 0;
              return (
                <div key={m.key} className="rounded-2xl bg-accent/40 p-2">
                  <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-medium">{totals[m.key]}<span className="text-muted-foreground">/{goals[m.key]}{m.unit}</span></p>
                  <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: m.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Log Food</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input value={entry.name} onChange={(e) => setEntry((p) => ({ ...p, name: e.target.value }))} placeholder="Food / meal" className="rounded-2xl" />
          <div className="grid grid-cols-4 gap-2">
            <Input type="number" value={entry.calories} onChange={(e) => setEntry((p) => ({ ...p, calories: e.target.value }))} placeholder="kcal" className="rounded-2xl" />
            <Input type="number" value={entry.protein} onChange={(e) => setEntry((p) => ({ ...p, protein: e.target.value }))} placeholder="P g" className="rounded-2xl" />
            <Input type="number" value={entry.carbs} onChange={(e) => setEntry((p) => ({ ...p, carbs: e.target.value }))} placeholder="C g" className="rounded-2xl" />
            <Input type="number" value={entry.fat} onChange={(e) => setEntry((p) => ({ ...p, fat: e.target.value }))} placeholder="F g" className="rounded-2xl" />
          </div>
          <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add</Button>
          {day.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 border-t border-border pt-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">{e.name || 'Entry'} · {e.calories} kcal</p>
                <p className="text-xs text-muted-foreground">P {e.protein} · C {e.carbs} · F {e.fat}</p>
              </div>
              <button
                onClick={() => setLog((l) => ({ ...l, [todayKey()]: (l[todayKey()] || []).filter((x) => x.id !== e.id) }))}
                className="text-muted-foreground shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}