import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const SITES = ['Abdomen', 'Left Thigh', 'Right Thigh', 'Left Arm', 'Right Arm'];

export default function HealthStudio() {
  const [inj, setInj] = useLocalStorage('health-inj', []);
  const [bp, setBp] = useLocalStorage('health-bp', []);
  const [meds, setMeds] = useLocalStorage('health-meds', []);
  const [injForm, setInjForm] = useState({ site: 'Abdomen', dose: '' });
  const [bpForm, setBpForm] = useState({ sys: '', dia: '', pulse: '' });
  const [med, setMed] = useState('');

  const addInj = () => {
    if (injForm.dose) {
      setInj([{ ...injForm, date: new Date().toLocaleDateString() }, ...inj]);
      setInjForm({ site: 'Abdomen', dose: '' });
    }
  };
  const addBp = () => {
    if (bpForm.sys && bpForm.dia) {
      setBp([{ ...bpForm, date: new Date().toLocaleDateString() }, ...bp]);
      setBpForm({ sys: '', dia: '', pulse: '' });
    }
  };
  const addMed = () => {
    if (med.trim()) {
      setMeds([...meds, { id: Date.now(), name: med.trim(), refill: false }]);
      setMed('');
    }
  };
  const bpData = bp.map((b, i) => ({ i, sys: +b.sys, dia: +b.dia }));

  return (
    <StudioShell title="Health & Vitals">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">GLP-1 & Injection Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2 flex-wrap">
            {SITES.map((s) => (
              <button
                key={s}
                onClick={() => setInjForm((f) => ({ ...f, site: s }))}
                className={`text-xs px-3 py-1 rounded-full border ${
                  injForm.site === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={injForm.dose}
              onChange={(e) => setInjForm((f) => ({ ...f, dose: e.target.value }))}
              placeholder="Dose (mg/units)"
              className="rounded-full"
            />
            <Button size="sm" onClick={addInj} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {inj.map((i, idx) => (
            <p key={idx} className="text-xs">
              {i.date} · {i.site} · {i.dose}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Blood Pressure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input type="number" value={bpForm.sys} onChange={(e) => setBpForm((f) => ({ ...f, sys: e.target.value }))} placeholder="Sys" className="rounded-full" />
            <Input type="number" value={bpForm.dia} onChange={(e) => setBpForm((f) => ({ ...f, dia: e.target.value }))} placeholder="Dia" className="rounded-full" />
            <Input type="number" value={bpForm.pulse} onChange={(e) => setBpForm((f) => ({ ...f, pulse: e.target.value }))} placeholder="Pulse" className="rounded-full" />
            <Button size="sm" onClick={addBp} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
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
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Medication & Supplements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={med}
              onChange={(e) => setMed(e.target.value)}
              placeholder="Medication name"
              className="rounded-full"
              onKeyDown={(e) => e.key === 'Enter' && addMed()}
            />
            <Button size="sm" onClick={addMed} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {meds.map((m) => (
            <div key={m.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={m.refill}
                onChange={() => setMeds((ms) => ms.map((x) => (x.id === m.id ? { ...x, refill: !x.refill } : x)))}
              />
              <span className={m.refill ? 'line-through text-muted-foreground' : ''}>{m.name}</span>
              {m.refill && <span className="text-xs text-amber-500">refill</span>}
            </div>
          ))}
        </CardContent>
      </Card>
    </StudioShell>
  );
}