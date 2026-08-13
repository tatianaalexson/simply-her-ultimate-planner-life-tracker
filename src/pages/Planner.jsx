import React, { useState } from 'react';
import PlannerTopBar from '@/components/planner/PlannerTopBar';
import FocusBanner from '@/components/planner/FocusBanner';
import TimelineView from '@/components/planner/TimelineView';
import DualScheduleView from '@/components/planner/DualScheduleView';
import TaskEngine from '@/components/planner/TaskEngine';
import RoutineAnchors from '@/components/planner/RoutineAnchors';
import ReflectionSidebar from '@/components/planner/ReflectionSidebar';
import WeeklyOverview from '@/components/planner/WeeklyOverview';
import ListView from '@/components/planner/ListView';
import { dayKey } from '@/lib/plannerStore';
import { Users } from 'lucide-react';

export default function Planner() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('daily');
  const [dual, setDual] = useState(false);
  const dk = dayKey(date);

  return (
    <div className="py-4 space-y-4 pb-28">
      <PlannerTopBar date={date} setDate={setDate} view={view} setView={setView} />

      <FocusBanner key={`f-${dk}`} date={date} />

      {view === 'daily' && (
        <>
          <button
            onClick={() => setDual((d) => !d)}
            className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 w-fit ${dual ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}
          >
            <Users className="w-3.5 h-3.5" /> {dual ? 'Hide' : 'Show'} Partner Schedule
          </button>
          {dual ? (
            <DualScheduleView key={`dual-${dk}`} date={date} />
          ) : (
            <TimelineView key={`tl-${dk}`} date={date} />
          )}
          <TaskEngine key={`te-${dk}`} date={date} />
          <RoutineAnchors key={`ro-${dk}`} date={date} />
          <ReflectionSidebar key={`rs-${dk}`} date={date} />
        </>
      )}

      {view === 'weekly' && <WeeklyOverview key={`wk-${dk}`} date={date} setDate={setDate} />}

      {view === 'list' && (
        <>
          <ListView key={`lv-${dk}`} date={date} />
          <TaskEngine key={`lte-${dk}`} date={date} />
        </>
      )}
    </div>
  );
}