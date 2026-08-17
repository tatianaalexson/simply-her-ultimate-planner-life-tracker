import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FlaskConical } from 'lucide-react';

const FLAGS = [
  { id: 'normal', label: 'Normal', cls: 'bg-emerald-100 text-emerald-700' },
  { id: 'high', label: 'High', cls: 'bg-amber-100 text-amber-700' },
  { id: 'low', label: 'Low', cls: 'bg-sky-100 text-sky-700' },
  { id: 'critical', label: 'Critical', cls: 'bg-rose-100 text-rose-700' },
  { id: 'pending', label: 'Pending', cls: 'bg-slate-100 text-slate-600' }
];

const isoOf = (d) => (d ? new Date(d).toLocaleDateString() : '');

export default function TestsTab() {
  const [tests, setTests] = useLocalStorage('health-tests', []);
  const [form, setForm] = useState({ name: '', date: '', result: '', unit: '', range: '', flag: 'normal', provider: '', notes: '' });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const add = () => {
    if (!form.name.trim() || !form.date) return;
    setTests((t) => [{ id: Date.now(), ...form }, ...t]);
    setForm({ name: '', date: '', result: '', unit: '', range: '', flag: 'normal', provider: '', notes: '' });
  };

  const byName = tests.reduce((acc, t) => {
    (acc[t.name] = acc[t.name] || []).push(t);
    return acc;
  }, {});
  const trend = (name) => byName[name].slice(0, 5).reverse().map((t) => t.result).filter(Boolean).join(' → ');

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Add Test / Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Test name (e.g. TSH, CBC)" className="rounded-2xl col-span-2" />
            <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="rounded-2xl" />
            <Select value={form.flag} onValueChange={(v) => set('flag', v)}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{FLAGS.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={form.result} onChange={(e) => set('result', e.target.value)} placeholder="Result" className="rounded-2xl" />
            <Input value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="Unit (mg/dL)" className="rounded-2xl" />
            <Input value={form.range} onChange={(e) => set('range', e.target.value)} placeholder="Reference range" className="rounded-2xl col-span-2" />
            <Input value={form.provider} onChange={(e) => set('provider', e.target.value)} placeholder="Ordered by" className="rounded-2xl col-span-2" />
            <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Notes, next steps" rows={2} className="rounded-2xl col-span-2 resize-none" />
          </div>
          <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Save result</Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Results Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tests.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No results logged yet.</p>}
          {tests.map((t) => {
            const flag = FLAGS.find((f) => f.id === t.flag) || FLAGS[0];
            return (
              <div key={t.id} className="flex items-start justify-between gap-2 border-t border-border pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                    {t.name}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${flag.cls}`}>{flag.label}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isoOf(t.date)} · {t.result}{t.unit ? ` ${t.unit}` : ''}{t.range ? ` (ref ${t.range})` : ''}
                  </p>
                  {trend(t.name) && <p className="text-[10px] text-muted-foreground/80 mt-0.5">Trend: {trend(t.name)}</p>}
                  {t.provider && <p className="text-[10px] text-muted-foreground/80">{t.provider}</p>}
                  {t.notes && <p className="text-xs mt-1 text-muted-foreground/80">{t.notes}</p>}
                </div>
                <button onClick={() => setTests((x) => x.filter((y) => y.id !== t.id))} className="text-muted-foreground shrink-0 mt-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}