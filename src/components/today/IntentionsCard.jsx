import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Check, X } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

export default function IntentionsCard() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const list = await base44.entities.Intention.filter({ intention_date: today() });
    setItems(list);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!text.trim() || items.length >= 3) return;
    await base44.entities.Intention.create({ text: text.trim(), intention_date: today(), completed: false });
    setText('');
    load();
  };
  const toggle = async (it) => {
    await base44.entities.Intention.update(it.id, { completed: !it.completed });
    load();
  };
  const remove = async (it) => {
    await base44.entities.Intention.delete(it.id);
    load();
  };

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">Top 3 Intentions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-2 group">
            <button
              onClick={() => toggle(it)}
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                it.completed ? 'bg-primary border-primary' : 'border-border'
              }`}
            >
              {it.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
            <span className={`flex-1 text-sm ${it.completed ? 'line-through text-muted-foreground' : ''}`}>{it.text}</span>
            <button onClick={() => remove(it)} className="opacity-0 group-hover:opacity-100 transition">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        ))}
        {items.length < 3 && (
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add an intention..."
              onKeyDown={(e) => e.key === 'Enter' && add()}
              className="rounded-full"
            />
            <Button size="icon" onClick={add} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
        {!loading && items.length === 0 && (
          <p className="text-xs text-muted-foreground">Set your top 3 priorities for today.</p>
        )}
      </CardContent>
    </Card>
  );
}