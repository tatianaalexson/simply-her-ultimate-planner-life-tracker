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
import { Plus, Trash2, Thermometer, Droplets, TestTube, Stethoscope, BookHeart } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const PATHWAYS = ['Natural Cycle', 'Clinical Treatment', 'At-Home Insemination'];
const MUCUS = ['Dry', 'Sticky', 'Creamy', 'Watery', 'Egg-white'];
const OPK = ['Negative', 'Faint', 'Positive', 'Peak'];

function CycleTab() {
  const [pathway, setPathway] = useLocalStorage('ttc-pathway', 'Natural Cycle');
  const [donors, setDonors] = useLocalStorage('ttc-donors', []);
  const [donor, setDonor] = useState({ id: '', type: 'Anonymous Cryobank' });
  const [cycle, setCycle] = useLocalStorage('ttc-cycle', { start: '', length: 28 });
  const addDonor = () => { if (donor.id) { setDonors([...donors, { ...donor }]); setDonor({ id: '', type: 'Anonymous Cryobank' }); } };
  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground mb-2">Tracking Mode</p>
          <div className="flex gap-2 flex-wrap">
            {PATHWAYS.map((p) => (
              <button key={p} onClick={() => setPathway(p)} className={`text-xs px-3 py-1.5 rounded-full border ${pathway === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}>{p}</button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Cycle</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1"><label className="text-xs">Cycle start</label><Input type="date" value={cycle.start} onChange={(e) => setCycle((c) => ({ ...c, start: e.target.value }))} className="rounded-2xl" /></div>
            <div className="w-28"><label className="text-xs">Length</label><Input type="number" value={cycle.length} onChange={(e) => setCycle((c) => ({ ...c, length: +e.target.value }))} className="rounded-2xl" /></div>
          </div>
          {cycle.start && <p className="text-xs text-muted-foreground">Day {Math.max(0, Math.floor((Date.now() - new Date(cycle.start)) / 86400000) + 1)} of cycle</p>}
        </CardContent>
      </Card>
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Donor Registry</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={donor.id} onChange={(e) => setDonor((p) => ({ ...p, id: e.target.value }))} placeholder="Donor ID" className="rounded-2xl" />
            <select value={donor.type} onChange={(e) => setDonor((p) => ({ ...p, type: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
              <option>Anonymous Cryobank</option><option>Directed / Known Donor</option>
            </select>
            <Button size="sm" onClick={addDonor} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          {donors.map((d, i) => (
            <p key={i} className="text-xs border-t border-border pt-2 first:border-0 first:pt-0">{d.id} · {d.type}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function BbtTab() {
  const [bbt, setBbt] = useLocalStorage('ttc-bbt', []);
  const [temp, setTemp] = useState('');
  const add = () => { if (temp) { setBbt([...bbt, { day: bbt.length + 1, temp: +temp }]); setTemp(''); } };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Thermometer className="w-4 h-4" /> BBT Chart</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Temp (°F)" className="rounded-2xl" />
          <Button size="sm" onClick={add} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {bbt.length > 0 && (
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bbt}><XAxis dataKey="day" /><Tooltip /><Line type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} /></LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {bbt.map((b) => <p key={b.day} className="text-xs border-t border-border pt-1">Day {b.day} · {b.temp}°F</p>)}
      </CardContent>
    </Card>
  );
}

function MucusTab() {
  const [log, setLog] = useLocalStorage('ttc-mucus', []);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), value: MUCUS[0] });
  const add = () => { setLog([{ id: Date.now(), ...form }, ...log]); setForm({ date: new Date().toISOString().slice(0, 10), value: MUCUS[0] }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Droplets className="w-4 h-4" /> Cervical Mucus</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
          <select value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            {MUCUS.map((m) => <option key={m}>{m}</option>)}
          </select>
          <Button size="sm" onClick={add} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {log.map((l) => (
          <div key={l.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{l.date}</span><span className="text-xs px-2 py-0.5 rounded-full bg-accent">{l.value}</span>
            <button onClick={() => setLog((x) => x.filter((y) => y.id !== l.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function OpkTab() {
  const [log, setLog] = useLocalStorage('ttc-opks', []);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), value: OPK[0] });
  const add = () => { setLog([{ id: Date.now(), ...form }, ...log]); setForm({ date: new Date().toISOString().slice(0, 10), value: OPK[0] }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><TestTube className="w-4 h-4" /> Ovulation Tests</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
          <select value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            {OPK.map((m) => <option key={m}>{m}</option>)}
          </select>
          <Button size="sm" onClick={add} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {log.map((l) => (
          <div key={l.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{l.date}</span><span className={`text-xs px-2 py-0.5 rounded-full ${l.value === 'Peak' || l.value === 'Positive' ? 'bg-emerald-100 text-emerald-700' : 'bg-accent'}`}>{l.value}</span>
            <button onClick={() => setLog((x) => x.filter((y) => y.id !== l.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AppointmentsTab() {
  const [items, setItems] = useLocalStorage('ttc-appointments', []);
  const [form, setForm] = useState({ date: '', provider: '', notes: '' });
  const add = () => { if (!form.date) return; setItems([{ id: Date.now(), ...form }, ...items]); setForm({ date: '', provider: '', notes: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Appointments</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
          <Input value={form.provider} onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))} placeholder="Provider" className="rounded-2xl" />
        </div>
        <Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" rows={2} className="rounded-2xl resize-none" />
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add</Button>
        {items.map((a) => (
          <div key={a.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0"><p className="font-medium">{a.date} · {a.provider}</p>{a.notes && <p className="text-xs text-muted-foreground">{a.notes}</p>}</div>
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== a.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TestsTab() {
  const [tests, setTests] = useLocalStorage('ttc-tests', []);
  const add = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setTests([...tests, { url: file_url, date: new Date().toLocaleDateString() }]);
  };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Test Gallery</CardTitle></CardHeader>
      <CardContent>
        <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-primary"><Plus className="w-4 h-4" /> Upload test<input type="file" accept="image/*" className="hidden" onChange={add} /></label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {tests.map((t, i) => <img key={i} src={t.url} alt="test" className="aspect-square object-cover rounded-2xl" />)}
        </div>
      </CardContent>
    </Card>
  );
}

function JournalTab() {
  const [entries, setEntries] = useLocalStorage('ttc-journal', []);
  const [form, setForm] = useState({ mood: '', text: '' });
  const add = () => { if (!form.text.trim()) return; setEntries([{ id: Date.now(), ...form, date: new Date().toISOString().slice(0, 10) }, ...entries]); setForm({ mood: '', text: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><BookHeart className="w-4 h-4" /> TTC Journal</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.mood} onChange={(e) => setForm((p) => ({ ...p, mood: e.target.value }))} placeholder="How are you feeling?" className="rounded-2xl" />
        <Textarea value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} placeholder="Reflection..." rows={3} className="rounded-2xl resize-none" />
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Save entry</Button>
        {entries.map((e) => (
          <div key={e.id} className="flex items-start gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0"><p className="text-xs text-muted-foreground">{e.date}{e.mood && ` · ${e.mood}`}</p><p>{e.text}</p></div>
            <button onClick={() => setEntries((x) => x.filter((y) => y.id !== e.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function TTCStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const tabs = [
    isFeatureEnabled('ttc.cycle') && { value: 'cycle', label: 'Cycle', node: <CycleTab /> },
    isFeatureEnabled('ttc.bbt') && { value: 'bbt', label: 'BBT', node: <BbtTab /> },
    isFeatureEnabled('ttc.mucus') && { value: 'mucus', label: 'Mucus', node: <MucusTab /> },
    isFeatureEnabled('ttc.opks') && { value: 'opks', label: 'OPKs', node: <OpkTab /> },
    isFeatureEnabled('ttc.appointments') && { value: 'appts', label: 'Appointments', node: <AppointmentsTab /> },
    isFeatureEnabled('ttc.tests') && { value: 'tests', label: 'Tests', node: <TestsTab /> },
    isFeatureEnabled('ttc.journal') && { value: 'journal', label: 'Journal', node: <JournalTab /> }
  ].filter(Boolean);
  return (
    <StudioShell title="TTC & Pathways Studio">
      {tabs.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">Enable a TTC feature in Settings to begin.</p> : (
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