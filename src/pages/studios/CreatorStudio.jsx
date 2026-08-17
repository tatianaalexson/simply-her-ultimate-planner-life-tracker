import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import EmptyState from '@/components/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ChevronRight, ChevronLeft, Lightbulb, CalendarDays, Clapperboard, FolderOpen, BarChart3 } from 'lucide-react';

const COLUMNS = ['Idea', 'Scripting', 'Filming', 'Editing', 'Ready', 'Published'];
const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Blog', 'Newsletter', 'Other'];

function PipelineTab() {
  const [cards, setCards] = useLocalStorage('creator-cards', []);
  const [deals, setDeals] = useLocalStorage('creator-deals', []);
  const [title, setTitle] = useState('');
  const [deal, setDeal] = useState('');
  const add = () => { if (title.trim()) { setCards([...cards, { id: Date.now(), title: title.trim(), stage: 0 }]); setTitle(''); } };
  const move = (id, dir) => setCards((cs) => cs.map((c) => (c.id === id ? { ...c, stage: Math.max(0, Math.min(COLUMNS.length - 1, c.stage + dir)) } : c)));
  const addDeal = () => { if (deal.trim()) { setDeals([...deals, { id: Date.now(), name: deal.trim(), status: 'Invoiced' }]); setDeal(''); } };
  const cycleDeal = (id) => setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, status: d.status === 'Invoiced' ? 'Paid' : 'Invoiced' } : d)));
  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Workflow Board</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New content idea" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && add()} />
            <Button size="sm" onClick={add} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {COLUMNS.map((col, ci) => (
              <div key={col} className="min-w-[140px] flex-1">
                <p className="text-xs font-medium mb-1 text-muted-foreground">{col}</p>
                <div className="space-y-2">
                  {cards.filter((c) => c.stage === ci).map((c) => (
                    <div key={c.id} className="rounded-2xl bg-secondary/50 p-2">
                      <p className="text-xs font-medium">{c.title}</p>
                      <div className="flex justify-between mt-1">
                        <button onClick={() => move(c.id, -1)}><ChevronLeft className="w-3 h-3" /></button>
                        <button onClick={() => move(c.id, 1)}><ChevronRight className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Brand Deals & Sponsorship</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={deal} onChange={(e) => setDeal(e.target.value)} placeholder="Sponsor / campaign" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && addDeal()} />
            <Button size="sm" onClick={addDeal} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          {deals.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm border-t border-border pt-2 first:border-0 first:pt-0">
              <span>{d.name}</span>
              <button onClick={() => cycleDeal(d.id)} className={`text-xs px-2 py-1 rounded-full ${d.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function IdeasTab() {
  const [ideas, setIdeas] = useLocalStorage('creator-ideas', []);
  const [form, setForm] = useState({ text: '', tag: '' });
  const add = () => { if (!form.text.trim()) return; setIdeas([{ id: Date.now(), ...form }, ...ideas]); setForm({ text: '', tag: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Ideas & Brainstorming</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Textarea value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} placeholder="Capture an idea..." rows={2} className="rounded-2xl resize-none" />
        <Input value={form.tag} onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))} placeholder="Tag (optional)" className="rounded-2xl" />
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Save idea</Button>
        {ideas.map((i) => (
          <div key={i.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0"><p>{i.text}</p>{i.tag && <p className="text-xs text-muted-foreground mt-0.5">#{i.tag}</p>}</div>
            <button onClick={() => setIdeas((x) => x.filter((y) => y.id !== i.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function CalendarTab() {
  const [items, setItems] = useLocalStorage('creator-calendar', []);
  const [form, setForm] = useState({ date: '', platform: PLATFORMS[0], title: '' });
  const add = () => { if (!form.date || !form.title.trim()) return; setItems([{ id: Date.now(), ...form }, ...items]); setForm({ date: '', platform: PLATFORMS[0], title: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Content Calendar</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
          <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Content title" className="rounded-2xl" />
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Schedule</Button>
        {items.sort((a, b) => a.date.localeCompare(b.date)).map((c) => (
          <div key={c.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="text-xs text-muted-foreground w-24 shrink-0">{c.date}</span>
            <span className="flex-1">{c.title}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent">{c.platform}</span>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== c.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProductionTab() {
  const [tasks, setTasks] = useLocalStorage('creator-production', ['Script', 'Storyboard', 'Shoot', 'Edit', 'Caption & tags', 'Schedule']);
  const [done, setDone] = useLocalStorage('creator-production-done', {});
  const [task, setTask] = useState('');
  const add = () => { if (task.trim()) { setTasks([...tasks, task.trim()]); setTask(''); } };
  const toggle = (t) => setDone((d) => ({ ...d, [t]: !d[t] }));
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Clapperboard className="w-4 h-4" /> Production Checklist</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Add step" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button size="icon" onClick={add} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {tasks.map((t) => (
          <div key={t} className="flex items-center gap-2 text-sm">
            <button onClick={() => toggle(t)} className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${done[t] ? 'bg-primary border-primary' : 'border-border'}`}>{done[t] && <span className="text-[10px] text-primary-foreground">✓</span>}</button>
            <span className={done[t] ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>{t}</span>
            <button onClick={() => setTasks((x) => x.filter((y) => y !== t))} className="text-muted-foreground"><Trash2 className="w-3 h-3" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LibraryTab() {
  const [items, setItems] = useLocalStorage('creator-library', []);
  const [form, setForm] = useState({ name: '', platform: PLATFORMS[0], url: '' });
  const add = () => { if (!form.name.trim()) return; setItems([{ id: Date.now(), ...form }, ...items]); setForm({ name: '', platform: PLATFORMS[0], url: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Content Library</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Asset name" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <Input value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} placeholder="Link" className="rounded-2xl" />
        </div>
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0"><p className="font-medium">{i.name}</p>{i.url && <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">{i.url}</a>}</div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent">{i.platform}</span>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== i.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AnalyticsTab() {
  const [stats, setStats] = useLocalStorage('creator-analytics', { followers: '', posts: '', engagement: '' });
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Quick Stats</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k}>
              <label className="text-xs capitalize">{k}</label>
              <Input type="number" value={v} onChange={(e) => setStats((s) => ({ ...s, [k]: e.target.value }))} className="rounded-2xl" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreatorStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const tabs = [
    isFeatureEnabled('cre.pipeline') && { value: 'pipeline', label: 'Pipeline', node: <PipelineTab /> },
    isFeatureEnabled('cre.ideas') && { value: 'ideas', label: 'Ideas', node: <IdeasTab /> },
    isFeatureEnabled('cre.calendar') && { value: 'calendar', label: 'Calendar', node: <CalendarTab /> },
    isFeatureEnabled('cre.production') && { value: 'production', label: 'Production', node: <ProductionTab /> },
    isFeatureEnabled('cre.library') && { value: 'library', label: 'Library', node: <LibraryTab /> },
    isFeatureEnabled('cre.analytics') && { value: 'analytics', label: 'Analytics', node: <AnalyticsTab /> }
  ].filter(Boolean);
  return (
    <StudioShell title="Content Creator Studio">
      {tabs.length === 0 ? <EmptyState title="The studio is a blank canvas" subtitle="Enable a Creator feature in Settings to begin." /> : (
        <Tabs defaultValue={tabs[0].value}>
          <TabsList className="flex w-full bg-accent rounded-full p-1 gap-1 mb-4 overflow-x-auto">
            {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="rounded-full text-xs flex-1">{t.label}</TabsTrigger>)}
          </TabsList>
          {tabs.map((t) => <TabsContent key={t.value} value={t.value} className="mt-0 space-y-4">{t.node}</TabsContent>)}
        </Tabs>
      )}
    </StudioShell>
  );
}