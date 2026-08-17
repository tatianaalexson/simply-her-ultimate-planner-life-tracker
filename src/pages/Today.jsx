import React from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import AffirmationCard from '@/components/today/AffirmationCard';
import WeatherPill from '@/components/today/WeatherPill';
import ProgressRings from '@/components/today/ProgressRings';
import JournalCard from '@/components/today/JournalCard';
import IntentionsCard from '@/components/today/IntentionsCard';
import RoutinesAccordion from '@/components/today/RoutinesAccordion';
import QuickTracker from '@/components/today/QuickTracker';
import TodayScheduleCard from '@/components/today/TodayScheduleCard';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning, Beautiful';
  if (h < 18) return 'Good Afternoon, Lovely';
  return 'Good Evening, Sweetheart';
};

export default function Today() {
  const { visibleFeaturesFor } = useAppSettings();
  const todayFeats = visibleFeaturesFor('today');
  const has = (id) => todayFeats.some((f) => f.id === id);

  const showRings = has('fit.water') || has('fit.steps') || has('beauty.skincare') || has('home.cleaning');
  const showQuick = has('fit.water') || has('fit.steps');
  const showRoutines = has('home.cleaning') || has('beauty.skincare') || has('beauty.routines');

  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">{greeting()}</h1>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <WeatherPill />
      </div>

      <AffirmationCard />
      <TodayScheduleCard />
      <IntentionsCard />

      {showRings && (
        <div className="rounded-3xl bg-card border p-4 shadow-sm">
          <h2 className="font-heading text-sm font-medium mb-3 text-muted-foreground">Today's Rings</h2>
          <ProgressRings />
        </div>
      )}

      {showRoutines && <RoutinesAccordion />}

      {showQuick && (
        <div>
          <h2 className="font-heading text-sm font-medium mb-2 text-muted-foreground">Quick Tracker</h2>
          <QuickTracker />
        </div>
      )}

      <JournalCard />
    </div>
  );
}