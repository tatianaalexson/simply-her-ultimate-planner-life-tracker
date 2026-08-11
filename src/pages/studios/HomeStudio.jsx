import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, PawPrint } from 'lucide-react';

const ROOMS = {
  'Living Room': ['Tidy surfaces', 'Vacuum', 'Dust shelves', 'Fluff pillows'],
  Kitchen: ['Wipe counters', 'Clean sink', 'Sweep floor', 'Empty trash'],
  Bedroom: ['Make bed', 'Laundry', 'Nightstand reset', 'Fresh linens']
};

export default function HomeStudio() {
  const [checks, setChecks] = useLocalStorage('home-checks', {});
  const [pets, setPets] = useLocalStorage('home-pets', []);
  const [pet, setPet] = useState('');
  const toggle = (k) => setChecks((s) => ({ ...s, [k]: !s[k] }));
  const addPet = () => {
    if (pet.trim()) {
      setPets([{ id: Date.now(), text: pet.trim(), time: new Date().toLocaleTimeString() }, ...pets]);
      setPet('');
    }
  };

  return (
    <StudioShell title="Home, Space & Pet Studio">
      {Object.entries(ROOMS).map(([room, tasks]) => (
        <Card key={room} className="rounded-3xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-base">{room}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Checkbox checked={!!checks[t]} onCheckedChange={() => toggle(t)} id={`h-${room}-${t}`} />
                <label htmlFor={`h-${room}-${t}`} className={`text-sm ${checks[t] ? 'line-through text-muted-foreground' : ''}`}>
                  {t}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Pet Care Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={pet}
              onChange={(e) => setPet(e.target.value)}
              placeholder="Fed / walked / meds..."
              className="rounded-full"
              onKeyDown={(e) => e.key === 'Enter' && addPet()}
            />
            <Button size="icon" onClick={addPet} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {pets.map((p) => (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <PawPrint className="w-4 h-4 text-primary" />
              <span>{p.text}</span>
              <span className="text-xs text-muted-foreground ml-auto">{p.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </StudioShell>
  );
}