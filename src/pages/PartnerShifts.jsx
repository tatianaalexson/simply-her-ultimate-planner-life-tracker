import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

export default function PartnerShifts() {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [form, setForm] = useState({
    label: '',
    date: today(),
    start_time: '06:00',
    end_time: '14:00',
    notes: ''
  });

  const load = async () => {
    const list = await base44.entities.PartnerShift.list('-shift_date', 100);
    setShifts(list);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.date) return;
    await base44.entities.PartnerShift.create({
      label: form.label || 'Shift',
      shift_date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      notes: form.notes
    });
    setForm({ label: '', date: today(), start_time: '06:00', end_time: '14:00', notes: '' });
    load();
  };
  const remove = async (s) => {
    await base44.entities.PartnerShift.delete(s.id);
    load();
  };

  return (
    <div className="py-4 space-y-4">
      <button
        onClick={() => navigate('/settings')}
        className="flex items-center gap-1 text-sm text-muted-foreground active:scale-95 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Settings
      </button>
      <h1 className="font-heading text-2xl font-semibold">Partner Shift Schedule</h1>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Add a Shift</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            placeholder="Label (e.g. Morning shift)"
            className="rounded-full"
          />
          <div className="flex gap-2">
            <Input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="rounded-full" />
            <Input type="time" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} className="rounded-full" />
            <Input type="time" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} className="rounded-full" />
          </div>
          <Input
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className="rounded-full"
          />
          <Button onClick={add} className="rounded-full w-full">
            <Plus className="w-4 h-4 mr-1" /> Add Shift
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {shifts.map((s) => (
          <Card key={s.id} className="rounded-2xl shadow-sm">
            <CardContent className="pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.shift_date} · {s.start_time}–{s.end_time}
                  </p>
                  {s.notes && <p className="text-xs mt-1">{s.notes}</p>}
                </div>
                <button onClick={() => remove(s)}>
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {shifts.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No shifts yet. Add your partner's work hours above.</p>
        )}
      </div>
    </div>
  );
}