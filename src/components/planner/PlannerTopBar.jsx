import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, CalendarDays, Grid3x3, List, CalendarRange } from 'lucide-react';
import { dayKey } from '@/lib/plannerStore';

const VIEWS = [
  { id: 'daily', label: 'Daily Grid', icon: Grid3x3 },
  { id: 'weekly', label: 'Weekly', icon: CalendarRange },
  { id: 'list', label: 'List', icon: List }
];

export default function PlannerTopBar({ date, setDate, view, setView }) {
  const shift = (n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    setDate(d);
  };
  const isToday = dayKey(date) === dayKey(new Date());

  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-background/90 backdrop-blur space-y-2">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" className="rounded-full h-9 w-9 shrink-0" onClick={() => shift(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={dayKey(date)}
            onChange={(e) => e.target.value && setDate(new Date(e.target.value + 'T00:00:00'))}
            className="rounded-full w-auto max-w-[170px]"
          />
        </div>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setDate(new Date())}>Today</Button>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); setDate(d); }}>Tomorrow</Button>
        <Button size="icon" variant="outline" className="rounded-full h-9 w-9 shrink-0" onClick={() => shift(1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-1 rounded-full bg-accent p-1">
        {VIEWS.map((v) => {
          const Icon = v.icon;
          const on = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-full transition ${on ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {v.label}
            </button>
          );
        })}
      </div>

      {!isToday && (
        <p className="text-xs text-muted-foreground text-center">
          {date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  );
}