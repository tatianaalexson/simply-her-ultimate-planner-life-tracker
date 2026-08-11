import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Dumbbell } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const FOCUS = {
  pilates: 'Pilates & Barre',
  strength: 'Heavy Lifting & Strength',
  running: 'Running & Cardio',
  yoga: 'Yoga & Mobility',
  walking: 'Gentle Home Movement & Walking'
};

export default function FitnessStudio() {
  const { settings } = useAppSettings();
  const [workouts, setWorkouts] = useLocalStorage('fitness-workouts', []);
  const [sleep, setSleep] = useLocalStorage('fitness-sleep', [7, 7.5, 6.5, 8, 7, 7.5, 8]);
  const [energy, setEnergy] = useLocalStorage('fitness-energy', 6);
  const [form, setForm] = useState({ name: '', detail: '' });
  const data = sleep.map((h, i) => ({ day: i, hours: h }));

  const add = () => {
    if (!form.name.trim()) return;
    setWorkouts([{ id: Date.now(), name: form.name, detail: form.detail, date: new Date().toLocaleDateString() }, ...workouts]);
    setForm({ name: '', detail: '' });
  };

  return (
    <StudioShell title="Fitness & Movement">
      <p className="text-sm text-muted-foreground">Focus: {FOCUS[settings.fitnessFocus]}</p>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Sleep & Recovery</CardTitle>
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
          <p className="text-xs text-muted-foreground mt-1">
            Last 7 nights · avg {(sleep.reduce((a, b) => a + b, 0) / sleep.length).toFixed(1)}h
          </p>
          <div className="mt-3">
            <label className="text-xs">Morning energy: {energy}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(+e.target.value)}
              className="w-full accent-[hsl(var(--primary))]"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Log a Movement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Workout name"
            className="rounded-full"
          />
          <Input
            value={form.detail}
            onChange={(e) => setForm((p) => ({ ...p, detail: e.target.value }))}
            placeholder="Sets / reps / notes"
            className="rounded-full"
          />
          <Button onClick={add} size="sm" className="rounded-full">
            <Plus className="w-4 h-4 mr-1" /> Log
          </Button>
          <div className="space-y-2 mt-2">
            {workouts.map((w) => (
              <div key={w.id} className="flex items-center gap-2 text-sm">
                <Dumbbell className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.detail} · {w.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </StudioShell>
  );
}