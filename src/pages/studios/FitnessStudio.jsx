import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Dumbbell, Moon, BedDouble } from 'lucide-react';
import FitnessHabitsTab from '@/components/health/FitnessHabitsTab';
import CalorieMacroTracker from '@/components/health/CalorieMacroTracker';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const FOCUS = {
  pilates: 'Pilates & Barre',
  strength: 'Heavy Lifting & Strength',
  running: 'Running & Cardio',
  yoga: 'Yoga & Mobility',
  walking: 'Gentle Home Movement & Walking'
};

const todayKey = () => new Date().toISOString().slice(0, 10);

function MovementTab() {
  const { settings } = useAppSettings();
  const [workouts, setWorkouts] = useLocalStorage('fitness-workouts', []);
  const [form, setForm] = useState({ name: '', detail: '', date: todayKey() });

  const add = () => {
    if (!form.name.trim()) return;
    setWorkouts([{ id: Date.now(), focus: settings.fitnessFocus, ...form }, ...workouts]);
    setForm({ name: '', detail: '', date: todayKey() });
  };

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base flex items-center gap-2"><Dumbbell className="w-4 h-4" /> Log a Movement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Workout name" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
          <Input value={form.detail} onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))} placeholder="Sets / reps / notes" className="rounded-2xl" />
        </div>
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Log</Button>
        <div className="space-y-2 mt-2">
          {workouts.map((w) => (
            <div key={w.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
              <Dumbbell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{w.name}</p>
                <p className="text-xs text-muted-foreground">{w.detail} · {w.date} · {FOCUS[w.focus] || 'Movement'}</p>
              </div>
              <button onClick={() => setWorkouts((x) => x.filter((y) => y.id !== w.id))} className="text-muted-foreground shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecoveryTab() {
  const [sleep, setSleep] = useLocalStorage('fitness-sleep', [7, 7.5, 6.5, 8, 7, 7.5, 8]);
  const [energy, setEnergy] = useLocalStorage('fitness-energy', 6);
  const [rest, setRest] = useLocalStorage('fitness-rest-days', {});
  const data = sleep.map((h, i) => ({ day: i, hours: h }));
  const today = rest[todayKey()];

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2"><Moon className="w-4 h-4" /> Sleep & Recovery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="day" hide />
                <Tooltip />
                <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Last 7 nights · avg {(sleep.reduce((a, b) => a + b, 0) / sleep.length).toFixed(1)}h</p>
          <div className="grid grid-cols-7 gap-1 mt-2">
            {sleep.map((h, i) => (
              <Input key={i} type="number" step="0.5" value={h} onChange={(e) => setSleep((s) => s.map((x, j) => (j === i ? +e.target.value : x)))} className="rounded-xl h-9 text-center px-1" />
            ))}
          </div>
          <div className="mt-3">
            <label className="text-xs">Morning energy: {energy}/10</label>
            <input type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(+e.target.value)} className="w-full accent-[hsl(var(--primary))]" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2"><BedDouble className="w-4 h-4" /> Rest Days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button size="sm" variant={today ? 'outline' : 'default'} className="rounded-full" onClick={() => setRest((r) => ({ ...r, [todayKey()]: !today }))}>
            {today ? 'Mark as active' : 'Mark today as rest'}
          </Button>
          {Object.entries(rest).filter(([, v]) => v).sort().reverse().map(([d]) => (
            <p key={d} className="text-xs text-muted-foreground">{d} · rest</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FitnessStudio() {
  const { settings, isFeatureEnabled } = useAppSettings();

  const tabs = [
    (isFeatureEnabled('fit.steps') || isFeatureEnabled('fit.water') || isFeatureEnabled('fit.active') || isFeatureEnabled('fit.sleep')) && { value: 'habits', label: 'Habits', node: <FitnessHabitsTab /> },
    (isFeatureEnabled('fit.calories') || isFeatureEnabled('fit.macros')) && { value: 'nutrition', label: 'Nutrition', node: <CalorieMacroTracker /> },
    (isFeatureEnabled('fit.active') || isFeatureEnabled('fit.workouts')) && { value: 'movement', label: 'Movement', node: <MovementTab /> },
    (isFeatureEnabled('fit.recovery') || isFeatureEnabled('fit.sleep')) && { value: 'recovery', label: 'Recovery', node: <RecoveryTab /> }
  ].filter(Boolean);

  return (
    <StudioShell title="Fitness & Movement">
      <p className="text-sm text-muted-foreground">Focus: {FOCUS[settings.fitnessFocus]}</p>
      {tabs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Enable a Fitness feature in Settings to begin.</p>
      ) : (
        <Tabs defaultValue={tabs[0].value}>
          <TabsList className="flex w-full bg-accent rounded-full p-1 gap-1 mb-4 overflow-x-auto">
            {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="rounded-full text-xs flex-1">{t.label}</TabsTrigger>)}
          </TabsList>
          {tabs.map((t) => <TabsContent key={t.value} value={t.value} className="mt-0 space-y-4">{t.node}</TabsContent>)}
        </Tabs>
      )}
    </StudioShell>
  );
}