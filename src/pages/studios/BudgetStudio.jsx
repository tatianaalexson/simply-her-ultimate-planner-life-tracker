import React, { useState, useEffect, useRef } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useBudgetItems } from '@/hooks/useBudgetItems';
import StudioShell from '@/components/StudioShell';
import EmptyState from '@/components/EmptyState';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Check, Trash2, Wallet, Receipt, PiggyBank, Repeat, Gift } from 'lucide-react';

const todayISO = () => new Date().toISOString().slice(0, 10);

function OverviewTab() {
  const { items, add, update, loading } = useBudgetItems('limit');
  const created = useRef(false);
  useEffect(() => {
    if (!loading && items.length === 0 && !created.current) {
      created.current = true;
      add({ name: 'Monthly Budget', amount: 0, spent: 0 });
    }
  }, [loading, items.length, add]);

  const rec = items[0];
  const budget = rec?.amount || 0;
  const spent = rec?.spent || 0;

  const setField = (field, val) => {
    if (rec) update(rec.id, { [field]: val });
    else add({ name: 'Monthly Budget', amount: field === 'amount' ? val : 0, spent: field === 'spent' ? val : 0 });
  };

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Wallet className="w-4 h-4" /> Monthly Overview</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1"><label className="text-xs">Budget</label><Input type="number" value={budget} onChange={(e) => setField('amount', +e.target.value)} className="rounded-2xl" /></div>
          <div className="flex-1"><label className="text-xs">Spent</label><Input type="number" value={spent} onChange={(e) => setField('spent', +e.target.value)} className="rounded-2xl" /></div>
        </div>
        <Progress value={budget ? (spent / budget) * 100 : 0} />
        <p className="text-xs text-muted-foreground">${spent} of ${budget}</p>
      </CardContent>
    </Card>
  );
}

