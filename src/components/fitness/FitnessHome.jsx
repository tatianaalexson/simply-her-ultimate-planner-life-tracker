import React, { useMemo } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useDailyRange } from '@/hooks/useDailyRange';
import { useSingleton } from '@/hooks/useSingleton';
import { useEntityList } from '@/hooks/useEntityList';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dumbbell, Footprints, Droplet, Moon, Battery, Plus,
  Repeat, Heart, Activity, BedDouble, Sparkles
} from 'lucide-react';
import { todayKey, categoryLabel, JUST_MOVE_OPTIONS } from '@/lib/fitnessConstants';

export default function FitnessHome({ onNavigate }) {
  const { isFeatureEnabled, settings } = useAppSettings();
  const today = todayKey();
  const { byDate, saveForDate } = useDailyRange('FitnessDaily', [today], {});
  const { record: fitSettings } = useSingleton('FitnessSetting', { kind: 'fitness' }, {});
  const { record: access } = useSingleton('AccessibilityProfile', { kind: 'accessibility' }, {});
  const { items: sessions } = useEntityList('WorkoutSession', {}, '-date');
  const { items: templates } = useEntityList('WorkoutTemplate', {}, '-created_date');

  const detailLevel = fitSettings?.detail_level || 'balanced';
  const focuses = fitSettings?.fitness_focuses || ['general'];
  const fluctuating = access?.fluctuating_capacity;
  const simplified = access?.simplified_workout;

  const day = byDate[today] || {};
  const todaySession = sessions.find((s) => s.date === today && s.status !== 'cancelled');
  const lastSession = sessions.find((s) => s.status === 'complete' || s.status === 'partial');
  const favouriteTemplates = templates.filter((t) => t.favourite && !t.archived).slice(0, 3);

  const showSteps = isFeatureEnabled('fit.steps');
  const showWater = isFeatureEnabled('fit.water');
  const showActive = isFeatureEnabled('fit.active') || isFeatureEnabled('fit.activeMinutes');
  const showSleep = isFeatureEnabled('fit.sleep');
  const showEnergy = isFeatureEnabled('fit.energy');
  const showRest = isFeatureEnabled('fit.restDays') || isFeatureEnabled('fit.recovery');
  const showCapacity = isFeatureEnabled('fit.capacity') || fluctuating;

  const capacityLevels = access?.capacity_levels?.length ? access.capacity_levels : [
    { id: 'full', label: 'Full' }, { id: 'reduced', label: 'Reduced' },
    { id: 'gentle', label: 'Gentle' }, { id: 'rest', label: 'Rest' }
  ];

  // Capacity check-in card (fluctuating capacity users)
  const showCapacityCard = showCapacity && !day.capacity_today;

  // Quick start buttons
  const quickStarts = useMemo(() => {
    const items = [];
    if (todaySession) {
      items.push({ label: 'Start Today\'s Workout', icon: Dumbbell, action: () => onNavigate('workouts') });
    }
    if (lastSession) {
      items.push({ label: 'Repeat Last', icon: Repeat, action: () => onNavigate('workouts') });
    }
    if (favouriteTemplates.length > 0) {
      items.push({ label: favouriteTemplates[0].name, icon: Heart, action: () => onNavigate('workouts') });
    }
    items.push({ label: 'Just Move', icon: Footprints, action: () => onNavigate('workouts') });
    items.push({ label: 'New Workout', icon: Plus, action: () => onNavigate('workouts') });
    return simplified ? items.slice(0, 2) : items.slice(0, 4);
  }, [todaySession, lastSession, favouriteTemplates, simplified, onNavigate]);

  const focusLabel = focuses.length > 1 || focuses[0] !== 'general'
    ? focuses.map((f) => categoryLabel(f)).join(' · ')
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">Fitness</p>
        <h2 className="font-heading text-xl font-semibold">
          {day.rest_day ? 'Rest is part of the plan.' : 'What sounds good today?'}
        </h2>
        {focusLabel && <p className="text-xs text-muted-foreground mt-0.5">{focusLabel}</p>}
      </div>

      {/* Capacity check-in */}
      {showCapacityCard && (
        <Card className="rounded-3xl shadow-sm border-primary/20">
          <CardContent className="p-4">
            <p className="font-heading text-sm mb-3">How's your capacity today?</p>
            <div className="flex gap-2 flex-wrap">
              {capacityLevels.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => saveForDate(today, { capacity_today: lvl.id })}
                  className="rounded-full px-4 py-2 text-sm border-2 transition border-border bg-card hover:border-primary"
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">Choose what fits today. Your plans adapt — nothing is lost.</p>
          </CardContent>
        </Card>
      )}

      {/* Capacity = Rest day message */}
      {day.capacity_today === 'rest' && (
        <Card className="rounded-3xl bg-accent/30">
          <CardContent className="p-4 text-center">
            <BedDouble className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium">Rest is part of the plan.</p>
            <p className="text-xs text-muted-foreground mt-1">Nothing to catch up on. Goals are quiet for today.</p>
          </CardContent>
        </Card>
      )}

      {/* Today's training (if a session is planned) */}
      {todaySession && day.capacity_today !== 'rest' && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-1">Today's Training</p>
            <p className="font-heading text-base">{todaySession.name}</p>
            <p className="text-xs text-muted-foreground">{categoryLabel(todaySession.category)}{todaySession.template_id ? ' · From template' : ''}</p>
            <Button size="sm" className="rounded-full mt-3" onClick={() => onNavigate('workouts')}>
              <Dumbbell className="w-3.5 h-3.5 mr-1" /> Start Workout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Start */}
      {day.capacity_today !== 'rest' && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium px-1">Quick Start</p>
          <div className={`grid ${simplified ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
            {quickStarts.map((qs, i) => (
              <Button key={i} variant="outline" className="rounded-2xl h-auto py-3 justify-start" onClick={qs.action}>
                <qs.icon className="w-4 h-4 mr-2" /> {qs.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Activity snapshot */}
      {(showSteps || showWater || showActive) && day.capacity_today !== 'rest' && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-2">Activity</p>
            <div className="grid grid-cols-3 gap-2">
              {showSteps && (
                <div className="text-center">
                  <Footprints className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-heading">{(day.steps || 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">steps</p>
                </div>
              )}
              {showWater && (
                <div className="text-center">
                  <Droplet className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-heading">{day.water || 0}</p>
                  <p className="text-[10px] text-muted-foreground">water</p>
                </div>
              )}
              {showActive && (
                <div className="text-center">
                  <Activity className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-heading">{day.active || 0}</p>
                  <p className="text-[10px] text-muted-foreground">active min</p>
                </div>
              )}
            </div>
            <Button size="sm" variant="ghost" className="rounded-full mt-2 w-full text-xs" onClick={() => onNavigate('activity')}>
              Log activity
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recovery snapshot */}
      {(showSleep || showEnergy) && (
        <Card className="rounded-3xl shadow-sm">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium mb-2">Recovery</p>
            <div className="grid grid-cols-2 gap-2">
              {showSleep && (
                <div className="text-center">
                  <Moon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-heading">{day.sleep ? `${day.sleep}h` : '—'}</p>
                  <p className="text-[10px] text-muted-foreground">sleep</p>
                </div>
              )}
              {showEnergy && (
                <div className="text-center">
                  <Battery className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-heading">{day.energy || 0}<span className="text-sm text-muted-foreground">/10</span></p>
                  <p className="text-[10px] text-muted-foreground">energy</p>
                </div>
              )}
            </div>
            <Button size="sm" variant="ghost" className="rounded-full mt-2 w-full text-xs" onClick={() => onNavigate('recovery')}>
              Recovery check-in
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state for new users */}
      {!todaySession && !lastSession && favouriteTemplates.length === 0 && day.capacity_today !== 'rest' && (
        <Card className="rounded-3xl">
          <CardContent className="py-8 text-center">
            <Sparkles className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Move in whatever way feels useful today.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}