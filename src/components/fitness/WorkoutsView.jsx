import React, { useState, useMemo } from 'react';
import { useEntityList } from '@/hooks/useEntityList';
import { useAppSettings } from '@/lib/AppSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Star, Clock, Dumbbell, Footprints, Repeat, Heart } from 'lucide-react';
import { MOVEMENT_CATEGORIES, JUST_MOVE_OPTIONS, categoryLabel, todayKey } from '@/lib/fitnessConstants';

export default function WorkoutsView() {
  const { isFeatureEnabled } = useAppSettings();
  const { items: templates, add: addTemplate, update: updateTemplate, remove: removeTemplate } = useEntityList('WorkoutTemplate', {}, '-created_date');
  const { items: sessions, add: addSession, update: updateSession } = useEntityList('WorkoutSession', {}, '-date');
  const [showCreate, setShowCreate] = useState(false);
  const [showJustMove, setShowJustMove] = useState(false);

  const favourites = templates.filter((t) => t.favourite && !t.archived);
  const recentSessions = sessions.slice(0, 5);
  const lastSession = sessions.find((s) => s.status === 'complete' || s.status === 'partial');

  const startFromTemplate = (tpl) => {
    addSession({
      name: tpl.name,
      date: todayKey(),
      status: 'planned',
      template_id: tpl.id,
      category: tpl.category,
      location: tpl.location || '',
      exercises: [],
      notes: ''
    });
  };

  const repeatLast = () => {
    if (!lastSession) return;
    addSession({
      name: lastSession.name,
      date: todayKey(),
      status: 'planned',
      category: lastSession.category,
      exercises: [],
      notes: ''
    });
  };

  const logJustMove = (type, duration, notes) => {
    addSession({
      name: type,
      date: todayKey(),
      status: 'complete',
      category: type === 'Walk' ? 'walking' : type === 'Swim' ? 'swimming' : type === 'Hike' ? 'hiking' : 'daily',
      duration: duration || 0,
      notes: notes || '',
      exercises: []
    });
  };

  return (
    <div className="space-y-4">
      {/* Quick Start */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium px-1">Quick Start</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="rounded-2xl h-auto py-3 flex-col gap-1" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> New Workout
          </Button>
          {lastSession && (
            <Button variant="outline" className="rounded-2xl h-auto py-3 flex-col gap-1" onClick={repeatLast}>
              <Repeat className="w-4 h-4" /> Repeat Last
            </Button>
          )}
          <Button variant="outline" className="rounded-2xl h-auto py-3 flex-col gap-1" onClick={() => setShowJustMove(true)}>
            <Footprints className="w-4 h-4" /> Just Move
          </Button>
          <Button variant="outline" className="rounded-2xl h-auto py-3 flex-col gap-1" onClick={() => setShowJustMove(true)}>
            <Heart className="w-4 h-4" /> Log Movement
          </Button>
        </div>
      </div>

      {/* Favourites */}
      {favourites.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium px-1">Favourites</p>
          {favourites.map((t) => (
            <Card key={t.id} className="rounded-2xl">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{categoryLabel(t.category)}{t.estimated_duration ? ` · ${t.estimated_duration} min` : ''}</p>
                </div>
                <Button size="sm" className="rounded-full shrink-0" onClick={() => startFromTemplate(t)}>Start</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All Templates */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">Workout Templates</p>
          <Button size="sm" variant="ghost" className="rounded-full h-7 text-xs" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5 mr-0.5" /> New</Button>
        </div>
        {templates.filter((t) => !t.archived).length === 0 ? (
          <Card className="rounded-3xl"><CardContent className="py-10 text-center">
            <Dumbbell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Build your first workout whenever you're ready.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {templates.filter((t) => !t.archived).map((t) => (
              <Card key={t.id} className="rounded-2xl">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {categoryLabel(t.category)}
                      {t.estimated_duration > 0 && <><Clock className="w-3 h-3" /> {t.estimated_duration}m</>}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full shrink-0" onClick={() => startFromTemplate(t)}>Start</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium px-1">Recent</p>
          {recentSessions.map((s) => (
            <Card key={s.id} className="rounded-2xl">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.date} · {s.status}</p>
                </div>
                {s.duration > 0 && <span className="text-xs text-muted-foreground">{s.duration}m</span>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && <CreateWorkoutSheet onSave={(data) => { addTemplate(data); setShowCreate(false); }} onClose={() => setShowCreate(false)} />}
      {showJustMove && <JustMoveSheet onSave={logJustMove} onClose={() => setShowJustMove(false)} />}
    </div>
  );
}

function CreateWorkoutSheet({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', category: 'strength', estimated_duration: 20, difficulty: 'moderate', description: '', notes: '' });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8 max-h-[85vh] overflow-y-auto">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">New Workout</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Workout name" className="rounded-2xl" autoFocus />
          <select value={form.category} onChange={(e) => set('category', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
            {MOVEMENT_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={form.estimated_duration} onChange={(e) => set('estimated_duration', +e.target.value)} placeholder="Duration (min)" className="rounded-2xl" />
            <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm w-full">
              <option value="gentle">Gentle</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Description (optional)" className="rounded-2xl min-h-[60px]" />
          <Button className="rounded-full w-full" onClick={() => { if (form.name.trim()) onSave(form); }} disabled={!form.name.trim()}>Create Workout</Button>
          <p className="text-xs text-muted-foreground text-center">You can add exercises and blocks after creating.</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function JustMoveSheet({ onSave, onClose }) {
  const [type, setType] = useState('Walk');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-center"><SheetTitle className="font-heading">Just Move</SheetTitle></SheetHeader>
        <div className="space-y-3 mt-4">
          <div className="flex flex-wrap gap-1.5">
            {JUST_MOVE_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => setType(opt)} className={`rounded-full px-3 py-1.5 text-sm border transition ${type === opt ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}>{opt}</button>
            ))}
          </div>
          <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration (min) — optional" className="rounded-2xl" />
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel? (optional)" className="rounded-2xl min-h-[50px]" />
          <Button className="rounded-full w-full" onClick={() => { onSave(type, +duration || 0, notes); onClose(); }}>Save Movement</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}