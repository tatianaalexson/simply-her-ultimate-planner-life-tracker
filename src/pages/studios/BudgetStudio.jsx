import React, { useState } from 'react';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Check } from 'lucide-react';

export default function BudgetStudio() {
  const [budget, setBudget] = useLocalStorage('budget-monthly', 0);
  const [spent, setSpent] = useLocalStorage('budget-spent', 0);
  const [bills, setBills] = useLocalStorage('budget-bills', []);
  const [goals, setGoals] = useLocalStorage('budget-goals', []);
  const [bill, setBill] = useState({ name: '', amount: '' });
  const [goal, setGoal] = useState({ name: '', target: '' });

  const addBill = () => {
    if (bill.name && bill.amount) {
      setBills([...bills, { id: Date.now(), ...bill, paid: false }]);
      setBill({ name: '', amount: '' });
    }
  };
  const addGoal = () => {
    if (goal.name && goal.target) {
      setGoals([...goals, { id: Date.now(), ...goal, saved: 0 }]);
      setGoal({ name: '', target: '' });
    }
  };

  return (
    <StudioShell title="Budget & Finances">
      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs">Budget</label>
              <Input type="number" value={budget} onChange={(e) => setBudget(+e.target.value)} className="rounded-full" />
            </div>
            <div className="flex-1">
              <label className="text-xs">Spent</label>
              <Input type="number" value={spent} onChange={(e) => setSpent(+e.target.value)} className="rounded-full" />
            </div>
          </div>
          <Progress value={budget ? (spent / budget) * 100 : 0} />
          <p className="text-xs text-muted-foreground">${spent} of ${budget}</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Bills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={bill.name} onChange={(e) => setBill((p) => ({ ...p, name: e.target.value }))} placeholder="Bill" className="rounded-full" />
            <Input value={bill.amount} onChange={(e) => setBill((p) => ({ ...p, amount: e.target.value }))} placeholder="$" className="rounded-full w-20" />
            <Button size="sm" onClick={addBill} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {bills.map((b) => (
            <div key={b.id} className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setBills((bs) => bs.map((x) => (x.id === b.id ? { ...x, paid: !x.paid } : x)))}
                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  b.paid ? 'bg-primary border-primary' : 'border-border'
                }`}
              >
                {b.paid && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </button>
              <span className={b.paid ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>{b.name}</span>
              <span className="text-muted-foreground">${b.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-base">Savings Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={goal.name} onChange={(e) => setGoal((p) => ({ ...p, name: e.target.value }))} placeholder="Goal" className="rounded-full" />
            <Input value={goal.target} onChange={(e) => setGoal((p) => ({ ...p, target: e.target.value }))} placeholder="$" className="rounded-full w-20" />
            <Button size="sm" onClick={addGoal} className="rounded-full shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {goals.map((g) => (
            <div key={g.id}>
              <div className="flex justify-between text-sm">
                <span>{g.name}</span>
                <span className="text-muted-foreground">${g.saved}/${g.target}</span>
              </div>
              <Progress value={g.target ? (g.saved / g.target) * 100 : 0} className="mt-1" />
              <Input
                type="number"
                placeholder="Add savings"
                onChange={(e) =>
                  setGoals((gs) => gs.map((x) => (x.id === g.id ? { ...x, saved: x.saved + (+e.target.value || 0) } : x)))
                }
                className="rounded-full mt-1 h-8"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </StudioShell>
  );
}