import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const AISLES = ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Other'];

export default function KitchenStudio() {
  const [meals, setMeals] = useLocalStorage('kitchen-meals', ['', '', '', '', '', '', '']);
  const [grocery, setGrocery] = useLocalStorage('kitchen-grocery', []);
  const [item, setItem] = useState('');
  const [aisle, setAisle] = useState('Produce');

  const addItem = () => {
    if (!item.trim()) return;
    setGrocery([...grocery, { id: Date.now(), name: item.trim(), aisle, done: false }]);
    setItem('');
  };
  const toggle = (id) => setGrocery((g) => g.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id) => setGrocery((g) => g.filter((i) => i.id !== id));

  return (
    <StudioShell title="Kitchen, Meals & Batch Prep">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">7-Day Meal Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DAYS.map((d, i) => (
            <div key={d} className="flex items-center gap-2">
              <span className="text-xs w-8 text-muted-foreground">{d}</span>
              <Input
                value={meals[i]}
                onChange={(e) => setMeals((m) => m.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder="Dinner plan"
                className="rounded-full"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Grocery List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Add item"
              className="rounded-full"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <select value={aisle} onChange={(e) => setAisle(e.target.value)} className="rounded-full border bg-card px-3 text-sm">
              {AISLES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <Button size="icon" onClick={addItem} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {AISLES.map((a) => (
            <div key={a}>
              {grocery.some((i) => i.aisle === a) && <p className="text-xs font-medium mt-2 text-muted-foreground">{a}</p>}
              {grocery
                .filter((i) => i.aisle === a)
                .map((i) => (
                  <div key={i.id} className="flex items-center gap-2 py-1">
                    <Checkbox checked={i.done} onCheckedChange={() => toggle(i.id)} id={`g-${i.id}`} />
                    <label htmlFor={`g-${i.id}`} className={`text-sm flex-1 ${i.done ? 'line-through text-muted-foreground' : ''}`}>
                      {i.name}
                    </label>
                    <button onClick={() => remove(i.id)}>
                      <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </StudioShell>
  );
}