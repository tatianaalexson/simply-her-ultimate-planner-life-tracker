import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, PawPrint, Shirt, Hammer, Wrench, Box } from 'lucide-react';

const ROOMS = {
  'Living Room': ['Tidy surfaces', 'Vacuum', 'Dust shelves', 'Fluff pillows'],
  Kitchen: ['Wipe counters', 'Clean sink', 'Sweep floor', 'Empty trash'],
  Bedroom: ['Make bed', 'Laundry', 'Nightstand reset', 'Fresh linens']
};

function CleaningTab() {
  const [checks, setChecks] = useLocalStorage('home-checks', {});
  const toggle = (k) => setChecks((s) => ({ ...s, [k]: !s[k] }));
  return (
    <div className="space-y-4">
      {Object.entries(ROOMS).map(([room, tasks]) => (
        <Card key={room} className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="font-heading text-base">{room}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Checkbox checked={!!checks[t]} onCheckedChange={() => toggle(t)} id={`h-${room}-${t}`} />
                <label htmlFor={`h-${room}-${t}`} className={`text-sm ${checks[t] ? 'line-through text-muted-foreground' : ''}`}>{t}</label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PetsTab() {
  const [pets, setPets] = useLocalStorage('home-pets', []);
  const [pet, setPet] = useState('');
  const add = () => { if (!pet.trim()) return; setPets([{ id: Date.now(), text: pet.trim(), time: new Date().toLocaleTimeString() }, ...pets]); setPet(''); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><PawPrint className="w-4 h-4" /> Pet Care Log</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={pet} onChange={(e) => setPet(e.target.value)} placeholder="Fed / walked / meds..." className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button size="icon" onClick={add} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {pets.map((p) => (
          <div key={p.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <PawPrint className="w-4 h-4 text-primary shrink-0" />
            <span className="flex-1">{p.text}</span>
            <span className="text-xs text-muted-foreground">{p.time}</span>
            <button onClick={() => setPets((x) => x.filter((y) => y.id !== p.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function LaundryTab() {
  const [loads, setLoads] = useLocalStorage('home-laundry', []);
  const [form, setForm] = useState({ load: '', status: 'To wash' });
  const STAGES = ['To wash', 'Washing', 'Drying', 'Folded'];
  const add = () => { if (!form.load.trim()) return; setLoads([{ id: Date.now(), ...form }, ...loads]); setForm({ load: '', status: 'To wash' }); };
  const cycle = (id) => setLoads((l) => l.map((x) => { if (x.id !== id) return x; const i = STAGES.indexOf(x.status); return { ...x, status: STAGES[(i + 1) % STAGES.length] }; }));
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Shirt className="w-4 h-4" /> Laundry</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={form.load} onChange={(e) => setForm((p) => ({ ...p, load: e.target.value }))} placeholder="Load (e.g. darks, towels)" className="rounded-2xl" />
          <Button size="icon" onClick={add} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {loads.map((l) => (
          <div key={l.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{l.load}</span>
            <button onClick={() => cycle(l.id)} className="text-xs px-2 py-1 rounded-full bg-accent">{l.status}</button>
            <button onClick={() => setLoads((x) => x.filter((y) => y.id !== l.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProjectsTab() {
  const [items, setItems] = useLocalStorage('home-projects', []);
  const [form, setForm] = useState({ name: '', status: 'Planning', notes: '' });
  const STAGES = ['Planning', 'In progress', 'Done'];
  const add = () => { if (!form.name.trim()) return; setItems([{ id: Date.now(), ...form }, ...items]); setForm({ name: '', status: 'Planning', notes: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Hammer className="w-4 h-4" /> Home Projects</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Project" className="rounded-2xl" />
        <div className="flex gap-2">
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button size="sm" onClick={add} className="rounded-full shrink-0"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {items.map((p) => (
          <div key={p.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{p.name} <span className="text-xs text-muted-foreground">· {p.status}</span></p>
              {p.notes && <p className="text-xs text-muted-foreground">{p.notes}</p>}
            </div>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== p.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MaintenanceTab() {
  const [items, setItems] = useLocalStorage('home-maintenance', []);
  const [form, setForm] = useState({ task: '', date: '', notes: '' });
  const add = () => { if (!form.task.trim()) return; setItems([{ id: Date.now(), ...form }, ...items]); setForm({ task: '', date: '', notes: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Wrench className="w-4 h-4" /> Maintenance Log</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.task} onChange={(e) => setForm((p) => ({ ...p, task: e.target.value }))} placeholder="Task (e.g. change filter)" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
          <Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="rounded-2xl" />
        </div>
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Log</Button>
        {items.map((m) => (
          <div key={m.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0"><p className="font-medium">{m.task}</p><p className="text-xs text-muted-foreground">{m.date} {m.notes && `· ${m.notes}`}</p></div>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== m.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InventoryTab() {
  const [items, setItems] = useLocalStorage('home-inventory', []);
  const [form, setForm] = useState({ name: '', qty: '', location: '' });
  const add = () => { if (!form.name.trim()) return; setItems([{ id: Date.now(), ...form, low: false }, ...items]); setForm({ name: '', qty: '', location: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Box className="w-4 h-4" /> Household Inventory</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} placeholder="Qty" className="rounded-2xl" />
          <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="rounded-2xl" />
        </div>
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <Checkbox checked={i.low} onCheckedChange={() => setItems((x) => x.map((y) => (y.id === i.id ? { ...y, low: !y.low } : y)))} id={`inv-${i.id}`} />
            <label htmlFor={`inv-${i.id}`} className={`flex-1 ${i.low ? 'text-amber-500' : ''}`}>{i.name}</label>
            <span className="text-xs text-muted-foreground">{i.qty} {i.location && `· ${i.location}`}</span>
            {i.low && <span className="text-[10px] text-amber-500">low</span>}
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== i.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function HomeStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const tabs = [
    isFeatureEnabled('home.cleaning') && { value: 'cleaning', label: 'Cleaning', node: <CleaningTab /> },
    { value: 'pets', label: 'Pets', node: <PetsTab /> },
    isFeatureEnabled('home.laundry') && { value: 'laundry', label: 'Laundry', node: <LaundryTab /> },
    isFeatureEnabled('home.projects') && { value: 'projects', label: 'Projects', node: <ProjectsTab /> },
    isFeatureEnabled('home.maintenance') && { value: 'maintenance', label: 'Maintenance', node: <MaintenanceTab /> },
    isFeatureEnabled('home.inventory') && { value: 'inventory', label: 'Inventory', node: <InventoryTab /> }
  ].filter(Boolean);
  return (
    <StudioShell title="Home, Space & Pet Studio">
      <Tabs defaultValue={tabs[0].value}>
        <TabsList className="flex w-full bg-accent rounded-full p-1 gap-1 mb-4 overflow-x-auto">
          {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="rounded-full text-xs flex-1">{t.label}</TabsTrigger>)}
        </TabsList>
        {tabs.map((t) => <TabsContent key={t.value} value={t.value} className="mt-0 space-y-4">{t.node}</TabsContent>)}
      </Tabs>
    </StudioShell>
  );
}