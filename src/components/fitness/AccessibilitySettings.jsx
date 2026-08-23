import React from 'react';
import { useSingleton } from '@/hooks/useSingleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  MOBILITY_PREFERENCES, COGNITIVE_SUPPORT, ADAPTATION_PREFERENCES,
  CAPACITY_LEVELS_DEFAULT, POSITION_OPTIONS
} from '@/lib/fitnessConstants';

function ChipToggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs border transition whitespace-nowrap ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent/60'}`}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function AccessibilitySettings() {
  const { record, save } = useSingleton('AccessibilityProfile', { kind: 'accessibility' }, {});

  const toggleArr = (key, val) => {
    const arr = record?.[key] || [];
    save({ [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  };
  const isActive = (key, val) => (record?.[key] || []).includes(val);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl bg-accent/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            These are your personal functional preferences. No diagnosis is required. Everything here is private and helps Fitness adapt to you.
          </p>
        </CardContent>
      </Card>

      <SectionCard title="Mobility Preferences">
        <div className="flex flex-wrap gap-1.5">
          {MOBILITY_PREFERENCES.map((m) => (
            <ChipToggle key={m} active={isActive('mobility_preferences', m)} onClick={() => toggleArr('mobility_preferences', m)}>{m}</ChipToggle>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Movement Positions">
        <p className="text-xs text-muted-foreground mb-2">Which positions work for you?</p>
        <div className="flex flex-wrap gap-1.5">
          {POSITION_OPTIONS.map((p) => (
            <ChipToggle key={p} active={isActive('movement_positions', p)} onClick={() => toggleArr('movement_positions', p)}>{p}</ChipToggle>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Adaptation Preferences">
        <div className="flex flex-wrap gap-1.5">
          {ADAPTATION_PREFERENCES.map((a) => (
            <ChipToggle key={a} active={isActive('adaptations', a)} onClick={() => toggleArr('adaptations', a)}>{a}</ChipToggle>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Cognitive & Executive Function Support">
        <div className="flex flex-wrap gap-1.5">
          {COGNITIVE_SUPPORT.map((c) => (
            <ChipToggle key={c} active={isActive('cognitive_support', c)} onClick={() => toggleArr('cognitive_support', c)}>{c}</ChipToggle>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Fluctuating Capacity">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">My capacity changes from day to day</p>
            <p className="text-xs text-muted-foreground">Fitness can offer Full / Reduced / Gentle / Rest versions of planned workouts</p>
          </div>
          <Switch checked={record?.fluctuating_capacity ?? false} onCheckedChange={(v) => save({ fluctuating_capacity: v })} />
        </div>
        {record?.fluctuating_capacity && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Capacity levels (rename to fit your experience):</p>
            {(record?.capacity_levels?.length ? record.capacity_levels : CAPACITY_LEVELS_DEFAULT).map((lvl, i) => (
              <Input
                key={lvl.id}
                value={lvl.label}
                onChange={(e) => {
                  const levels = [...(record?.capacity_levels || CAPACITY_LEVELS_DEFAULT)];
                  levels[i] = { ...lvl, label: e.target.value };
                  save({ capacity_levels: levels });
                }}
                className="rounded-2xl"
                placeholder="Label"
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Energy Budget (Optional)">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Track daily energy</p>
            <p className="text-xs text-muted-foreground">A subjective capacity system — not a medical measurement</p>
          </div>
          <Switch checked={record?.energy_budget_enabled ?? false} onCheckedChange={(v) => save({ energy_budget_enabled: v })} />
        </div>
        {record?.energy_budget_enabled && (
          <div className="mt-3 space-y-2">
            <Input
              value={record?.energy_budget_terminology || 'Energy Budget'}
              onChange={(e) => save({ energy_budget_terminology: e.target.value })}
              placeholder="What do you call it? (e.g. Spoons, My Energy)"
              className="rounded-2xl"
            />
            <Input
              type="number"
              value={record?.energy_budget_daily || 0}
              onChange={(e) => save({ energy_budget_daily: +e.target.value })}
              placeholder="Daily available amount"
              className="rounded-2xl"
            />
          </div>
        )}
      </SectionCard>

      <SectionCard title="Pacing (Optional)">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Alternate activity and rest</p>
            <p className="text-xs text-muted-foreground">e.g. 5 min movement, 10 min rest</p>
          </div>
          <Switch checked={record?.pacing_enabled ?? false} onCheckedChange={(v) => save({ pacing_enabled: v })} />
        </div>
        {record?.pacing_enabled && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Activity (min)</p>
              <Input type="number" value={record?.pacing_activity_min ?? 5} onChange={(e) => save({ pacing_activity_min: +e.target.value })} className="rounded-2xl" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Rest (min)</p>
              <Input type="number" value={record?.pacing_rest_min ?? 10} onChange={(e) => save({ pacing_rest_min: +e.target.value })} className="rounded-2xl" />
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Activity Tolerance (Optional)">
        <p className="text-xs text-muted-foreground mb-2">Personal planning references. No medical interpretation.</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm w-28 shrink-0">Standing</span>
            <Input type="number" value={record?.activity_tolerance_standing ?? 0} onChange={(e) => save({ activity_tolerance_standing: +e.target.value })} className="rounded-2xl" />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm w-28 shrink-0">Walking</span>
            <Input type="number" value={record?.activity_tolerance_walking ?? 0} onChange={(e) => save({ activity_tolerance_walking: +e.target.value })} className="rounded-2xl" />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm w-28 shrink-0">Seated</span>
            <Input type="number" value={record?.activity_tolerance_seated ?? 0} onChange={(e) => save({ activity_tolerance_seated: +e.target.value })} className="rounded-2xl" />
            <span className="text-xs text-muted-foreground">min</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Display Preferences">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div><p className="text-sm">Simplified workout mode</p><p className="text-xs text-muted-foreground">One exercise at a time, large controls</p></div>
            <Switch checked={record?.simplified_workout ?? false} onCheckedChange={(v) => save({ simplified_workout: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">Reduce visible metrics</p><p className="text-xs text-muted-foreground">Fewer numbers on screen</p></div>
            <Switch checked={record?.hide_metrics ?? false} onCheckedChange={(v) => save({ hide_metrics: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">Reduce motion</p></div>
            <Switch checked={record?.reduce_motion ?? false} onCheckedChange={(v) => save({ reduce_motion: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm">Larger interaction targets</p></div>
            <Switch checked={record?.larger_targets ?? false} onCheckedChange={(v) => save({ larger_targets: v })} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notes">
        <Textarea
          value={record?.custom_notes || ''}
          onChange={(e) => save({ custom_notes: e.target.value })}
          placeholder="Anything else Fitness should know about how you move?"
          className="rounded-2xl min-h-[80px]"
        />
      </SectionCard>
    </div>
  );
}