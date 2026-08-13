import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';

const TIMES = ['morning', 'afternoon', 'evening'];
const todayKey = () => new Date().toISOString().slice(0, 10);

export default function MedicationCabinetTab() {
  const [meds, setMeds] = useLocalStorage('health-medications', []);
  const [doseLog, setDoseLog] = useLocalStorage('health-dose-log', {});
  const [form, setForm] = useState({ name: '', dose: '', frequency: '', times: ['morning'], remaining: '' });
  const [editingId, setEditingId] = useState(null);

  const toggleTime = (t) =>
    setForm((f) => ({ ...f, times: f.times.includes(t) ? f.times.filter((x) => x !== t) : [...f.times, t] }));

  const save = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setMeds((m) => m.map((x) => (x.id === editingId ? { ...x, ...form } : x)));
      setEditingId(null);
    } else {
      setMeds((m) => [...m, { id: Date.now(), ...form, remaining: form.remaining || '' }]);
    }
    setForm({ name: '', dose: '', frequency: '', times: ['morning'], remaining: '' });
  };

  const edit = (m) => {
    setEditingId(m.id);
    setForm({ name: m.name, dose: m.dose, frequency: m.frequency, times: m.times, remaining: m.remaining });
  };

  const today = doseLog[todayKey()] || {};

  const toggleDose = (medId, time) => {
    const key = todayKey();
    setDoseLog((log) => {
      const day = log[key] || {};
      return { ...log, [key]: { ...day, [`${medId}-${time}`]: !day[`${medId}-${time}`] } };
    });
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">{editingId ? 'Edit medication' : 'Add medication / supplement'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={form.dose} onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))} placeholder="Dose (e.g. 50mg)" className="rounded-2xl" />
            <Input value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))} placeholder="Frequency (e.g. daily)" className="rounded-2xl" />
          </div>
          <Input type="number" value={form.remaining} onChange={(e) => setForm((f) => ({ ...f, remaining: e.target.value }))} placeholder="Remaining count" className="rounded-2xl" />
          <div className="flex flex-wrap gap-2">
            {TIMES.map((t) => (
              <button
                key={t}
                onClick={() => toggleTime(t)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize ${form.times.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={save} className="rounded-full">
            {editingId ? <><Check className="w-4 h-4 mr-1" /> Update</> : <><Plus className="w-4 h-4 mr-1" /> Add</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Daily Checklist · {new Date().toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {meds.length === 0 && <p className="text-xs text-muted-foreground">No medications yet.</p>}
          {meds.map((m) => {
            const low = m.remaining !== '' && Number(m.remaining) <= 5;
            return (
              <div key={m.id} className="border-t border-border pt-2 first:border-0 first:pt-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{m.name} {m.dose && `· ${m.dose}`}</p>
                    <p className="text-xs text-muted-foreground">{m.frequency || 'as needed'} {m.remaining !== '' && `· ${m.remaining} left`}</p>
                    {low && <span className="text-xs text-amber-500">Refill soon</span>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => edit(m)} className="text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setMeds((x) => x.filter((y) => y.id !== m.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {TIMES.filter((t) => m.times.includes(t)).map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleDose(m.id, t)}
                      className={`flex-1 text-xs py-1.5 rounded-xl border capitalize ${today[`${m.id}-${t}`] ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
                    >
                      {today[`${m.id}-${t}`] ? '✓ ' : ''}{t}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}