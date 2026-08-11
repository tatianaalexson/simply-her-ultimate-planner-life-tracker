import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

const PATHWAYS = ['Natural Cycle', 'Clinical Treatment', 'At-Home Insemination'];

export default function TTCStudio() {
  const [pathway, setPathway] = useLocalStorage('ttc-pathway', 'Natural Cycle');
  const [bbt, setBbt] = useLocalStorage('ttc-bbt', []);
  const [temp, setTemp] = useState('');
  const [tests, setTests] = useLocalStorage('ttc-tests', []);
  const [donors, setDonors] = useLocalStorage('ttc-donors', []);
  const [donor, setDonor] = useState({ id: '', type: 'Anonymous Cryobank' });

  const addTemp = () => {
    if (temp) {
      setBbt([...bbt, { day: bbt.length + 1, temp: +temp }]);
      setTemp('');
    }
  };
  const addTest = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setTests([...tests, { url: file_url, date: new Date().toLocaleDateString() }]);
  };
  const addDonor = () => {
    if (donor.id) {
      setDonors([...donors, { ...donor }]);
      setDonor({ id: '', type: 'Anonymous Cryobank' });
    }
  };

  return (
    <StudioShell title="TTC & Pathways Studio">
      <Card className="rounded-3xl shadow-sm">
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground mb-2">Tracking Mode</p>
          <div className="flex gap-2 flex-wrap">
            {PATHWAYS.map((p) => (
              <button
                key={p}
                onClick={() => setPathway(p)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  pathway === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">BBT Chart</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Temp (°F)" className="rounded-full" />
            <Button size="sm" onClick={addTemp} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {bbt.length > 0 && (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bbt}>
                  <XAxis dataKey="day" />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Test Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm text-primary">
            <Plus className="w-4 h-4" /> Upload test
            <input type="file" accept="image/*" className="hidden" onChange={addTest} />
          </label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {tests.map((t, i) => (
              <img key={i} src={t.url} alt="test" className="aspect-square object-cover rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Donor Registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={donor.id} onChange={(e) => setDonor((p) => ({ ...p, id: e.target.value }))} placeholder="Donor ID" className="rounded-full" />
            <select value={donor.type} onChange={(e) => setDonor((p) => ({ ...p, type: e.target.value }))} className="rounded-full border bg-card px-3 text-sm">
              <option>Anonymous Cryobank</option>
              <option>Directed / Known Donor</option>
            </select>
            <Button size="sm" onClick={addDonor} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {donors.map((d, i) => (
            <p key={i} className="text-xs">
              {d.id} · {d.type}
            </p>
          ))}
        </CardContent>
      </Card>
    </StudioShell>
  );
}