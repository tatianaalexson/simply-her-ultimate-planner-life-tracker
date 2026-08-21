import React from 'react';
import { useDailyRange } from '@/hooks/useDailyRange';
import { useSingleton } from '@/hooks/useSingleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import ProgressRing from '@/components/ProgressRing';
import { Activity, Droplet, Flame, Moon } from 'lucide-react';

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function FitnessHabitsTab() {
  const today = todayKey();
  const { byDate, saveForDate } = useDailyRange('FitnessDaily', [today], { steps: 0, water: 0, active: 0, sleep: 0 });
  const { record: settings, save: saveSettings } = useSingleton('FitnessSetting', { kind: 'fitness' }, { steps_goal: 8000, water_goal: 8, active_goal: 30, sleep_goal: 4, wearable: false });

  const day = byDate[today] || { steps: 0, water: 0, active: 0, sleep: 0 };
  const set = (key, val) => saveForDate(today, { [key]: Math.max(0, val) });

  const goals = {
    steps: settings?.steps_goal ?? 8000,
    water: settings?.water_goal ?? 8,
    active: settings?.active_goal ?? 30,
    sleep: settings?.sleep_goal ?? 4
  };
  const wearable = settings?.wearable ?? false;
  const setGoal = (key, val) => saveSettings({ [`${key}_goal`]: val });
  const setWearable = (v) => saveSettings({ wearable: v });

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
                onChange={(e) => setGoal(r.key, +e.target.value)}
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