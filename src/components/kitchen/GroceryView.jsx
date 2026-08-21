import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ShoppingCart, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useGroceryItems, useMealPlan, useRecipes } from '@/hooks/useKitchen';
import { useAppSettings } from '@/lib/AppSettings';
import { GROCERY_CATEGORIES, EMPTY, startOfWeek, weekDates } from '@/components/kitchen/kitchenConstants';

export default function GroceryView({ onBack, onOpenGroceryReview }) {
  const { isFeatureEnabled } = useAppSettings();
  const [listName, setListName] = useState('Weekly Groceries');
  const { items, add, update, remove } = useGroceryItems(listName);
  const { items: meals } = useMealPlan();
  const { items: recipes } = useRecipes();
  const [q, setQ] = useState('');
  const [hideChecked, setHideChecked] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', qty: '1', category: 'Other' });
  const [newList, setNewList] = useState('');
  const [shopMode, setShopMode] = useState(false);

  const filtered = useMemo(() => items.filter((i) => {
    if (hideChecked && i.checked) return false;
    if (q && !i.name?.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, q, hideChecked]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((i) => { const c = i.category || 'Other'; (g[c] = g[c] || []).push(i); });
    return g;
  }, [filtered]);

  const addItem = () => {
    if (!newItem.name.trim()) return;
    add({ ...newItem, list_name: listName, checked: false });
    setNewItem({ name: '', qty: '1', category: 'Other' });
  };

  const generateFromMeals = () => {
    const week = weekDates(startOfWeek());
    const sources = meals
      .filter((m) => week.includes(m.date) && m.meal_type === 'recipe' && m.recipe_id)
      .map((m) => ({ recipe: recipes.find((r) => r.id === m.recipe_id), plannedServings: m.servings || 1, meal: m }))
      .filter((s) => s.recipe);
    if (sources.length === 0) return;
    onOpenGroceryReview(sources, listName);
  };

  const createList = () => { if (newList.trim()) { setListName(newList.trim()); setNewList(''); } };

  const sourceLabel = (item) => {
    const names = [];
    if (item.source_recipe_ids?.length) names.push(...recipes.filter((r) => item.source_recipe_ids.includes(r.id)).map((r) => r.name));
    if (names.length === 0) return null;
    return names;
  };

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="rounded-full"><ArrowLeft className="w-4 h-4" /></Button>
        <h2 className="font-heading text-lg font-semibold flex-1">Groceries</h2>
        <Button size="sm" variant={shopMode ? 'default' : 'outline'} className="rounded-full" onClick={() => setShopMode((s) => !s)}><ShoppingCart className="w-4 h-4 mr-1" /> Shop</Button>
      </div>

      <div className="flex items-center gap-2">
        <select value={listName} onChange={(e) => setListName(e.target.value)} className="rounded-2xl border bg-card px-3 py-2 text-sm flex-1">
          <option>Weekly Groceries</option>
          {items.map((i) => i.list_name).filter((v, i, a) => v && v !== 'Weekly Groceries' && a.indexOf(v) === i).map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <Input value={newList} onChange={(e) => setNewList(e.target.value)} placeholder="New list name" className="rounded-2xl" />
        <Button variant="outline" className="rounded-full" onClick={createList}>Create</Button>
      </div>

      {isFeatureEnabled('kit.groceryGen') && (
        <Button variant="outline" className="rounded-full w-full" onClick={generateFromMeals}><Plus className="w-4 h-4 mr-1" /> Generate from this week's meals</Button>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="rounded-2xl pl-9" />
        </div>
        <Button variant={hideChecked ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setHideChecked((h) => !h)}>Hide checked</Button>
      </div>

      {!shopMode && (
        <Card className="rounded-3xl"><CardContent className="p-3 space-y-2">
          <div className="flex gap-2">
            <Input value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} placeholder="Add item" className="rounded-2xl" onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <Input value={newItem.qty} onChange={(e) => setNewItem((p) => ({ ...p, qty: e.target.value }))} className="rounded-2xl w-16" />
            <Button size="icon" className="rounded-2xl shrink-0" onClick={addItem}><Plus className="w-4 h-4" /></Button>
          </div>
          <select value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} className="rounded-2xl border bg-card px-3 py-1.5 text-sm">
            {GROCERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </CardContent></Card>
      )}

      {filtered.length === 0 ? (
        <EmptyState icon={ShoppingCart} title={EMPTY.groceries.title} subtitle={EMPTY.groceries.subtitle} />
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              <p className="text-xs font-medium text-muted-foreground mb-1">{cat}</p>
              {list.map((i) => {
                const srcs = sourceLabel(i);
                return (
                  <Card key={i.id} className={`rounded-2xl mb-1.5 ${i.checked ? 'opacity-60' : ''}`}>
                    <CardContent className={`p-3 ${shopMode ? 'py-4' : ''}`}>
                      <div className="flex items-center gap-3">
                        <Checkbox checked={i.checked} onCheckedChange={(v) => update(i.id, { checked: v })} id={`g-${i.id}`} />
                        <div className="flex-1 min-w-0">
                          <label htmlFor={`g-${i.id}`} className={`text-sm ${i.checked ? 'line-through text-muted-foreground' : ''} ${shopMode ? 'text-base' : ''}`}>{i.name}</label>
                          <p className="text-[11px] text-muted-foreground">{i.qty} {i.unit}{i.store ? ` · ${i.store}` : ''}</p>
                          {srcs && !shopMode && (
                            <button onClick={() => setExpanded(expanded === i.id ? null : i.id)} className="text-[10px] text-primary flex items-center gap-0.5 mt-0.5">
                              Needed for {srcs.length} recipe{srcs.length !== 1 ? 's' : ''}
                              {expanded === i.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                        {!shopMode && <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => remove(i.id)}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>}
                      </div>
                      {expanded === i.id && srcs && (
                        <div className="mt-2 pl-7 space-y-0.5">
                          {srcs.map((n, k) => <p key={k} className="text-[11px] text-muted-foreground">• {n}</p>)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}