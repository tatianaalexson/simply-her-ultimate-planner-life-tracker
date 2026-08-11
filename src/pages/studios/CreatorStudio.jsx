import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';

const COLUMNS = ['Idea', 'Scripting', 'Filming', 'Editing', 'Ready', 'Published'];

export default function CreatorStudio() {
  const [cards, setCards] = useLocalStorage('creator-cards', []);
  const [title, setTitle] = useState('');
  const [deals, setDeals] = useLocalStorage('creator-deals', []);
  const [deal, setDeal] = useState('');

  const add = () => {
    if (title.trim()) {
      setCards([...cards, { id: Date.now(), title: title.trim(), stage: 0 }]);
      setTitle('');
    }
  };
  const move = (id, dir) =>
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, stage: Math.max(0, Math.min(COLUMNS.length - 1, c.stage + dir)) } : c)));
  const addDeal = () => {
    if (deal.trim()) {
      setDeals([...deals, { id: Date.now(), name: deal.trim(), status: 'Invoiced' }]);
      setDeal('');
    }
  };
  const cycleDeal = (id) =>
    setDeals((ds) => ds.map((d) => (d.id === id ? { ...d, status: d.status === 'Invoiced' ? 'Paid' : 'Invoiced' } : d)));

  return (
    <StudioShell title="Content Creator Studio">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Workflow Board</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New content idea"
              className="rounded-full"
              onKeyDown={(e) => e.key === 'Enter' && add()}
            />
            <Button size="sm" onClick={add} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {COLUMNS.map((col, ci) => (
              <div key={col} className="min-w-[140px] flex-1">
                <p className="text-xs font-medium mb-1 text-muted-foreground">{col}</p>
                <div className="space-y-2">
                  {cards
                    .filter((c) => c.stage === ci)
                    .map((c) => (
                      <div key={c.id} className="rounded-2xl bg-secondary/50 p-2">
                        <p className="text-xs font-medium">{c.title}</p>
                        <div className="flex justify-between mt-1">
                          <button onClick={() => move(c.id, -1)}>
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button onClick={() => move(c.id, 1)}>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Brand Deals & Sponsorship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={deal}
              onChange={(e) => setDeal(e.target.value)}
              placeholder="Sponsor / campaign"
              className="rounded-full"
              onKeyDown={(e) => e.key === 'Enter' && addDeal()}
            />
            <Button size="sm" onClick={addDeal} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {deals.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span>{d.name}</span>
              <button
                onClick={() => cycleDeal(d.id)}
                className={`text-xs px-2 py-1 rounded-full ${
                  d.status === 'Paid' ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'
                }`}
              >
                {d.status}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </StudioShell>
  );
}