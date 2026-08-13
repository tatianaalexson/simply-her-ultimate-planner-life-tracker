import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

export default function AppointmentHubTab() {
  const [team, setTeam] = useLocalStorage('health-care-team', []);
  const [appts, setAppts] = useLocalStorage('health-appointments', []);
  const [doc, setDoc] = useState({ name: '', specialty: '', clinic: '', phone: '', portal: '' });
  const [appt, setAppt] = useState({ date: '', doctor: '', instructions: '', followup: '' });
  const [questions, setQuestions] = useLocalStorage('health-visit-questions', []);

  const addDoc = () => {
    if (!doc.name.trim()) return;
    setTeam([{ id: Date.now(), ...doc }, ...team]);
    setDoc({ name: '', specialty: '', clinic: '', phone: '', portal: '' });
  };
  const addAppt = () => {
    if (!appt.date) return;
    setAppts([{ id: Date.now(), ...appt, time: new Date().toLocaleString() }, ...appts]);
    setAppt({ date: '', doctor: '', instructions: '', followup: '' });
  };
  const addQuestion = () => setQuestions((q) => ['New question', ...q]);

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Care Team Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={doc.name} onChange={(e) => setDoc((d) => ({ ...d, name: e.target.value }))} placeholder="Doctor / provider name" className="rounded-2xl" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={doc.specialty} onChange={(e) => setDoc((d) => ({ ...d, specialty: e.target.value }))} placeholder="Specialty" className="rounded-2xl" />
            <Input value={doc.clinic} onChange={(e) => setDoc((d) => ({ ...d, clinic: e.target.value }))} placeholder="Clinic" className="rounded-2xl" />
            <Input value={doc.phone} onChange={(e) => setDoc((d) => ({ ...d, phone: e.target.value }))} placeholder="Phone" className="rounded-2xl" />
            <Input value={doc.portal} onChange={(e) => setDoc((d) => ({ ...d, portal: e.target.value }))} placeholder="Portal URL" className="rounded-2xl" />
          </div>
          <Button size="sm" onClick={addDoc} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add provider</Button>
          {team.map((d) => (
            <div key={d.id} className="border-t border-border pt-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{d.name} · {d.specialty}</p>
                <button onClick={() => setTeam((x) => x.filter((y) => y.id !== d.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <p className="text-xs text-muted-foreground">{d.clinic} {d.phone && `· ${d.phone}`}</p>
              {d.portal && <a href={d.portal} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">{d.portal}</a>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Pre-Visit Planner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={appt.date} onChange={(e) => setAppt((a) => ({ ...a, date: e.target.value }))} className="rounded-2xl" />
            <Input value={appt.doctor} onChange={(e) => setAppt((a) => ({ ...a, doctor: e.target.value }))} placeholder="Doctor" className="rounded-2xl" />
          </div>
          <Textarea value={appt.instructions} onChange={(e) => setAppt((a) => ({ ...a, instructions: e.target.value }))} placeholder="Pre-visit instructions (fasting, bring records)…" rows={2} className="rounded-2xl resize-none" />
          <Textarea value={appt.followup} onChange={(e) => setAppt((a) => ({ ...a, followup: e.target.value }))} placeholder="Post-visit follow-ups…" rows={2} className="rounded-2xl resize-none" />
          <Button size="sm" onClick={addAppt} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Save visit</Button>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Questions to Ask</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button size="sm" variant="outline" onClick={addQuestion} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Add question</Button>
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2 border-t border-border pt-2">
              <input
                value={q}
                onChange={(e) => setQuestions((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                className="flex-1 text-sm bg-transparent outline-none"
              />
              <button onClick={() => setQuestions((arr) => arr.filter((_, j) => j !== i))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          {appts.map((a) => (
            <div key={a.id} className="border-t border-border pt-2">
              <p className="text-sm font-medium">{a.date} · {a.doctor || 'Visit'}</p>
              {a.instructions && <p className="text-xs text-muted-foreground">Pre: {a.instructions}</p>}
              {a.followup && <p className="text-xs">Follow-up: {a.followup}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}