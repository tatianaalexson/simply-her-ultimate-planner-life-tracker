import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarClock, Check, ArrowRight } from 'lucide-react';

const CATEGORY_STYLE = {
  home: 'bg-amber-400',
  reflection: 'bg-violet-400',
  wellness: 'bg-emerald-400',
  errands: 'bg-sky-400',
  work: 'bg-slate-400',
  partner: 'bg-rose-400'
};

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
};

const nowMin = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};
const toMin = (t) => {
  if (!t) return Infinity;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export default function TodayScheduleCard({ tasks, onToggle }) {
  const navigate = useNavigate();

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="rounded-3xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading text-sm font-medium">Today's Plan</h2>
          </div>
          <div className="rounded-2xl bg-accent/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Nothing scheduled today — enjoy the spaciousness.</p>
            <button onClick={() => navigate('/planner')} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Add to planner <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const incomplete = tasks.filter((t) => !t.completed);
  const done = tasks.length - incomplete.length;
  const mustDo = incomplete.filter((t) => t.priority === 'high');
  const quickWin = incomplete.filter((t) => t.priority !== 'high').slice(0, 3);

  const nm = nowMin();
  const upcoming = incomplete
    .filter((t) => t.start_time)
    .sort((a, b) => toMin(a.start_time) - toMin(b.start_time));
  const upNext = upcoming.find((t) => toMin(t.start_time) >= nm) || upcoming[0];

  const Row = ({ t }) => (
    <div className="flex items-center gap-2.5 py-1">
      <button
        onClick={() => onToggle(t)}
        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${t.completed ? 'bg-primary border-primary' : 'border-border'}`}
      >
        {t.completed && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </button>
      <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_STYLE[t.category] || 'bg-slate-300'}`} />
      {t.start_time && <span className="text-[11px] text-muted-foreground shrink-0 w-14">{fmtTime(t.start_time)}</span>}
      <span className={`flex-1 text-sm truncate ${t.completed ? 'line-through text-muted-foreground' : ''}`}>{t.title}</span>
    </div>
  );

  const progress = Math.round((done / tasks.length) * 100);

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading text-sm font-medium">Today's Plan</h2>
          </div>
          <span className="text-xs text-muted-foreground">{done}/{tasks.length} · {progress}%</span>
        </div>

        <div className="h-1.5 rounded-full bg-accent overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>

        {upNext && (
          <div className="rounded-2xl bg-accent/40 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Up next</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${CATEGORY_STYLE[upNext.category] || 'bg-slate-300'}`} />
              <span className="text-sm font-medium">{upNext.title}</span>
              {upNext.start_time && <span className="text-[11px] text-muted-foreground ml-auto">{fmtTime(upNext.start_time)}</span>}
            </div>
          </div>
        )}

        {mustDo.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Must do</p>
            <div className="space-y-0.5">{mustDo.slice(0, 4).map((t) => <Row key={t.id} t={t} />)}</div>
          </div>
        )}

        {quickWin.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Quick wins</p>
            <div className="space-y-0.5">{quickWin.map((t) => <Row key={t.id} t={t} />)}</div>
          </div>
        )}

        <button onClick={() => navigate('/planner')} className="w-full text-center text-xs text-muted-foreground pt-1 hover:text-foreground transition">
          Open full planner →
        </button>
      </CardContent>
    </Card>
  );
}