import React, { useState } from 'react';
import { useAppSettings } from '@/lib/AppSettings';
import { useLocalStorage } from '@/lib/useLocalStorage';
import StudioShell from '@/components/StudioShell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Trash2, Utensils, ShoppingCart, BookOpen, Box, Snowflake, ChefHat } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const AISLES = ['Produce', 'Dairy', 'Pantry', 'Frozen', 'Other'];

function MealPlanTab() {
  const [meals, setMeals] = useLocalStorage('kitchen-meals', ['', '', '', '', '', '', '']);
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Utensils className="w-4 h-4" /> 7-Day Meal Plan</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {DAYS.map((d, i) => (
          <div key={d} className="flex items-center gap-2">
            <span className="text-xs w-8 text-muted-foreground">{d}</span>
            <Input value={meals[i]} onChange={(e) => setMeals((m) => m.map((x, j) => (j === i ? e.target.value : x)))} placeholder="Dinner plan" className="rounded-2xl" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function GroceryTab() {
  const [grocery, setGrocery] = useLocalStorage('kitchen-grocery', []);
  const [item, setItem] = useState('');
  const [aisle, setAisle] = useState('Produce');
  const addItem = () => { if (!item.trim()) return; setGrocery([...grocery, { id: Date.now(), name: item.trim(), aisle, done: false }]); setItem(''); };
  const toggle = (id) => setGrocery((g) => g.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  const remove = (id) => setGrocery((g) => g.filter((i) => i.id !== id));

  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Grocery List</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add item" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && addItem()} />
          <select value={aisle} onChange={(e) => setAisle(e.target.value)} className="rounded-2xl border bg-card px-3 text-sm">
            {AISLES.map((a) => <option key={a}>{a}</option>)}
          </select>
          <Button size="icon" onClick={addItem} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {AISLES.map((a) => (
          <div key={a}>
            {grocery.some((i) => i.aisle === a) && <p className="text-xs font-medium mt-2 text-muted-foreground">{a}</p>}
            {grocery.filter((i) => i.aisle === a).map((i) => (
              <div key={i.id} className="flex items-center gap-2 py-1">
                <Checkbox checked={i.done} onCheckedChange={() => toggle(i.id)} id={`g-${i.id}`} />
                <label htmlFor={`g-${i.id}`} className={`text-sm flex-1 ${i.done ? 'line-through text-muted-foreground' : ''}`}>{i.name}</label>
                <button onClick={() => remove(i.id)}><X className="w-3 h-3 text-muted-foreground" /></button>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecipesTab() {
  const [recipes, setRecipes] = useLocalStorage('kitchen-recipes', []);
  const [form, setForm] = useState({ name: '', link: '', tags: '', notes: '' });
  const add = () => {
    if (!form.name.trim()) return;
    setRecipes([{ id: Date.now(), ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }, ...recipes]);
    setForm({ name: '', link: '', tags: '', notes: '' });
  };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><BookOpen className="w-4 h-4" /> Recipe Library</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Recipe name" className="rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} placeholder="Link / source" className="rounded-2xl" />
          <Input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma)" className="rounded-2xl" />
        </div>
        <Input value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="rounded-2xl" />
        <Button size="sm" onClick={add} className="rounded-full"><Plus className="w-4 h-4 mr-1" /> Save recipe</Button>
        {recipes.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-2 border-t border-border pt-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">{r.name}</p>
              {r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">{r.link}</a>}
              {r.tags?.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">{r.tags.join(' · ')}</p>}
              {r.notes && <p className="text-xs text-muted-foreground/80">{r.notes}</p>}
            </div>
            <button onClick={() => setRecipes((x) => x.filter((y) => y.id !== r.id))} className="text-muted-foreground shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function StorageTab({ storageKey, title, icon: Icon }) {
  const [items, setItems] = useLocalStorage(storageKey, []);
  const [form, setForm] = useState({ name: '', qty: '' });
  const add = () => {
    if (!form.name.trim()) return;
    setItems([{ id: Date.now(), name: form.name.trim(), qty: form.qty || '1', low: false }, ...items]);
    setForm({ name: '', qty: '' });
  };
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><Icon className="w-4 h-4" /> {title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Item" className="rounded-2xl" />
          <Input value={form.qty} onChange={(e) => setForm((p) => ({ ...p, qty: e.target.value }))} placeholder="Qty" className="rounded-2xl w-24" />
          <Button size="icon" onClick={add} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {items.map((i) => (
          <div key={i.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <Checkbox checked={i.low} onCheckedChange={() => setItems((x) => x.map((y) => (y.id === i.id ? { ...y, low: !y.low } : y)))} id={`${storageKey}-${i.id}`} />
            <label htmlFor={`${storageKey}-${i.id}`} className={`flex-1 ${i.low ? 'text-amber-500' : ''}`}>{i.name}</label>
            <span className="text-xs text-muted-foreground">{i.qty}</span>
            {i.low && <span className="text-[10px] text-amber-500">low</span>}
            <button onClick={() => setItems((x) => x.filter((y) => y.id !== i.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MealPrepTab() {
  const [tasks, setTasks] = useLocalStorage('kitchen-mealprep', [
    { id: 1, text: 'Batch cook grains', day: 'Sun' },
    { id: 2, text: 'Chop veg', day: 'Sun' },
    { id: 3, text: 'Portion snacks', day: 'Wed' }
  ]);
  const [form, setForm] = useState({ text: '', day: 'Sun' });
  const add = () => { if (!form.text.trim()) return; setTasks([...tasks, { id: Date.now(), ...form, done: false }]); setForm({ text: '', day: 'Sun' }); };
  const toggle = (id) => setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  return (
    <Card className="rounded-3xl shadow-sm">
      <CardHeader className="pb-2"><CardTitle className="font-heading text-base flex items-center gap-2"><ChefHat className="w-4 h-4" /> Batch Prep Plan</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-2">
          <Input value={form.text} onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))} placeholder="Prep task" className="rounded-2xl" />
          <select value={form.day} onChange={(e) => setForm((p) => ({ ...p, day: e.target.value }))} className="rounded-2xl border bg-card px-3 text-sm">
            {DAYS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <Button size="icon" onClick={add} className="rounded-2xl shrink-0"><Plus className="w-4 h-4" /></Button>
        </div>
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 text-sm border-t border-border pt-2 first:border-0 first:pt-0">
            <Checkbox checked={!!t.done} onCheckedChange={() => toggle(t.id)} id={`mp-${t.id}`} />
            <label htmlFor={`mp-${t.id}`} className={`flex-1 ${t.done ? 'line-through text-muted-foreground' : ''}`}>{t.text}</label>
            <span className="text-xs text-muted-foreground">{t.day}</span>
            <button onClick={() => setTasks((x) => x.filter((y) => y.id !== t.id))} className="text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function KitchenStudio() {
  const { isFeatureEnabled } = useAppSettings();
  const tabs = [
    isFeatureEnabled('kit.mealplan') && { value: 'plan', label: 'Meal Plan', node: <MealPlanTab /> },
    isFeatureEnabled('kit.grocery') && { value: 'grocery', label: 'Grocery', node: <GroceryTab /> },
    isFeatureEnabled('kit.recipes') && { value: 'recipes', label: 'Recipes', node: <RecipesTab /> },
    isFeatureEnabled('kit.pantry') && { value: 'pantry', label: 'Pantry', node: <StorageTab storageKey="kitchen-pantry" title="Pantry" icon={Box} /> },
    isFeatureEnabled('kit.freezer') && { value: 'freezer', label: 'Freezer', node: <StorageTab storageKey="kitchen-freezer" title="Freezer" icon={Snowflake} /> },
    isFeatureEnabled('kit.mealprep') && { value: 'prep', label: 'Meal Prep', node: <MealPrepTab /> }
  ].filter(Boolean);

  return (
    <StudioShell title="Kitchen, Meals & Batch Prep">
      {tabs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Enable a Kitchen feature in Settings to begin.</p>
      ) : (
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