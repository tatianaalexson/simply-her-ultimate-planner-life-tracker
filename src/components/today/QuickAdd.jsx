import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, CheckSquare, Target, BookOpen, Heart, Clock, Utensils, Dumbbell, DollarSign } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isGroupEnabled } = useAppSettings();

  const reset = () => { setMode(null); setText(''); };

  const createActions = [
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'text-sky-500' },
    { id: 'intention', label: 'Intention', icon: Target, color: 'text-amber-500' },
    { id: 'journal', label: 'Journal', icon: BookOpen, color: 'text-rose-500' },
    { id: 'prayer', label: 'Prayer', icon: Heart, color: 'text-violet-500', gate: () => isGroupEnabled('faith') }
  ];

  const navActions = [
    { id: 'block', label: 'Time block', icon: Clock, to: '/planner' },
    { id: 'meal', label: 'Meal', icon: Utensils, to: '/life/kitchen', gate: () => isGroupEnabled('kitchen') },
    { id: 'workout', label: 'Workout', icon: Dumbbell, to: '/life/fitness', gate: () => isGroupEnabled('fitness') },
    { id: 'expense', label: 'Expense', icon: DollarSign, to: '/life/budget', gate: () => isGroupEnabled('budget') }
  ];

  const submit = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (mode === 'task') {
        await base44.entities.Task.create({ title: text.trim(), task_date: todayISO(), priority: 'medium', category: 'home', completed: false });
      } else if (mode === 'intention') {
        await base44.entities.Intention.create({ text: text.trim(), intention_date: todayISO(), completed: false });
      } else if (mode === 'journal') {
        await base44.entities.JournalEntry.create({ content: text.trim(), mood: 'peaceful', entry_date: todayISO() });
      } else if (mode === 'prayer') {
        await base44.entities.PrayerLog.create({ category: 'prayer', title: text.trim(), log_date: todayISO(), status: 'active' });
      }
      toast({ title: 'Saved 🌷' });
      setOpen(false); reset();
    } finally {
      setSaving(false);
    }
  };

  const visibleCreate = createActions.filter((a) => !a.gate || a.gate());
  const visibleNav = navActions.filter((a) => !a.gate || a.gate());

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset(); }}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-90 transition"
        aria-label="Quick add"
      >
        <Plus className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative w-full max-w-2xl bg-card rounded-t-3xl shadow-2xl p-5 pb-8 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-base font-semibold">Quick Add</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>

            {mode ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Add a {visibleCreate.find((a) => a.id === mode)?.label || 'entry'}:</p>
                <textarea
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                  placeholder="Type here…"
                  rows={3}
                  className="w-full rounded-2xl border bg-transparent p-3 text-sm resize-none focus-visible:ring-1 focus-visible:ring-ring outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={() => reset()} className="flex-1 rounded-full border py-2 text-sm">Back</button>
                  <button onClick={submit} disabled={saving || !text.trim()} className="flex-1 rounded-full bg-primary text-primary-foreground py-2 text-sm font-medium disabled:opacity-50">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {visibleCreate.map((a) => (
                    <button key={a.id} onClick={() => setMode(a.id)} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-accent/50 active:scale-95 transition">
                      <a.icon className={`w-5 h-5 ${a.color}`} strokeWidth={1.5} />
                      <span className="text-[11px] font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>
                {visibleNav.length > 0 && (
                  <>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Open a studio</p>
                    <div className="grid grid-cols-4 gap-2">
                      {visibleNav.map((a) => (
                        <button key={a.id} onClick={() => { navigate(a.to); setOpen(false); }} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border active:scale-95 transition">
                          <a.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                          <span className="text-[11px] font-medium">{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}