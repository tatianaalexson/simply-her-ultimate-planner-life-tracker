import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const SITES = ['Abdomen', 'Left Thigh', 'Right Thigh', 'Left Arm', 'Right Arm'];

export default function PhysicalHealthTab() {
  const [symptoms, setSymptoms] = useLocalStorage('health-symptoms', []);
  const [vitals, setVitals] = useLocalStorage('health-vitals', []);
  const [injections, setInjections] = useLocalStorage('health-injections', []);
  const [supplements, setSupplements] = useLocalStorage('health-supplements', []);

  const [sym, setSym] = useState({ name: '', notes: '' });
  const [sev, setSev] = useState(5);
  const [vit, setVit] = useState({ sys: '', dia: '', hr: '', weight: '' });
  const [inj, setInj] = useState({ site: 'Abdomen', dose: '' });
  const [supp, setSupp] = useState({ name: '', dose: '' });

  const addSym = () => {
    if (!sym.name.trim()) return;
    setSymptoms([{ id: Date.now(), ...sym, severity: sev, time: new Date().toLocaleString() }, ...symptoms]);
    setSym({ name: '', notes: '' });
    setSev(5);
  };
  const addVit = () => {
    if (!vit.sys || !vit.dia) return;
    setVitals([{ ...vit, time: new Date().toLocaleString() }, ...vitals]);
    setVit({ sys: '', dia: '', hr: '', weight: '' });
  };
  const addInj = () => {
    if (!inj.dose.trim()) return;
    setInjections([{ ...inj, time: new Date().toLocaleString() }, ...injections]);
    setInj({ site: 'Abdomen', dose: '' });
  };
  const addSupp = () => {
    if (!supp.name.trim()) return;
    setSupplements([{ id: Date.now(), ...supp, time: new Date().toLocaleString() }, ...supplements]);
    setSupp({ name: '', dose: '' });
  };

  const bpData = vitals.slice(0, 12).reverse().map((v, i) => ({ i, sys: +v.sys, dia: +v.dia }));

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Symptom & Flare-Up Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={sym.name} onChange={(e) => setSym((s) => ({ ...s, name: e.target.value }))} placeholder="Symptom" className="rounded-2xl" />
          <div>
            <label className="text-xs font-medium">Severity: {sev}/10</label>
            <Slider value={[sev]} onValueChange={(v) => setSev(v[0])} max={10} step={1} className="mt-2" />
          </div>
          <Textarea value={sym.notes} onChange={(e) => setSym((s) => ({ ...s, notes: e.target.value }))} placeholder="Body notes (location, context)…" rows={2} className="rounded-2xl resize-none" />
          <Button size="sm" onClick={addSym} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Log symptom</Button>
          {symptoms.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-2 border-t border-border pt-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.name} · {s.severity}/10</p>
                {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                <p className="text-[10px] text-muted-foreground">{s.time}</p>
              </div>
              <button onClick={() => setSymptoms((x) => x.filter((y) => y.id !== s.id))} className="text-muted-foreground shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Vitals Tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={vit.sys} onChange={(e) => setVit((v) => ({ ...v, sys: e.target.value }))} placeholder="Systolic" className="rounded-2xl" />
            <Input type="number" value={vit.dia} onChange={(e) => setVit((v) => ({ ...v, dia: e.target.value }))} placeholder="Diastolic" className="rounded-2xl" />
            <Input type="number" value={vit.hr} onChange={(e) => setVit((v) => ({ ...v, hr: e.target.value }))} placeholder="Heart rate" className="rounded-2xl" />
            <Input type="number" value={vit.weight} onChange={(e) => setVit((v) => ({ ...v, weight: e.target.value }))} placeholder="Weight" className="rounded-2xl" />
          </div>
          <Button size="sm" onClick={addVit} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Log vitals</Button>
          {bpData.length > 0 && (
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bpData}>
                  <XAxis dataKey="i" hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="sys" stroke="hsl(0 70% 55%)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="dia" stroke="hsl(199 52% 55%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {vitals.map((v, i) => (
            <p key={i} className="text-xs border-t border-border pt-1">
              {v.time} · BP {v.sys}/{v.dia} {v.hr && `· HR ${v.hr}`} {v.weight && `· ${v.weight}`}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">GLP-1 & Injection Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SITES.map((s) => (
              <button
                key={s}
                onClick={() => setInj((f) => ({ ...f, site: s }))}
                className={`text-xs px-3 py-1 rounded-full border ${inj.site === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={inj.dose} onChange={(e) => setInj((f) => ({ ...f, dose: e.target.value }))} placeholder="Dose (mg/units)" className="rounded-2xl" />
            <Button size="sm" onClick={addInj} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          {injections.map((i, idx) => (
            <p key={idx} className="text-xs">{i.time} · {i.site} · {i.dose}</p>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Supplement Stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={supp.name} onChange={(e) => setSupp((s) => ({ ...s, name: e.target.value }))} placeholder="Supplement" className="rounded-2xl" />
            <Input value={supp.dose} onChange={(e) => setSupp((s) => ({ ...s, dose: e.target.value }))} placeholder="Dose" className="rounded-2xl" />
            <Button size="sm" onClick={addSupp} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          {supplements.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-t border-border pt-2">
              <p className="text-sm">{s.name} · {s.dose} <span className="text-[10px] text-muted-foreground">{s.time}</span></p>
              <button onClick={() => setSupplements((x) => x.filter((y) => y.id !== s.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}