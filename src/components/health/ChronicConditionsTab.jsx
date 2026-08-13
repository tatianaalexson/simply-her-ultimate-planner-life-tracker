import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Activity, Stethoscope, HelpCircle, Flame } from 'lucide-react';

const SEVERITY = ['Mild', 'Moderate', 'Severe', 'Debilitating'];
const CONFIRMED_STATUS = ['Active', 'Managed', 'Flaring', 'Remission', 'Resolved'];
const SUSPECT_STATUS = ['Investigating', 'Awaiting referral', 'Ruled out', 'Confirmed'];

function AddButton({ onClick, label }) {
  return (
    <Button size="sm" onClick={onClick} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> {label}</Button>
  );
}

function EntryRow({ item, onDelete, badge, fields }) {
  return (
    <div className="flex items-start justify-between gap-2 border-t border-border pt-2">
      <div className="min-w-0">
        <p className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
          {item.name}
          {badge && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">{badge}</span>}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{fields}</p>
        {item.notes && <p className="text-xs mt-1 text-muted-foreground/80">{item.notes}</p>}
      </div>
      <button onClick={onDelete} className="text-muted-foreground shrink-0 mt-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  );
}

export default function ChronicConditionsTab() {
  const [data, setData] = useLocalStorage('health-conditions', { confirmed: [], suspected: [] });
  const [log, setLog] = useLocalStorage('health-symptom-log', []);

  const [confirmed, setConfirmed] = useState({ name: '', date: '', severity: 'Mild', status: 'Active', doctor: '', notes: '' });
  const [suspect, setSuspect] = useState({ name: '', noticed: '', symptoms: '', status: 'Investigating', notes: '' });
  const [sym, setSym] = useState({ symptom: '', severity: 5, related: '', triggers: '', date: '', notes: '' });

  const addConfirmed = () => {
    if (!confirmed.name.trim()) return;
    setData((d) => ({ ...d, confirmed: [{ id: Date.now(), ...confirmed }, ...d.confirmed] }));
    setConfirmed({ name: '', date: '', severity: 'Mild', status: 'Active', doctor: '', notes: '' });
  };
  const addSuspect = () => {
    if (!suspect.name.trim()) return;
    setData((d) => ({ ...d, suspected: [{ id: Date.now(), ...suspect }, ...d.suspected] }));
    setSuspect({ name: '', noticed: '', symptoms: '', status: 'Investigating', notes: '' });
  };
  const addSym = () => {
    if (!sym.symptom.trim()) return;
    setLog((l) => [{ id: Date.now(), ...sym, date: sym.date || new Date().toISOString().slice(0, 10) }, ...l]);
    setSym({ symptom: '', severity: 5, related: '', triggers: '', date: '', notes: '' });
  };

  const allNames = [...data.confirmed, ...data.suspected].map((c) => c.name).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Confirmed Diagnoses */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Confirmed Diagnoses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={confirmed.name} onChange={(e) => setConfirmed((p) => ({ ...p, name: e.target.value }))} placeholder="Condition name" className="rounded-2xl col-span-2" />
            <Input type="date" value={confirmed.date} onChange={(e) => setConfirmed((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
            <Input value={confirmed.doctor} onChange={(e) => setConfirmed((p) => ({ ...p, doctor: e.target.value }))} placeholder="Diagnosing doctor" className="rounded-2xl" />
            <Select value={confirmed.severity} onValueChange={(v) => setConfirmed((p) => ({ ...p, severity: v }))}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{SEVERITY.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={confirmed.status} onValueChange={(v) => setConfirmed((p) => ({ ...p, status: v }))}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{CONFIRMED_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea value={confirmed.notes} onChange={(e) => setConfirmed((p) => ({ ...p, notes: e.target.value }))} placeholder="Treatment, notes, next steps" className="rounded-2xl col-span-2 min-h-[60px]" />
          </div>
          <AddButton onClick={addConfirmed} label="Add diagnosis" />
          {data.confirmed.map((c) => (
            <EntryRow
              key={c.id}
              item={c}
              badge={c.status}
              onDelete={() => setData((d) => ({ ...d, confirmed: d.confirmed.filter((x) => x.id !== c.id) }))}
              fields={`${c.date ? `Diagnosed ${c.date}` : ''}${c.doctor ? ` · ${c.doctor}` : ''} · ${c.severity}`}
            />
          ))}
        </CardContent>
      </Card>

      {/* Suspected / unconfirmed */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Things I Think I Have (Unconfirmed)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={suspect.name} onChange={(e) => setSuspect((p) => ({ ...p, name: e.target.value }))} placeholder="Condition you suspect" className="rounded-2xl col-span-2" />
            <Input type="date" value={suspect.notion} onChange={(e) => setSuspect((p) => ({ ...p, noticed: e.target.value }))} className="rounded-2xl" />
            <Select value={suspect.status} onValueChange={(v) => setSuspect((p) => ({ ...p, status: v }))}>
              <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{SUSPECT_STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Input value={suspect.symptoms} onChange={(e) => setSuspect((p) => ({ ...p, symptoms: e.target.value }))} placeholder="Why you suspect it (symptoms)" className="rounded-2xl col-span-2" />
            <Textarea value={suspect.notes} onChange={(e) => setSuspect((p) => ({ ...p, notes: e.target.value }))} placeholder="Questions to ask doctor, research notes" className="rounded-2xl col-span-2 min-h-[60px]" />
          </div>
          <AddButton onClick={addSuspect} label="Add suspected" />
          {data.suspected.map((c) => (
            <EntryRow
              key={c.id}
              item={c}
              badge={c.status}
              onDelete={() => setData((d) => ({ ...d, suspected: d.suspected.filter((x) => x.id !== c.id) }))}
              fields={`${c.noticed ? `Noticed ${c.noticed}` : 'Unconfirmed'} · ${c.symptoms}`}
            />
          ))}
        </CardContent>
      </Card>

      {/* Symptom & Flare log */}
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base flex items-center gap-2"><Flame className="w-4 h-4" /> Symptom & Flare-up Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input value={sym.symptom} onChange={(e) => setSym((p) => ({ ...p, symptom: e.target.value }))} placeholder="Symptom / flare" className="rounded-2xl" />
            <Input type="date" value={sym.date} onChange={(e) => setSym((p) => ({ ...p, date: e.target.value }))} className="rounded-2xl" />
            <Input list="cond-names" value={sym.related} onChange={(e) => setSym((p) => ({ ...p, related: e.target.value }))} placeholder="Related condition" className="rounded-2xl" />
            <Input value={sym.triggers} onChange={(e) => setSym((p) => ({ ...p, triggers: e.target.value }))} placeholder="Triggers" className="rounded-2xl" />
            <datalist id="cond-names">{allNames.map((n) => <option key={n} value={n} />)}</datalist>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Severity: {sym.severity}/10</label>
              <input type="range" min="1" max="10" value={sym.severity} onChange={(e) => setSym((p) => ({ ...p, severity: +e.target.value }))} className="w-full accent-[hsl(var(--primary))]" />
            </div>
            <Textarea value={sym.notes} onChange={(e) => setSym((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes, duration, what helped" className="rounded-2xl col-span-2 min-h-[60px]" />
          </div>
          <AddButton onClick={addSym} label="Log entry" />
          {log.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-2 border-t border-border pt-2">
              <div className="min-w-0">
                <p className="text-sm font-medium flex items-center gap-1.5 flex-wrap">
                  <Activity className="w-3.5 h-3.5 text-primary" /> {s.symptom}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">{s.severity}/10</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.date}{s.related ? ` · ${s.related}` : ''}{s.triggers ? ` · Trigger: ${s.triggers}` : ''}</p>
                {s.notes && <p className="text-xs mt-1 text-muted-foreground/80">{s.notes}</p>}
              </div>
              <button onClick={() => setLog((l) => l.filter((x) => x.id !== s.id))} className="text-muted-foreground shrink-0 mt-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}