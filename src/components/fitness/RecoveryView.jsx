import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useDailyRange } from '@/hooks/useDailyRange';
import { useSingleton } from '@/hooks/useSingleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Moon, BedDouble, Battery, HeartPulse, Plus } from 'lucide-react';
import { todayKey, CAPACITY_LEVELS_DEFAULT, POST_ACTIVITY_RESPONSES } from '@/lib/fitnessConstants';

export default function RecoveryView() {
  const { isFeatureEnabled } = useAppSettings();
  const today = todayKey();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().slice(0, 10);
  });
  const { byDate, saveForDate } = useDailyRange('FitnessDaily', last7, { sleep: 0, energy: 0, sleep_quality: 0, soreness: 0, motivation: 0, rest_day: false });
  const { record: access } = useSingleton('AccessibilityProfile', { kind: 'accessibility' }, {});

  const showSleep = isFeatureEnabled('fit.sleep');
  const showEnergy = isFeatureEnabled('fit.energy');
  const showSoreness = isFeatureEnabled('fit.soreness');
  const showRest = isFeatureEnabled('fit.restDays') || isFeatureEnabled('fit.recovery');
  const showCapacity = isFeatureEnabled('fit.capacity') || isFeatureEnabled('fit.fluctuatingCapacity');

  const day = byDate[today] || {};
  const sleep = last7.map((d) => byDate[d]?.sleep ?? 0);
  const sleepData = sleep.map((h, i) => ({ day: i, hours: h }));
  const restToday = day.rest_day ?? false;

  const set = (k, v) => saveForDate(today, { [k]: v });
  const capacityLevels = access?.capacity_levels?.length ? access.capacity_levels : CAPACITY_LEVELS_DEFAULT;

  if (!showSleep && !showEnergy && !showSoreness && !showRest && !showCapacity) {
    return (
      <Card className="rounded-3xl"><CardContent className="py-10 text-center">
        <HeartPulse className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Enable Sleep, Energy, or Recovery in Fitness Settings to begin tracking recovery.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Capacity Check-in */}
      {showCapacity && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="font-heading text-base">How's your capacity today?</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {capacityLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => set('capacity_today', lvl.id)}
                  className={`rounded-full px-4 py-2 text-sm border-2 transition ${day.capacity_today === lvl.id ? 'border-primary bg-primary/10 font-medium' : 'border-border bg-card'}`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            {day.capacity_today === 'rest' && (
              <p className="text-xs text-muted-foreground mt-2 italic">Rest is part of the plan. Nothing to catch up on.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sleep */}
      {showSleep && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Moon className="w-4 h-4" /> Sleep</CardTitle></CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <XAxis dataKey="day" hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 nights · avg {(sleep.reduce((a, b) => a + b, 0) / sleep.length).toFixed(1)}h</p>
            <div className="grid grid-cols-7 gap-1 mt-2">
              {sleep.map((h, i) => (
                <Input key={i} type="number" step="0.5" value={h} onChange={(e) => saveForDate(last7[i], { sleep: +e.target.value })} className="rounded-xl h-9 text-center px-1" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Energy & Soreness */}
      {(showEnergy || showSoreness) && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Battery className="w-4 h-4" /> How does movement feel?</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {showEnergy && (
              <div>
                <label className="text-xs">Morning energy: {day.energy ?? 0}/10</label>
                <input type="range" min="0" max="10" value={day.energy ?? 0} onChange={(e) => set('energy', +e.target.value)} className="w-full accent-[hsl(var(--primary))]" />
              </div>
            )}
            {showSoreness && (
              <div>
                <label className="text-xs">Soreness: {day.soreness ?? 0}/5</label>
                <input type="range" min="0" max="5" value={day.soreness ?? 0} onChange={(e) => set('soreness', +e.target.value)} className="w-full accent-[hsl(var(--primary))]" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rest Days */}
      {showRest && (
        <Card className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><BedDouble className="w-4 h-4" /> Rest Days</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button size="sm" variant={restToday ? 'outline' : 'default'} className="rounded-full" onClick={() => set('rest_day', !restToday)}>
              {restToday ? 'Mark as active' : 'Mark today as rest'}
            </Button>
            {last7.filter((d) => byDate[d]?.rest_day).reverse().map((d) => (
              <p key={d} className="text-xs text-muted-foreground">{d} · rest</p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Post-Activity Response */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">After Movement</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">How did that feel?</p>
          <div className="flex flex-wrap gap-1.5">
            {POST_ACTIVITY_RESPONSES.map((r) => (
              <button
                key={r}
                onClick={() => set('post_activity_response', r)}
                className={`rounded-full px-3 py-1.5 text-xs border transition ${day.post_activity_response === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <Textarea value={day.capacity_notes || ''} onChange={(e) => set('capacity_notes', e.target.value)} placeholder="Notes (optional)" className="rounded-2xl min-h-[50px] mt-1" />
        </CardContent>
      </Card>
    </div>
  );
}