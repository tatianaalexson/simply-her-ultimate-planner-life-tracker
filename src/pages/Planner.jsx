import React, { useState } from 'react';
import PlannerTopBar from '@/components/planner/PlannerTopBar';
import FocusBanner from '@/components/planner/FocusBanner';
import TimelineView from '@/components/planner/TimelineView';
import TaskEngine from '@/components/planner/TaskEngine';
import RoutineAnchors from '@/components/planner/RoutineAnchors';
import ReflectionSidebar from '@/components/planner/ReflectionSidebar';
import WeeklyOverview from '@/components/planner/WeeklyOverview';
import ListView from '@/components/planner/ListView';
import { dayKey } from '@/lib/plannerStore';

export default function Planner() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('daily');
  const dk = dayKey(date);

  return (
    <div className="py-4 space-y-4 pb-28">
      <PlannerTopBar date={date} setDate={setDate} view={view} setView={setView} />

      <FocusBanner key={`f-${dk}`} date={date} />

      {view === 'daily' && (
        <>
          <TimelineView key={`tl-${dk}`} date={date} />
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