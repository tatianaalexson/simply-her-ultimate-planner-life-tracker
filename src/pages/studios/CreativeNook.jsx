import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Check, Trash2, BookOpen, Lightbulb, Image, BookHeart, Palette } from 'lucide-react';

function LibraryTab() {
  const [books, setBooks] = useLocalStorage('nook-books', []);
  const [book, setBook] = useState('');
  const [watch, setWatch] = useLocalStorage('nook-watch', []);
  const [w, setW] = useState('');
  const addBook = () => { if (book.trim()) { setBooks([...books, { id: Date.now(), title: book.trim(), done: false }]); setBook(''); } };
  const addWatch = () => { if (w.trim()) { setWatch([...watch, { id: Date.now(), title: w.trim(), done: false }]); setW(''); } };
  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><BookOpen className="w-4 h-4" /> Bookshelf</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={book} onChange={(e) => setBook(e.target.value)} placeholder="Add a book" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && addBook()} />
            <Button size="icon" onClick={addBook} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          {books.map((b) => (
            <div key={b.id} className="flex items-center gap-2 text-sm">
              <button onClick={() => setBooks((bs) => bs.map((x) => (x.id === b.id ? { ...x, done: !x.done } : x)))} className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${b.done ? 'bg-primary border-primary' : 'border-border'}`}>{b.done && <Check className="w-2.5 h-2.5 text-primary-foreground" />}</button>
              <span className={b.done ? 'line-through text-muted-foreground' : ''}>{b.title}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Watchlist</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={w} onChange={(e) => setW(e.target.value)} placeholder="Add to watchlist" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && addWatch()} />
            <Button size="icon" onClick={addWatch} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          {watch.map((x) => <p key={x.id} className="text-sm border-t border-border pt-2 first:border-0 first:pt-0">{x.title}</p>)}
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsTab() {
  const [items, setItems] = useLocalStorage('nook-projects', []);
  const [form, setForm] = useState({ name: '', status: 'Planning' });
  const STAGES = ['Planning', 'In progress', 'Done'];
  const add = () => { if (!form.name.trim()) return; setItems([{ id: Date.now(), ...form }, ...items]); setForm({ name: '', status: 'Planning' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Palette className="w-4 h-4" /> Projects</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Project name" className="rounded-2xl" />
        <div className="flex gap-2">
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button size="sm" onClick={add} className="rounded-full shrink-0"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {items.map((p) => (
          <div key={p.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{p.name}</span><span className="text-xs px-2 py-0.5 rounded-full bg-accent">{p.status}</span>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== p.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function IdeasTab() {
  const [ideas, setIdeas] = useLocalStorage('nook-ideas', []);
  const [text, setText] = useState('');
  const add = () => { if (!text.trim()) return; setIdeas([{ id: Date.now(), text: text.trim() }, ...ideas]); setText(''); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Ideas & Brainstorming</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Spark of an idea..." rows={2} className="rounded-2xl resize-none" />
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Save</Button>
        {ideas.map((i) => (
          <div key={i.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{i.text}</span>
            <button onClick={() => setIdeas((x) => x.filter((y) => y.id !== i.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MoodboardsTab() {
  const [vision, setVision] = useLocalStorage('nook-vision', []);
  const add = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setVision([...vision, file_url]);
  };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Image className="w-4 h-4" /> Moodboards</CardTitle></CardHeader>
      <CardContent>
        <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-primary"><Plus className="w-4 h-4" /> Add image<input type="file" accept="image/*" className="hidden" onChange={add} /></label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {vision.map((v, i) => <img key={i} src={v} alt="vision" className="aspect-square object-cover rounded-2xl" />)}
        </div>
      </CardContent>
    </Card>
  );
}

function JournalTab() {
  const [entries, setEntries] = useLocalStorage('nook-journal', []);
  const [form, setForm] = useState({ title: '', text: '' });
  const add = () => { if (!form.text.trim()) return; setEntries([{ id: Date.now(), ...form, date: new Date().toISOString().slice(0, 10) }, ...entries]); setForm({ title: '', text: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><BookHeart className="w-4 h-4" /> Creative Journal</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Title (optional)" className="rounded-2xl" />
        <Textarea value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} placeholder="Reflect on your creative practice..." rows={3} className="rounded-2xl resize-none" />
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Save entry</Button>
        {entries.map((e) => (
          <div key={e.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0"><p className="font-medium">{e.title || 'Entry'} <span className="text-xs text-muted-foreground">· {e.date}</span></p><p className="text-xs">{e.text}</p></div>
            <button onClick={() => setEntries((x) => x.filter((y) => y.id !== e.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CreativeNook() {
  const { isFeatureEnabled } = useAppSettings();
  const tabs = [
    { value: 'library', label: 'Library', node: <LibraryTab /> },
    isFeatureEnabled('cre8.projects') && { value: 'projects', label: 'Projects', node: <ProjectsTab /> },
    isFeatureEnabled('cre8.ideas') && { value: 'ideas', label: 'Ideas', node: <IdeasTab /> },
    isFeatureEnabled('cre8.moodboards') && { value: 'moodboards', label: 'Moodboards', node: <MoodboardsTab /> },
    isFeatureEnabled('cre8.journal') && { value: 'journal', label: 'Journal', node: <JournalTab /> }
  ].filter(Boolean);
  return (
    <StudioShell title="Creative Nook & Library">
      <Tabs defaultValue={tabs[0].value}>
        <TabsList className="flex w-full bg-accent rounded-full p-1 gap-1 mb-4 overflow-x-auto">
          {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="rounded-full text-xs flex-1">{t.label}</TabsTrigger>)}
        </TabsList>
        {tabs.map((t) => <TabsContent key={t.value} value={t.value} className="mt-0 space-y-4">{t.node}</TabsContent>)}
      </Tabs>
    </StudioShell>
  );
}