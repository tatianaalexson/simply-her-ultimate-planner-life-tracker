import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import ProgressRing from '@/components/ProgressRing';
import { Activity, Droplet, Flame, Moon } from 'lucide-react';

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function FitnessHabitsTab() {
  const [goals, setGoals] = useLocalStorage('health-fitness-goals', { steps: 8000, water: 8, active: 30, sleep: 4 });
  const [log, setLog] = useLocalStorage('health-fitness-log', {});
  const [wearable, setWearable] = useLocalStorage('health-wearable-sync', false);

  const day = log[todayKey()] || { steps: 0, water: 0, active: 0, sleep: 0 };
  const set = (key, val) =>
    setLog((l) => ({ ...l, [todayKey()]: { ...day, [key]: Math.max(0, val) } }));

  const rings = [
    { key: 'steps', label: 'Steps', value: day.steps, max: goals.steps, color: 'hsl(199 52% 50%)', icon: Activity },
    { key: 'water', label: 'Water', value: day.water, max: goals.water, color: 'hsl(199 80% 55%)', icon: Droplet },
    { key: 'active', label: 'Active min', value: day.active, max: goals.active, color: 'hsl(12 76% 60%)', icon: Flame },
    { key: 'sleep', label: 'Sleep (1-5)', value: day.sleep, max: goals.sleep, color: 'hsl(265 60% 65%)', icon: Moon }
  ];

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Today's Rings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2 overflow-x-auto pb-2">
            {rings.map((r) => (
              <ProgressRing
                key={r.key}
                label={r.label}
                value={r.value}
                max={r.max}
                color={r.color}
                icon={r.icon}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Manual Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rings.map((r) => (
            <div key={r.key} className="flex items-center gap-2">
              <span className="text-sm w-24 shrink-0">{r.label}</span>
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 shrink-0" onClick={() => set(r.key, day[r.key] - (r.key === 'water' ? 1 : r.key === 'sleep' ? 1 : 100))}>-</Button>
              <Input
                type="number"
                value={day[r.key]}
                onChange={(e) => set(r.key, +e.target.value)}
                className="rounded-2xl"
              />
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 shrink-0" onClick={() => set(r.key, day[r.key] + (r.key === 'water' ? 1 : r.key === 'sleep' ? 1 : 100))}>+</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Goals & Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rings.map((r) => (
            <div key={r.key} className="flex items-center gap-2">
              <span className="text-sm w-24 shrink-0">{r.label} goal</span>
              <Input
                type="number"
                value={goals[r.key]}
                onChange={(e) => setGoals((g) => ({ ...g, [r.key]: +e.target.value }))}
                className="rounded-2xl"
              />
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              <p className="text-sm font-medium">Wearable sync</p>
              <p className="text-xs text-muted-foreground">Connect a tracker for automatic entry</p>
            </div>
            <Switch checked={wearable} onCheckedChange={setWearable} />
          </div>
          {wearable && (
            <p className="text-xs text-amber-500">Manual entry is active. Pairing a device is coming soon.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}