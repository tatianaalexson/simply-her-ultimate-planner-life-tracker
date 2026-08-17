import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import AffirmationCard from '@/components/today/AffirmationCard';
import WeatherPill from '@/components/today/WeatherPill';
import ProgressRings from '@/components/today/ProgressRings';
import JournalCard from '@/components/today/JournalCard';
import IntentionsCard from '@/components/today/IntentionsCard';
import RoutinesAccordion from '@/components/today/RoutinesAccordion';
import QuickTracker from '@/components/today/QuickTracker';
import TodayScheduleCard from '@/components/today/TodayScheduleCard';
import LifeSnapshot from '@/components/today/LifeSnapshot';
import QuickAdd from '@/components/today/QuickAdd';
import FocusBanner from '@/components/planner/FocusBanner';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning, Beautiful';
  if (h < 18) return 'Good Afternoon, Lovely';
  return 'Good Evening, Sweetheart';
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function Today() {
  const { visibleFeaturesFor } = useAppSettings();
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    try {
      setTasks(await base44.entities.Task.filter({ task_date: todayISO() }, 'start_time'));
    } catch {
      setTasks([]);
    }
  };
  useEffect(() => { load(); }, []);

  const toggleTask = async (t) => {
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
    try { await base44.entities.Task.update(t.id, { completed: !t.completed }); } catch { load(); }
  };

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
      <FocusBanner key={`tf-${todayISO()}`} date={new Date()} />
      <TodayScheduleCard tasks={tasks} onToggle={toggleTask} />
      <IntentionsCard />
      <LifeSnapshot tasks={tasks} />

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
      <QuickAdd />
    </div>
  );
}