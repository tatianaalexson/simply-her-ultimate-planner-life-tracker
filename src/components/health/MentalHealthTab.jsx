import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

const MOODS = ['Peaceful', 'Anxious', 'Productive', 'Grateful', 'Restful', 'Overwhelmed'];
const FOCUS = ['Stress', 'Anxiety', 'Sleep', 'Energy', 'Self-esteem', 'Boundaries', 'Grief', 'Focus', 'Hormones', 'Body image'];
const AFFIRMATIONS = {
  Stress: 'I release what I cannot control and breathe through this moment.',
  Anxiety: 'I am safe in this moment; my breath grounds me.',
  Sleep: 'I invite rest and let the day soften behind me.',
  Energy: 'I honor my energy and move at a pace that nurtures me.',
  'Self-esteem': 'I am enough, exactly as I am today.',
  Boundaries: 'I am allowed to say no with kindness and clarity.',
  Grief: 'I make space for my feelings and let them move through me.',
  Focus: 'I choose one gentle step at a time.',
  Hormones: 'I am patient with my body through every cycle.',
  'Body image': 'My body is worthy of care and gratitude today.'
};
const GROUND_PROMPTS = [
  'Name 5 things you can see right now.',
  'Name 4 things you can physically feel.',
  'Name 3 sounds you can hear.',
  'Name 2 things you can smell.',
  'Place both feet on the floor. Feel the ground holding you.',
  'Press your hand to your heart. Feel its steady beat.',
  'Take one slow breath and notice the pause at the top.'
];

export default function MentalHealthTab() {
  const [moods, setMoods] = useLocalStorage('health-mood-logs', []);
  const [profile, setProfile] = useLocalStorage('health-wellness-profile', []);
  const [ground, setGround] = useLocalStorage('health-ground-reflection', '');
  const [mood, setMood] = useState('Peaceful');
  const [note, setNote] = useState('');
  const [trigger, setTrigger] = useState('');
  const [energy, setEnergy] = useState(5);
  const [prompt, setPrompt] = useState(GROUND_PROMPTS[0]);
  const [phase, setPhase] = useState('idle');
  const [running, setRunning] = useState(false);
  const timers = useRef([]);

  const cycle = () => {
    setPhase('inhale');
    timers.current.push(setTimeout(() => setPhase('hold'), 4000));
    timers.current.push(setTimeout(() => setPhase('exhale'), 11000));
    timers.current.push(setTimeout(cycle, 19000));
  };
  const startBreathing = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(true);
    cycle();
  };
  const stopBreathing = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setRunning(false);
    setPhase('idle');
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const addMood = () => {
    setMoods([{ id: Date.now(), mood, note, trigger, energy, time: new Date().toLocaleString() }, ...moods]);
    setNote('');
    setTrigger('');
    setEnergy(5);
  };

  const toggleFocus = (f) =>
    setProfile((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]));

  const dailyAff = (profile[0] && AFFIRMATIONS[profile[0]]) || 'I am gentle with myself today.';

  const scale = phase === 'inhale' || phase === 'hold' ? 1.5 : 1;
  const dur = phase === 'inhale' ? '4s' : phase === 'hold' ? '7s' : phase === 'exhale' ? '8s' : '0.3s';

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Daily Mood & Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  mood === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium">Energy level: {energy}/10</label>
            <Slider value={[energy]} onValueChange={(v) => setEnergy(v[0])} max={10} step={1} className="mt-2" />
          </div>
          <Input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Trigger (optional)" className="rounded-2xl" />
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="A short reflection…" rows={2} className="rounded-2xl resize-none" />
          <Button size="sm" onClick={addMood} className="rounded-full">
            <Plus className="w-4 h-4 mr-1" /> Log entry
          </Button>
          {moods.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-2 border-t border-border pt-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">{e.mood} · Energy {e.energy}/10</p>
                {e.trigger && <p className="text-xs text-muted-foreground">Trigger: {e.trigger}</p>}
                {e.note && <p className="text-xs">{e.note}</p>}
                <p className="text-[10px] text-muted-foreground">{e.time}</p>
              </div>
              <button onClick={() => setMoods((ms) => ms.filter((x) => x.id !== e.id))} className="text-muted-foreground shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Wellness Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Select focus areas to tailor your daily affirmation.</p>
          <div className="flex flex-wrap gap-2">
            {FOCUS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFocus(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition ${
                  profile.includes(f) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="rounded-2xl bg-accent/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Today's affirmation</p>
            <p className="font-heading text-sm italic">{dailyAff}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Grounding & Calming Corner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div
                className="w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/40"
                style={{ transform: `scale(${scale})`, transition: `transform ${dur} ease-in-out` }}
              />
            </div>
            <p className="text-sm font-medium capitalize">{phase === 'idle' ? 'Tap start to begin 4-7-8' : phase}</p>
            <div className="flex gap-2">
              {!running ? (
                <Button size="sm" onClick={startBreathing} className="rounded-full">Start breathing</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={stopBreathing} className="rounded-full">Stop</Button>
              )}
            </div>
          </div>
          <div className="rounded-2xl bg-accent/50 p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm flex-1">{prompt}</p>
              <button onClick={() => setPrompt(GROUND_PROMPTS[Math.floor(Math.random() * GROUND_PROMPTS.length)])} className="text-muted-foreground shrink-0">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <Textarea
              value={ground}
              onChange={(e) => setGround(e.target.value)}
              placeholder="Audio reflection notes (write here)…"
              rows={2}
              className="rounded-2xl resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}