function TransactionsTab() {
  const { items: tx, add, remove } = useBudgetItems('transaction');
  const [form, setForm] = useState({ name: '', amount: '', cat: '' });
  const addTx = () => {
    if (!form.name || !form.amount) return;
    add({ name: form.name, amount: +form.amount, category: form.cat, tx_date: todayISO() });
    setForm({ name: '', amount: '', cat: '' });
  };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Transactions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Description" className="rounded-2xl" />
        <div className="flex gap-2">
          <Input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="$" className="rounded-2xl" />
          <Input value={form.cat} onChange={(e) => setForm((p) => ({ ...p, cat: e.target.value }))} placeholder="Category" className="rounded-2xl" />
          <Button size="icon" onClick={addTx} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {tx.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <div className="flex-1 min-w-0"><p className="font-medium">{t.name}</p><p className="text-xs text-muted-foreground">{t.tx_date} · {t.category}</p></div>
            <span className="text-muted-foreground">${t.amount}</span>
            <button onClick={() => remove(t.id)} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BillsTab() {
  const { items: bills, add, update, remove } = useBudgetItems('bill');
  const [bill, setBill] = useState({ name: '', amount: '' });
  const addBill = () => { if (bill.name && bill.amount) { add({ name: bill.name, amount: +bill.amount, paid: false }); setBill({ name: '', amount: '' }); } };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Receipt className="w-4 h-4" /> Bills</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={bill.name} onChange={(e) => setBill((p) => ({ ...p, name: e.target.value }))} placeholder="Bill" className="rounded-2xl" />
          <Input value={bill.amount} onChange={(e) => setBill((p) => ({ ...p, amount: e.target.value }))} placeholder="$" className="rounded-2xl w-24" />
          <Button size="sm" onClick={addBill} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {bills.map((b) => (
          <div key={b.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <button onClick={() => update(b.id, { paid: !b.paid })} className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${b.paid ? 'bg-primary border-primary' : 'border-border'}`}>{b.paid && <Check className="w-2.5 h-2.5 text-primary-foreground" />}</button>
            <span className={b.paid ? 'line-through text-muted-foreground flex-1' : 'flex-1'}>{b.name}</span>
            <span className="text-muted-foreground">${b.amount}</span>
            <button onClick={() => remove(b.id)} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BudgetCatTab() {
  const { items: cats, add, update, remove } = useBudgetItems('category');
  const [form, setForm] = useState({ name: '', limit: '' });
  const [inc, setInc] = useState({});
  const addCat = () => { if (!form.name) return; add({ name: form.name, limit: +form.limit || 0, spent: 0 }); setForm({ name: '', limit: '' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base">Budget Categories</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Category" className="rounded-2xl" />
          <Input value={form.limit} onChange={(e) => setForm((p) => ({ ...p, limit: e.target.value }))} placeholder="Limit $" className="rounded-2xl w-24" />
          <Button size="sm" onClick={addCat} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {cats.map((c) => (
          <div key={c.id}>
            <div className="flex justify-between text-sm"><span>{c.name}</span><span className="text-muted-foreground">${c.spent}/${c.limit}</span></div>
            <Progress value={c.limit ? (c.spent / c.limit) * 100 : 0} className="mt-1" />
            <div className="flex gap-2 mt-1">
              <Input type="number" value={inc[c.id] || ''} onChange={(e) => setInc((p) => ({ ...p, [c.id]: e.target.value }))} placeholder="Add expense" className="rounded-2xl h-8" />
              <Button size="sm" variant="outline" onClick={() => { update(c.id, { spent: (c.spent || 0) + (+inc[c.id] || 0) }); setInc((p) => ({ ...p, [c.id]: '' })); }} className="rounded-2xl h-8 px-2">Add</Button>
              <button onClick={() => remove(c.id)} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SavingsTab() {
  const { items: goals, add, update } = useBudgetItems('savings');
  const [goal, setGoal] = useState({ name: '', target: '' });
  const [inc, setInc] = useState({});
  const addGoal = () => { if (goal.name && goal.target) { add({ name: goal.name, target: +goal.target, saved: 0 }); setGoal({ name: '', target: '' }); } };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><PiggyBank className="w-4 h-4" /> Savings Goals</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input value={goal.name} onChange={(e) => setGoal((p) => ({ ...p, name: e.target.value }))} placeholder="Goal" className="rounded-2xl" />
          <Input value={goal.target} onChange={(e) => setGoal((p) => ({ ...p, target: e.target.value }))} placeholder="$" className="rounded-2xl w-24" />
          <Button size="sm" onClick={addGoal} className="rounded-full shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {goals.map((g) => (
          <div key={g.id}>
            <div className="flex justify-between text-sm"><span>{g.name}</span><span className="text-muted-foreground">${g.saved}/${g.target}</span></div>
            <Progress value={g.target ? (g.saved / g.target) * 100 : 0} className="mt-1" />
            <div className="flex gap-2 mt-1">
              <Input type="number" value={inc[g.id] || ''} onChange={(e) => setInc((p) => ({ ...p, [g.id]: e.target.value }))} placeholder="Add savings" className="rounded-2xl h-8" />
              <Button size="sm" variant="outline" onClick={() => { update(g.id, { saved: (g.saved || 0) + (+inc[g.id] || 0) }); setInc((p) => ({ ...p, [g.id]: '' })); }} className="rounded-2xl h-8 px-2">Add</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SubscriptionsTab() {
  const { items: subs, add, remove } = useBudgetItems('subscription');
  const [form, setForm] = useState({ name: '', amount: '', cycle: 'Monthly' });
  const addSub = () => { if (!form.name) return; add({ name: form.name, amount: +form.amount || 0, cycle: form.cycle }); setForm({ name: '', amount: '', cycle: 'Monthly' }); };
  const total = subs.reduce((s, x) => s + (+x.amount || 0), 0);
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Repeat className="w-4 h-4" /> Subscriptions</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Subscription" className="rounded-2xl" />
        <div className="flex gap-2">
          <Input value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="$" className="rounded-2xl" />
          <select value={form.cycle} onChange={(e) => setForm((p) => ({ ...p, cycle: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            <option>Monthly</option><option>Yearly</option><option>Weekly</option>
          </select>
          <Button size="icon" onClick={addSub} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {subs.map((s) => (
          <div key={s.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{s.name}</span><span className="text-xs text-muted-foreground">{s.cycle}</span><span className="text-muted-foreground">${s.amount}</span>
            <button onClick={() => remove(s.id)} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground pt-1">Total: ${total}</p>
      </CardContent>
    </Card>
  );
}

function WishlistTab() {
  const { items, add, remove } = useBudgetItems('wishlist');
  const [form, setForm] = useState({ name: '', price: '', priority: 'Want' });
  const addItem = () => { if (!form.name) return; add({ name: form.name, price: +form.price || 0, priority: form.priority }); setForm({ name: '', price: '', priority: 'Want' }); };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Gift className="w-4 h-4" /> Wishlist</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item" className="rounded-2xl" />
        <div className="flex gap-2">
          <Input value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} placeholder="$" className="rounded-2xl" />
          <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            <option>Want</option><option>Need</option><option>Someday</option>
          </select>
          <Button size="icon" onClick={addItem} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <span className="flex-1">{i.name}</span><span className="text-xs px-2 py-0.5 rounded-full bg-accent">{i.priority}</span><span className="text-muted-foreground">{i.price ? `$${i.price}` : ''}</span>
            <button onClick={() => remove(i.id)} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function BudgetStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const tabs = [
    isFeatureEnabled('bud.overview') && { value: 'overview', label: 'Overview', node: <OverviewTab /> },
    isFeatureEnabled('bud.transactions') && { value: 'tx', label: 'Transactions', node: <TransactionsTab /> },
    isFeatureEnabled('bud.bills') && { value: 'bills', label: 'Bills', node: <BillsTab /> },
    isFeatureEnabled('bud.budget') && { value: 'budget', label: 'Categories', node: <BudgetCatTab /> },
    isFeatureEnabled('bud.savings') && { value: 'savings', label: 'Savings', node: <SavingsTab /> },
    isFeatureEnabled('bud.subscriptions') && { value: 'subs', label: 'Subscriptions', node: <SubscriptionsTab /> },
    isFeatureEnabled('bud.wishlist') && { value: 'wishlist', label: 'Wishlist', node: <WishlistTab /> }
  ].filter(Boolean);
  return (
    <StudioShell title="Budget & Finances">
      {tabs.length === 0 ? <EmptyState title="Finances are tucked away" subtitle="Enable a Budget feature in Settings to begin." /> : (
        <Tabs defaultValue={tabs[0].value}>
          <TabsList className="flex w-full bg-accent rounded-full p-1 gap-1 mb-4 overflow-x-auto">
            {tabs.map((t) => <TabsTrigger key={t.value} value={t.value} className="rounded-full text-xs flex-1">{t.label}</TabsTrigger>)}
          </TabsList>
          {tabs.map((t) => <TabsContent key={t.value} value={t.value} className="mt-0 space-y-4">{t.node}</TabsContent>)}
        </Tabs>
      )}
    </StudioShell>
  );
}