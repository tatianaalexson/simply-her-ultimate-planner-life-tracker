import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Plus, Check, X, CalendarPlus } from 'lucide-react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import GoogleCalendarPanel from '@/components/planner/GoogleCalendarPanel';

const today = () => new Date().toISOString().slice(0, 10);

const CATS = [
  { id: 'home', label: 'Home', color: 'bg-rose-200 text-rose-800' },
  { id: 'reflection', label: 'Reflection', color: 'bg-violet-200 text-violet-800' },
  { id: 'wellness', label: 'Wellness', color: 'bg-green-200 text-green-800' },
  { id: 'errands', label: 'Errands', color: 'bg-amber-200 text-amber-800' },
  { id: 'work', label: 'Work', color: 'bg-blue-200 text-blue-800' },
  { id: 'partner', label: 'Partner', color: 'bg-pink-200 text-pink-800' }
];
const catColor = (id) => CATS.find((c) => c.id === id)?.color || 'bg-gray-200';

export default function Planner() {
  const [tasks, setTasks] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [view, setView] = useState('daily');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', time: '08:00', category: 'home' });
  const [weeklyGoals, setWeeklyGoals] = useLocalStorage('weekly-goals', ['', '', '']);
  const gcal = useGoogleCalendar(today());

  const load = async () => {
    const [list, shiftList] = await Promise.all([
      base44.entities.Task.filter({ task_date: today() }),
      base44.entities.PartnerShift.filter({ shift_date: today() })
    ]);
    setTasks(list);
    setShifts(shiftList);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.title.trim()) return;
    await base44.entities.Task.create({
      ...form,
      title: form.title.trim(),
      task_date: today(),
      completed: false
    });
    setForm({ title: '', time: '08:00', category: 'home' });
    setShowAdd(false);
    load();
  };
  const toggle = async (t) => {
    await base44.entities.Task.update(t.id, { completed: !t.completed });
    load();
  };
  const remove = async (t) => {
    await base44.entities.Task.delete(t.id);
    load();
  };
  const pushToGoogle = async (t) => {
    if (!t.start_time) return;
    const [hh, mm] = t.start_time.split(':').map(Number);
    const endIn = t.end_time || `${String((hh + 1) % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    const start = `${t.task_date}T${t.start_time}:00`;
    const end = `${t.task_date}T${endIn}:00`;
    try {
      await gcal.pushEvent({ title: t.title, start, end });
      gcal.refresh();
    } catch {}
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const tasksByHour = (h) => tasks.filter((t) => parseInt((t.start_time || '24').split(':')[0], 10) === h);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div className="py-4">
      <h1 className="font-heading text-2xl font-semibold mb-3">Planner</h1>
      <Tabs value={view} onValueChange={setView}>
        <TabsList className="rounded-full w-full">
          <TabsTrigger value="daily" className="rounded-full flex-1">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-full flex-1">Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className="rounded-full flex-1">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4 space-y-1">
          {shifts.length > 0 && (
            <div className="mb-2 rounded-2xl bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800 p-3">
              <p className="text-xs font-medium text-pink-700 dark:text-pink-300 mb-1">Partner Shift Today</p>
              {shifts.map((s) => (
                <div key={s.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{s.label || 'Shift'}</span>
                  <span className="text-pink-700 dark:text-pink-300">
                    {s.start_time} – {s.end_time}
                  </span>
                </div>
              ))}
              {shifts.some((s) => s.notes) && (
                <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                  {shifts.find((s) => s.notes)?.notes}
                </p>
              )}
            </div>
          )}
          <GoogleCalendarPanel
            connected={gcal.connected}
            events={gcal.events}
            loading={gcal.loading}
            onConnect={gcal.connect}
            onDisconnect={gcal.disconnect}
            onRefresh={gcal.refresh}
          />
          {hours.map((h) => {
            const ts = tasksByHour(h);
            return (
              <div key={h} className="flex gap-2 border-b border-border/50 py-1.5 min-h-[40px]">
                <span className="text-[10px] text-muted-foreground w-10 shrink-0 pt-1">
                  {h.toString().padStart(2, '0')}:00
                </span>
                <div className="flex-1 space-y-1">
                  {ts.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <button
                        onClick={() => toggle(t)}
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          t.completed ? 'bg-primary border-primary' : 'border-border'
                        }`}
                      >
                        {t.completed && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                      </button>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${catColor(t.category)} ${t.completed ? 'opacity-50 line-through' : ''}`}>
                        {t.title}
                      </span>
                      <button onClick={() => remove(t)}>
                        <X className="w-3 h-3 text-muted-foreground" />
                      </button>
                      {gcal.connected && t.start_time && (
                        <button onClick={() => pushToGoogle(t)} title="Add to Google Calendar">
                          <CalendarPlus className="w-3 h-3 text-blue-500" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="weekly" className="mt-4 space-y-3">
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="pt-4">
              <h3 className="font-heading text-sm mb-2">Top Weekly Goals</h3>
              {weeklyGoals.map((g, i) => (
                <Input
                  key={i}
                  value={g}
                  onChange={(e) => setWeeklyGoals((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={`Goal ${i + 1}`}
                  className="rounded-full mb-2"
                />
              ))}
            </CardContent>
          </Card>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[10px] py-2 rounded-xl bg-card border shadow-sm">
                {d}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-4">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthDays }, (_, i) => i + 1).map((d) => (
              <div
                key={d}
                className="aspect-square flex flex-col items-center justify-center rounded-xl bg-card border text-xs shadow-sm"
              >
                <span>{d}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setShowAdd(false)}>
          <Card className="rounded-t-3xl w-full p-4 space-y-3 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg">New Task</h3>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Task title"
              className="rounded-full"
            />
            <div className="flex gap-2">
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                className="rounded-full"
              />
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={add} className="rounded-full w-full">
              Add Task
            </Button>
          </Card>
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}