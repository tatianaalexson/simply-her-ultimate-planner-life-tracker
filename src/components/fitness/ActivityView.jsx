import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useDailyRange } from '@/hooks/useDailyRange';
import { useSingleton } from '@/hooks/useSingleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/ProgressRing';
import { Droplet, Footprints, Flame, Activity, Plus, Minus } from 'lucide-react';
import { todayKey } from '@/lib/fitnessConstants';

export default function ActivityView() {
  const { isFeatureEnabled } = useAppSettings();
  const today = todayKey();
  const { byDate, saveForDate } = useDailyRange('FitnessDaily', [today], { steps: 0, water: 0, active: 0, distance: 0 });
  const { record: fitSettings, save: saveSettings } = useSingleton('FitnessSetting', { kind: 'fitness' }, { steps_goal: 8000, water_goal: 8, active_goal: 30 });

  const day = byDate[today] || { steps: 0, water: 0, active: 0, distance: 0 };

  const showSteps = isFeatureEnabled('fit.steps');
  const showWater = isFeatureEnabled('fit.water');
  const showActive = isFeatureEnabled('fit.active') || isFeatureEnabled('fit.activeMinutes');
  const showDistance = isFeatureEnabled('fit.distance');

  const goals = {
    steps: fitSettings?.steps_goal ?? 8000,
    water: fitSettings?.water_goal ?? 8,
    active: fitSettings?.active_goal ?? 30
  };

  const rings = [];
  if (showSteps) rings.push({ key: 'steps', label: 'Steps', value: day.steps, max: goals.steps, color: 'hsl(199 52% 50%)', icon: Footprints, step: 100 });
  if (showActive) rings.push({ key: 'active', label: 'Active min', value: day.active, max: goals.active, color: 'hsl(12 76% 60%)', icon: Flame, step: 5 });
  if (showWater) rings.push({ key: 'water', label: 'Water', value: day.water, max: goals.water, color: 'hsl(199 80% 55%)', icon: Droplet, step: 1 });

  const set = (key, val) => saveForDate(today, { [key]: Math.max(0, val) });
  const setGoal = (key, val) => saveSettings({ [`${key}_goal`]: Math.max(0, val) });

  if (rings.length === 0 && !showDistance) {
    return (
      <Card className="rounded-3xl"><CardContent className="py-10 text-center">
        <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Enable Steps, Water, or Active Minutes in Fitness Settings to begin tracking activity.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      {rings.length > 0 && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Today</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between gap-2 overflow-x-auto pb-2">
              {rings.map((r) => (
                <ProgressRing key={r.key} label={r.label} value={r.value} max={r.max} color={r.color} icon={r.icon} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showDistance && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <span className="text-sm flex-1">Distance today</span>
            <Input type="number" step="0.1" value={day.distance || 0} onChange={(e) => set('distance', +e.target.value)} className="rounded-2xl w-24 text-center" />
            <span className="text-xs text-muted-foreground">{fitSettings?.unit_system === 'imperial' ? 'mi' : 'km'}</span>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Quick Add</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {rings.map((r) => (
            <div key={r.key} className="flex items-center gap-2">
              <span className="text-sm w-24 shrink-0">{r.label}</span>
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 shrink-0" onClick={() => set(r.key, day[r.key] - r.step)}><Minus className="w-3.5 h-3.5" /></Button>
              <Input type="number" value={day[r.key]} onChange={(e) => set(r.key, +e.target.value)} className="rounded-2xl text-center" />
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 shrink-0" onClick={() => set(r.key, day[r.key] + r.step)}><Plus className="w-3.5 h-3.5" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Goals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {rings.map((r) => (
            <div key={r.key} className="flex items-center gap-2">
              <span className="text-sm w-24 shrink-0">{r.label} goal</span>
              <Input type="number" value={goals[r.key]} onChange={(e) => setGoal(r.key, +e.target.value)} className="rounded-2xl" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}