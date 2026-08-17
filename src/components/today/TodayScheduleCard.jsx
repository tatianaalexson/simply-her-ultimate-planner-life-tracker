import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarClock, Check, Plus } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

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

export default function TodayScheduleCard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await base44.entities.Task.filter({ task_date: todayISO() }, 'start_time');
      setTasks(list);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    await base44.entities.Task.update(t.id, { completed: !t.completed });
    setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, completed: !x.completed } : x)));
  };

  const done = tasks.filter((t) => t.completed).length;
  const timed = [...tasks].sort((a, b) => (a.start_time || '99').localeCompare(b.start_time || '99'));

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-heading text-sm font-medium">Today's Plan</h2>
          </div>
          {tasks.length > 0 && (
            <span className="text-xs text-muted-foreground">{done}/{tasks.length} done</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => <div key={i} className="h-9 rounded-xl bg-accent animate-pulse" />)}
          </div>
        ) : timed.length === 0 ? (
          <div className="rounded-2xl bg-accent/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Nothing scheduled today — enjoy the spaciousness.</p>
            <button onClick={() => navigate('/planner')} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
              <Plus className="w-4 h-4" /> Add to planner
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {timed.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-1.5">
                <button
                  onClick={() => toggle(t)}
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    t.completed ? 'bg-primary border-primary' : 'border-border'
                  }`}
                >
                  {t.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <span className={`w-12 text-[11px] text-muted-foreground shrink-0 ${t.start_time ? '' : 'opacity-40'}`}>
                  {t.start_time ? fmtTime(t.start_time) : '—'}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_STYLE[t.category] || 'bg-slate-300'}`} />
                <span className={`flex-1 text-sm ${t.completed ? 'line-through text-muted-foreground' : ''}`}>{t.title}</span>
              </div>
            ))}
            <button onClick={() => navigate('/planner')} className="w-full text-center text-xs text-muted-foreground pt-1 hover:text-foreground transition">
              Open planner →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}